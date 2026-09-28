import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from larshansen.dev/qr/, next to the landing page (see .github/workflows/deploy.yml).
export default defineConfig({
  base: "/qr/",
  plugins: [react()]
});
