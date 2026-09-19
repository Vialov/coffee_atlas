import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Exercise the real Expo Drizzle driver and migrations against SQLite. Only the
// native bridge is replaced; SQL, transactions, seeding, and mapping are real.
const native = vi.hoisted(() => ({ openDatabaseSync: vi.fn() }));
vi.mock("expo-sqlite", () => native);
vi.mock("expo-crypto", async () => ({
  randomUUID: (await import("node:crypto")).randomUUID,
}));
let sqlite: DatabaseSync;
let directory: string;
let databasePath: string;
let failSql: string | undefined;
const executed: string[] = [];
function bridge() {
  return {
    execSync(sql: string) {
      executed.push(sql);
      sqlite.exec(sql);
    },
    prepareSync(sql: string) {
      executed.push(sql);
      if (failSql && sql.includes(failSql))
        throw new Error("Injected SQLite failure");
      const stmt = sqlite.prepare(sql);
      return {
        executeSync(params: SQLInputValue[]) {
          if (stmt.columns().length > 0) {
            const rows = stmt.all(...params);
            return {
              changes: 0,
              lastInsertRowId: 0,
              getAllSync: () => rows,
              getFirstSync: () => rows[0] ?? null,
            };
          }
          const result = stmt.run(...params);
          return {
            changes: result.changes,
            lastInsertRowId: result.lastInsertRowid,
          };
        },
        executeForRawResultSync(params: SQLInputValue[]) {
          stmt.setReturnArrays(true);
          const rows = stmt.all(...params);
          return { getAllSync: () => rows };
        },
      };
    },
  };
}
beforeEach(() => {
  vi.resetModules();
  directory = mkdtempSync(join(tmpdir(), "coffee-atlas-test-"));
  databasePath = join(directory, "coffee-atlas.db");
  sqlite = new DatabaseSync(databasePath);
  failSql = undefined;
  executed.length = 0;
  native.openDatabaseSync.mockReset().mockImplementation(bridge);
});
afterEach(() => {
  sqlite.close();
  rmSync(directory, { recursive: true, force: true });
});

async function start() {
  const { initializeDatabase } = await import("../src/db/migrate");
  await initializeDatabase();
  return import("../src/repositories/coffeeRepository");
}

