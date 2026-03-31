"use client";

import { startAuthentication, type PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Panel, Shell } from "@/components/ui";

type AuthMode = "login" | "register";

type ApiResponse = {
  error?: string;
  redirectTo?: string;
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

export function AuthCard({ initialMode = "login" }: { initialMode?: AuthMode }) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "PublicKeyCredential" in window);
  }, []);

  async function handlePasswordAuth(formData: FormData) {
    setLoading(true);
    setError(null);

    const response = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        email: String(formData.get("email") ?? "").trim(),
        passphrase: String(formData.get("passphrase") ?? "")
      })
    });

    const data = (await response.json()) as ApiResponse;
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Valami nem sikerült.");
      return;
    }

    router.push(data.redirectTo ?? "/");
    router.refresh();
  }

  async function handlePasskeyLogin() {
    if (!supported) {
      setError("Ez a böngésző vagy eszköz most nem támogatja a passkey bejelentkezést.");
      return;
    }

    setPasskeyLoading(true);
    setError(null);

    try {
      const optionsResponse = await fetch("/api/auth/passkey/authenticate/options", {
        method: "POST"
      });

      const optionsData = (await optionsResponse.json()) as PublicKeyCredentialRequestOptionsJSON & ApiResponse;

      if (!optionsResponse.ok) {
        setError(optionsData.error ?? "Nem tudtam elindítani a passkey bejelentkezést.");
        setPasskeyLoading(false);
        return;
      }

      const credential = await startAuthentication({
        optionsJSON: optionsData
      });

      const verifyResponse = await fetch("/api/auth/passkey/authenticate/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ credential })
      });

      const verifyData = (await verifyResponse.json()) as ApiResponse;

      if (!verifyResponse.ok) {
        setError(verifyData.error ?? "A passkey bejelentkezés nem sikerült.");
        setPasskeyLoading(false);
        return;
      }

      router.push(verifyData.redirectTo ?? "/");
      router.refresh();
    } catch (error) {
      setError(getErrorMessage(error, "A passkey bejelentkezés nem sikerült."));
    }

    setPasskeyLoading(false);
  }

  return (
    <Shell className="flex items-center">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-6">
          <p className="text-[11px] uppercase tracking-[0.32em] text-clay/80">Belépés a saját ACA térbe</p>
          <h1 className="font-display text-5xl leading-[0.95] text-ink">
            Biztonságos belépés emaillel vagy passkey-jel.
          </h1>
          <p className="max-w-2xl text-base leading-8 text-[#6d5a50] sm:text-lg">
            A napi becsekkolásod, a mai lépésed és a jegyzeteid innentől nem csak a böngészőben élnek, hanem
            D1-ben, dátum szerint visszatölthetően. Megérdemled, hogy ez a munka megtartva legyen.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Email + jelszó bejelentkezés",
              "Passkey alapú gyors belépés",
              "Mai ACA állapot mentése D1-be"
            ].map((item) => (
              <div key={item} className="rounded-[24px] bg-white/72 p-4 shadow-soft">
                <p className="text-sm leading-7 text-ink">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <Panel className="mx-auto w-full max-w-xl space-y-5">
          <div className="flex rounded-full bg-white/70 p-1">
            <button
              type="button"
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${mode === "login" ? "bg-[#f0dfd1] text-ink" : "text-[#6d5a50]"}`}
              onClick={() => setMode("login")}
            >
              Belépés
            </button>
            <button
              type="button"
              className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${mode === "register" ? "bg-[#f0dfd1] text-ink" : "text-[#6d5a50]"}`}
              onClick={() => setMode("register")}
            >
              Fiók létrehozása
            </button>
          </div>

          <form action={handlePasswordAuth} className="space-y-4">
            <div className="space-y-2">
              <h2 className="font-display text-3xl text-ink">
                {mode === "login" ? "Lépj be a mai munkádhoz" : "Hozd létre a saját helyedet"}
              </h2>
              <p className="text-sm leading-7 text-[#6d5a50]">
                {mode === "login"
                  ? "Emaillel és jelszóval is beléphetsz, utána hozzáadhatsz passkeyt is."
                  : "Először emaillel és jelszóval hozzuk létre a fiókodat, utána egy kattintással adhatsz hozzá passkeyt."}
              </p>
            </div>

            <input
              name="email"
              type="email"
              required
              autoComplete="username webauthn"
              placeholder="Email cím"
            />
            <input
              name="passphrase"
              type="password"
              required
              minLength={12}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Legalább 12 karakteres jelszó"
            />

            {error ? <p className="text-sm text-red-700">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={loading || passkeyLoading}>
              {loading ? "Dolgozom..." : mode === "login" ? "Belépek emaillel" : "Létrehozom a fiókot"}
            </Button>
          </form>

          <div className="space-y-4 border-t border-[rgba(80,53,38,0.08)] pt-4">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-[#7b665a]">
              <span className="h-px flex-1 bg-[rgba(80,53,38,0.08)]" />
              vagy
              <span className="h-px flex-1 bg-[rgba(80,53,38,0.08)]" />
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={passkeyLoading || loading}
              onClick={handlePasskeyLogin}
            >
              {passkeyLoading ? "Passkey ellenőrzés..." : "Belépés passkey-jel"}
            </Button>

            <p className="text-center text-xs leading-6 text-[#7b665a]">
              A passkey bejelentkezés akkor működik, ha ezt korábban már hozzáadtad a fiókodhoz.
            </p>
          </div>

          <p className="text-center text-sm text-[#7b665a]">
            Belépés után a főoldalon rögtön hozzá tudsz adni passkeyt a gyorsabb következő belépéshez.
          </p>

          <p className="text-center text-xs leading-6 text-[#7b665a]">
            Ha inkább visszamennél: <Link href="/" className="text-clay">főoldal</Link>
          </p>
        </Panel>
      </div>
    </Shell>
  );
}

