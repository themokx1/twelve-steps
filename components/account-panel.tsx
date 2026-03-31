"use client";

import { startRegistration, type PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Panel } from "@/components/ui";

type PasskeyItem = {
  id: string;
  name: string | null;
  deviceType: string;
  backedUp: boolean;
  createdAt: number;
  lastUsedAt: number | null;
};

type ApiResponse = {
  error?: string;
  ok?: boolean;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const details = `${error.name} ${error.message}`.toLowerCase();
    if (details.includes("notallowederror") || details.includes("cancel")) {
      return "A passkey művelet meg lett szakítva.";
    }
  }

  return fallback;
}

export function AccountPanel({
  email,
  passkeys
}: {
  email: string;
  passkeys: PasskeyItem[];
}) {
  const router = useRouter();
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<"passkey" | "logout" | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "PublicKeyCredential" in window);
  }, []);

  async function handleCreatePasskey() {
    if (!supported) {
      setError("Ez a böngésző vagy eszköz most nem támogatja a passkeyket.");
      return;
    }

    setLoading("passkey");
    setError(null);
    setStatus(null);

    try {
      const optionsResponse = await fetch("/api/auth/passkey/register/options", {
        method: "POST"
      });

      const optionsData = (await optionsResponse.json()) as PublicKeyCredentialCreationOptionsJSON & ApiResponse;

      if (!optionsResponse.ok) {
        setError(optionsData.error ?? "Nem tudtam elindítani a passkey létrehozást.");
        setLoading(null);
        return;
      }

      const credential = await startRegistration({
        optionsJSON: optionsData
      });

      const verifyResponse = await fetch("/api/auth/passkey/register/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          credential
        })
      });

      const verifyData = (await verifyResponse.json()) as ApiResponse;

      if (!verifyResponse.ok) {
        setError(verifyData.error ?? "A passkey mentése nem sikerült.");
        setLoading(null);
        return;
      }

      setStatus("A passkey el lett mentve ehhez a fiókhoz.");
      router.refresh();
    } catch (error) {
      setError(getErrorMessage(error, "A passkey mentése nem sikerült."));
    }

    setLoading(null);
  }

  async function handleLogout() {
    setLoading("logout");
    setError(null);
    setStatus(null);

    await fetch("/api/auth/logout", {
      method: "POST"
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <Panel className="space-y-4">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.32em] text-clay/80">Fiók és belépés</p>
        <h3 className="font-display text-[1.65rem] leading-tight text-ink">Email + passkey hozzáférés</h3>
        <p className="text-sm leading-7 text-[#6d5a50]">{email}</p>
      </div>

      <div className="rounded-[22px] bg-white/72 p-4">
        <p className="text-sm leading-7 text-ink">
          {passkeys.length > 0
            ? `${passkeys.length} passkey van mentve ehhez a fiókhoz. A következő belépésnél már használhatod őket.`
            : "Még nincs mentett passkey. Most hozzáadhatsz egyet, hogy legközelebb gyorsan, biometrikával vagy eszköz-PIN-nel lépj be."}
        </p>
      </div>

      {passkeys.length > 0 ? (
        <div className="space-y-3">
          {passkeys.map((passkey) => (
            <div key={passkey.id} className="rounded-[20px] bg-white/72 p-4 text-sm text-[#6d5a50]">
              <p className="font-semibold text-ink">{passkey.name ?? "Mentett passkey"}</p>
              <p>{passkey.backedUp ? "Szinkronizált passkey" : "Eszközhöz kötött passkey"}</p>
              <p>{passkey.deviceType}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button type="button" onClick={handleCreatePasskey} disabled={loading !== null}>
          {loading === "passkey" ? "Passkey mentése..." : "Passkey hozzáadása"}
        </Button>
        <Button type="button" variant="ghost" onClick={handleLogout} disabled={loading !== null}>
          {loading === "logout" ? "Kiléptetés..." : "Kilépés"}
        </Button>
      </div>

      {status ? <p className="text-sm text-cedar">{status}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </Panel>
  );
}
