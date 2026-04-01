import { getEnv } from "@/lib/db/client";

export async function getSessionHmacSecret() {
  const env = await getEnv();

  if (!env.SESSION_HMAC_SECRET) {
    throw new Error("SESSION_HMAC_SECRET is not configured.");
  }

  return env.SESSION_HMAC_SECRET;
}
