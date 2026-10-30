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

test("homepage omits the auxiliary topbar while keeping language in the main navigation", () => {
  assert.doesNotMatch(html, /class=["']topbar["']/);
  assert.match(html, /class=["']mainbar["'][\s\S]*data-language-toggle/);
});

test("homepage has direct supported fallbacks and no dead hash controls", () => {
  assert.match(html, /Keco-Studio-Setup-0\.1\.7-windows-x64\.exe/);
  assert.match(html, /Keco-Studio-0\.1\.7-macos-arm64\.dmg/);
  assert.match(html, /Keco-Studio-0\.1\.7-macos-x64\.dmg/);
  assert.doesNotMatch(html, /href=["']#["']/);
});

test("homepage uses one accessible feature showcase instead of five repeated sections", () => {
  assert.equal((html.match(/data-feature-showcase(?:\s|>)/g) || []).length, 1);
  assert.equal((html.match(/data-feature-tab=/g) || []).length, 5);
  assert.equal((html.match(/role=["']tab["']/g) || []).length, 5);
  assert.equal((html.match(/data-feature-panel(?:\s|>)/g) || []).length, 1);
  assert.equal((html.match(/data-feature-carousel(?:\s|>)/g) || []).length, 1);
  assert.doesNotMatch(html, /class=["'][^"']*\bproduct-feature\b/);
});

test("homepage keeps all feature descriptions available without JavaScript", () => {
  assert.equal((html.match(/data-feature-fallback=/g) || []).length, 5);
  assert.match(html, /<noscript>[\s\S]*data-feature-fallback="map"[\s\S]*<\/noscript>/);
});

test("homepage presents a detected-device download before compact alternatives", () => {
  assert.equal((html.match(/data-download-recommendation(?:\s|>)/g) || []).length, 1);
  assert.equal((html.match(/data-recommended-download(?:\s|>)/g) || []).length, 1);
  assert.equal((html.match(/data-download-option=/g) || []).length, 4);
  assert.equal((html.match(/data-recommended-badge(?:\s|>)/g) || []).length, 3);
});

test("homepage keeps eight FAQ items collapsed by default", () => {
  assert.equal((html.match(/<details(?:\s|>)/g) || []).length, 8);
  assert.doesNotMatch(html, /<details\s+open/);
});
