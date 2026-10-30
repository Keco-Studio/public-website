# Keco Studio PRD Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage with the approved bilingual, download-first Keco Studio single-page experience while preserving the current visual design system.

**Architecture:** Keep the zero-build static site. Add `site-core.js` as a browser/CommonJS-compatible module containing immutable release data, translations, platform selection, and carousel state helpers; keep `site.js` as the defensive DOM integration layer. Rebuild only `index.html`, extend the existing shared CSS with scoped homepage components, and leave the two legacy pages functional but unlinked from the new homepage.

**Tech Stack:** Semantic HTML5, existing CSS custom properties and responsive grid, vanilla JavaScript, Node.js built-in test runner, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-10-30-keco-studio-prd-redesign.md`

## Global Constraints

- Preserve the current `Source Sans 3` typography, blue/white/dark palette, 12-column grid, square corners, thin rules, button treatments, dark footer, and responsive type scale.
- Preserve automatic day/night theme behavior and its existing manual override.
- English is the default; Simplified Chinese is a complete, persistent alternative.
- Use only the real `Keco-Studio/keco-desktop` `v0.1.7` Windows x64, macOS arm64, and macOS x64 assets.
- Linux and mobile are non-downloadable `Coming soon` / `即将推出` states.
- No download starts without an explicit visitor click.
- Use the existing file in `assets/screenshots/` for all initial screenshot slots.
- Keep `pricing.html` and `game-designers.html` functional but remove them from homepage navigation.
- Help, privacy, terms, cookies, and filing controls are non-navigating `Coming soon` / `即将提供` states.
- Do not add a framework, backend, analytics, account flow, newsletter submission, or fabricated legal text.

---

## File Map

- Create `site-core.js`: release catalog, feature slide catalog, translations, platform detection, localized download model, and pure carousel helpers.
- Create `tests/site-core.test.mjs`: unit coverage for localization, platform selection, download catalog, and carousel state.
- Create `tests/homepage-contract.test.mjs`: static semantic and fallback contract for the rebuilt homepage.
- Create `tests/homepage-runtime.test.mjs`: lightweight DOM-harness coverage for language and download initialization.
- Modify `index.html`: approved single-page information architecture and English no-JavaScript fallback.
- Modify `site.js`: retain theme and legacy-page behavior; add homepage initialization using `KecoSiteCore`.
- Modify `styles.css`: retain all existing tokens and legacy selectors; add scoped homepage layouts and states.
- Modify `tests/theme-mode.test.mjs`: update homepage asset version assertions without weakening legacy-page checks.
- Add `assets/screenshots/屏幕截图 2026-10-30 104821.png` to version control as the approved temporary product image.

---

### Task 1: Pure Site Model And Release Catalog

**Files:**
- Create: `site-core.js`
- Create: `tests/site-core.test.mjs`

**Interfaces:**
- Produces: `KecoSiteCore.RELEASE`, `KecoSiteCore.FEATURES`, `KecoSiteCore.TRANSLATIONS`
- Produces: `KecoSiteCore.normalizeLanguage(value): "en" | "zh-CN"`
- Produces: `KecoSiteCore.t(language, key): string`
- Produces: `KecoSiteCore.detectPlatform(navigatorLike): { kind, architecture, recommendedKey, supported, mobile }`
- Produces: `KecoSiteCore.getDownload(key): Download | null`
- Produces: `KecoSiteCore.getDownloadView(language, detection): DownloadView`
- Produces: `KecoSiteCore.nextSlide(index, count, direction): number`
- Produces: `KecoSiteCore.shouldAutoplay(prefersReducedMotion): boolean`

- [ ] **Step 1: Write the failing core-model tests**

Create `tests/site-core.test.mjs` with explicit catalog and behavior checks:

```js
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const core = require("../site-core.js");

