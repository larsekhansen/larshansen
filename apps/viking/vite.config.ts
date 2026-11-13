import { defineConfig } from "vite";

// Served from larshansen.dev/viking/, next to the landing page (see .github/workflows/deploy.yml).
// Each level after the first is its own file, fetched when it is first needed; everything else the
// levels share (the kit, the swatches, the map builder) stays with the page, so a level is one fetch.
const LAZY = /\/src\/levels\/(akershus|radhuset|slottet|holmenkollen)\.ts$|\/packages\/maze\//;

export default defineConfig({
  base: "/viking/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => (LAZY.test(id) ? undefined : "index")
      }
    }
  }
});
