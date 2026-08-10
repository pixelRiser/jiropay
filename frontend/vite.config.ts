import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      // Redirige l'entrée serveur de TanStack Start vers src/server.ts.
      server: { entry: "server" },
    }),
    viteReact(),
    nitro({
      // Auto-hébergé sur ce serveur (voir Dockerfile) — pas Cloudflare.
      defaultPreset: "node-server",
    }),
  ],
});
