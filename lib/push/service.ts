import webpush from "web-push";
import { getEnv } from "@/lib/db/client";

export type BrowserPushSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export async function getPushPublicKey() {
  const env = await getEnv();
  return env.VAPID_PUBLIC_KEY ?? null;
}

export async function sendPushNotification(
  subscription: BrowserPushSubscription,
  payload: {
    title: string;
    body: string;
    url?: string;
  }
) {
  const env = await getEnv();

  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    return {
      enabled: false,
      delivered: false,
      reason: "VAPID kulcsok nincsenek beállítva."
    };
  }

  webpush.setVapidDetails(
    `mailto:${env.NOTIFICATION_SENDER_EMAIL || "support@example.com"}`,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return {
      enabled: true,
      delivered: true
    };
  } catch (error) {
    return {
      enabled: true,
      delivered: false,
      reason: error instanceof Error ? error.message : "Ismeretlen push hiba."
    };
  }
}

