import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { applySchema } from "./schema.mjs";
import { seedDatabase } from "./seed.mjs";

let dbInstance = null;

export function getDbPath() {
  const dataDir =
    process.env.LULU_DATA_DIR ??
    path.resolve(process.cwd(), process.env.LULU_DATA_DIR_REL ?? "../data");
  fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, "lulu-sante.sqlite");
}

export function getDb() {
  if (!dbInstance) {
    const dbPath = getDbPath();
    dbInstance = new Database(dbPath);
    applySchema(dbInstance);
    seedDatabase(dbInstance);
  }
  return dbInstance;
}
