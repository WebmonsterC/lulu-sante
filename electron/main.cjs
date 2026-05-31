const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const { spawn } = require("node:child_process");
const http = require("node:http");

const PORT = process.env.LULU_PORT ?? "8787";

let serverProcess = null;
let dataDir = null;
let mainWindow = null;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

function resolvePaths() {
  if (app.isPackaged) {
    return {
      serverEntry: path.join(process.resourcesPath, "server", "src", "index.mjs"),
      staticDir: path.join(process.resourcesPath, "frontend", "dist"),
      nodeModules: path.join(process.resourcesPath, "server", "node_modules"),
      serverCwd: path.join(process.resourcesPath, "server"),
    };
  }

  return {
    serverEntry: path.join(__dirname, "../server/src/index.mjs"),
    staticDir: path.join(__dirname, "../frontend/dist"),
    nodeModules: path.join(__dirname, "../server/node_modules"),
    serverCwd: path.join(__dirname, "../server"),
  };
}

function resolveIconPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "build", "icon.png");
  }
  return path.join(__dirname, "build", "icon.png");
}

function resolveDataDir() {
  if (dataDir) return dataDir;
  dataDir = path.join(app.getPath("userData"), "lulu-data");
  return dataDir;
}

function startServer() {
  const paths = resolvePaths();

  serverProcess = spawn(process.execPath, [paths.serverEntry], {
    cwd: paths.serverCwd,
    env: {
      ...process.env,
      // Sans ceci, process.execPath relance l'app Electron au lieu d'exécuter Node.
      ELECTRON_RUN_AS_NODE: "1",
      PORT,
      HOST: "0.0.0.0",
      STATIC_DIR: paths.staticDir,
      LULU_DATA_DIR: resolveDataDir(),
      NODE_PATH: paths.nodeModules,
    },
    stdio: "inherit",
  });

  serverProcess.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`Serveur Lulu Santé arrêté (code ${code})`);
    }
  });
}

function waitForServer(maxAttempts = 40) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    function probe() {
      attempts += 1;
      const request = http.get(`http://127.0.0.1:${PORT}/api/health`, (response) => {
        response.resume();
        if (response.statusCode === 200) {
          resolve();
          return;
        }
        retry();
      });

      request.on("error", retry);
      request.setTimeout(500, () => {
        request.destroy();
        retry();
      });
    }

    function retry() {
      if (attempts >= maxAttempts) {
        reject(new Error("Le serveur local n'a pas démarré à temps."));
        return;
      }
      setTimeout(probe, 250);
    }

    probe();
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    title: "Lulu Santé",
    icon: resolveIconPath(),
    autoHideMenuBar: true,
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  await mainWindow.loadURL(`http://127.0.0.1:${PORT}/`);
}

function focusMainWindow() {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
}

if (gotTheLock) {
  app.on("second-instance", () => {
    focusMainWindow();
  });

  app.whenReady().then(async () => {
    console.log(`Données SQLite : ${resolveDataDir()}`);
    startServer();
    try {
      await waitForServer();
      await createWindow();
    } catch (error) {
      console.error(error);
      app.quit();
    }
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("before-quit", () => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
}
