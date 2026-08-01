/* OpportunityNest text sanitizer
 * Defensive rendering-only pipeline that repairs corrupted opportunity text
 * without touching the database or API responses:
 *   1. decode HTML entities           (&quot; &#39; &amp; &lt; &gt; &QUOT; ...)
 *   2. remove markdown syntax         (## ### ** __ * ` [x](url) list markers)
 *   3. strip HTML tags                (<p>, <strong>, ...)
 *   4. remove escape characters       (\" \' \\) left over from imports
 *   5. repair escaped apostrophes     (McGill University"s -> McGill University's)
 *   6. fix known corrupted tokens     (Mc"all -> McCall, "ANADA -> Canada, ...)
 *   7. normalize whitespace           (collapse spaces, trim)
 *   8. generate word-safe excerpts    (180-220 chars, "…" only when truncated)
 *
 * UMD: attaches to window.OpportunityNest in the browser, exports a plain
 * object in CommonJS/ESM test environments. Safe to load as a classic script.
 */
(function (root, factory) {
  "use strict";
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else {
    var ON = (root.OpportunityNest = root.OpportunityNest || {});
    var api = factory();
    for (var key in api) {
      if (Object.prototype.hasOwnProperty.call(api, key)) ON[key] = api[key];
    }
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var NAMED_ENTITIES = {
    quot: '"',
    amp: "&",
    lt: "<",
    gt: ">",
    apos: "'",
    nbsp: "\u00A0",
    ndash: "\u2013",
    mdash: "\u2014",
    hellip: "\u2026",
    bull: "\u2022",
    middot: "\u00B7",
    ldquo: "\u201C",
    rdquo: "\u201D",
    lsquo: "\u2018",
    rsquo: "\u2019",
    copy: "\u00A9",
    reg: "\u00AE",
    trade: "\u2122",
    deg: "\u00B0",
    plusmn: "\u00B1",
    times: "\u00D7",
    divide: "\u00F7",
    pound: "\u00A3",
    euro: "\u20AC",
    yen: "\u00A5",
    cent: "\u00A2",
    laquo: "\u00AB",
    raquo: "\u00BB",
    para: "\u00B6",
    dagger: "\u2020",
    prime: "\u2032",
    infin: "\u221E",
    frac12: "\u00BD",
    frac14: "\u00BC",
    frac34: "\u00BE",
    sup2: "\u00B2",
    sup3: "\u00B3",
    szlig: "\u00DF",
    agrave: "\u00E0",
    aacute: "\u00E1",
    acirc: "\u00E2",
    atilde: "\u00E3",
    auml: "\u00E4",
    aring: "\u00E5",
    ccedil: "\u00E7",
    egrave: "\u00E8",
    eacute: "\u00E9",
    ecirc: "\u00EA",
    euml: "\u00EB",
    igrave: "\u00EC",
    iacute: "\u00ED",
    icirc: "\u00EE",
    iuml: "\u00EF",
    ntilde: "\u00F1",
    ograve: "\u00F2",
    oacute: "\u00F3",
    ocirc: "\u00F4",
    otilde: "\u00F5",
    ouml: "\u00F6",
    ugrave: "\u00F9",
    uacute: "\u00FA",
    ucirc: "\u00FB",
    uuml: "\u00FC",
    yacute: "\u00FD",
    yuml: "\u00FF",
    Egrave: "\u00C8",
    Eacute: "\u00C9",
    Ecirc: "\u00CA",
    Euml: "\u00CB",
    Ograve: "\u00D2",
    Oacute: "\u00D3",
    Ocirc: "\u00D4",
    Otilde: "\u00D5",
    Ouml: "\u00D6",
    Ugrave: "\u00D9",
    Uacute: "\u00DA",
    Ucirc: "\u00DB",
    Uuml: "\u00DC",
    Yacute: "\u00DD"
  };

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  /* 1. Decode HTML entities, including double-encoded (&amp;quot; -> ") and
   * uppercase variants (&QUOT;). A few passes handle nested double-encoding. */
  function decodeEntities(value) {
    var str = String(value == null ? "" : value);
    for (var pass = 0; pass < 3; pass++) {
      var next = str.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]+);?/gi, function (match, ent) {
        var first = ent.charAt(0);
        if (first === "#") {
          var hex = ent.charAt(1).toLowerCase() === "x";
          var code = hex ? parseInt(ent.slice(2), 16) : parseInt(ent.slice(1), 10);
          if (Number.isFinite(code) && code > 0 && code <= 0x10ffff) {
            try { return String.fromCodePoint(code); } catch (_e) { return match; }
          }
          return match;
        }
        var key = ent.toLowerCase();
        return hasOwn(NAMED_ENTITIES, key) ? NAMED_ENTITIES[key] : match;
      });
      if (next === str) break;
      str = next;
    }
    return str;
  }

  /* 2. Remove markdown syntax. Blank lines are preserved so paragraph
   * structure survives for rich-text contexts; flat contexts collapse them. */
  function stripMarkdown(value) {
    return String(value == null ? "" : value)
      .split(/\r?\n/)
      .map(function (line) {
        return line
          .replace(/^\s*#{1,6}[ \t]+/, "")          // ATX headers "## Introduction"
          .replace(/^\s*#{1,6}\s*$/, "")            // bare "##" line
          .replace(/(^|\s)#{2,}[ \t]*/g, "$1")      // stray "##" anywhere in a line
          .replace(/^\s*>\s?/, "")                  // blockquote
          .replace(/^\s*(?:[-*+]|\d{1,3}[.)])\s+/, "") // list markers
          .replace(/^\s*={3,}\s*$/, "")             // setext underline
          .replace(/^\s*-{3,}\s*$/, "")
          .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images -> alt text
          .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")  // links -> label
          .replace(/\*\*([^*]*)\*\*/g, "$1")        // **bold**
          .replace(/__([^_]*?)__/g, "$1")           // __underline/bold__
          .replace(/`([^`]*)`/g, "$1")              // `inline code`
          .replace(/(^|\s)\*([^*\n]+)\*(?=$|\s|[.,;:!?)])/g, "$1$2") // *italic*
          .replace(/(^|\s)_([^_\n]+)_(?=$|\s|[.,;:!?)])/g, "$1$2")   // _italic_
          .trim();
      })
      .join("\n");
  }

  /* 3. Strip HTML tags, keeping their text content. */
  function stripHtml(value) {
    return String(value == null ? "" : value).replace(/<[^>]*>/g, " ");
  }

  /* 4. Remove escape characters left behind by imports (\" \' \\) */
  function removeEscapeChars(value) {
    return String(value == null ? "" : value).replace(/\\(["'\\])/g, "$1");
  }

  /* 5. Collapse whitespace runs and trim. Single newlines are kept and
   * 3+ newlines collapse to a paragraph break (double newline). */
  function normalizeWhitespace(value) {
    return String(value == null ? "" : value)
      .replace(/[\u00A0\u200B\uFEFF]+/g, " ")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  /* 5b. Repair escaped apostrophes where a straight double-quote sits between
   * two word characters (McGill University"s -> McGill University's). Safe for
   * legit quoted phrases because those never put a quote directly between two
   * letters. */
  function fixEscapedQuotes(value) {
    return String(value == null ? "" : value).replace(/(\w)"(\w)/g, "$1'$2");
  }

  /* 6. Fix known corrupted tokens (double-quote replacing a letter). */
  var FIX_MAP = [
    [/Mc"all/g, "McCall"],
    [/F"lbright/g, "Fulbright"],
    [/"ndergraduate/g, "Undergraduate"],
    [/S"stainable/g, "Sustainable"],
    [/f"nds/g, "funds"],
    [/la"nched/g, "launched"],
    [/st"dents/g, "students"],
    [/agric"ltural/g, "agricultural"]
  ];

  function fixCorruptedText(value) {
    var out = String(value == null ? "" : value);
    for (var i = 0; i < FIX_MAP.length; i++) {
      out = out.replace(FIX_MAP[i][0], FIX_MAP[i][1]);
    }
    return out;
  }

  /* 6b. Fix corrupted country names. Operates on the decoded value. */
  var COUNTRY_FIX_MAP = [
    [/^"?ANADA$/i, "Canada"],
    [/^"?HINA$/i, "China"],
    [/^SA"?DI ARABIA$/i, "Saudi Arabia"],
    [/^"?NITED STATES$/i, "United States"],
    [/^"?NITED KINGDOM$/i, "United Kingdom"],
    [/^"?AE$/i, "UAE"],
    [/^"?K$/i, "UK"],
    [/^"?SA$/i, "USA"]
  ];

  function titleCaseWord(word) {
    if (!word) return word;
    var LOWERCASE_WORDS = { of: 1, "the": 1, and: 1, "in": 1, for: 1, "on": 1, "at": 1, to: 1 };
    var first = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    return LOWERCASE_WORDS[word.toLowerCase()] ? word.toLowerCase() : first;
  }

  /* 6c. Clean a country label: repair corruptions, proper capitalization,
   * preserve known acronyms (USA, UK, UAE, EU). */
  function cleanCountry(value) {
    if (value == null) return "";
    var s = String(value).trim();
    for (var i = 0; i < COUNTRY_FIX_MAP.length; i++) {
      s = s.replace(COUNTRY_FIX_MAP[i][0], COUNTRY_FIX_MAP[i][1]);
    }
    // Title-case lower-cased country names ("saudi arabia" -> "Saudi Arabia")
    s = s.replace(/\b([a-z])([a-z]+)\b/g, function (m, first, rest) {
      return first.toUpperCase() + rest.toLowerCase();
    });
    return s.replace(/\s+/g, " ").trim();
  }

  /* Full flat sanitize pipeline for single-line contexts (titles, meta). */
  function sanitizeText(value) {
    if (value == null) return "";
    var out = String(value);
    out = decodeEntities(out);
    out = removeEscapeChars(out);
    out = stripHtml(out);
    out = stripMarkdown(out);
    out = normalizeWhitespace(out);
    out = fixCorruptedText(out);   // known tokens first (Mc"all -> McCall)
    out = fixEscapedQuotes(out);   // then remaining " between letters -> '
    return normalizeWhitespace(out).replace(/[ \t\r\n]+/g, " ").trim();
  }

  /* Rich-text variant that preserves paragraph/newline structure (detail body). */
  function cleanRichText(value) {
    if (value == null) return "";
    var out = String(value);
    out = decodeEntities(out);
    out = removeEscapeChars(out);
    out = stripHtml(out);
    out = stripMarkdown(out);
    out = normalizeWhitespace(out);
    out = fixCorruptedText(out);
    out = fixEscapedQuotes(out);
    return out.trim();
  }

  function cleanTitle(value) {
    return sanitizeText(value);
  }

  /* 8. Word-safe excerpt: 180-220 characters, never splits a word,
   * appends "…" only when truncated. */
  function cleanExcerpt(value, max, min) {
    var text = sanitizeText(value);
    if (!text) return "";
    var upper = typeof max === "number" && max > 0 ? max : 220;
    var lower = typeof min === "number" && min > 0 ? min : 180;
    if (lower > upper) lower = upper;
    if (text.length <= upper) return text;
    var cut = upper;
    var lastSpace = text.lastIndexOf(" ", upper);
    if (lastSpace > lower) cut = lastSpace;
    else if (lastSpace > 0) cut = lastSpace;
    return text.slice(0, cut).replace(/[ \t]+$/, "") + "\u2026";
  }

  return {
    decodeEntities: decodeEntities,
    stripMarkdown: stripMarkdown,
    stripHtml: stripHtml,
    removeEscapeChars: removeEscapeChars,
    normalizeWhitespace: normalizeWhitespace,
    fixEscapedQuotes: fixEscapedQuotes,
    fixCorruptedText: fixCorruptedText,
    cleanCountry: cleanCountry,
    sanitizeText: sanitizeText,
    cleanRichText: cleanRichText,
    cleanTitle: cleanTitle,
    cleanExcerpt: cleanExcerpt
  };
});
