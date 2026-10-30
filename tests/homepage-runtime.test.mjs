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
    this.children = [];
    this.dataset = {};
    this.hidden = false;
    this.href = attributes.href || "";
    this.listeners = new Map();
    this.selectors = new Map();
    this.style = {};
    this.textContent = "";
    const classes = new Set();
    this.classList = {
      add(...names) { names.forEach((name) => classes.add(name)); },
      contains(name) { return classes.has(name); },
      remove(...names) { names.forEach((name) => classes.delete(name)); },
      toggle(name, force) {
        if (force === true || (force === undefined && !classes.has(name))) classes.add(name);
        else classes.delete(name);
      }
    };
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }

  click() {
    this.trigger("click");
  }

  trigger(type, extra = {}) {
    for (const listener of this.listeners.get(type) || []) {
      listener({ currentTarget: this, preventDefault() {}, target: this, ...extra });
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

  appendChild(node) {
    this.children.push(node);
    return node;
  }

  contains(node) {
    return node === this || this.children.includes(node);
  }

  querySelector(selector) {
    return this.selectors.get(selector) || null;
  }

  replaceChildren(...nodes) {
    this.children = nodes;
  }

  setSelector(selector, node) {
    this.selectors.set(selector, node);
  }
}

function bootHomepage({ storedLanguage = null, platform = "Other", userAgent = "Other", mobile = false, carousel = false, reducedMotion = false } = {}) {
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
  const carouselRoot = new FakeNode();
  const carouselImage = new FakeNode();
  const carouselCaption = new FakeNode();
  const carouselStatus = new FakeNode();
  const previousButton = new FakeNode();
  const nextButton = new FakeNode();
  const dots = new FakeNode();
  const carouselError = new FakeNode();
  const retryButton = new FakeNode();
  carouselRoot.setSelector("[data-carousel-image]", carouselImage);
  carouselRoot.setSelector("[data-carousel-caption]", carouselCaption);
  carouselRoot.setSelector("[data-carousel-status]", carouselStatus);
  carouselRoot.setSelector("[data-carousel-prev]", previousButton);
  carouselRoot.setSelector("[data-carousel-next]", nextButton);
  carouselRoot.setSelector("[data-carousel-dots]", dots);
  carouselRoot.setSelector("[data-carousel-error]", carouselError);
  carouselRoot.setSelector("[data-carousel-retry]", retryButton);
  carouselRoot.getAttribute = (name) => name === "data-carousel" ? "game-design-system" : null;
  const documentElement = { dataset: {}, lang: "en" };
  const document = {
    documentElement,
    title: "",
    createElement() { return new FakeNode(); },
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
      if (selector === "[data-carousel]") return carousel ? [carouselRoot] : [];
      return [];
    }
  };
  const timeouts = [];
  const intervals = [];
  let clearedIntervals = 0;
  const window = {
    KecoSiteCore: core,
    clearInterval() { clearedIntervals += 1; },
    clearTimeout() {},
    matchMedia() { return { matches: reducedMotion }; },
    setInterval(callback, delay) { intervals.push({ callback, delay }); return intervals.length; },
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
    nodes: {
      carousel: carouselRoot,
      carouselImage,
      dots,
      headline,
      languageButton,
      nextButton,
      previousButton,
      primaryDownload
    },
    storage,
    timeouts,
    get clearedIntervals() { return clearedIntervals; },
    get intervalCount() { return intervals.length; },
    runInterval() { intervals.at(-1).callback(); }
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

test("carousel advances after three seconds and wraps", () => {
  const runtime = bootHomepage({ carousel: true });

  assert.equal(runtime.nodes.carousel.dataset.activeSlide, "0");
  assert.equal(runtime.intervalCount, 1);
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
  assert.equal(runtime.clearedIntervals, 1);
  assert.equal(runtime.intervalCount, 2);
});

test("carousel pauses on hover and resumes after pointer exit", () => {
  const runtime = bootHomepage({ carousel: true });

  runtime.nodes.carousel.trigger("pointerenter");
  assert.equal(runtime.clearedIntervals, 1);
  runtime.nodes.carousel.trigger("pointerleave");
  assert.equal(runtime.intervalCount, 2);
});

test("reduced motion disables carousel autoplay", () => {
  const runtime = bootHomepage({ carousel: true, reducedMotion: true });

  assert.equal(runtime.nodes.carousel.dataset.activeSlide, "0");
  assert.equal(runtime.intervalCount, 0);
});