test("normalizes supported languages and defaults to English", () => {
  assert.equal(core.normalizeLanguage("zh-CN"), "zh-CN");
  assert.equal(core.normalizeLanguage("en"), "en");
  assert.equal(core.normalizeLanguage("fr"), "en");
  assert.equal(core.t("zh-CN", "hero.headline"), "一次完成一个切片，做出你的游戏。");
});

test("maps only real release assets to supported downloads", () => {
  assert.equal(core.RELEASE.version, "v0.1.7");
  assert.match(core.getDownload("windows-x64").url, /Keco-Studio-Setup-0\.1\.7-windows-x64\.exe$/);
  assert.match(core.getDownload("macos-arm64").url, /Keco-Studio-0\.1\.7-macos-arm64\.dmg$/);
  assert.match(core.getDownload("macos-x64").url, /Keco-Studio-0\.1\.7-macos-x64\.dmg$/);
  assert.equal(core.getDownload("linux-x64"), null);
});

test("detects Windows, Mac architectures, Linux, mobile, and unknown", () => {
  assert.deepEqual(core.detectPlatform({ userAgent: "Windows NT 10.0; Win64; x64", platform: "Win32" }).recommendedKey, "windows-x64");
  assert.deepEqual(core.detectPlatform({ userAgent: "Macintosh", platform: "MacIntel", architecture: "arm" }).recommendedKey, "macos-arm64");
  assert.deepEqual(core.detectPlatform({ userAgent: "Macintosh", platform: "MacIntel", architecture: "x86" }).recommendedKey, "macos-x64");
  assert.equal(core.detectPlatform({ userAgent: "X11; Linux x86_64", platform: "Linux x86_64" }).supported, false);
  assert.equal(core.detectPlatform({ userAgent: "iPhone", platform: "iPhone", mobile: true }).mobile, true);
  assert.equal(core.detectPlatform({ userAgent: "Other", platform: "Other" }).recommendedKey, null);
});

test("carousel helpers wrap and respect reduced motion", () => {
  assert.equal(core.nextSlide(2, 3, 1), 0);
  assert.equal(core.nextSlide(0, 3, -1), 2);
  assert.equal(core.shouldAutoplay(false), true);
  assert.equal(core.shouldAutoplay(true), false);
});
```

- [ ] **Step 2: Run the tests and verify the module is missing**

Run: `node --test tests/site-core.test.mjs`

Expected: FAIL with `Cannot find module '../site-core.js'`.

- [ ] **Step 3: Implement `site-core.js` as a UMD-style pure module**

Use this export shell so the same implementation works in a browser and Node:

```js
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.KecoSiteCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  // RELEASE, FEATURES, TRANSLATIONS, and pure functions live here.
  return {
    RELEASE: RELEASE,
    FEATURES: FEATURES,
    TRANSLATIONS: TRANSLATIONS,
    normalizeLanguage: normalizeLanguage,
    t: t,
    detectPlatform: detectPlatform,
    getDownload: getDownload,
    getDownloadView: getDownloadView,
    nextSlide: nextSlide,
    shouldAutoplay: shouldAutoplay
  };
});
```

Define the three exact GitHub download URLs and byte sizes from the spec. Define
all English and Chinese strings used by the header, hero, five features,
carousel captions, download states, requirements, installation guidance, FAQ,
closing action, footer, error messages, and accessibility labels. Define three
slide entries per feature using the approved screenshot path and distinct
`objectPosition` values.

- [ ] **Step 4: Run the core-model tests**

Run: `node --test tests/site-core.test.mjs`

Expected: PASS with four tests and zero failures.

- [ ] **Step 5: Commit the pure model**

```bash
git add site-core.js tests/site-core.test.mjs
git commit -m "feat: add bilingual release and platform model"
```

---

### Task 2: Semantic Single-Page Homepage

**Files:**
- Create: `tests/homepage-contract.test.mjs`
- Modify: `index.html`
- Add: `assets/screenshots/屏幕截图 2026-10-30 104821.png`

**Interfaces:**
- Consumes: translation keys and release URLs from `site-core.js`
- Produces: stable section IDs `top`, `game-design-system`, `ai-agent`, `simulator`, `script`, `map`, `downloads`, `requirements`, and `faq`
- Produces: DOM hooks `[data-i18n]`, `[data-carousel]`, `[data-download]`, `[data-language-toggle]`, `.theme-btn`, `.menu-btn`, and `#mobile-panel`

