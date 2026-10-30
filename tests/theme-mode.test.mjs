import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pages = [
  { file: "index.html", version: "prd-1" },
  { file: "game-designers.html", version: "theme-time-3" },
  { file: "pricing.html", version: "theme-time-3" }
];

for (const page of pages) {
  test(`${page.file} allows the system color scheme to control native UI`, async () => {
    const html = await readFile(new URL("../" + page.file, import.meta.url), "utf8");

    assert.doesNotMatch(html, /color-scheme\s*:\s*light\b/i);
    assert.match(html, /class="icon-btn theme-btn"/);
    assert.match(html, new RegExp(`href="styles\\.css\\?v=${page.version}"`));
    assert.match(html, new RegExp(`src="site\\.js\\?v=${page.version}"`));
  });
}
