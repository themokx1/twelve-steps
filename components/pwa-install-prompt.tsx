"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{
      outcome: "accepted" | "dismissed";
      platform: string;
    }>;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

const DISMISS_KEY = "aca-pwa-dismissed-at";
const DISMISS_TTL_MS = 5 * 24 * 60 * 60 * 1000;

function shouldSuppressPrompt() {
  if (typeof window === "undefined") return true;
  const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) ?? "0");
  return dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_TTL_MS;
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIosSafari() {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  const appleMobile =
    /iphone|ipad|ipod/.test(userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  const safari = /safari/.test(userAgent) && !/crios|fxios|edgios|chrome/.test(userAgent);
  return appleMobile && safari;
}

export function PwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<"install" | "ios" | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isStandaloneMode() || shouldSuppressPrompt()) {
      return;
    }

    if (isIosSafari()) {
      setMode("ios");
      setVisible(true);
    }

    function handleBeforeInstallPrompt(event: Event) {
      const deferred = event as BeforeInstallPromptEvent;
      deferred.preventDefault();
      if (isStandaloneMode() || shouldSuppressPrompt()) return;
      setPromptEvent(deferred);
      setMode("install");
      setVisible(true);
    }

    function handleInstalled() {
      window.localStorage.removeItem(DISMISS_KEY);
      setVisible(false);
      setMode(null);
      setPromptEvent(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  function dismiss() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }

    setVisible(false);
    setMode(null);
    setPromptEvent(null);
  }

  async function handleInstall() {
    if (!promptEvent) return;
    setInstalling(true);

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        dismiss();
      }
    } finally {
      setInstalling(false);
      setPromptEvent(null);
    }
  }

  if (!visible || !mode) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <aside className="pointer-events-auto w-full max-w-lg rounded-[28px] border border-[rgba(80,53,38,0.1)] bg-[rgba(255,247,239,0.95)] p-5 shadow-card backdrop-blur">
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.32em] text-clay/80">Mindig kéznél</p>
            <h2 className="font-display text-2xl text-ink">Tedd ki kezdőképernyőre</h2>
            <p className="text-sm leading-7 text-[#6d5a50]">
              Telepítve úgy működik, mint egy csendes, saját ACA tér: gyorsabban nyílik meg, fókuszáltabb,
              és készen áll az emlékeztetőkre is.
            </p>
          </div>

          {mode === "ios" ? (
            <ol className="space-y-2 text-sm text-[#6d5a50]">
              <li>1. Nyomd meg a Megosztás ikont a Safariban.</li>
              <li>2. Válaszd a Főképernyőhöz adás lehetőséget.</li>
              <li>3. Nyisd meg onnan, hogy appként működjön.</li>
            </ol>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {mode === "install" ? (
              <Button type="button" disabled={installing} onClick={handleInstall}>
                {installing ? "Telepítés..." : "Telepítem"}
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={dismiss}>
              Később
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

