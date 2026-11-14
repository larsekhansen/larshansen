import { defineConfig } from "vite";

// Served from larshansen.dev/viking/, next to the landing page (see .github/workflows/deploy.yml).
// Each level after the first is one file, fetched when it is first needed; everything the levels
// share (the kit, the shared swatches, the map builder) stays with the page, so a level is one
// fetch. The last three levels' own swatches, and the bosses' rules, go with their level. The
// scripted routes (for `?debug&auto`) and the scripted player are files of their own, fetched
// only under `?debug&auto`; what only `?debug` needs is one more. The maze splits as it likes.
const LEVEL = /\/src\/levels\/(akershus|radhuset|slottet|holmenkollen|akerselva|nordmarka|stortinget|ekeberg|nabolaget)\.ts$/;
const ROUTE = /\/src\/levels\/routes\/(\w+)\.ts$/;
// A level's own swatches and its boss come with it: they are imported by that level alone.
const OWN: Record<string, string> = { "swatches/metro": "stortinget", "swatches/hill": "ekeberg", "swatches/winter": "nabolaget", "game/plough": "nabolaget", "game/troll": "nordmarka" };
const OWNED = /\/(swatches\/metro|swatches\/hill|swatches\/winter|game\/plough|game\/troll)\.ts$/;

export default defineConfig({
  base: "/viking/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (/\/packages\/maze\//.test(id)) return undefined;
          const route = ROUTE.exec(id);
          if (route) return route[1] === "common" ? "routes" : `${route[1]}-route`;
          if (/\/src\/game\/bot\.ts$/.test(id)) return "routes";
          if (/\/src\/debug\.ts$/.test(id)) return "debug";
          const level = LEVEL.exec(id);
          const owned = OWNED.exec(id);
          return level ? level[1] : owned ? OWN[owned[1]] : "index";
        }
      }
    }
  }
});
