// Keep the runtime env contract in source control so clean CI builds do not
// depend on a locally generated, git-ignored ambient declaration.
export interface CloudflareEnv {
  APP_ENV: string;
  APP_NAME: string;
  APP_URL: string;
  DB: D1Database;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL_COMPANION?: string;
  OPENAI_MODEL_LIGHT?: string;
  SESSION_COOKIE_NAME?: string;
  SESSION_HMAC_SECRET?: string;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  NOTIFICATION_SENDER_EMAIL?: string;
}
