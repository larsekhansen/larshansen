import { defineConfig } from "vite";

// Served from larshansen.dev/viking/, next to the landing page (see .github/workflows/deploy.yml).
// Each level after the first is one file, fetched when it is first needed; everything the levels
// share (the kit, the shared swatches, the map builder) stays with the page, so a level is one
// fetch. The last three levels' own swatches, and the bosses' rules, go with their level. The
// scripted routes (for `?debug&auto`) and the scripted player are files of their own, fetched
// only under `?debug&auto`; what only `?debug` needs is one more. The maze splits as it likes.
const LEVEL = /\/src\/levels\/(akershus|radhuset|slottet|holmenkollen|akerselva|nordmarka|stortinget|ekeberg|nabolaget|bygdoy|vigelandsparken)\.ts$/;
const ROUTE = /\/src\/levels\/routes\/(\w+)\.ts$/;
// A level's own swatches and its boss come with it: they are imported by that level alone.
// Line 2's kit pieces (the rocking deck, the sinking pad, the oars) come with Bygdøy, the first to use them.
const OWN: Record<string, string> = { "swatches/metro": "stortinget", "swatches/hill": "ekeberg", "swatches/winter": "nabolaget", "swatches/museum": "bygdoy", "swatches/park": "vigelandsparken", "game/plough": "nabolaget", "game/troll": "nordmarka", deck: "bygdoy", sink: "bygdoy", oars: "bygdoy" };
const OWNED = /\/(swatches\/metro|swatches\/hill|swatches\/winter|swatches\/museum|swatches\/park|game\/plough|game\/troll|deck|sink|oars)\.ts$/;

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
          // How the line map looks: fetched on its own as the page starts.
          if (/\/src\/levels\/kartArt\.ts$/.test(id)) return "kart";
          // The shield's rules and drawing: fetched when he has it, or goes where it is given.
          if (/\/src\/game\/shield\.ts$/.test(id)) return "shield";
          const level = LEVEL.exec(id);
          const owned = OWNED.exec(id);
          return level ? level[1] : owned ? OWN[owned[1]] : "index";
        }
      }
    }
  }
});
