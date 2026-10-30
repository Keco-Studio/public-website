import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const core = require("../site-core.js");
const source = await readFile(new URL("../site.js", import.meta.url), "utf8");

class FakeNode {
  constructor(attributes = {}) {
    this.attributes = new Map(Object.entries(attributes));
    this.dataset = {};
    this.hidden = false;
    this.href = attributes.href || "";
    this.listeners = new Map();
    this.textContent = "";
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }

  click() {
    for (const listener of this.listeners.get("click") || []) {
      listener({ currentTarget: this, preventDefault() {}, target: this });
    }
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === "href") this.href = "";
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
    if (name === "href") this.href = String(value);
  }
}

function bootHomepage({ storedLanguage = null, platform = "Other", userAgent = "Other", mobile = false } = {}) {
  const storageValues = new Map(storedLanguage ? [["keco-language", storedLanguage]] : []);
  const storage = {
    getItem(key) { return storageValues.get(key) ?? null; },
    removeItem(key) { storageValues.delete(key); },
    setItem(key, value) { storageValues.set(key, String(value)); }
  };
  const headline = new FakeNode({ "data-i18n": "hero.headline" });
  const languageButton = new FakeNode({
    "data-i18n": "language.switch",
    "data-i18n-aria-label": "language.switchLabel"
  });
  const primaryDownload = new FakeNode({ href: "#downloads" });
  const meta = new FakeNode();
  const documentElement = { dataset: {}, lang: "en" };
  const document = {
    documentElement,
    title: "",
    getElementById() { return null; },
    querySelector(selector) {
      if (selector === "[data-primary-download]") return primaryDownload;
      if (selector === 'meta[name="description"]') return meta;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-i18n]") return [headline, languageButton];
      if (selector === "[data-i18n-aria-label]") return [languageButton];
      if (selector === "[data-language-toggle]") return [languageButton];
      return [];
    }
  };
  const timeouts = [];
  const window = {
    KecoSiteCore: core,
    clearTimeout() {},
    matchMedia() { return { matches: false }; },
    setTimeout(callback, delay) { timeouts.push({ callback, delay }); return timeouts.length; }
  };
  const navigator = { platform, userAgent, userAgentData: { mobile } };

  vm.runInNewContext(source, {
    Date,
    document,
    globalThis: window,
    localStorage: storage,
    navigator,
    setTimeout: window.setTimeout,
    window
  });

  return {
    document,
    nodes: { headline, languageButton, primaryDownload },
    storage,
    timeouts
  };
}

test("language control restores Chinese and translates text and labels", () => {
  const runtime = bootHomepage({ storedLanguage: "zh-CN", platform: "Win32", userAgent: "Windows" });

  assert.equal(runtime.document.documentElement.lang, "zh-CN");
  assert.equal(runtime.nodes.headline.textContent, "一次完成一个切片，做出你的游戏。");
  assert.equal(runtime.nodes.languageButton.textContent, "EN");
  assert.equal(runtime.nodes.languageButton.getAttribute("aria-label"), "Switch to English");
});

test("language control persists an explicit switch", () => {
  const runtime = bootHomepage({ platform: "Win32", userAgent: "Windows" });

  runtime.nodes.languageButton.click();

  assert.equal(runtime.storage.getItem("keco-language"), "zh-CN");
  assert.equal(runtime.document.documentElement.lang, "zh-CN");
});

test("Windows detection points the primary action at the real installer without starting it", () => {
  const runtime = bootHomepage({ platform: "Win32", userAgent: "Windows NT 10.0; Win64; x64" });

  assert.match(runtime.nodes.primaryDownload.href, /windows-x64\.exe$/);
  assert.equal(runtime.nodes.primaryDownload.getAttribute("aria-disabled"), null);
  assert.equal(runtime.nodes.primaryDownload.textContent, "Download for Windows");
});

test("Linux detection presents a non-downloadable coming-soon state", () => {
  const runtime = bootHomepage({ platform: "Linux x86_64", userAgent: "X11; Linux x86_64" });

  assert.equal(runtime.nodes.primaryDownload.href, "");
  assert.equal(runtime.nodes.primaryDownload.getAttribute("aria-disabled"), "true");
  assert.equal(runtime.nodes.primaryDownload.textContent, "Linux coming soon");
});
