import { randomUUID } from "expo-crypto";
import { normalizeLot, type LotDraft } from "../utils/lotForm";
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

export async function createCoffeeLot(draft: LotDraft): Promise<string> {
  const values = normalizeLot(draft);
  const id = randomUUID();
  const now = new Date().toISOString();
  await getDatabase()
    .insert(coffeeLots)
    .values({
      ...values,
      id,
      packageDescriptors: JSON.stringify(values.packageDescriptors),
      createdAt: now,
      updatedAt: now,
    });
  return id;
}

export async function updateCoffeeLot(
  id: string,
  draft: LotDraft,
): Promise<void> {
  const values = normalizeLot(draft);
  const result = await getDatabase()
    .update(coffeeLots)
    .set({
      ...values,
      packageDescriptors: JSON.stringify(values.packageDescriptors),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(coffeeLots.id, id));
  if (!result.changes) throw new Error("This lot no longer exists.");
}

export async function deleteCoffeeLot(id: string): Promise<void> {
  await getDatabase().delete(coffeeLots).where(eq(coffeeLots.id, id));
}