describe("persistent coffee initialization and repository", () => {
  it("opens the named database, migrates before seeding, and maps both complete coffees", async () => {
    const repo = await start();
    expect(native.openDatabaseSync).toHaveBeenCalledWith("coffee-atlas.db");
    const coffees = await repo.getAllCoffeeLots();
    expect(coffees.map((coffee) => coffee.name)).toEqual([
      "Ethiopia Bensa",
      "Colombia El Mirador",
    ]);
    expect(coffees[0]).toMatchObject({
      roaster: "Sonder",
      country: "Ethiopia",
      region: "Sidama",
      process: "Washed",
      variety: "Heirloom",
      roastDate: "2026-08-28",
      packageDescriptors: ["jasmine", "peach", "bergamot"],
      rating: 4.5,
      photoPath: null,
    });
    expect(coffees[1]).toMatchObject({
      roaster: "Hotel Belgrade",
      country: "Colombia",
      region: "Huila",
      process: "Natural",
      variety: "Caturra",
      roastDate: "2026-08-20",
      packageDescriptors: ["strawberry", "cacao", "red wine"],
      rating: 4,
    });
    expect(await repo.getCoffeeLotById(coffees[0]!.id)).toEqual(coffees[0]);
    expect(await repo.getCoffeeLotById("missing")).toBeNull();
    expect(sqlite.prepare("PRAGMA foreign_keys").get()).toMatchObject({
      foreign_keys: 1,
    });
    const migrationIndex = executed.findIndex((sql) =>
      sql.includes("CREATE TABLE `coffee_lots`"),
    );
    const seedIndex = executed.findIndex((sql) =>
      sql.startsWith('insert into "coffee_lots"'),
    );
    expect(migrationIndex).toBeGreaterThan(-1);
    expect(seedIndex).toBeGreaterThan(migrationIndex);
  });
  it("shares concurrent initialization and preserves IDs and data across startup", async () => {
    const { initializeDatabase } = await import("../src/db/migrate");
    const first = initializeDatabase();
    expect(initializeDatabase()).toBe(first);
    await first;
    const before = sqlite
      .prepare("SELECT * FROM coffee_lots ORDER BY id")
      .all();
    sqlite.close();
    sqlite = new DatabaseSync(databasePath);
    vi.resetModules();
    await start();
    expect(
      sqlite.prepare("SELECT * FROM coffee_lots ORDER BY id").all(),
    ).toEqual(before);
    expect(
      sqlite
        .prepare("SELECT count(*) AS total FROM __drizzle_migrations")
        .get(),
    ).toMatchObject({ total: 3 });
  });
  it("upgrades the original database without changing existing coffee data", async () => {
    const { getDatabase, configureDatabase } = await import("../src/db/client");
    const { migrate } = await import("drizzle-orm/expo-sqlite/migrator");
    const { default: migrations } =
      await import("../src/db/migrations/migrations");
    configureDatabase();
    await migrate(getDatabase(), {
      journal: {
        ...migrations.journal,
        entries: migrations.journal.entries.slice(0, 1),
      },
      migrations: { m0000: migrations.migrations.m0000 },
    });
    sqlite.exec(`INSERT INTO coffee_lots
      (id, name, roaster, package_descriptors, rating, created_at, updated_at)
      VALUES ('user-lot', 'My coffee', 'My roaster', '["peach"]', 0, '2026-01-01', '2026-01-02')`);
    const before = sqlite.prepare("SELECT * FROM coffee_lots").get();
    const repo = await start();
    expect(sqlite.prepare("SELECT * FROM coffee_lots").get()).toEqual({
      ...before,
      photo_path: null,
    });
    expect(await repo.getCoffeeLotById("user-lot")).toMatchObject({
      rating: 0,
      photoPath: null,
      packageDescriptors: ["peach"],
    });
    sqlite
      .prepare("UPDATE coffee_lots SET photo_path = ? WHERE id = ?")
      .run("coffee-photos/user-lot.jpg", "user-lot");
    sqlite.close();
    sqlite = new DatabaseSync(databasePath);
    vi.resetModules();
    const reopened = await start();
    expect(await reopened.getCoffeeLotById("user-lot")).toMatchObject({
      photoPath: "coffee-photos/user-lot.jpg",
      rating: 0,
    });
    expect(await reopened.getAllCoffeeLots()).toHaveLength(1);
    expect(
      sqlite
        .prepare("SELECT count(*) AS total FROM __drizzle_migrations")
        .get(),
    ).toMatchObject({ total: 3 });
  });
  it("does not insert seeds into an existing nonempty database", async () => {
    await start();
    sqlite.exec(
      "DELETE FROM coffee_lots WHERE name = 'Colombia El Mirador'; UPDATE coffee_lots SET name = 'My existing coffee', rating = NULL, country = NULL",
    );
    vi.resetModules();
    const repo = await start();
    expect(await repo.getAllCoffeeLots()).toMatchObject([
      { name: "My existing coffee", rating: null, country: null },
    ]);
    expect((await repo.getAllCoffeeLots()).length).toBe(1);
  });
  it.each(["not json", "{}", '["peach", 42]'])(
    "rejects malformed descriptors: %s",
    async (value) => {
      const repo = await start();
      sqlite
        .prepare("UPDATE coffee_lots SET package_descriptors = ?")
        .run(value);
      await expect(repo.getAllCoffeeLots()).rejects.toThrow();
      await expect(
        repo.getCoffeeLotById("a1b2c3d4-0001-4000-8000-000000000001"),
      ).rejects.toThrow();
    },
  );
  it("stops before seeding if a migration fails", async () => {
    failSql = "CREATE TABLE `coffee_lots`";
    await expect(start()).rejects.toThrow();
    expect(
      executed.some((sql) => sql.startsWith('insert into "coffee_lots"')),
    ).toBe(false);
  });
  it("rolls back both seeds when an insertion fails", async () => {
    const { getDatabase, configureDatabase } = await import("../src/db/client");
    const { migrate } = await import("drizzle-orm/expo-sqlite/migrator");
    const { default: migrations } =
      await import("../src/db/migrations/migrations");
    configureDatabase();
    await migrate(getDatabase(), migrations);
    sqlite.exec(
      "CREATE TRIGGER reject_second BEFORE INSERT ON coffee_lots WHEN NEW.name = 'Colombia El Mirador' BEGIN SELECT RAISE(ABORT, 'seed failure'); END;",
    );
    const { seedDatabaseIfEmpty } = await import("../src/db/seed");
    await expect(seedDatabaseIfEmpty()).rejects.toThrow();
    expect(
      sqlite.prepare("SELECT count(*) AS total FROM coffee_lots").get(),
    ).toMatchObject({ total: 0 });
  });
  it("reports native opening failure as a rejected initialization", async () => {
    native.openDatabaseSync.mockImplementation(() => {
      throw new Error("Cannot open database");
    });
    await expect(start()).rejects.toThrow("Cannot open database");
  });
});

