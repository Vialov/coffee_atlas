# Coffee Atlas

Local-first personal specialty coffee journal, built with Expo, React Native,
TypeScript, Expo Router, expo-sqlite, and Drizzle. Targets iOS and Android.

## Current scope

Only coffee list and coffee detail. Do not add Atlas/maps, OCR, synchronization,
editing, authentication, or backend features unless explicitly requested.

## Engineering

- SQLite is the source of truth; UI must never import seed fixtures.
- Schema changes require generated, versioned migrations. Never silently recreate a database.
- Never fix a persisted schema change by deleting or recreating the database. Every persisted schema change must be delivered as a new, generated, versioned migration.
- Persist UUID entity IDs. Store descriptors as JSON text and expose `string[]`.
- Keep components small and code straightforward; avoid generic infrastructure and state frameworks.
- Maintain both native platforms and keep all runtime data/assets offline.
- Initialization opens the database, configures pragmas, migrates, then atomically seeds only an empty table.

## Design

Warm field journal; platform fonts, whitespace, subtle borders, no dashboard styling.
Central theme palette: background #F6F2E9, surface #FFFDF8, text #292621,
green #48624D, terracotta #B76642, muted #8B867B, divider #DDD7CB.

## Checks

Run `npm run typecheck`, `npm run lint`, and `npm test` before finishing.
Check `npm start` still starts Expo. For database changes verify first launch and
relaunch on a native device. Generate migrations with `npm run db:generate -- --name descriptive_name`;
commit SQL, metadata, and the generated migration bundle together.
