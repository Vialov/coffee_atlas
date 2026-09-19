import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { configureDatabase, getDatabase } from "./client";
import migrations from "./migrations/migrations";
import { seedDevDataIfEmpty } from "./seed/devSeed";

let initialization: Promise<void> | undefined;
export function initializeDatabase(): Promise<void> {
  initialization ??= (async () => {
    configureDatabase();
    await migrate(getDatabase(), migrations);
    if (__DEV__) await seedDevDataIfEmpty();
  })();
  return initialization;
}
