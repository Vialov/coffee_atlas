import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

// Lazy opening lets the initialization boundary handle native opening failures.
let connection: ReturnType<typeof openDatabaseSync> | undefined;
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;
export function getDatabase() {
  if (!database) {
    connection ??= openDatabaseSync("coffee-atlas.db");
    database = drizzle(connection, { schema });
  }
  return database;
}

export function configureDatabase() {
  getDatabase();
  connection!.execSync("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
}
