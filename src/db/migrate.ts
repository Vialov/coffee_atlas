import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { configureDatabase, getDatabase } from "./client";
import migrations from "./migrations/migrations";
import { seedDatabaseIfEmpty } from "./seed";

let initialization: Promise<void> | undefined;
export function initializeDatabase(): Promise<void> {
  initialization ??= (async () => {
    configureDatabase();
    await migrate(getDatabase(), migrations);
    await seedDatabaseIfEmpty();
  })();
  return initialization;
}
