const fs = require("fs");
const files = fs.readdirSync("guides").filter(f => f.endsWith(".html")).sort();
const entries = files.map(f => `  <url>
    <loc>https://www.opportunitynest.org/guides/${f}</loc>
    <lastmod>2026-07-07</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join("\n");
const sm = fs.readFileSync("sitemap.xml", "utf-8");
const updated = sm.replace("</urlset>", entries + "\n</urlset>");
fs.writeFileSync("sitemap.xml", updated, "utf-8");
console.log("Added " + files.length + " guide URLs to sitemap.xml");
