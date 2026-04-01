import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";
import electron from "vite-plugin-electron/simple";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    electron({
      main: {
        entry: "electron/main.js",
        vite: {
          build: {
            rollupOptions: {
              external: [
                "sequelize",
                "sqlite3",
                "better-sqlite3",
                "pg",
                "pg-hstore",
                "tedious",
                "mysql2",
                "oracledb",
                "pdfmake"
              ],
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, "electron/preload.js"),
      },
      renderer: process.env.NODE_ENV === "test" ? undefined : {},
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});