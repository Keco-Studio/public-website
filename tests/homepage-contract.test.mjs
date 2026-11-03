import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const css = await readFile(new URL("../styles.css", import.meta.url), "utf8");

test("homepage exposes the approved product journey", () => {
  for (const id of ["game-design-system", "ai-agent", "simulator", "script", "map", "download-dialog-title", "requirements", "faq"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
  assert.match(html, /Make your game, one slice at a time\./);
  assert.match(html, /data-language-toggle/);
  assert.match(html, /styles\.css\?v=prd-4/);
  assert.match(html, /site-core\.js\?v=prd-4/);
  assert.match(html, /site\.js\?v=prd-4/);
  assert.match(html, /assets\/screenshots\/englishlibraries\.png/);
  assert.match(html, /data-i18n-src-zh="assets\/screenshots\/chineselibraries\.png"/);
  assert.doesNotMatch(html, /assets\/screenshots\/屏幕截图 2026-10-30 104821\.png/);
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
  assert.equal((html.match(/data-feature-link=/g) || []).length, 10);
  assert.equal((html.match(/data-feature-tab=/g) || []).length, 5);
  assert.equal((html.match(/role=["']tab["']/g) || []).length, 5);
  assert.equal((html.match(/data-feature-panel(?:\s|>)/g) || []).length, 1);
  assert.equal((html.match(/data-feature-carousel(?:\s|>)/g) || []).length, 1);
  assert.doesNotMatch(html, /class=["'][^"']*\bproduct-feature\b/);
});

test("feature screenshots remain fully visible inside the shared preview", () => {
  assert.match(css, /\.carousel-stage\s*>\s*img\s*\{[^}]*object-fit:\s*contain;/s);
  assert.match(css, /\.carousel-arrow\[hidden\][^{]*\.carousel-dots\[hidden\]\s*\{\s*display:\s*none;/s);
});

test("homepage workspace screenshot uses its intrinsic height without letterboxing", () => {
  const productImageRule = css.match(/\.product-frame img\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(productImageRule, /height:\s*auto;/);
  assert.doesNotMatch(productImageRule, /aspect-ratio:/);
});

test("homepage omits redundant release and carousel status copy", () => {
  assert.doesNotMatch(html, /class=["'][^"']*\bhero-release\b/);
  assert.doesNotMatch(html, /data-carousel-status(?:\s|>)/);
});

test("homepage keeps all feature descriptions available without JavaScript", () => {
  assert.equal((html.match(/data-feature-fallback=/g) || []).length, 5);
  assert.match(html, /<noscript>[\s\S]*data-feature-fallback="map"[\s\S]*<\/noscript>/);
});

test("homepage presents a detected-device download before compact alternatives", () => {
  assert.equal((html.match(/<dialog[^>]*data-download-dialog(?:\s|>)/g) || []).length, 1);
  assert.equal((html.match(/data-download-dialog-open(?:\s|>)/g) || []).length, 6);
  assert.equal((html.match(/data-download-recommendation(?:\s|>)/g) || []).length, 1);
  assert.equal((html.match(/data-recommended-download(?:\s|>)/g) || []).length, 1);
  assert.equal((html.match(/data-download-option=/g) || []).length, 4);
  assert.equal((html.match(/data-recommended-badge(?:\s|>)/g) || []).length, 3);
  assert.doesNotMatch(html, /href=["']#downloads["']/);
  assert.doesNotMatch(html, /<section[^>]*class=["'][^"']*\bdownloads\b/);
});

test("homepage keeps eight FAQ items collapsed by default", () => {
  assert.equal((html.match(/<details(?:\s|>)/g) || []).length, 8);
  assert.doesNotMatch(html, /<details\s+open/);
});
