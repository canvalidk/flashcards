import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseCardFile } from "../card-data.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const manifestPath = path.join(root, "cards", "manifest.json");
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

const cards = (
  await Promise.all(
    manifest.files.map(async (relativePath) => {
      const source = await fs.readFile(path.join(root, relativePath), "utf8");
      return parseCardFile(source, relativePath);
    }),
  )
).flat();

if (cards.length === 0) throw new Error("The site loaded no cards.");

const ids = new Set(cards.map((card) => card.id));
if (ids.size !== cards.length) throw new Error("The site loaded duplicate card IDs.");

for (const card of cards) {
  for (const field of ["id", "front", "back", "speed", "topic", "family"]) {
    if (!card[field]) throw new Error(`${card.id || "Unknown card"} is missing ${field}.`);
  }
}

const families = [...new Set(cards.map((card) => card.family))].sort();
console.log(`Validated site data: ${cards.length} cards; families: ${families.join(", ")}.`);
