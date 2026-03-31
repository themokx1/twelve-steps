import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    passwordSalt: text("password_salt").notNull(),
    displayName: text("display_name"),
    locale: text("locale").notNull().default("hu"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull()
  },
  (table) => ({
    emailUnique: uniqueIndex("users_email_unique").on(table.email)
  })
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at").notNull(),
    rotatesAt: integer("rotates_at").notNull(),
    createdAt: integer("created_at").notNull(),
    lastSeenAt: integer("last_seen_at").notNull(),
    userAgentHash: text("user_agent_hash"),
    ipHash: text("ip_hash")
  },
  (table) => ({
    userIdx: index("sessions_user_idx").on(table.userId),
    expiresIdx: index("sessions_expires_idx").on(table.expiresAt)
  })
);

export const passkeys = sqliteTable(
  "passkeys",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    credentialId: text("credential_id").notNull(),
    publicKey: text("public_key").notNull(),
    counter: integer("counter").notNull().default(0),
    deviceType: text("device_type").notNull(),
    backedUp: integer("backed_up").notNull().default(0),
    transportsJson: text("transports_json").notNull().default("[]"),
    name: text("name"),
    createdAt: integer("created_at").notNull(),
    lastUsedAt: integer("last_used_at"),
    updatedAt: integer("updated_at").notNull()
  },
  (table) => ({
    userIdx: index("passkeys_user_idx").on(table.userId),
    credentialUnique: uniqueIndex("passkeys_credential_id_unique").on(table.credentialId)
  })
);

export const stepProgress = sqliteTable(
  "step_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stepNumber: integer("step_number").notNull(),
    status: text("status").notNull().default("not_started"),
    resonanceScore: integer("resonance_score"),
    intention: text("intention"),
    lastVisitedAt: integer("last_visited_at"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull()
  },
  (table) => ({
    userStepUnique: uniqueIndex("step_progress_user_step_unique").on(table.userId, table.stepNumber),
    userStatusIdx: index("step_progress_user_status_idx").on(table.userId, table.status)
  })
);

export const practiceEntries = sqliteTable(
  "practice_entries",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stepNumber: integer("step_number").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    prompt: text("prompt"),
    response: text("response").notNull(),
    emotionalTemperature: integer("emotional_temperature"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull()
  },
  (table) => ({
    userStepIdx: index("practice_entries_user_step_idx").on(table.userId, table.stepNumber),
    createdIdx: index("practice_entries_created_idx").on(table.createdAt)
  })
);

export const meetingSessions = sqliteTable(
  "meeting_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    meetingDate: text("meeting_date").notNull(),
    arrivalNote: text("arrival_note"),
    bodyNote: text("body_note"),
    needsNote: text("needs_note"),
    dailyPromise: text("daily_promise"),
    affirmationShown: text("affirmation_shown"),
    activeStep: integer("active_step").notNull().default(1),
    notesJson: text("notes_json").notNull().default("{}"),
    completedActionsJson: text("completed_actions_json").notNull().default("[]"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull()
  },
  (table) => ({
    userDateIdx: uniqueIndex("meeting_sessions_user_date_unique").on(table.userId, table.meetingDate)
  })
);

export const aiRuns = sqliteTable(
  "ai_runs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    kind: text("kind").notNull(),
    model: text("model"),
    inputExcerpt: text("input_excerpt"),
    outputExcerpt: text("output_excerpt"),
    status: text("status").notNull(),
    createdAt: integer("created_at").notNull()
  },
  (table) => ({
    createdIdx: index("ai_runs_created_idx").on(table.createdAt),
    kindIdx: index("ai_runs_kind_idx").on(table.kind)
  })
);

export const pushSubscriptions = sqliteTable(
  "push_subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    endpoint: text("endpoint").notNull(),
    keysJson: text("keys_json").notNull(),
    locale: text("locale"),
    userAgent: text("user_agent"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull()
  },
  (table) => ({
    endpointUnique: uniqueIndex("push_subscriptions_endpoint_unique").on(table.endpoint)
  })
);