- [ ] **Step 1: Write the failing homepage contract test**

Create `tests/homepage-contract.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the contract and verify it fails against the old homepage**

Run: `node --test tests/homepage-contract.test.mjs`

Expected: FAIL because the five PRD section IDs and language control are absent.

- [ ] **Step 3: Rebuild `index.html` with English fallback content**

Use this exact section order: `header.site-header`, `main#top`,
`section.product-hero`, `section.product-proof`, `div.feature-list` containing
the five ordered `section.product-feature` elements, `section#downloads`,
`section#requirements`, `section#faq`, `section.final-download`, and
`footer.site-footer`. Each section must contain its full English fallback copy
from the spec rather than empty client-rendered shells.

Include the current logo, existing theme SVGs, lucide-style familiar download,
arrow, menu, sun, moon, and carousel arrow icons already represented by inline
SVG patterns in the project. Use text buttons only for explicit download and
language commands. Every translatable text or ARIA label gets a key through
`data-i18n` or `data-i18n-aria-label`. Load `site-core.js?v=prd-1` before
`site.js?v=prd-1` with `defer`.

Use direct GitHub URLs on the three supported version anchors so downloads stay
available without JavaScript. Render Linux and mobile as disabled buttons, not
anchors. Render auxiliary coming-soon items as text/status controls, not links.

- [ ] **Step 4: Run the homepage contract**

Run: `node --test tests/homepage-contract.test.mjs`

Expected: PASS with three tests and zero failures.

- [ ] **Step 5: Commit the semantic homepage and approved image**

```bash
git add index.html tests/homepage-contract.test.mjs assets/screenshots/屏幕截图\ 2026-10-30\ 104821.png
git commit -m "feat: rebuild homepage around Keco Studio downloads"
```

---

### Task 3: Localization And Download Runtime

**Files:**
- Create: `tests/homepage-runtime.test.mjs`
- Modify: `site.js`
- Modify: `tests/theme-mode.test.mjs`

**Interfaces:**
- Consumes: `window.KecoSiteCore`
- Produces: persisted key `keco-language`
- Produces: `html.lang`, localized text/ARIA attributes, detected primary download, download status panel, and three-second retry state
- Preserves: persisted key `keco-theme` and current theme scheduling semantics

- [ ] **Step 1: Write failing runtime tests using a minimal DOM harness**

In `tests/homepage-runtime.test.mjs`, load `site-core.js` and `site.js` through
`vm.runInNewContext`. Provide fake nodes implementing `textContent`, `dataset`,
`hidden`, `href`, `setAttribute`, `getAttribute`, and `addEventListener`.
Assert these exact outcomes:

```js
test("language control restores Chinese and translates text and labels", () => {
  const runtime = bootHomepage({ storedLanguage: "zh-CN", platform: "Win32" });
  assert.equal(runtime.document.documentElement.lang, "zh-CN");
  assert.equal(runtime.nodes.headline.textContent, "一次完成一个切片，做出你的游戏。");
  assert.equal(runtime.nodes.languageButton.getAttribute("aria-label"), "Switch to English");
});

test("language control persists an explicit switch", () => {
  const runtime = bootHomepage({ platform: "Win32" });
  runtime.nodes.languageButton.click();
  assert.equal(runtime.storage.getItem("keco-language"), "zh-CN");
});

test("Windows detection points the primary action at the real installer", () => {
  const runtime = bootHomepage({ platform: "Win32" });
  assert.match(runtime.nodes.primaryDownload.href, /windows-x64\.exe$/);
  assert.equal(runtime.downloadClicks, 0);
});

test("Linux detection presents a non-downloadable coming-soon state", () => {
  const runtime = bootHomepage({ platform: "Linux x86_64" });
  assert.equal(runtime.nodes.primaryDownload.getAttribute("aria-disabled"), "true");
  assert.equal(runtime.downloadClicks, 0);
});
```

