import { gzipSync } from "node:zlib";
import { defineConfig, type Plugin } from "vite";

// Served from larshansen.dev/viking/, next to the landing page (see .github/workflows/deploy.yml).
// Each level after the first is one file, fetched when it is first needed; everything the levels
// share (the kit, the shared swatches, the map builder) stays with the page, so a level is one
// fetch. The last three levels' own swatches, and the bosses' rules, go with their level. The
// scripted routes (for `?debug&auto`) and the scripted player are files of their own, fetched
// only under `?debug&auto`; what only `?debug` needs is one more. The maze splits as it likes.
const LEVEL = /\/src\/levels\/(akershus|radhuset|slottet|holmenkollen|akerselva|nordmarka|stortinget|ekeberg|nabolaget|bygdoy|vigelandsparken|korketrekkeren|ostensjovannet|bjorvika|gamlebyen)\.ts$/;
const ROUTE = /\/src\/levels\/routes\/(\w+)\.ts$/;
// A level's own swatches and its boss come with it: they are imported by that level alone.
// Line 2's kit pieces come with the level that uses them (the rocking deck and the oars with Bygdøy); the
// sinking pad, which Bygdøy and Østensjøvannet both use, is a small file of its own that both fetch.
const OWN: Record<string, string> = { "swatches/metro": "stortinget", kept: "stortinget", "swatches/hill": "ekeberg", "swatches/winter": "nabolaget", "swatches/museum": "bygdoy", "swatches/park": "vigelandsparken", "swatches/sledge": "korketrekkeren", "swatches/lake": "ostensjovannet", "swatches/site": "bjorvika", "swatches/ruins": "gamlebyen", "game/serpent": "gamlebyen", "game/plough": "nabolaget", "game/troll": "nordmarka", "render/night": "nordmarka", deck: "bygdoy", sink: "sink", oars: "bygdoy" };
const OWNED = /\/(swatches\/metro|swatches\/hill|swatches\/winter|swatches\/museum|swatches\/park|swatches\/sledge|swatches\/lake|swatches\/site|swatches\/ruins|game\/serpent|game\/plough|game\/troll|render\/night|deck|sink|oars|kept)\.ts$/;

/**
 * The first script's budget (ADR 0011): the script the page loads first (the kit, the rules, the line map,
 * Langkaia) must stay under 60 kB gzipped, measured as vite reports it (zlib's gzip in the process vite runs
 * in). Over it, the build fails, so the budget is enforced and not remembered.
 */
const BUDGET_KB = 60;
function firstScriptBudget(): Plugin {
  return {
    name: "first-script-budget",
    apply: "build",
    // After vite's own plugins have finished the chunks, so this is the code that is written.
    enforce: "post",
    writeBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type !== "chunk" || !file.isEntry) continue;
        const kb = gzipSync(file.code).length / 1000;
        if (kb > BUDGET_KB) this.error(`The first script, ${file.fileName}, is ${kb.toFixed(2)} kB gzipped, over the ${BUDGET_KB} kB budget (ADR 0011): move what one level alone uses into its file.`);
      }
    }
  };
}

export default defineConfig({
  base: "/viking/",
  plugins: [firstScriptBudget()],
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
          // The enemy looks several levels share but the first does not: fetched with the first level that has one.
          if (/\/src\/render\/looks\.ts$/.test(id)) return "looks";
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
