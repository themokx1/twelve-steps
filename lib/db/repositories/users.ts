import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { createId } from "@/lib/utils/ids";
import { nowUnix } from "@/lib/utils/time";

export async function createUser(input: {
  email: string;
  passwordHash: string;
  passwordSalt: string;
  locale?: string;
}) {
  const db = await getDb();
  const timestamp = nowUnix();
  const userId = createId("usr");

  await db.insert(users).values({
    id: userId,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    passwordSalt: input.passwordSalt,
    locale: input.locale ?? "hu",
    createdAt: timestamp,
    updatedAt: timestamp
  });

  return userId;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  return user ?? null;
}

export async function getUserById(userId: string) {
  const db = await getDb();
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user ?? null;
}

export async function updateUserPasswordCredentials(
  userId: string,
  input: {
    passwordHash: string;
    passwordSalt: string;
  }
) {
  const db = await getDb();

  await db
    .update(users)
    .set({
      passwordHash: input.passwordHash,
      passwordSalt: input.passwordSalt,
      updatedAt: nowUnix()
    })
    .where(eq(users.id, userId));
}

