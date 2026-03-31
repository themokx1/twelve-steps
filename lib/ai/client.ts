import OpenAI from "openai";
import { getEnv } from "@/lib/db/client";

export async function getOpenAIClient() {
  const env = await getEnv();
  return new OpenAI({
    apiKey: env.OPENAI_API_KEY
  });
}

export async function createStructuredResponseWithTrace({
  name,
  model,
  schema,
  input
}: {
  name: string;
  model: string;
  schema: Record<string, unknown>;
  input: OpenAI.Responses.ResponseCreateParams["input"];
}) {
  const env = await getEnv();
  const httpResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      store: false,
      input,
      text: {
        format: {
          type: "json_schema",
          name,
          schema,
          strict: true
        }
      }
    })
  });

  const rawText = await httpResponse.text();
  const response = rawText ? JSON.parse(rawText) : null;

  if (!httpResponse.ok) {
    throw new Error(`OpenAI Responses API error (${httpResponse.status}): ${rawText.slice(0, 1000)}`);
  }

  return {
    outputText: extractResponseOutputText(response),
    response
  };
}

function extractResponseOutputText(response: unknown) {
  if (response && typeof response === "object" && "output_text" in response && typeof response.output_text === "string") {
    return response.output_text;
  }

  if (response && typeof response === "object" && "output" in response && Array.isArray(response.output)) {
    const fragments = response.output.flatMap((item) => {
      if (!item || typeof item !== "object" || !("content" in item) || !Array.isArray(item.content)) {
        return [];
      }

      const texts: string[] = [];

      for (const content of item.content as unknown[]) {
        if (
          content &&
          typeof content === "object" &&
          "type" in content &&
          content.type === "output_text" &&
          "text" in content &&
          typeof content.text === "string"
        ) {
          texts.push(content.text);
        }
      }

      return texts;
    });

    if (fragments.length > 0) {
      return fragments.join("\n");
    }
  }

  throw new Error("OpenAI response did not include output_text.");
}

