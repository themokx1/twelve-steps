import { NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth/api";
import { generateCompanionReply } from "@/lib/ai/companion";

const requestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  stepNumber: z.number().int().min(1).max(12).optional(),
  stepTitle: z.string().max(240).optional(),
  journalSnippet: z.string().max(4000).optional(),
  conversation: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(1500)
      })
    )
    .max(10)
    .optional()
});

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;

  try {
    const body = requestSchema.parse(await request.json());
    const reply = await generateCompanionReply({
      ...body,
      userId: auth.session.userId
    });
    return NextResponse.json(reply);
  } catch (error) {
    console.error("Companion route failed", error);
    return NextResponse.json(
      {
        toneLabel: "Stabil tartás",
        response:
          "Most egyszerű, biztos válasszal maradok veled: állj meg, lélegezz, és válassz ki egyetlen igaz mondatot arról, mi van benned. Megérdemled, hogy jó történjen veled, és ehhez most az is elég, ha nem menekülsz el önmagad elől.",
        focusQuestion: "Mi az a mondat, amit most nem akarsz tovább kerülni?",
        microAction: "Írj le egy rövid jegyzetet a kiválasztott lépéshez.",
        affirmation: "Megérdemled, hogy jó történjen veled.",
        boundary: "Most csak egy feladatra figyelj."
      },
      { status: 200 }
    );
  }
}
