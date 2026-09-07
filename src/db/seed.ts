import { count } from "drizzle-orm";
import { getDatabase } from "./client";
import { coffeeLots } from "./schema";

const timestamp = "2026-09-08T00:00:00.000Z";
const seeds: (typeof coffeeLots.$inferInsert)[] = [
  {
    id: "a1b2c3d4-0001-4000-8000-000000000001",
    name: "Ethiopia Bensa",
    roaster: "Sonder",
    country: "Ethiopia",
    region: "Sidama",
    process: "Washed",
    variety: "Heirloom",
    roastDate: "2026-08-28",
    packageDescriptors: JSON.stringify(["jasmine", "peach", "bergamot"]),
    myImpression:
      "Очень чистая и лёгкая чашка. Сначала сильнее чувствуется жасмин, после остывания появляется персик и чайная бергамотовая нота. Хочется попробовать ещё раз на чуть более низкой температуре.",
    rating: 4.5,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: "a1b2c3d4-0002-4000-8000-000000000002",
    name: "Colombia El Mirador",
    roaster: "Hotel Belgrade",
    country: "Colombia",
    region: "Huila",
    process: "Natural",
    variety: "Caturra",
    roastDate: "2026-08-20",
    packageDescriptors: JSON.stringify(["strawberry", "cacao", "red wine"]),
    myImpression:
      "Более плотный и сладкий кофе. Ягоды хорошо заметны, но чашка заметно тяжелее первой. Понравился, хотя каждый день такой кофе я бы не пил.",
    rating: 4.0,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

export async function seedDatabaseIfEmpty() {
  // Expo's synchronous transaction callback keeps the check and both writes atomic.
  getDatabase().transaction((tx) => {
    const result = tx.select({ value: count() }).from(coffeeLots).get();
    if (result?.value === 0) tx.insert(coffeeLots).values(seeds).run();
  });
}
