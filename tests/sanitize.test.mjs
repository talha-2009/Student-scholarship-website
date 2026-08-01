import assert from "node:assert";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
await import(pathToFileURL(join(__dirname, "..", "sanitize.js")).href);
const ON = globalThis.OpportunityNest;

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log("  ok  " + name);
  } catch (err) {
    failed++;
    console.log("  FAIL " + name);
    console.log("       " + (err && err.message ? err.message.split("\n")[0] : err));
  }
}

function eq(actual, expected, label) {
  assert.strictEqual(actual, expected, (label || "") + "\n  actual:   " + JSON.stringify(actual) + "\n  expected: " + JSON.stringify(expected));
}

console.log("\nON.sanitize helpers present:", typeof ON.sanitizeText === "function");

// ── 1. HTML entities ────────────────────────────────────────────────
test("decodes &quot;", () => eq(ON.decodeEntities("a&quot;b"), 'a"b'));
test("decodes uppercase &QUOT;", () => eq(ON.decodeEntities("&QUOT;ANADA"), '"ANADA'));
test("decodes &quot; without semicolon", () => eq(ON.decodeEntities("a&quot b"), 'a" b'));
test("decodes &#39;", () => eq(ON.decodeEntities("It&#39;s"), "It's"));
test("decodes &#039;", () => eq(ON.decodeEntities("It&#039;s"), "It's"));
test("decodes &#x27;", () => eq(ON.decodeEntities("&#x27;"), "'"));
test("decodes &amp;", () => eq(ON.decodeEntities("R&amp;D"), "R&D"));
test("decodes &lt; &gt;", () => eq(ON.decodeEntities("&lt;b&gt;"), "<b>"));
test("decodes double-encoded &amp;quot;", () => eq(ON.decodeEntities("&amp;quot;"), '"'));
test("leaves bare & alone", () => eq(ON.decodeEntities("R&D"), "R&D"));
test("preserves unicode", () => eq(ON.decodeEntities("Caf\u00e9 \u2013 日本語"), "Caf\u00e9 \u2013 日本語"));

// ── 2. Markdown ─────────────────────────────────────────────────────
test("strips ## heading text", () => eq(ON.stripMarkdown("## Introduction"), "Introduction"));
test("strips ### heading", () => eq(ON.stripMarkdown("### Overview"), "Overview"));
test("strips bare ## line", () => eq(ON.stripMarkdown("##"), ""));
test("strips **bold**", () => eq(ON.stripMarkdown("**bold**"), "bold"));
test("strips __underline__", () => eq(ON.stripMarkdown("__underline__"), "underline"));
test("strips *italic*", () => eq(ON.stripMarkdown("some *italic* text"), "some italic text"));
test("strips backticks", () => eq(ON.stripMarkdown("`code`"), "code"));
test("strips list markers", () => eq(ON.stripMarkdown("- item"), "item"));
test("strips numbered list markers", () => eq(ON.stripMarkdown("1. item"), "item"));
test("links -> label", () => eq(ON.stripMarkdown("[apply here](https://x.com)"), "apply here"));
test("keeps paragraphs split by blank lines", () =>
  eq(ON.stripMarkdown("## Introduction\n\nAt India's top institutions."), "Introduction\n\nAt India's top institutions."));
test("strips stray ## in the middle of a line", () =>
  eq(ON.stripMarkdown('Mc"all Scholarship "2026" ## Funded'), 'Mc"all Scholarship "2026" Funded'));

// ── 3. HTML tags ────────────────────────────────────────────────────
test("strips <b> tags (rendered)", () => eq(ON.sanitizeText("<b>Hi</b>"), "Hi"));
test("strips nested tags keeping text (rendered)", () =>
  eq(ON.sanitizeText("<p><strong>Hello</strong> world</p>"), "Hello world"));

// ── 4. Escaped characters ───────────────────────────────────────────
test("removes \\\" escapes", () => eq(ON.removeEscapeChars('He said \\"hi\\"'), 'He said "hi"'));
test("removes \\' escapes", () => eq(ON.removeEscapeChars("It\\'s"), "It's"));

// ── 5. Whitespace ───────────────────────────────────────────────────
test("collapses whitespace", () => eq(ON.normalizeWhitespace("a  \n  b   c"), "a\nb c"));
test("sanitizeText collapses to single line", () => eq(ON.sanitizeText("  a   b\n\n  c  "), "a b c"));

// ── 6. Escaped apostrophes ──────────────────────────────────────────
test("McGill University\"s -> University's", () =>
  eq(ON.fixEscapedQuotes('McGill University"s'), "McGill University's"));
test("apostrophe in middle of word", () => eq(ON.fixEscapedQuotes('doesn"t'), "doesn't"));
test("leaves legit quoted phrase intact", () =>
  eq(ON.fixEscapedQuotes('He said "hello" to her'), 'He said "hello" to her'));