- [ ] **Step 2: Run runtime and retained theme tests to verify failure**

Run: `node --test tests/homepage-runtime.test.mjs tests/theme-toggle.test.mjs tests/theme-mode.test.mjs`

Expected: runtime tests FAIL because localization and download initialization do
not exist; existing theme tests remain green.

- [ ] **Step 3: Extend `site.js` defensively**

Keep the current theme block behavior unchanged. Add isolated
`initLanguage(core)`, `applyLanguage(core, language)`, `initDownloads(core)`,
`renderPrimaryDownload(core, language, detection)`, and
`showDownloadStatus(core, language, download)` functions after obtaining
`window.KecoSiteCore`. `initLanguage` reads `keco-language`, normalizes it,
applies it, and binds one toggle. `applyLanguage` updates every translation
hook, `html.lang`, the title, the description, and localized ARIA hooks.
`initDownloads` detects once synchronously, renders the primary action, binds
explicit download clicks, and asynchronously refines Mac architecture.
`renderPrimaryDownload` assigns a real URL only for a supported download and
otherwise removes `href` and sets `aria-disabled="true"`.
`showDownloadStatus` reveals the chosen filename and installation guidance,
then exposes retry and version-selection actions after 3000 ms.

Guard every initializer by checking that its required root exists. Catch storage
access errors. Use `navigator.userAgentData.getHighEntropyValues(["architecture"])`
when available, render once synchronously, then refine macOS architecture after
the promise resolves. Do not programmatically click a download link.

Keep legacy pixel-map and mobile-menu behavior conditional so the retained old
pages still work. Localize the mobile menu open/close label when the homepage
dictionary is available.

Update `tests/theme-mode.test.mjs` to read each HTML file with
`readFile(new URL("../" + page.file, import.meta.url), "utf8")` instead of
fetching a local server. Make `index.html` expect the `prd-1` asset query while
`pricing.html` and `game-designers.html` continue expecting `theme-time-3`.

- [ ] **Step 4: Run runtime and retained theme tests**

Run: `node --test tests/homepage-runtime.test.mjs tests/theme-toggle.test.mjs tests/theme-mode.test.mjs`

Expected: PASS with all language, platform, no-auto-download, theme, and asset
version assertions green.

- [ ] **Step 5: Commit localization and downloads**

```bash
git add site.js tests/homepage-runtime.test.mjs tests/theme-mode.test.mjs
git commit -m "feat: add bilingual platform-aware downloads"
```

---

### Task 4: Product Screenshot Carousels

**Files:**
- Modify: `site.js`
- Modify: `tests/homepage-runtime.test.mjs`

**Interfaces:**
- Consumes: `KecoSiteCore.FEATURES`, `nextSlide`, and `shouldAutoplay`
- Produces: independent carousel instances with previous, next, dot navigation, caption, failure/retry, pause, and reduced-motion behavior

- [ ] **Step 1: Add failing carousel runtime tests**

Extend the runtime harness with fake carousel roots and controllable timers:

```js
test("carousel advances after three seconds and wraps", () => {
  const runtime = bootHomepage({ carousel: true });
  assert.equal(runtime.nodes.carousel.dataset.activeSlide, "0");
  runtime.runInterval();
  assert.equal(runtime.nodes.carousel.dataset.activeSlide, "1");
  runtime.runInterval();
  runtime.runInterval();
  assert.equal(runtime.nodes.carousel.dataset.activeSlide, "0");
});

test("manual carousel navigation resets the interval", () => {
  const runtime = bootHomepage({ carousel: true });
  runtime.nodes.nextButton.click();
  assert.equal(runtime.nodes.carousel.dataset.activeSlide, "1");
  assert.equal(runtime.intervalResetCount, 1);
});

test("reduced motion disables carousel autoplay", () => {
  const runtime = bootHomepage({ carousel: true, reducedMotion: true });
  assert.equal(runtime.intervalCount, 0);
});
```

