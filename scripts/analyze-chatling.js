// Deep analysis of Chatling embed.js
const res = await fetch("https://chatling.ai/js/embed.js");
const text = await res.text();

console.log("=== Script length:", text.length, "===\n");

// Find all iframe-related code
console.log("=== IFRAME CREATION ===");
const iframeMatches = text.match(/.{0,150}iframe.{0,150}/gi);
if (iframeMatches) {
  iframeMatches.forEach((m, i) => console.log(`\n--- Match ${i+1} ---\n${m.trim()}`));
}

console.log("\n\n=== SRC ATTRIBUTES ===");
const srcMatches = text.match(/.{0,100}\.src\s*=.{0,100}/g);
if (srcMatches) {
  srcMatches.forEach((m, i) => console.log(`\n--- Match ${i+1} ---\n${m.trim()}`));
}

console.log("\n\n=== BLOCKED/ERROR MESSAGES ===");
const blockedMatches = text.match(/.{0,100}(blocked|error|fail|denied|restrict).{0,100}/gi);
if (blockedMatches) {
  blockedMatches.forEach((m, i) => console.log(`\n--- Match ${i+1} ---\n${m.trim()}`));
}

console.log("\n\n=== POSTMESSAGE ===");
const postMsgMatches = text.match(/.{0,100}postMessage.{0,100}/g);
if (postMsgMatches) {
  postMsgMatches.forEach((m, i) => console.log(`\n--- Match ${i+1} ---\n${m.trim()}`));
}

console.log("\n\n=== DOMAINS/URLS ===");
const urlMatches = text.match(/https?:\/\/[^\s"'`)]+/g);
if (urlMatches) {
  [...new Set(urlMatches)].forEach(u => console.log("  " + u));
}

console.log("\n\n=== CHATLING CONFIG OPTIONS ===");
const configMatches = text.match(/.{0,80}chtlConfig.{0,80}/g);
if (configMatches) {
  configMatches.forEach((m, i) => console.log(`\n--- Match ${i+1} ---\n${m.trim()}`));
}

console.log("\n\n=== SANDBOX ATTRIBUTES ===");
const sandboxMatches = text.match(/.{0,100}sandbox.{0,100}/gi);
if (sandboxMatches) {
  sandboxMatches.forEach((m, i) => console.log(`\n--- Match ${i+1} ---\n${m.trim()}`));
}