describe("lot CRUD persistence", () => {
  it("creates a name-only lot, edits every field, and preserves changes on reopen", async () => {
    const repo = await start();
    const { emptyLot } = await import("../src/utils/lotForm");
    const id = await repo.createCoffeeLot({
      ...emptyLot,
      name: "  New coffee  ",
    });
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    const created = await repo.getCoffeeLotById(id);
    expect(created).toMatchObject({ ...emptyLot, name: "New coffee", id });
    const changed = {
      ...emptyLot,
      name: "Edited",
      roaster: "Roaster",
      country: "Foo Island",
      region: "North",
      process: "Experimental",
      variety: "Bourbon",
      roastDate: "2026-09-18",
      rating: 4.299999,
      packageDescriptors: [" peach ", "PEACH", "jasmine"],
      myImpression: "Чистая чашка",
      photoPath: "coffee-photos/test.jpg",
    };
    await repo.updateCoffeeLot(id, changed);
    sqlite.close();
    sqlite = new DatabaseSync(databasePath);
    vi.resetModules();
    const reopened = await start();
    expect(await reopened.getCoffeeLotById(id)).toMatchObject({
      ...changed,
      rating: 4.3,
      packageDescriptors: ["peach", "jasmine"],
      createdAt: created!.createdAt,
    });
    await reopened.updateCoffeeLot(id, { ...emptyLot, name: "Only name" });
    expect(await reopened.getCoffeeLotById(id)).toMatchObject({
      ...emptyLot,
      name: "Only name",
    });
  });
  it("does not resurrect deleted lots when the empty journal reopens", async () => {
    const repo = await start();
    for (const lot of await repo.getAllCoffeeLots())
      await repo.deleteCoffeeLot(lot.id);
    sqlite.close();
    sqlite = new DatabaseSync(databasePath);
    vi.resetModules();
    const reopened = await start();
    expect(await reopened.getAllCoffeeLots()).toEqual([]);
  });
  it("rejects blank names and propagates failed writes without changing saved data", async () => {
    const repo = await start();
    const { emptyLot } = await import("../src/utils/lotForm");
    await expect(
      repo.createCoffeeLot({ ...emptyLot, name: "  " }),
    ).rejects.toThrow();
    const lot = (await repo.getAllCoffeeLots())[0]!;
    failSql = 'update "coffee_lots"';
    await expect(
      repo.updateCoffeeLot(lot.id, { ...emptyLot, name: "Changed" }),
    ).rejects.toThrow();
    expect(await repo.getCoffeeLotById(lot.id)).toEqual(lot);
    failSql = undefined;
    await expect(
      repo.updateCoffeeLot("missing", { ...emptyLot, name: "Changed" }),
    ).rejects.toThrow("no longer exists");
  });
});