- [ ] **Step 2: Run the carousel tests and verify failure**

Run: `node --test tests/homepage-runtime.test.mjs`

Expected: FAIL because no carousel interval or navigation is initialized.

- [ ] **Step 3: Implement independent carousel controllers in `site.js`**

Add `initCarousels(core)` and one controller per `[data-carousel]`. Render the
configured image path, object position, localized caption, `aria-live` slide
status, and active dot. Use a 3000 ms interval only when reduced motion is off.
Pause on `pointerenter` and `focusin`; resume on `pointerleave` and `focusout`
when focus has left the carousel. Manual arrows and dots restart the interval.

On `img.error`, hide the failed image without collapsing its frame and show the
localized error plus retry control. Retry restores the image and appends a
cache-busting query without changing the configured source.

- [ ] **Step 4: Run runtime and core tests**

Run: `node --test tests/site-core.test.mjs tests/homepage-runtime.test.mjs`

Expected: PASS with carousel wrap, reset, reduced-motion, localization, and
download tests green.

- [ ] **Step 5: Commit carousel behavior**

```bash
git add site.js tests/homepage-runtime.test.mjs
git commit -m "feat: add accessible product screenshot carousels"
```

---

### Task 5: Preserve And Extend The Existing Visual System

**Files:**
- Modify: `styles.css`

**Interfaces:**
- Consumes: semantic classes from `index.html`
- Produces: responsive desktop/tablet/mobile layout with current tokens only

- [ ] **Step 1: Record the baseline token guard**

Run:

```bash
rg -n -- '--bg: #ffffff|--panel: #f3f5fa|--accent: #1d4ed8|--footer: #111827|border-radius: 0|grid-template-columns: repeat\(12' styles.css
```

Expected: all current visual anchors are present before editing.

- [ ] **Step 2: Add scoped homepage styles without changing root tokens**

Append styles for:

- `.product-hero` and `.hero-release`
- `.product-proof` and `.product-frame`
- `.product-feature`, `.feature-copy`, and `.feature-carousel`
- `.carousel-stage`, `.carousel-controls`, `.carousel-dots`, and image error state
- `.download-grid`, `.download-option`, `.download-status`, and disabled states
- `.requirements-grid`, `.requirements-table`, and `.install-guide`
- `.final-download` and `.status-link`

Use only `var(--bg)`, `var(--panel)`, `var(--card)`, `var(--line)`, `var(--ink)`,
`var(--ink-2)`, `var(--accent)`, `var(--accent-hover)`, and `var(--on-accent)` for
theme-dependent surfaces. Keep every new panel and button at `border-radius: 0`.
Use `aspect-ratio: 1893 / 1012` for hero and carousel media. Keep control
dimensions stable, long filenames wrapping, and mobile buttons full-width only
below 640 px.

Do not remove legacy selectors because the retained pages still consume them.
Do not introduce viewport-scaled font sizes, negative letter spacing, gradients,
or decorative shapes.

- [ ] **Step 3: Verify the token guard remains unchanged**

Run the Step 1 `rg` command again and inspect `git diff -- styles.css`.

Expected: root light/dark tokens and existing component values are unchanged;
the diff contains only scoped homepage additions or narrowly required responsive
adjustments.

- [ ] **Step 4: Run all Node tests**

Run: `node --test tests/*.test.mjs`

Expected: PASS with zero failures.

- [ ] **Step 5: Commit the style extension**

```bash
git add styles.css
git commit -m "style: extend existing Keco system for product homepage"
```

---

### Task 6: Browser, Download, And Deployment Verification

