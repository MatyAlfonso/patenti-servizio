import { app, BrowserWindow, protocol, net } from "electron";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";
import Server from "../srv/Server.js";
import { checkExpiredLicenses } from '../srv/utils/checkExpiredLicenses.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

protocol.registerSchemesAsPrivileged([
  { scheme: 'app-file', privileges: { bypassCSP: true, stream: true } }
]);
process.env.APP_ROOT = path.join(__dirname, "..");
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.whenReady().then(async () => {
  try {
    protocol.handle('app-file', async (request) => {
      try {
        const url = new URL(request.url);

        let decodedPath = decodeURIComponent(url.host + url.pathname);

        if (process.platform === 'win32' && /^[a-zA-Z]\\/.test(decodedPath)) {
          decodedPath = decodedPath[0] + ":" + decodedPath.substring(1);
        }

        if (process.platform === 'win32' && decodedPath.startsWith('/')) {
          decodedPath = decodedPath.substring(1);
        }

        const finalPath = path.normalize(decodedPath);

        if (!fs.existsSync(finalPath)) {
          console.error("File not found:", finalPath);
          return new Response("Not Found", { status: 404 });
        }

        return net.fetch(pathToFileURL(finalPath).toString());
      } catch (error) {
        console.error("Error:", error);
        return new Response(error.message, { status: 500 });
      }
    });

    await Server.start();
    await checkExpiredLicenses();
    createWindow();
  } catch (error) {
    console.error("Error:", error);
  }
});