// ── 7. Corrupted tokens / country names ─────────────────────────────
test("Mc\"all -> McCall", () => eq(ON.fixCorruptedText('Mc"all'), "McCall"));
test("F\"lbright -> Fulbright", () => eq(ON.fixCorruptedText('F"lbright'), "Fulbright"));
test("\"ndergraduate -> Undergraduate", () => eq(ON.fixCorruptedText('"ndergraduate'), "Undergraduate"));
test("S\"stainable -> Sustainable", () => eq(ON.fixCorruptedText('S"stainable'), "Sustainable"));
test("f\"nds -> funds", () => eq(ON.fixCorruptedText('f"nds'), "funds"));
test("la\"nched -> launched", () => eq(ON.fixCorruptedText('la"nched'), "launched"));
test("st\"dents -> students", () => eq(ON.fixCorruptedText('st"dents'), "students"));
test("agric\"ltural -> agricultural", () => eq(ON.fixCorruptedText('agric"ltural'), "agricultural"));
test('"ANADA -> Canada', () => eq(ON.cleanCountry('"ANADA'), "Canada"));
test('"HINA -> China', () => eq(ON.cleanCountry('"HINA'), "China"));
test('SA"DI ARABIA -> Saudi Arabia', () => eq(ON.cleanCountry('SA"DI ARABIA'), "Saudi Arabia"));
test("&QUOT;ANADA decoded+cleaned -> Canada", () => eq(ON.cleanCountry(ON.decodeEntities("&QUOT;ANADA")), "Canada"));
test("cleanCountry preserves proper case", () => eq(ON.cleanCountry("United States"), "United States"));
test("cleanCountry title-cases lowercase", () => eq(ON.cleanCountry("saudi arabia"), "Saudi Arabia"));
test("cleanCountry preserves acronyms", () => eq(ON.cleanCountry("UK"), "UK"));

// ── 8. Full sanitizeText pipeline ───────────────────────────────────
test("sanitizeText: markdown + entity + tag mix", () =>
  eq(
    ON.sanitizeText('## Introduction &quot;Quote&quot;\n\n<b>Bold</b> **strong** and \'apos\' at India&#39;s top'),
    'Introduction "Quote" Bold strong and \'apos\' at India\'s top'
  ));
test("sanitizeText: title never contains entities or markdown", () => {
  const t = ON.sanitizeText('Mc"all Scholarship &quot;2026&quot; ## Funded');
  assert.ok(!t.includes("&quot;") && !t.includes("&#39;") && !t.includes("##") && !t.includes('\\"'),
    "title still has corruption: " + t);
  assert.ok(!t.includes("Mc\"all"), "title corruption token not fixed: " + t);
});
test("sanitizeText: escaped quotes decoded", () =>
  eq(ON.sanitizeText('McGill University\\"s \\"test\\"'), "McGill University's \"test\""));
test("sanitizeText fixes corrupted words via full pipeline", () =>
  eq(
    ON.sanitizeText('Mc"all F"lbright "ndergraduate S"stainable f"nds la"nched st"dents agric"ltural'),
    "McCall Fulbright Undergraduate Sustainable funds launched students agricultural"
  ));
test("sanitizeText preserves legit quoted phrases", () =>
  eq(ON.sanitizeText('"Café – 日本語" unbroken'), '"Café – 日本語" unbroken'));

// ── 9. Excerpts ─────────────────────────────────────────────────────
const longText = "This is a long description. ".repeat(30);
test("cleanExcerpt shortens to <= 220 chars", () => {
  const ex = ON.cleanExcerpt(longText);
  assert.ok(ex.length <= 220, "excerpt too long: " + ex.length);
});
test("cleanExcerpt never cuts a word in half", () => {
  const ex = ON.cleanExcerpt(longText);
  const cutPos = ex.replace(/\u2026$/, "").length;
  assert.ok(cutPos === 0 || /\s/.test(longText.charAt(cutPos)), "word cut in half: " + JSON.stringify(ex.slice(-30)));
});
test("cleanExcerpt returns short text unchanged", () =>
  eq(ON.cleanExcerpt("Short clean description."), "Short clean description."));
test("cleanExcerpt adds … only when truncated", () => {
  assert.ok(ON.cleanExcerpt(longText).endsWith("…"), "truncated excerpt missing ellipsis");
  assert.ok(!ON.cleanExcerpt("Short.").endsWith("…"), "short excerpt should not have ellipsis");
});
test("cleanExcerpt handles empty input", () => eq(ON.cleanExcerpt(""), ""));
test("cleanExcerpt result length within 180-220 when possible", () => {
  const ex = ON.cleanExcerpt(longText);
  assert.ok(ex.length <= 220 && ex.length >= 170, "excerpt out of range: " + ex.length);
});
test("cleanExcerpt strips markdown before excerpting", () => {
  const ex = ON.cleanExcerpt("## Introduction\n\nAt India's top engineering and science institutions, DAAD WISE offers a specific, well-worn path into a German research lab for under");
  assert.ok(!ex.includes("##"), "excerpt still contains ##: " + ex);
  assert.ok(!ex.includes("\n"), "excerpt contains newlines");
});

// ── 10. Idempotence / no-op on clean text ───────────────────────────
test("sanitizeText is a no-op on clean text", () => {
  const clean = "Fully Funded Rhodes Scholarship for graduate study at Oxford University.";
  eq(ON.sanitizeText(clean), clean);
});
test("cleanRichText keeps paragraph breaks", () =>
  eq(ON.cleanRichText("## Introduction\n\nAt India's top institutions.\n\nSecond paragraph."),
    "Introduction\n\nAt India's top institutions.\n\nSecond paragraph."));
test("cleanRichText decodes entities and strips markdown", () =>
  eq(ON.cleanRichText("**Bold** and &#39;quoted&#39; text &amp; more"), "Bold and 'quoted' text & more"));

console.log("\n" + passed + " passed, " + failed + " failed");
if (failed > 0) process.exit(1);
