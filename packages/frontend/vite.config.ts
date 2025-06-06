import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dotenv from "dotenv";

dotenv.config({ path: resolve(__dirname, "../../.env") });

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
});
