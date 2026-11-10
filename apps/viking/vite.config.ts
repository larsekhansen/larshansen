import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from larshansen.dev/viking/, next to the landing page (see .github/workflows/deploy.yml).
export default defineConfig({
  base: "/viking/",
  plugins: [react()]
});
