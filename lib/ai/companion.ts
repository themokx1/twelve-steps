import { z } from "zod";
import { createStructuredResponseWithTrace } from "@/lib/ai/client";
import { getEnv } from "@/lib/db/client";
import { safeLogAiRun } from "@/lib/db/repositories/journey";

const companionResponseSchema = z.object({
  toneLabel: z.string().min(2).max(40),
  response: z.string().min(20).max(900),
  focusQuestion: z.string().min(8).max(220),
  microAction: z.string().min(8).max(220),
  affirmation: z.string().min(8).max(220),
  boundary: z.string().min(8).max(220)
});

const companionJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["toneLabel", "response", "focusQuestion", "microAction", "affirmation", "boundary"],
  properties: {
    toneLabel: { type: "string" },
    response: { type: "string" },
    focusQuestion: { type: "string" },
    microAction: { type: "string" },
    affirmation: { type: "string" },
    boundary: { type: "string" }
  }
} satisfies Record<string, unknown>;

export type CompanionReply = z.infer<typeof companionResponseSchema>;

export async function generateCompanionReply({
  message,
  stepNumber,
  stepTitle,
  journalSnippet,
  conversation
}: {
  message: string;
  stepNumber?: number;
  stepTitle?: string;
  journalSnippet?: string;
  conversation?: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  const env = await getEnv();
  const model = env.OPENAI_MODEL_COMPANION || env.OPENAI_MODEL_LIGHT || "gpt-5.4-mini";
  const inputExcerpt = message.slice(0, 500);

  if (!env.OPENAI_API_KEY) {
    const fallback = createFallbackReply({ message, stepTitle });
    await safeLogAiRun({
      kind: "aca_companion",
      model,
      inputExcerpt,
      outputExcerpt: JSON.stringify(fallback).slice(0, 500),
      status: "fallback_no_api_key"
    });
    return fallback;
  }

  try {
    const { outputText } = await createStructuredResponseWithTrace({
      name: "aca_companion_reply",
      model,
      schema: companionJsonSchema,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "Te egy ACA 12 lepesen vegigkiserő, meleg hangú, nagyon empatikus, de fegyelmezett tars vagy. A felhasznalot nem hagyod szetszorni vagy elkalandozni. Mindig ACA-s szemleletben valaszolsz: jelenlet, onazonossag, felelossegvallalas, belso gyermek, szeretetteljes hatarok, egyetlen kovetkezo helyes lepes. Nem diagnosztizalsz, nem ijesztgetsz, nem vagy hideg. Ha a user veszelyt, onbantast vagy teljes kontrollvesztést jelez, roviden, melegen mondd ki, hogy most azonnali emberi tamasz kell. A valasz legyen magyarul, konkret, gyakorlatias, 4-6 mondatos. Mindig adj egy fokuszkerdest, egy apro cselekvest, egy hatartarto mondatot es egy megerositest. A megerosites sokszor emlekeztessen arra, hogy a felhasznalo megerdemli, hogy jo tortenjen vele."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                `Aktiv lepes: ${stepNumber ?? "ismeretlen"}. ${stepTitle ?? "Nincs kivalasztva."}`,
                journalSnippet ? `Friss jegyzet: ${journalSnippet}` : "Friss jegyzet nincs.",
                conversation && conversation.length > 0
                  ? `Legutobbi beszelgetes: ${conversation
                      .slice(-6)
                      .map((entry) => `${entry.role}: ${entry.content}`)
                      .join(" | ")}`
                  : "Korabbi beszelgetes nincs.",
                `Felhasznaloi uzenet: ${message}`
              ].join("\n\n")
            }
          ]
        }
      ]
    });

    const parsed = companionResponseSchema.parse(JSON.parse(outputText));

    await safeLogAiRun({
      kind: "aca_companion",
      model,
      inputExcerpt,
      outputExcerpt: outputText.slice(0, 500),
      status: "success"
    });

    return parsed;
  } catch (error) {
    const fallback = createFallbackReply({ message, stepTitle });

    await safeLogAiRun({
      kind: "aca_companion",
      model,
      inputExcerpt,
      outputExcerpt: JSON.stringify(fallback).slice(0, 500),
      status: "fallback_error"
    });

    console.error("Companion generation failed", error);
    return fallback;
  }
}

function createFallbackReply({
  message,
  stepTitle
}: {
  message: string;
  stepTitle?: string;
}) {
  const lower = message.toLowerCase();
  const isOverwhelmed = /(felek|panik|szorong|ossze|nem birom|tulterhelt|remenytelen)/.test(lower);
  const isAvoiding = /(holnap|majd kesobb|nem akarok|nincs kedvem|elkerulom)/.test(lower);
  const stepContext = stepTitle ? `Most a(z) ${stepTitle} körül dolgozol.` : "Most azzal dolgozol, ami éppen eléd jött.";

  if (isOverwhelmed) {
    return {
      toneLabel: "Földelés",
      response: `${stepContext} Nem kell most mindent megoldanod. Először csak lassítsunk le, és hozzuk vissza a figyelmet a jelen pillanatba. Tedd le a vállad, nézz körül, és nevezd meg magadban három dolgot, amit látsz. Megérdemled, hogy jó történjen veled, és most az a jó, ha nem erőből nyomod tovább magad.`,
      focusQuestion: "Mi az az egy érzés, amit most már ki tudsz mondani szépítés nélkül?",
      microAction: "Írj le egyetlen őszinte mondatot arról, mi fáj vagy mi túl sok most.",
      affirmation: "Megérdemled, hogy jó történjen veled akkor is, amikor éppen nehéz.",
      boundary: "Most csak a következő 5 perc a dolgod, nem az egész életed rendezése."
    };
  }

  if (isAvoiding) {
    return {
      toneLabel: "Gyengéd következetesség",
      response: `${stepContext} Érzem, hogy menne az eltolás, és itt most szeretettel, de komolyan megfoglak. Nem kell tökéletesen csinálnod, csak megjelenni. Az ACA munka gyakran pont ott gyógyít, ahol legszívesebben elfordulnánk. Megérdemled, hogy jó történjen veled, és ehhez ma elég egy kicsi, valós lépés.`,
      focusQuestion: "Mi az a legkisebb feladat, amit most tényleg meg tudsz csinálni kifogás nélkül?",
      microAction: "Válassz ki egy kérdést a lépésedből, és válaszold meg három mondatban.",
      affirmation: "Megérdemled, hogy jó történjen veled, nem csak majd egyszer, hanem a mai döntéseidben is.",
      boundary: "Nem kell ihletre várni, csak kezdd el a következő kicsi igaz lépéssel."
    };
  }

  return {
    toneLabel: "Tartó jelenlét",
    response: `${stepContext} Itt vagyok veled, és együtt végig tudjuk vinni ezt a részt. Maradjunk konkrétak: egy érzés, egy gondolat, egy apró cselekvés. Nem kell nagyot teljesítened ahhoz, hogy ez érvényes munka legyen. Megérdemled, hogy jó történjen veled, és az is jó, amikor végre figyelmet kapsz saját magadtól.`,
    focusQuestion: "Mi az a mondat, amit a leginkább ki kell mondanod ma magadnak?",
    microAction: "Írj le most egy rövid jegyzetet a lépésedhez, akkor is, ha nem tökéletes.",
    affirmation: "Megérdemled, hogy jó történjen veled, és megérdemled a következetes támogatást is.",
    boundary: "Ne nyiss új témát, amíg ezt az egy gondolatot végig nem írtad."
  };
}

