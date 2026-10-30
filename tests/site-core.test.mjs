import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const core = require("../site-core.js");

test("normalizes supported languages and defaults unknown values to English", () => {
  assert.equal(core.normalizeLanguage("zh-CN"), "zh-CN");
  assert.equal(core.normalizeLanguage("en"), "en");
  assert.equal(core.normalizeLanguage("fr"), "en");
  assert.equal(core.normalizeLanguage(null), "en");
  assert.equal(core.t("zh-CN", "hero.headline"), "一次完成一个切片，做出你的游戏。");
  assert.equal(core.t("fr", "hero.headline"), "Make your game, one slice at a time.");
});

test("maps only published release assets to supported downloads", () => {
  assert.equal(core.RELEASE.version, "v0.1.7");
  assert.equal(core.RELEASE.publishedAt, "2026-09-29");
  assert.match(core.getDownload("windows-x64").url, /Keco-Studio-Setup-0\.1\.7-windows-x64\.exe$/);
  assert.equal(core.getDownload("windows-x64").size, 5300935);
  assert.match(core.getDownload("macos-arm64").url, /Keco-Studio-0\.1\.7-macos-arm64\.dmg$/);
  assert.equal(core.getDownload("macos-arm64").size, 1837056);
  assert.match(core.getDownload("macos-x64").url, /Keco-Studio-0\.1\.7-macos-x64\.dmg$/);
  assert.equal(core.getDownload("macos-x64").size, 1941574);
  assert.equal(core.getDownload("linux-x64"), null);
  assert.equal(core.getDownload("mobile"), null);
});

test("detects supported desktops and keeps Linux, mobile, and unknown unsupported", () => {
  assert.deepEqual(
    core.detectPlatform({ userAgent: "Windows NT 10.0; Win64; x64", platform: "Win32" }),
    { kind: "windows", architecture: "x64", recommendedKey: "windows-x64", supported: true, mobile: false }
  );
  assert.deepEqual(
    core.detectPlatform({ userAgent: "Macintosh", platform: "MacIntel", architecture: "arm" }),
    { kind: "macos", architecture: "arm64", recommendedKey: "macos-arm64", supported: true, mobile: false }
  );
  assert.deepEqual(
    core.detectPlatform({ userAgent: "Macintosh", platform: "MacIntel", architecture: "x86" }),
    { kind: "macos", architecture: "x64", recommendedKey: "macos-x64", supported: true, mobile: false }
  );
  assert.deepEqual(
    core.detectPlatform({ userAgent: "Macintosh", platform: "MacIntel" }),
    { kind: "macos", architecture: "unknown", recommendedKey: null, supported: true, mobile: false }
  );
  assert.deepEqual(
    core.detectPlatform({ userAgent: "X11; Linux x86_64", platform: "Linux x86_64" }),
    { kind: "linux", architecture: "x64", recommendedKey: null, supported: false, mobile: false }
  );
  assert.deepEqual(
    core.detectPlatform({ userAgent: "iPhone", platform: "iPhone", mobile: true }),
    { kind: "mobile", architecture: "unknown", recommendedKey: null, supported: false, mobile: true }
  );
  assert.deepEqual(
    core.detectPlatform({ userAgent: "Other", platform: "Other" }),
    { kind: "unknown", architecture: "unknown", recommendedKey: null, supported: false, mobile: false }
  );
});

test("builds localized download views without inventing unavailable links", () => {
  const windows = core.getDownloadView("en", core.detectPlatform({ platform: "Win32", userAgent: "Windows" }));
  assert.equal(windows.label, "Download for Windows");
  assert.match(windows.url, /windows-x64\.exe$/);
  assert.equal(windows.disabled, false);

  const linux = core.getDownloadView("zh-CN", core.detectPlatform({ platform: "Linux x86_64", userAgent: "Linux" }));
  assert.equal(linux.label, "Linux 版即将推出");
  assert.equal(linux.url, null);
  assert.equal(linux.disabled, true);
});

test("carousel helpers wrap in both directions and respect reduced motion", () => {
  assert.equal(core.nextSlide(2, 3, 1), 0);
  assert.equal(core.nextSlide(0, 3, -1), 2);
  assert.equal(core.nextSlide(1, 3, 1), 2);
  assert.equal(core.nextSlide(0, 0, 1), 0);
  assert.equal(core.shouldAutoplay(false), true);
  assert.equal(core.shouldAutoplay(true), false);
});
