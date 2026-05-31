import { Router } from "express";
import { getDb } from "../db/index.mjs";
import { readMetierBundle, writeMetierKey } from "../db/seed.mjs";
import { requireAuth } from "../middleware/auth.mjs";

export const metierRouter = Router();

metierRouter.use(requireAuth);

metierRouter.get("/", (_req, res) => {
  const db = getDb();
  res.json(readMetierBundle(db));
});

metierRouter.put("/:key", (req, res) => {
  const allowed = new Set([
    "agents",
    "dossiers",
    "alertes",
    "arrets",
    "saisines_cm",
    "visites_mt",
    "parcours_ppr",
    "chronologie",
    "kpi_direction",
  ]);

  const apiKey = req.params.key;
  if (!allowed.has(apiKey)) {
    res.status(400).json({ error: "Clé métier inconnue." });
    return;
  }

  const db = getDb();
  writeMetierKey(db, apiKey, req.body);
  res.json(readMetierBundle(db));
});
