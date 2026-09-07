import { asc, eq } from "drizzle-orm";
import { getDatabase } from "../db/client";
import { coffeeLots } from "../db/schema";
import type { CoffeeLot } from "../types/coffee";

function mapCoffeeLot(row: typeof coffeeLots.$inferSelect): CoffeeLot {
  const descriptors: unknown = JSON.parse(row.packageDescriptors);
  if (
    !Array.isArray(descriptors) ||
    !descriptors.every((value) => typeof value === "string")
  ) {
    throw new Error("Invalid package descriptors in stored coffee.");
  }
  return { ...row, packageDescriptors: descriptors };
}

export async function getAllCoffeeLots(): Promise<CoffeeLot[]> {
  const rows = await getDatabase()
    .select()
    .from(coffeeLots)
    .orderBy(asc(coffeeLots.createdAt), asc(coffeeLots.id));
  return rows.map(mapCoffeeLot);
}

export async function getCoffeeLotById(id: string): Promise<CoffeeLot | null> {
  const rows = await getDatabase()
    .select()
    .from(coffeeLots)
    .where(eq(coffeeLots.id, id))
    .limit(1);
  return rows[0] ? mapCoffeeLot(rows[0]) : null;
}
