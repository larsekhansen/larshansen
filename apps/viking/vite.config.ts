import { defineConfig } from "vite";

// Served from larshansen.dev/viking/, next to the landing page (see .github/workflows/deploy.yml).
// Each level after the first is one file, fetched when it is first needed, and its scripted route
// (for `?debug&auto`) goes in the same file; everything the levels share (the kit, the swatches,
// the map builder) stays with the page, so a level is one fetch. The maze splits as it likes.
const LEVEL = /\/src\/levels\/(?:routes\/)?(akershus|radhuset|slottet|holmenkollen)\.ts$/;

export default defineConfig({
  base: "/viking/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (/\/packages\/maze\//.test(id)) return undefined;
          const level = LEVEL.exec(id);
          return level ? level[1] : "index";
        }
      }
    }
  }
});
