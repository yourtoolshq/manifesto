// @ts-check
import process from "node:process";

import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import { loadEnv } from "vite";

import { createServerEnv } from "./src/env.ts";
import tailwindcss from "@tailwindcss/vite";

const mode = process.env.NODE_ENV ?? "production";

createServerEnv(loadEnv(mode, process.cwd(), ""));

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});
