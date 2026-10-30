import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("homepage exposes the approved product journey", () => {
  for (const id of ["game-design-system", "ai-agent", "simulator", "script", "map", "downloads", "requirements", "faq"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /Make your game, one slice at a time\./);
  assert.match(html, /data-language-toggle/);
  assert.match(html, /site-core\.js\?v=prd-1/);
  assert.match(html, /assets\/screenshots\/屏幕截图 2026-10-30 104821\.png/);
});

test("homepage has direct supported fallbacks and no dead hash controls", () => {
  assert.match(html, /Keco-Studio-Setup-0\.1\.7-windows-x64\.exe/);
  assert.match(html, /Keco-Studio-0\.1\.7-macos-arm64\.dmg/);
  assert.match(html, /Keco-Studio-0\.1\.7-macos-x64\.dmg/);
  assert.doesNotMatch(html, /href=["']#["']/);
});

test("homepage includes five carousel roots and eight collapsed FAQ items", () => {
  assert.equal((html.match(/data-carousel=/g) || []).length, 5);
  assert.equal((html.match(/<details(?:\s|>)/g) || []).length, 8);
  assert.doesNotMatch(html, /<details\s+open/);
});
