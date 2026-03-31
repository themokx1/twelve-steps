# ACA Tizenkét Lépés

Warm, Cloudflare-ready `Next.js` web app for learning, practicing, and recording the ACA 12 steps in a guided, meeting-like flow.

## What is in this starter

- `Next.js 15` App Router + `React 19` + `TypeScript`
- Cloudflare Workers runtime via `@opennextjs/cloudflare`
- Cloudflare D1 + Drizzle schema-first setup
- structured OpenAI companion route with graceful fallback
- installable PWA shell + service worker
- browser push subscription flow and test push route
- ACA-first UI with:
  - mini meeting opening
  - daily check-in
  - guided step library
  - practice prompts and journaling space
  - supportive AI companion
  - gentle progress/badge system

## Notes about scope

This first pass is intentionally strong on the actual recovery UX and the Cloudflare/OpenAI foundation.

Already scaffolded:

- D1 tables for `users`, `sessions`, `passkeys`, `step_progress`, `practice_entries`, `meeting_sessions`, `ai_runs`, `push_subscriptions`
- reusable AI client and audit logging
- push notification service layer

Not fully implemented yet:

- full email/password auth flow
- passkey enrollment/sign-in UI
- server-persisted user journaling screens

The schema and architecture are ready for those next steps.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.dev.vars`:

```env
OPENAI_API_KEY=sk-...
SESSION_HMAC_SECRET=replace-with-a-long-random-secret
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
NOTIFICATION_SENDER_EMAIL=you@example.com
```

3. Create a D1 database and fill the IDs in [wrangler.jsonc](/Users/zoltanpalotai16/PhpstormProjects/twelve-steps/wrangler.jsonc).

4. Apply migrations locally:

```bash
npx wrangler d1 migrations apply DB --local
```

5. Run the app:

```bash
npm run dev
```

Production-like local runtime:

```bash
npm run preview
```

## Key files

- [app/page.tsx](/Users/zoltanpalotai16/PhpstormProjects/twelve-steps/app/page.tsx)
- [components/aca-home.tsx](/Users/zoltanpalotai16/PhpstormProjects/twelve-steps/components/aca-home.tsx)
- [components/companion-panel.tsx](/Users/zoltanpalotai16/PhpstormProjects/twelve-steps/components/companion-panel.tsx)
- [app/api/ai/companion/route.ts](/Users/zoltanpalotai16/PhpstormProjects/twelve-steps/app/api/ai/companion/route.ts)
- [lib/ai/companion.ts](/Users/zoltanpalotai16/PhpstormProjects/twelve-steps/lib/ai/companion.ts)
- [lib/db/schema.ts](/Users/zoltanpalotai16/PhpstormProjects/twelve-steps/lib/db/schema.ts)
- [public/sw.js](/Users/zoltanpalotai16/PhpstormProjects/twelve-steps/public/sw.js)

## Recommended next build steps

1. Add real auth screens and session cookies using the existing schema foundation.
2. Persist journaling and step progress to D1 repositories instead of local storage only.
3. Add passkey enrollment and sign-in.
4. Add daily reminder scheduling and admin tools for push campaigns.
5. Add Vitest coverage for the AI fallback and repository helpers.
