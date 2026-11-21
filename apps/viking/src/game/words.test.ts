import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { SCENE_WORDS } from "@larshansen/pixelkit/i18n";
import { strings } from "./i18n";
import { fresh, type Progress } from "./progress";
import { BUILT, ORDER, loadLevel } from "../levels/index";
import { kartDef } from "../levels/kart";
import { kartArt } from "../levels/kartArt";

// Order 31 (item 6, ADR 0016): every word the game shows exists in Norwegian and in English. Wherever the code keeps words by
// language (an object with `nb` or `en`), both are there, with the same keys, the same number of lines and the same arguments,
// and no line is empty in one language and not in the other. Every module of the page is looked through (all it exports, as
// deep as it goes) and every level as it is loaded, the encore and the line map with no runes and with all of them.

const SRC = resolve(dirname(import.meta.path), "..");
/** Files that are not modules to look through: the page itself, the debug code, the reach search's worker. */
const SKIP = new Set(["main.ts", "debug.ts", "game/reach.worker.ts"]);

function sources(dir = SRC): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name);
    if (d.isDirectory()) return sources(p);
    const rel = relative(SRC, p);
    return d.name.endsWith(".ts") && !d.name.endsWith(".test.ts") && !SKIP.has(rel) ? [rel] : [];
  });
}

/** How many places keep words by language, of all looked through. */
let pairs = 0;
/** Where `nb` and `en` disagree, below `root`: missing, other keys, other lengths, other arguments, empty in one. */
function disagreements(root: unknown, name: string): string[] {
  const out: string[] = [];
  const seen = new Set<object>();
  const shape = (a: unknown, b: unknown, at: string) => {
    if (typeof a !== typeof b || Array.isArray(a) !== Array.isArray(b)) return void out.push(`${at}: ${typeof a} in nb, ${typeof b} in en`);
    if (typeof a === "string" && (a === "") !== (b === "")) out.push(`${at}: empty in ${a === "" ? "nb" : "en"} only`);
    if (typeof a === "function" && a.length !== (b as (...x: unknown[]) => unknown).length) out.push(`${at}: ${a.length} arguments in nb, ${(b as () => void).length} in en`);
    if (Array.isArray(a) && a.length !== (b as unknown[]).length) out.push(`${at}: ${a.length} lines in nb, ${(b as unknown[]).length} in en`);
    if (a && typeof a === "object" && !Array.isArray(a)) {
      const ka = Object.keys(a).sort();
      const kb = Object.keys(b as object).sort();
      for (const k of ka) if (!kb.includes(k)) out.push(`${at}.${k}: in nb only`);
      for (const k of kb) if (!ka.includes(k)) out.push(`${at}.${k}: in en only`);
      for (const k of ka) if (kb.includes(k)) shape((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${at}.${k}`);
    }
  };
  const walk = (v: unknown, at: string, depth: number) => {
    if (!v || typeof v !== "object" || seen.has(v) || depth > 12) return;
    seen.add(v);
    if (ArrayBuffer.isView(v)) return;
    const o = v as Record<string, unknown>;
    if ("nb" in o || "en" in o) {
      pairs++;
      if (!("nb" in o) || !("en" in o)) out.push(`${at}: ${"nb" in o ? "nb" : "en"} only`);
      else shape(o.nb, o.en, at);
    }
    if (v instanceof Map) for (const [k, x] of v) walk(x, `${at}[${String(k)}]`, depth + 1);
    else for (const k of Object.keys(o)) walk(o[k], `${at}.${k}`, depth + 1);
  };
  walk(root, name, 0);
  return out;
}

describe("Norwegian and English (ADR 0016, order 31)", () => {
  test("every word kept by language, in every module of the page and every level, has both, with the same keys, lines and arguments", async () => {
    const found: string[] = [];
    let looked = 0;
    for (const file of sources()) {
      const mod = (await import(join(SRC, file))) as Record<string, unknown>;
      for (const [k, v] of Object.entries(mod)) {
        looked++;
        found.push(...disagreements(v, `${file}:${k}`));
      }
    }
    found.push(...disagreements(SCENE_WORDS, "kit SCENE_WORDS"));
    // The page's own words are kept inside `game/i18n.ts` and handed out by language.
    found.push(...disagreements({ nb: strings("nb"), en: strings("en") }, "game/i18n strings"));
    const all: Progress = { ...fresh(), cleared: [...ORDER], best: Object.fromEntries(ORDER.map((id) => [id, 60000])) };
    for (const st of BUILT) found.push(...disagreements(await loadLevel(st.id), `level ${st.id}`));
    found.push(...disagreements(await loadLevel("encore"), "level encore"));
    found.push(...disagreements(kartDef(fresh(), kartArt), "the map"), ...disagreements(kartDef(all, kartArt), "the map with every rune"));
    console.log(`Words kept by language: ${pairs} places, in ${looked} exports and the levels`);
    expect(looked).toBeGreaterThan(100);
    expect(pairs).toBeGreaterThan(200);
    expect([...new Set(found)]).toEqual([]);
  }, 60_000);

  test("the test sees a word missing in one language", () => {
    expect(disagreements({ sign: { nb: ["a", "b"], en: ["a"] }, card: { nb: { x: "", y: "z" }, en: { x: "q" } } }, "made up")).toEqual([
      "made up.sign: 2 lines in nb, 1 in en",
      "made up.card.y: in nb only",
      "made up.card.x: empty in nb only"
    ]);
  });
});
