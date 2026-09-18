import { real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const coffeeLots = sqliteTable("coffee_lots", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  roaster: text("roaster").notNull(),
  photoPath: text("photo_path"),
  country: text("country"),
  region: text("region"),
  process: text("process"),
  variety: text("variety"),
  roastDate: text("roast_date"),
  packageDescriptors: text("package_descriptors").notNull(),
  myImpression: text("my_impression"),
  rating: real("rating"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
