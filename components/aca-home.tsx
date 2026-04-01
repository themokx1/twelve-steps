"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  ACA_AFFIRMATIONS,
  ACA_MEETING_FLOW,
  ACA_OPENING_LINES,
  STEPS,
  getStepByNumber
} from "@/lib/aca/program";
import { type DeskState } from "@/lib/aca/state";
import { AccountPanel } from "@/components/account-panel";
import { CompanionPanel } from "@/components/companion-panel";
import { NotificationPrompt } from "@/components/notification-prompt";
import { Button, Panel, SectionTitle, Shell } from "@/components/ui";

type PasskeyItem = {
  id: string;
  name: string | null;
  deviceType: string;
  backedUp: boolean;
  createdAt: number;
  lastUsedAt: number | null;
};

export function AcaHome({
  userId,
  initialDeskState,
  meetingDate,
  email,
  passkeys
}: {
  userId: string;
  initialDeskState: DeskState;
  meetingDate: string;
  email: string;
  passkeys: PasskeyItem[];
}) {
  const [deskState, setDeskState] = useState<DeskState>(initialDeskState);
  const [search, setSearch] = useState("");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [saveMessage, setSaveMessage] = useState("A mai állapotod D1-ből töltődött be.");
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());
  const isFirstSync = useRef(true);

  useEffect(() => {
    setDeskState(initialDeskState);
    setSaveState("saved");
    setSaveMessage("A mai állapotod D1-ből töltődött be.");
  }, [initialDeskState]);

  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }

    const timeout = window.setTimeout(async () => {
      setSaveState("saving");
      setSaveMessage("Mentem a mai munkádat D1-be...");

      try {
        const response = await fetch("/api/today", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            deskState
          })
        });

        if (!response.ok) {
          throw new Error("A mentés nem sikerült.");
        }

        setSaveState("saved");
        setSaveMessage("A mai állapotod el lett mentve D1-be.");
      } catch {
        setSaveState("error");
        setSaveMessage("A mentés most nem sikerült. A változtatásaid itt maradtak a képernyőn, próbáld újra.");
      }
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [deskState]);

  const selectedStep = getStepByNumber(deskState.activeStep);

  const filteredSteps = useMemo(() => {
    if (!deferredSearch) return STEPS;

    return STEPS.filter((step) =>
      [step.title, step.subtitle, step.purpose, step.meetingLens, ...step.questions]
        .join(" ")
        .toLowerCase()
        .includes(deferredSearch)
    );
  }, [deferredSearch]);

  const journalText = deskState.notes[String(selectedStep.number)] ?? "";
  const completedCount = deskState.completedActions.length;
  const engagedSteps = STEPS.filter((step) => {
    const notes = deskState.notes[String(step.number)]?.trim() ?? "";
    const done = deskState.completedActions.some((entry) => entry.startsWith(`${step.number}:`));
    return notes.length > 30 || done;
  }).length;

  const badges = [
    deskState.checkIn.feeling.trim() ? "Megérkeztél" : null,
    deskState.checkIn.need.trim() ? "Kimondtad a szükségletet" : null,
    completedCount > 0 ? "Mozgásban vagy" : null,
    journalText.trim().length > 80 ? "Őszinte munka" : null
  ].filter(Boolean) as string[];

  const progressStats = [
    {
      label: "Megérintett lépések",
      value: `${engagedSteps}/12`
    },
    {
      label: "Mai mikrogyakorlatok",
      value: String(completedCount)
    },
    {
      label: "Mai nap",
      value: meetingDate
    }
  ];
  const promiseText =
    deskState.checkIn.promise.trim() || "Válassz egy kicsi vállalást, és az lesz ma a fókuszod.";
  const saveStatusLabel = saveState === "saved" ? "Elmentve" : saveState === "saving" ? "Mentés..." : "Mentési hiba";
  const saveStatusTone =
    saveState === "saved"
      ? "bg-[#e4f0eb] text-cedar"
      : saveState === "saving"
        ? "bg-white/80 text-ink"
        : "bg-[#f7d7d2] text-[#8f3f30]";

  function updateCheckIn(key: keyof DeskState["checkIn"], value: string) {
    setDeskState((current) => ({
      ...current,
      checkIn: {
        ...current.checkIn,
        [key]: value
      }
    }));
  }

  function updateNotes(value: string) {
    setDeskState((current) => ({
      ...current,
      notes: {
        ...current.notes,
        [String(selectedStep.number)]: value
      }
    }));
  }

  function togglePractice(actionIndex: number) {
    const key = `${selectedStep.number}:${actionIndex}`;

    startTransition(() => {
      setDeskState((current) => {
        const hasEntry = current.completedActions.includes(key);
        return {
          ...current,
          completedActions: hasEntry
            ? current.completedActions.filter((entry) => entry !== key)
            : [...current.completedActions, key]
        };
      });
    });
  }

  return (
    <Shell className="overflow-x-hidden">
      <div className="space-y-6 pb-10 md:space-y-8 xl:space-y-10">
        <Panel className="overflow-hidden lg:min-h-[calc(100svh-3.5rem)]">
          <div className="grid gap-8 xl:h-full xl:grid-cols-[1.18fr_0.82fr] xl:items-end">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.32em] text-clay/80">ACA mini gyűlés</p>
                <h1 className="max-w-5xl font-display text-4xl leading-[0.95] text-ink sm:text-5xl xl:text-[4.8rem]">
                  Meleg, letisztult tér a 12 lépés megismerésére, gyakorlására és rögzítésére.
                </h1>
                <p className="max-w-3xl text-base leading-8 text-[#6d5a50] sm:text-lg">
                  Most már bejelentkezve dolgozol: a mai becsekkolásod és jegyzeteid D1-be mentődnek, és ugyanarra a
                  napra vissza is töltődnek. Nem kell tartanod fejben az egészet. Megérdemled, hogy jó történjen
                  veled, és azt is, hogy ez a munka tényleg meg legyen tartva.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {ACA_AFFIRMATIONS.map((affirmation) => (
                  <span
                    key={affirmation}
                    className="inline-flex rounded-full border border-[rgba(80,53,38,0.08)] bg-white/70 px-4 py-2 text-sm text-ink/80"
                  >
                    {affirmation}
                  </span>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {progressStats.map((stat) => (
                  <div key={stat.label} className="rounded-[24px] bg-white/72 p-5 shadow-soft">
                    <p className="text-[11px] uppercase tracking-[0.26em] text-clay/80">{stat.label}</p>
                    <p className="mt-2 font-display text-3xl text-ink">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative space-y-4 rounded-[30px] bg-[#f2dfcf] p-6 shadow-soft">
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.32em] text-clay/80">Mai nyitó szöveg</p>
                <h2 className="max-w-md font-display text-[2rem] leading-tight text-ink">Az első percekben már tartunk</h2>
              </div>
              <div className="space-y-3">
                {ACA_OPENING_LINES.map((line) => (
                  <p key={line} className="rounded-[22px] bg-white/70 p-4 text-sm leading-7 text-ink">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Panel>

        <section className="grid gap-6 2xl:grid-cols-[1.28fr_0.72fr] 2xl:items-start">
          <Panel className="space-y-6 lg:min-h-[22rem]">
            <SectionTitle
              eyebrow="Mai tartás"
              title="A rendszer most mit emel eléd?"
              body="A jobb oldali sáv helyett itt egy szélesebb fókuszfelület tartja meg a mai vállalást, a kijelölt lépést és a mentési állapotot."
            />

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.95fr_0.95fr]">
              <div className="rounded-[24px] bg-white/72 p-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-clay/80">Mai fókusz</p>
                <p className="mt-3 text-sm leading-7 text-ink">{promiseText}</p>
              </div>

              <div className="rounded-[24px] bg-white/72 p-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-clay/80">Kijelölt lépés</p>
                <p className="mt-3 text-sm leading-7 text-ink">
                  {selectedStep.number}. lépés: {selectedStep.subtitle}
                </p>
              </div>

              <div className="rounded-[24px] bg-[#f0dfd1] p-5">
                <p className="text-[11px] uppercase tracking-[0.28em] text-clay/80">Mentési állapot</p>
                <p className="mt-3 text-sm leading-7 text-ink">{saveMessage}</p>
                <span className={`mt-4 inline-flex rounded-full px-3 py-2 text-xs font-semibold ${saveStatusTone}`}>
                  {saveStatusLabel}
                </span>
              </div>
            </div>
          </Panel>

          <AccountPanel email={email} passkeys={passkeys} />
        </section>

        <section className="grid gap-6 2xl:grid-cols-[1.02fr_0.98fr] 2xl:items-start">
          <Panel className="space-y-6 lg:min-h-[46rem]">
            <SectionTitle
              eyebrow="Becsekkolás"
              title="Ne találgasd magad, inkább mondd ki"
              body="A napi munka itt kezdődik: érzés, testi állapot, szükséglet és egy vállalható mai mondat."
            />

            <div className="grid gap-4">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Mit érzel most a legerősebben?</span>
                <textarea
                  rows={3}
                  value={deskState.checkIn.feeling}
                  onChange={(event) => updateCheckIn("feeling", event.target.value)}
                  placeholder="Például: szétszórt vagyok, félek, dühös vagyok, megkönnyebbültem..."
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Mit jelez most a tested?</span>
                <textarea
                  rows={3}
                  value={deskState.checkIn.body}
                  onChange={(event) => updateCheckIn("body", event.target.value)}
                  placeholder="Például: összeszorult mellkas, fáradt vállak, kapkodó légzés..."
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Mire van most igazán szükséged?</span>
                <textarea
                  rows={3}
                  value={deskState.checkIn.need}
                  onChange={(event) => updateCheckIn("need", event.target.value)}
                  placeholder="Például: egyértelműségre, nyugalomra, pihenésre, határokra..."
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-ink">Mi az egy vállalás mára?</span>
                <input
                  value={deskState.checkIn.promise}
                  onChange={(event) => updateCheckIn("promise", event.target.value)}
                  placeholder="Például: megválaszolok egy kérdést a 4. lépésből."
                />
              </label>
            </div>
          </Panel>

          <Panel className="space-y-6 lg:min-h-[46rem]">
            <SectionTitle
              eyebrow="Mini gyűlés ritmus"
              title="Minden konkrétan eléd van téve"
              body="Semmit nem kell fejben összeraknod: a folyamat fix, tartó és egyszerre nagyon emberi."
            />

            <div className="space-y-4">
              {ACA_MEETING_FLOW.map((item, index) => (
                <div
                  key={item.title}
                  className="grid gap-3 rounded-[24px] bg-white/70 p-4 md:grid-cols-[auto_1fr] md:items-start"
                >
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0d7c5] font-display text-xl text-ink">
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                    <p className="text-sm leading-7 text-[#6d5a50]">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] bg-[#f0dfd1] p-5">
              <p className="text-[11px] uppercase tracking-[0.28em] text-clay/80">Játékosság, de nem komolytalanul</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {badges.length > 0 ? (
                  badges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-ink"
                    >
                      {badge}
                    </span>
                  ))
                ) : (
                  <span className="text-sm leading-7 text-[#6d5a50]">
                    Az első jelvényed már az, hogy itt vagy. Az is számít.
                  </span>
                )}
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[0.8fr_1.2fr] 2xl:items-start">
          <Panel className="space-y-5 lg:min-h-[calc(100svh-4rem)]">
            <SectionTitle
              eyebrow="12 lépés"
              title="Kereshető, kiválasztható, egyből használható"
              body="Szűrj rá egy témára, vagy csak menj sorban. Minden lépéshez itt van a fókusz, a kérdés és a gyakorlat."
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Keress egy lépésre, témára vagy kérdésre..."
            />

            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-1">
              {filteredSteps.map((step) => {
                const isActive = step.number === selectedStep.number;
                const noteLength = deskState.notes[String(step.number)]?.trim().length ?? 0;
                const doneCount = deskState.completedActions.filter((entry) => entry.startsWith(`${step.number}:`)).length;

                return (
                  <button
                    key={step.number}
                    type="button"
                    className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                      isActive
                        ? "border-transparent bg-[#f0d7c5] shadow-soft"
                        : "border-[rgba(80,53,38,0.08)] bg-white/60 hover:bg-white"
                    }`}
                    onClick={() => setDeskState((current) => ({ ...current, activeStep: step.number }))}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-clay/80">{step.number}. lépés</p>
                        <h3 className="text-base font-semibold leading-6 text-ink">{step.title}</h3>
                        <p className="text-sm leading-6 text-[#6d5a50]">{step.subtitle}</p>
                      </div>
                      <div className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-ink/75">
                        {doneCount} gyakorlat · {noteLength > 0 ? "van jegyzet" : "nincs jegyzet"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel className="space-y-6 lg:min-h-[calc(100svh-4rem)]">
            <SectionTitle
              eyebrow={`${selectedStep.number}. lépés`}
              title={selectedStep.title}
              body={selectedStep.subtitle}
            />

            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4">
                <div className="rounded-[24px] bg-white/70 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-clay/80">Miért fontos most?</p>
                  <p className="mt-3 text-sm leading-7 text-ink">{selectedStep.purpose}</p>
                </div>

                <div className="rounded-[24px] bg-[#f0dfd1] p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-clay/80">ACA nézőpont</p>
                  <p className="mt-3 text-sm leading-7 text-ink">{selectedStep.meetingLens}</p>
                </div>

                <div className="rounded-[24px] bg-white/70 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-clay/80">Mai mondat</p>
                  <p className="mt-3 font-display text-2xl leading-tight text-ink">{selectedStep.prayer}</p>
                </div>

                <div className="rounded-[24px] bg-white/70 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-clay/80">Megerősítés</p>
                  <p className="mt-3 text-sm leading-7 text-ink">{selectedStep.affirmation}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-3 rounded-[24px] bg-white/70 p-5">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-clay/80">Vezetett kérdések</p>
                  <div className="space-y-3">
                    {selectedStep.questions.map((question) => (
                      <div key={question} className="rounded-[20px] bg-[#fffaf5] p-3 text-sm leading-7 text-ink">
                        {question}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-[24px] bg-white/70 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-clay/80">Mai gyakorlatok</p>
                    <span className="rounded-full bg-[#f0dfd1] px-3 py-2 text-xs font-semibold text-ink">
                      {selectedStep.celebration}
                    </span>
                  </div>

                  {selectedStep.practices.map((practice, index) => {
                    const isDone = deskState.completedActions.includes(`${selectedStep.number}:${index}`);

                    return (
                      <button
                        key={practice.label}
                        type="button"
                        className={`w-full rounded-[20px] border px-4 py-4 text-left transition ${
                          isDone
                            ? "border-transparent bg-[#e4f0eb]"
                            : "border-[rgba(80,53,38,0.08)] bg-[#fffaf5] hover:bg-white"
                        }`}
                        onClick={() => togglePractice(index)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm font-semibold text-ink">{practice.label}</h3>
                            <p className="mt-1 text-sm leading-6 text-[#6d5a50]">{practice.hint}</p>
                          </div>
                          <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-ink">
                            {isDone ? "Kész" : "Kijelölöm"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-[28px] border border-[rgba(80,53,38,0.08)] bg-[#fffaf5] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-clay/80">Saját jegyzeted</p>
                  <h3 className="text-lg font-semibold text-ink">Itt rögzíted, amit valóban észrevettél</h3>
                </div>
                <Button type="button" variant="ghost">
                  {journalText.trim().length > 0 ? "Munka folyamatban" : "Kezdem"}
                </Button>
              </div>

              <textarea
                rows={11}
                value={journalText}
                onChange={(event) => updateNotes(event.target.value)}
                placeholder="Írj ide őszintén. Nem kell szépen, csak igazul. Mi történt benned? Mit láttál meg? Mi a következő tiszta lépés?"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-[#f0dfd1] p-4">
                <p className="text-sm leading-7 text-ink">
                  {journalText.trim().length > 0
                    ? "Ez már valós munka. Még ha nem is kész, már nem vagy a ködben."
                    : "Kezdd el egyetlen mondattal. Az első igaz mondat mindig többet ér, mint a tökéletes hallgatás."}
                </p>
                <span className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-ink">
                  {journalText.trim().length} karakter
                </span>
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[0.62fr_1.38fr] 2xl:items-start">
          <NotificationPrompt />

          <CompanionPanel
            userId={userId}
            stepNumber={selectedStep.number}
            stepTitle={selectedStep.title}
            journalSnippet={[deskState.checkIn.feeling, deskState.checkIn.need, journalText].filter(Boolean).join("\n")}
          />
        </section>
      </div>
    </Shell>
  );
}
