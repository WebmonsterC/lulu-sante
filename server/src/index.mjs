import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildNetworkInfo } from "./network.mjs";
import { getDbPath } from "./db/index.mjs";
import { authRouter } from "./routes/auth.mjs";
import { usersRouter } from "./routes/users.mjs";
import { metierRouter } from "./routes/metier.mjs";
import {
  auditRouter,
  configRouter,
  snapshotsRouter,
} from "./routes/data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? "0.0.0.0";
const STATIC_DIR =
  process.env.STATIC_DIR ?? path.resolve(__dirname, "../../frontend/dist");

const app = express();
app.use(express.json({ limit: "4mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "lulu-sante",
    version: "0.1.0",
    database: getDbPath(),
    storage: "sqlite",
  });
});

app.get("/api/network", (_req, res) => {
  res.json(buildNetworkInfo(PORT));
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/metier", metierRouter);
app.use("/api/audit", auditRouter);
app.use("/api/snapshots", snapshotsRouter);
app.use("/api/config", configRouter);

app.use(express.static(STATIC_DIR, { index: false, maxAge: "1h" }));

app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(STATIC_DIR, "index.html"));
});

const server = app.listen(PORT, HOST, () => {
  const info = buildNetworkInfo(PORT);
  console.log("");
  console.log("  Lulu Santé — serveur local (SQLite)");
  console.log(`  Base          : ${getDbPath()}`);
  console.log(`  Poste hôte    : ${info.localUrl}`);
  if (info.inviteUrl) {
    console.log(`  Réseau local  : ${info.inviteUrl}`);
  } else {
    console.log("  Réseau local  : aucune interface LAN détectée");
  }
  console.log("");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\n  Erreur : le port ${PORT} est déjà utilisé.`);
    console.error(`  Arrêtez l'autre instance ou lancez : $env:PORT=${PORT + 1}; npm run dev\n`);
    process.exit(1);
  }
  throw error;
});
