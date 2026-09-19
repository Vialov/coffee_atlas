# Coffee Atlas

A small, local-first specialty coffee journal for iOS and Android. Includes a
coffee list, detail screen, and a shared add/edit form. No account, backend,
remote images, or runtime data connection is required.

Actual release link: https://expo.dev/accounts/kirdal/projects/coffee-atlas/builds/04d7ec76-c33e-4105-b096-4ebb920c1493

## Development

Use Node.js 24 LTS (or newer) and npm. The test harness uses built-in Node SQLite.

```sh
npm install
npx expo start
```

Open the project in an Expo Go version supporting SDK 57, or use an Android
emulator / iOS simulator. iOS simulation requires macOS and full Xcode; Android
requires Android Studio's SDK and an emulator. Development uses Metro; installed
release builds contain their JavaScript and work without the development server.
Development builds may seed two sample lots on the journal's first launch.

```sh
npm run android       # Start Expo and open Android
npm run ios           # Start Expo and open iOS
npm run typecheck
npm run lint
npm test
npx expo install --check
npx expo export --platform all
```

## EAS setup

Install and connect EAS once for the Expo account that owns the application:

```sh
npm install -g eas-cli
eas login
eas build:configure
```

`eas build:configure` is a one-time project-linking step, not a command that must
be repeated before each build. Keep credentials, keystores, and tokens out of the
repository; EAS can manage Android signing credentials securely.

## APK build

```sh
eas build -p android --profile preview
```

This produces an APK suitable for direct installation on an Android device or
emulator. The equivalent npm command is `npm run build:apk`.

## Production build

```sh
eas build -p android --profile production
```

This profile is reserved for the later Google Play/AAB workflow. The equivalent
npm command is `npm run build:production`.

Preview and production builds never seed demo records. A fresh release starts
with an empty, migrated journal. Installing a newer build over an existing build
with the same `com.vialov.coffeeatlas` package and signing identity preserves the
local SQLite database; future releases must keep that package and increment the
Android version code.

## Structure and stack

- `app/`: Expo Router native stack, `/` list, `/coffee/[id]` detail, and `/lot-form` create/edit.
- `src/components/`, `src/theme/`: reusable cards, chips, sections, and central visual tokens.
- `src/db/`: Drizzle SQLite schema, connection, startup, migrations, and seed mechanism.
- `src/repositories/`: typed CRUD operations and JSON-to-domain mapping.
- `src/types/`: application domain types.

React Native, Expo, strict TypeScript, expo-sqlite, and Drizzle ORM/Kit. React DOM
and animation packages satisfy Expo Router's compatible peers; web is not a target.

## Persistence and migrations

The app automatically opens `coffee-atlas.db`, enables foreign keys and WAL, and
applies bundled Drizzle migrations. In development only, it then inserts two
sample lots in a transaction when `coffee_lots` is empty and initialization has
not been recorded. A versioned `journal_state` table records development seed
initialization in the same transaction, so deleting all lots leaves an empty
journal on subsequent launches. Release initialization stops after migrations.
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

Native checklist: development first launch has two coffees; release first launch
has none. Open details, check every field, header back and Android hardware back;
relaunch and confirm persisted IDs/count; open an unknown ID; check large text and
narrow screens; launch an installed release offline. iOS and Android bundle
success alone is not device verification.

Out of scope: list search/filters, maps, OCR, AI,
authentication, synchronization, and brewing history.

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
