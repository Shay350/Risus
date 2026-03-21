# Risus

Risus is a UI-first MVP for multilingual consultation work. It is currently built as a focused three-screen workflow instead of a full admin suite.

## Product Flow

1. `Session`
   One-on-one live consultation view with the call surface, translated chat-style transcript rail, minimal metadata, and call controls.

2. `Analysis`
   Condensed AI insight review with a small metric strip and only four sections: Revenue, Risks, Questions, and Recommendation.

3. `Deliverables`
   Unified operational output queue for generated summaries, translated files, and export packets.

Legacy routes such as `/dashboard`, `/workspace`, `/documents`, and `/summaries` redirect into this simplified flow.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS v4
- Small reusable UI layer with `class-variance-authority`, `clsx`, and `tailwind-merge`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Current State

- Frontend only
- Mocked session, transcript, insight, and deliverable data
- No backend media, translation, upload, auth, or persistence wiring yet

## Key Files

- `src/app/(app)/session/page.tsx`
- `src/app/(app)/analysis/page.tsx`
- `src/app/(app)/deliverables/page.tsx`
- `src/components/layout/*`
- `src/components/calls/*`
- `src/components/deliverables/*`
- `src/lib/mock-data.ts`
