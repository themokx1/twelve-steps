"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ACA_QUICK_PROMPTS } from "@/lib/aca/program";
import { Button, Panel } from "@/components/ui";
import { readStoredJson, writeStoredJson } from "@/lib/utils/browser-storage";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  toneLabel?: string;
  focusQuestion?: string;
  microAction?: string;
  affirmation?: string;
  boundary?: string;
};

const STORAGE_KEY = "aca-companion-thread-v1";

const INITIAL_MESSAGE: ChatMessage = {
  id: "initial",
  role: "assistant",
  toneLabel: "Tartó jelenlét",
  content:
    "Itt vagyok veled. Nem kell tökéletesen csinálnod ezt a munkát, de szeretném, ha komolyan vennéd. Maradjunk egyszerre gyengédek és következetesek. Megérdemled, hogy jó történjen veled.",
  focusQuestion: "Mi a legfontosabb érzés vagy helyzet, amit most ki kell mondanod?",
  microAction: "Írj nekem egy rövid, őszinte mondatot arról, mi van most benned.",
  affirmation: "Megérdemled, hogy jó történjen veled.",
  boundary: "Ne próbáld egyszerre az egész történetedet megoldani."
};

export function CompanionPanel({
  stepNumber,
  stepTitle,
  journalSnippet
}: {
  stepNumber: number;
  stepTitle: string;
  journalSnippet: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [storageReady, setStorageReady] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const storedMessages = readStoredJson<ChatMessage[]>(STORAGE_KEY, [INITIAL_MESSAGE]);
    setMessages(storedMessages.length > 0 ? storedMessages : [INITIAL_MESSAGE]);
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    writeStoredJson(STORAGE_KEY, messages);
  }, [messages, storageReady]);

  const conversation = useMemo(
    () => messages.map((message) => ({ role: message.role, content: message.content })),
    [messages]
  );

  async function submitMessage(rawMessage?: string) {
    const message = (rawMessage ?? input).trim();
    if (!message || pending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message
    };

    const nextConversation = [...conversation, { role: "user" as const, content: message }];

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setPending(true);

    try {
      const response = await fetch("/api/ai/companion", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          message,
          stepNumber,
          stepTitle,
          journalSnippet,
          conversation: nextConversation
        })
      });

      const data = (await response.json()) as {
        toneLabel: string;
        response: string;
        focusQuestion: string;
        microAction: string;
        affirmation: string;
        boundary: string;
      };

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.response,
          toneLabel: data.toneLabel,
          focusQuestion: data.focusQuestion,
          microAction: data.microAction,
          affirmation: data.affirmation,
          boundary: data.boundary
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          toneLabel: "Stabil tartás",
          content:
            "Most nem értem el az AI réteget, de itt maradok veled a lényegnél. Írd le egy mondatban, mi a következő igaz lépésed, és utána csináld meg öt percen belül.",
          focusQuestion: "Mi az az egy mondat, amit most nem akarsz tovább kerülni?",
          microAction: "Válaszolj meg egy kérdést a kiválasztott lépésből.",
          affirmation: "Megérdemled, hogy jó történjen veled, akkor is, ha most egyszerűbben haladunk.",
          boundary: "Most ne nyiss új témát, maradj ennél az egy feladatnál."
        }
      ]);
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitMessage();
  }

  return (
    <Panel className="space-y-5">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.32em] text-clay/80">AI társ</p>
        <h3 className="font-display text-[1.7rem] leading-tight text-ink">Empatikus, de fegyelmezett kísérés</h3>
        <p className="text-sm leading-7 text-[#6d5a50]">
          Nem hagy elkallódni, nem beszél mellé, és újra meg újra visszakísér a következő igaz lépésedhez.
        </p>
      </div>

      <div className="grid gap-2">
        {ACA_QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="rounded-2xl border border-[rgba(80,53,38,0.08)] bg-white/60 px-3 py-2 text-left text-sm text-ink/80 transition hover:bg-white"
            onClick={() => void submitMessage(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="max-h-[30rem] space-y-3 overflow-y-auto pr-1">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "assistant"
                ? "rounded-[22px] bg-white/72 p-4"
                : "ml-auto max-w-[92%] rounded-[22px] bg-[#f0dfd1] p-4"
            }
          >
            <div className="space-y-2">
              {message.toneLabel ? (
                <p className="text-[11px] uppercase tracking-[0.28em] text-clay/80">{message.toneLabel}</p>
              ) : null}
              <p className="text-sm leading-7 text-ink">{message.content}</p>
              {message.role === "assistant" ? (
                <div className="space-y-2 border-t border-[rgba(80,53,38,0.08)] pt-3 text-sm text-[#6d5a50]">
                  {message.focusQuestion ? <p><strong>Kérdés:</strong> {message.focusQuestion}</p> : null}
                  {message.microAction ? <p><strong>Következő lépés:</strong> {message.microAction}</p> : null}
                  {message.boundary ? <p><strong>Határ:</strong> {message.boundary}</p> : null}
                  {message.affirmation ? <p><strong>Megerősítés:</strong> {message.affirmation}</p> : null}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {pending ? (
          <div className="rounded-[22px] bg-white/72 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-clay/60" />
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-clay/40 [animation-delay:120ms]" />
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-clay/30 [animation-delay:240ms]" />
            </div>
          </div>
        ) : null}
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <textarea
          rows={4}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={`Mi történik most benned a(z) ${stepTitle.toLowerCase()} körül?`}
        />
        <Button type="submit" className="w-full" disabled={pending || input.trim().length === 0}>
          {pending ? "Válasz készül..." : `Beszéljük át a ${stepNumber}. lépést`}
        </Button>
      </form>

      <p className="text-xs leading-6 text-[#7b665a]">
        Ha közvetlen veszélyben vagy vagy önbántás kockázatát érzed, most azonnali emberi segítséghez fordulj ahelyett, hogy itt maradsz egyedül.
      </p>
    </Panel>
  );
}
