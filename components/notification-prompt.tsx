"use client";

import { useEffect, useState } from "react";
import { Button, Panel } from "@/components/ui";

type BrowserPushSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

export function NotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Kíméletes emlékeztetőket kérhetsz, hogy könnyebb legyen visszatérni magadhoz.");

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermission("unsupported");
      setStatus("Ezen az eszközön most nem támogatott a böngészős értesítés.");
      return;
    }

    setPermission(Notification.permission);

    navigator.serviceWorker.register("/sw.js").catch(() => undefined);

    fetch("/api/notifications/public-key")
      .then(async (response) => {
        if (!response.ok || response.status === 204) {
          return null;
        }

        return (await response.json()) as { publicKey?: string };
      })
      .then((data) => {
        if (data?.publicKey) {
          setPublicKey(data.publicKey);
        }
      })
      .catch(() => undefined);
  }, []);

  async function showLocalConfirmation() {
    if (!("serviceWorker" in navigator)) return;
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification("ACA társ", {
      body: "Emlékeztetlek: megérdemled, hogy jó történjen veled.",
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: "/" }
    });
  }

  async function enableNotifications() {
    if (permission === "unsupported" || !("serviceWorker" in navigator)) return;

    setBusy(true);

    try {
      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);

      if (nextPermission !== "granted") {
        setStatus("Ha később készen állsz rá, itt bármikor újra kérhetsz emlékeztetőket.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      if (!publicKey) {
        await showLocalConfirmation();
        setStatus(
          "Az engedély rendben van. Ha később beállítjuk a VAPID kulcsokat, a szerveres push is azonnal működni fog."
        );
        return;
      }

      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        }));

      const serializable = subscription.toJSON() as BrowserPushSubscription;

      const subscribeResponse = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          subscription: serializable,
          locale: navigator.language
        })
      });

      if (!subscribeResponse.ok) {
        const subscribePayload = (await subscribeResponse.json().catch(() => null)) as {
          error?: string;
        } | null;

        throw new Error(subscribePayload?.error ?? "A push feliratkozás mentése nem sikerült.");
      }

      setSubscribed(true);

      const testResponse = await fetch("/api/notifications/test", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        }
      });

      const testPayload = (await testResponse.json().catch(() => null)) as {
        error?: string;
        message?: string;
        delivered?: boolean;
      } | null;

      setStatus(
        testPayload?.message ||
          (testPayload?.delivered
            ? "Az első emlékeztető úton van feléd."
            : "Feliratkoztál, de a tesztküldéshez még kell egy kis szerveroldali finomhangolás.")
      );
    } catch {
      setSubscribed(false);
      setStatus("Az értesítések beállítása most nem sikerült. Ettől még az app használható marad.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel className="space-y-4">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.32em] text-clay/80">Push emlékeztetők</p>
        <h3 className="font-display text-[1.65rem] leading-tight text-ink">Finom visszahívás a napi munkához</h3>
        <p className="text-sm leading-7 text-[#6d5a50]">{status}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={enableNotifications} disabled={busy || permission === "unsupported"}>
          {busy
            ? "Beállítás..."
            : subscribed || permission === "granted"
              ? "Értesítések aktívak"
              : "Kérek emlékeztetőket"}
        </Button>
        <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-2 text-xs font-semibold text-ink/75">
          {permission === "unsupported"
            ? "Nem támogatott"
            : permission === "denied"
              ? "Le van tiltva"
              : permission === "granted"
                ? "Engedélyezve"
                : "Még nincs engedély"}
        </span>
      </div>
    </Panel>
  );
}