**Files:**
- Modify only if verification exposes a concrete defect: `index.html`, `styles.css`, `site.js`, `site-core.js`, or relevant tests
- Create temporarily and do not commit: `/tmp/keco-site-verification/`

**Interfaces:**
- Verifies the complete homepage, retained pages, external release assets, and GitHub Pages workflow

- [ ] **Step 1: Run the complete automated suite**

Start the static server:

```bash
python3 -m http.server 8000
```

In another shell run:

```bash
node --test tests/*.test.mjs
```

Expected: all tests PASS with zero failures.

- [ ] **Step 2: Verify all supported release URLs**

Run:

```bash
curl -L --fail --silent --show-error --range 0-0 -o /dev/null -w '%{http_code} %{url_effective}\n' https://github.com/Keco-Studio/keco-desktop/releases/download/v0.1.7/Keco-Studio-Setup-0.1.7-windows-x64.exe
curl -L --fail --silent --show-error --range 0-0 -o /dev/null -w '%{http_code} %{url_effective}\n' https://github.com/Keco-Studio/keco-desktop/releases/download/v0.1.7/Keco-Studio-0.1.7-macos-arm64.dmg
curl -L --fail --silent --show-error --range 0-0 -o /dev/null -w '%{http_code} %{url_effective}\n' https://github.com/Keco-Studio/keco-desktop/releases/download/v0.1.7/Keco-Studio-0.1.7-macos-x64.dmg
```

Expected: each command exits zero and resolves to a GitHub release asset
response; a partial-content response is acceptable for the one-byte range.

- [ ] **Step 3: Capture responsive Playwright screenshots**

Install the ephemeral Chromium browser if it is not cached, then capture:

```bash
mkdir -p /tmp/keco-site-verification
npx --yes playwright install chromium
npx --yes playwright screenshot --device="Desktop Chrome" --full-page http://127.0.0.1:8000/index.html /tmp/keco-site-verification/home-desktop.png
npx --yes playwright screenshot --device="iPhone 13" --full-page http://127.0.0.1:8000/index.html /tmp/keco-site-verification/home-mobile.png
```

Expected: both screenshots are nonblank and include the hero, five feature
sections, downloads, requirements, FAQ, closing action, and footer.

- [ ] **Step 4: Inspect screenshots and interactive states**

Open both screenshots with the image viewer. In a Playwright browser session,
click the language and theme controls and capture Chinese light/dark states at
1440x1000 and 390x844. Confirm:

- No horizontal overflow, overlap, clipped long text, or nested card styling.
- The first viewport shows the product name, primary download, and screenshot.
- Screenshot pixels are nonblank in the hero and every feature frame.
- English and Chinese labels fit at both widths.
- Light and dark modes preserve the existing palette.
- Carousels keep a stable height during automatic and manual transitions.
- Linux and mobile never become live download links.

- [ ] **Step 5: Run final repository checks**

```bash
git diff --check
git status --short --branch
git log --oneline --decorate -8
```

Expected: no whitespace errors; only the user-provided PRD remains intentionally
untracked; implementation commits are ahead of `origin/main`.

- [ ] **Step 6: Push and verify GitHub Pages**

```bash
git push origin main
gh run list --repo Keco-Studio/public-website --workflow static.yml --limit 1
```

Copy the new run's numeric database ID from that output, wait for it, and then
execute the page check:

```bash
gh run watch RUN_ID --repo Keco-Studio/public-website --exit-status
curl -L --fail --silent --show-error -o /dev/null -w 'HTTP %{http_code}\n%{url_effective}\n' https://keco-studio.github.io/public-website/
```

Expected: the workflow completes successfully and the published homepage returns
HTTP 200.

---

## Plan Self-Review Checklist

- Every approved spec section maps to a task above.
- Translation keys, platform result fields, download identifiers, and carousel
  helpers have one consistent name across tests and implementation.
- The plan contains no change to existing visual tokens or a new design system.
- The plan does not commit the source PRD document.
- The approved screenshot is committed because the deployed homepage references
  it.
