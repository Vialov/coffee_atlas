# Coffee Atlas

A small, local-first specialty coffee journal for iOS and Android. Includes a coffee list, detail screen, and a shared add/edit form, with two sample lots on first launch. No account,
backend, remote images, or runtime data connection is required.

## Setup

Use Node.js 24 LTS (or newer) and npm. The test harness uses built-in Node SQLite.

```sh
npm install
npm start
```

Open the project in an Expo Go version supporting SDK 57, or use an Android
emulator / iOS simulator. iOS simulation requires macOS and full Xcode; Android
requires Android Studio's SDK and an emulator. Development uses Metro; installed
release builds contain their JavaScript and work without the development server.

```sh
npm run android       # Start Expo and open Android
npm run ios           # Start Expo and open iOS
npm run typecheck
npm run lint
npm test
npx expo install --check
npx expo export --platform all
```

For a standalone local Android release: `npx expo run:android --variant release`.
Native build tooling and dependency downloads are needed to build, but no backend
is needed to use the resulting app. Generated native directories are ignored.

## Structure and stack

- `app/`: Expo Router native stack, `/` list, `/coffee/[id]` detail, and `/lot-form` create/edit.
- `src/components/`, `src/theme/`: reusable cards, chips, sections, and central visual tokens.
- `src/db/`: Drizzle SQLite schema, connection, startup, migrations, and seed mechanism.
- `src/repositories/`: typed CRUD operations and JSON-to-domain mapping.
- `src/types/`: application domain types.

React Native, Expo, strict TypeScript, expo-sqlite, and Drizzle ORM/Kit. React DOM
and animation packages satisfy Expo Router's compatible peers; web is not a target.

## Persistence and migrations

The app automatically opens `coffee-atlas.db`, enables foreign keys and WAL,
applies bundled Drizzle migrations, and inserts the two seeds in a transaction
only when `coffee_lots` is empty and initialization has not been recorded. A versioned
`journal_state` table records initialization in the same transaction, so deleting all
lots leaves an empty journal on subsequent launches. Rendering waits for that sequence.
Repeated startup does not duplicate seeds or recreate data. A startup failure
shows an error without resetting storage.

Descriptors are JSON text in SQLite and validated `string[]` values at the repository
boundary. Dates use ISO strings; roast dates are displayed in UTC to avoid day shifts.
List order is creation time ascending, then UUID ascending. Optional fields are omitted
when absent. English interface labels preserve the original Russian tasting notes.

`photo_path` is nullable and stores a relative path inside the app's persistent
Documents directory (for example, `coffee-photos/lot-id.jpg`). `CoffeeLot.photoPath`
exposes it to the detail screen, which resolves it against the current Documents
directory using `expo-file-system`. Missing or unreadable photos show a locally
drawn package labeled with the lot's data. The form supports camera capture and gallery
selection, copying the image to Documents on save. Replaced/deleted photos are
removed after a successful database write; canceled form edits do not copy files.

To change the schema:

1. Edit `src/db/schema.ts`.
2. Run `npm run db:generate -- --name describe_change`.
3. Commit the generated SQL, metadata, and migration entry point under `src/db/migrations/`.
4. Test startup against both a fresh and an existing database.

Migrations are bundled by Metro/Babel and applied on-device, not by a developer
manually creating the database. Never edit an already released migration or reset
user storage to accommodate a schema change.

## Verification

Tests exercise the real Drizzle Expo driver through a small Node SQLite bridge,
including migrations, seed idempotence, preservation of existing data, repository
mapping, missing IDs, and failure ordering. They supplement native testing.

Native checklist: first launch has two coffees; open both details; check every field,
header back and Android hardware back; relaunch and confirm persisted IDs/count;
open an unknown ID; check large text and narrow screens; launch an installed release
offline. iOS and Android bundle success alone is not device verification.

Out of scope: list search/filters, maps, OCR, AI,
authentication, synchronization, and brewing history.

### Iteration 1 validation

Verified with a clean `npm ci`, lint, TypeScript, all 9 SQLite regression tests,
21/21 Expo Doctor checks, and iOS/Android bundle exports. An Android API 36 emulator
ran the installed release without Metro or network access: both details, header
and hardware back, cold-launch unknown IDs, restart seed count, and 320dp layouts
with 150% font scale were checked. Existing custom-row preservation is covered by
the SQLite regression suite, not by direct modification of the emulator's database.

An iOS native build/runtime check is still needed on a machine with full Xcode.
The stable dependency tree currently reports 17 moderate npm audit findings;
the suggested forced fixes include incompatible major downgrades and were not applied.

### Add / edit lot

Use the floating + on the list or the pencil on a detail screen. Only the name is
required. The shared form supports a bundled searchable country list (including
custom text), processing choices, removable flavor notes, an optional native roast
date picker, optional photos, decimal ratings, and multiline impressions. Clear
controls restore optional dates/ratings to null. Back navigation confirms unsaved
changes; deletion requires confirmation. Lists and details reload SQLite on focus.

CRUD regression tests cover name-only insertion, complete updates, failed writes,
UUIDs, reopen persistence, and deleting every lot without reseeding. The country
list is bundled because Android Hermes does not provide Intl.DisplayNames.

### Add / edit validation

TypeScript, lint, 29 automated tests, Expo startup, and both platform bundle exports
pass. Android Expo Go checks covered name-only creation, immediate list/detail
refresh, edit prefill, custom country entry, discard confirmation, rating buttons
and slider, date selection/clearing, cold-relaunch persistence, and confirmed
deletion. The temporary test lot was removed afterward. Actual camera/gallery
capture and iOS runtime checks remain unverified; iOS requires full Xcode.
