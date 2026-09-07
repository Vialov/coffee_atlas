import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";
export default defineConfig({
  plugins: [
    {
      name: "migration-sql",
      load(id) {
        if (id.endsWith(".sql"))
          return `export default ${JSON.stringify(readFileSync(id, "utf8"))}`;
      },
    },
  ],
  test: {
    server: { deps: { inline: ["drizzle-orm"] } },
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
