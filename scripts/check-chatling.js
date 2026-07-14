const res = await fetch("https://chatling.ai/js/embed.js");
const text = await res.text();
// Find all URLs
const urls = text.match(/https?:\/\/[^\s'"`)\]]+/g);
if (urls) {
  const unique = [...new Set(urls)];
  unique.forEach(u => console.log(u));
} else {
  console.log("No URLs found. Script length:", text.length);
}
// Also look for iframe creation patterns
const iframePatterns = text.match(/iframe|widget\.chatling|app\.chatling|chatling\.ai\/[a-z]+/gi);
if (iframePatterns) {
  console.log("\n--- iframe/widget patterns ---");
  [...new Set(iframePatterns)].forEach(p => console.log(p));
}
