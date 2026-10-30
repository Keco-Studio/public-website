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
    this.selectorLists = new Map();
    this.style = {};
    this.textContent = "";
    this.focused = false;
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

  focus() {
    this.focused = true;
  }

  querySelector(selector) {
    return this.selectors.get(selector) || null;
  }

  querySelectorAll(selector) {
    return this.selectorLists.get(selector) || [];
  }

  replaceChildren(...nodes) {
    this.children = nodes;
  }

  setSelector(selector, node) {
    this.selectors.set(selector, node);
  }

  setSelectorAll(selector, nodes) {
    this.selectorLists.set(selector, nodes);
  }
}

function bootHomepage({ storedLanguage = null, platform = "Other", userAgent = "Other", mobile = false, carousel = false, reducedMotion = false, initialHash = "" } = {}) {
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
  const recommendedDownload = new FakeNode();
  const recommendedTitle = new FakeNode();
  const recommendedMeta = new FakeNode();
  const downloadRecommendation = new FakeNode();
  downloadRecommendation.setSelector("[data-recommended-download]", recommendedDownload);
  downloadRecommendation.setSelector("[data-recommended-title]", recommendedTitle);
  downloadRecommendation.setSelector("[data-recommended-meta]", recommendedMeta);
  const downloadOptions = ["windows-x64", "macos-arm64", "macos-x64", "linux-x64"].map((key) => {
    const option = new FakeNode({ "data-download-option": key });
    option.setSelector("[data-recommended-badge]", new FakeNode());
    return option;
  });
  const meta = new FakeNode();
  const releaseMeta = new FakeNode();
  const proofImage = new FakeNode({ "data-i18n-alt": "hero.proofAlt" });
  const featureRoot = new FakeNode();
  const featurePanel = new FakeNode();
  const featureTitle = new FakeNode();
  const featureBody = new FakeNode();
  const featureTabs = [
    ["game-design-system", "feature-tab-game-design-system"],
    ["ai-agent", "feature-tab-ai-agent"],
    ["simulator", "feature-tab-simulator"],
    ["script", "feature-tab-script"],
    ["map", "feature-tab-map"]
  ].map(([key, id]) => new FakeNode({ "data-feature-tab": key, id }));
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
  featureRoot.setSelector("[data-feature-panel]", featurePanel);
  featureRoot.setSelector("[data-feature-title]", featureTitle);
  featureRoot.setSelector("[data-feature-body]", featureBody);
  featureRoot.setSelector("[data-feature-carousel]", carouselRoot);
  featureRoot.setSelectorAll("[data-feature-tab]", featureTabs);
  const documentElement = { dataset: {}, lang: "en" };
  const document = {
    documentElement,
    title: "",
    createElement() { return new FakeNode(); },
    getElementById() { return null; },
    querySelector(selector) {
      if (selector === "[data-primary-download]") return primaryDownload;
      if (selector === "[data-download-recommendation]") return downloadRecommendation;
      if (selector === "[data-release-meta]") return releaseMeta;
      if (selector === 'meta[name="description"]') return meta;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-i18n]") return [headline, languageButton];
      if (selector === "[data-i18n-aria-label]") return [languageButton];
      if (selector === "[data-language-toggle]") return [languageButton];
      if (selector === "[data-i18n-alt]") return [proofImage];
      if (selector === "[data-feature-showcase]") return carousel ? [featureRoot] : [];
      if (selector === "[data-download-option]") return downloadOptions;
      return [];
    }
  };
  const timeouts = [];
  const intervals = [];
  const historyCalls = [];
  const windowListeners = new Map();
  let clearedIntervals = 0;
  const window = {
    KecoSiteCore: core,
    location: { hash: initialHash },
    history: {
      pushState(state, title, url) {
        historyCalls.push({ method: "pushState", url });
        window.location.hash = url.startsWith("#") ? url : "";
      },
      replaceState(state, title, url) {
        historyCalls.push({ method: "replaceState", url });
        window.location.hash = url.startsWith("#") ? url : "";
      }
    },
    addEventListener(type, listener) {
      if (!windowListeners.has(type)) windowListeners.set(type, []);
      windowListeners.get(type).push(listener);
    },
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
      downloadOptions,
      dots,
      featureBody,
      featurePanel,
      featureRoot,
      featureTabs,
      featureTitle,
      headline,
      languageButton,
      nextButton,
      previousButton,
      primaryDownload,
      proofImage,
      recommendedDownload,
      recommendedTitle,
      releaseMeta
    },
    storage,
    timeouts,
    historyCalls,
    changeHash(hash) {
      window.location.hash = hash;
      for (const listener of windowListeners.get("hashchange") || []) listener();
    },
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
  assert.match(runtime.nodes.recommendedDownload.href, /windows-x64\.exe$/);
  assert.equal(runtime.nodes.recommendedTitle.textContent, "Windows · x64");
  assert.equal(runtime.nodes.downloadOptions[0].classList.contains("is-recommended"), true);
  assert.equal(runtime.nodes.downloadOptions[0].querySelector("[data-recommended-badge]").hidden, false);
  assert.equal(runtime.nodes.downloadOptions[1].classList.contains("is-recommended"), false);
});

test("Linux detection presents a non-downloadable coming-soon state", () => {
  const runtime = bootHomepage({ platform: "Linux x86_64", userAgent: "X11; Linux x86_64" });

  assert.equal(runtime.nodes.primaryDownload.href, "");
  assert.equal(runtime.nodes.primaryDownload.getAttribute("aria-disabled"), "true");
  assert.equal(runtime.nodes.primaryDownload.textContent, "Linux coming soon");
});

test("unsupported devices still receive complete Chinese release and image text", () => {
  const runtime = bootHomepage({ storedLanguage: "zh-CN", platform: "Linux x86_64", userAgent: "Linux" });

  assert.equal(runtime.nodes.releaseMeta.textContent, "版本 v0.1.7 · 发布于 2026-09-29");
  assert.equal(runtime.nodes.proofImage.getAttribute("alt"), "显示游戏设计文档的 Keco Studio 工作台");
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

test("carousel stays paused while keyboard focus remains in the feature showcase", () => {
  const runtime = bootHomepage({ carousel: true });

  runtime.nodes.featureRoot.trigger("focusin");
  assert.equal(runtime.clearedIntervals, 1);

  runtime.nodes.nextButton.click();
  assert.equal(runtime.intervalCount, 1);

  runtime.nodes.featureRoot.trigger("focusout", { relatedTarget: null });
  assert.equal(runtime.intervalCount, 2);
});

test("reduced motion disables carousel autoplay", () => {
  const runtime = bootHomepage({ carousel: true, reducedMotion: true });

  assert.equal(runtime.nodes.carousel.dataset.activeSlide, "0");
  assert.equal(runtime.intervalCount, 0);
});

test("feature selector replaces the shared panel content and resets its carousel", () => {
  const runtime = bootHomepage({ carousel: true });

  runtime.nodes.nextButton.click();
  runtime.nodes.featureTabs[1].click();

  assert.equal(runtime.nodes.featureRoot.dataset.activeFeature, "ai-agent");
  assert.equal(runtime.nodes.featureTabs[0].getAttribute("aria-selected"), "false");
  assert.equal(runtime.nodes.featureTabs[1].getAttribute("aria-selected"), "true");
  assert.equal(runtime.nodes.featurePanel.getAttribute("aria-labelledby"), "feature-tab-ai-agent");
  assert.equal(runtime.nodes.featureTitle.textContent, "AI Agent");
  assert.match(runtime.nodes.featureBody.textContent, /understands the documents/);
  assert.equal(runtime.nodes.carousel.dataset.activeSlide, "0");
});

test("feature selector supports arrow-key navigation", () => {
  const runtime = bootHomepage({ carousel: true });

  runtime.nodes.featureTabs[0].trigger("keydown", { key: "ArrowDown" });

  assert.equal(runtime.nodes.featureRoot.dataset.activeFeature, "ai-agent");
  assert.equal(runtime.nodes.featureTabs[1].focused, true);
});

test("feature selector follows feature hashes from the product navigation", () => {
  const runtime = bootHomepage({ carousel: true, initialHash: "#simulator" });

  assert.equal(runtime.nodes.featureRoot.dataset.activeFeature, "simulator");

  runtime.changeHash("#map");

  assert.equal(runtime.nodes.featureRoot.dataset.activeFeature, "map");
  assert.equal(runtime.nodes.featureTabs[4].getAttribute("aria-selected"), "true");
});

test("feature selector writes user choices back to the URL", () => {
  const runtime = bootHomepage({ carousel: true });

  runtime.nodes.featureTabs[1].click();

  assert.equal(runtime.nodes.featureRoot.dataset.activeFeature, "ai-agent");
  assert.equal(runtime.historyCalls.at(-1).method, "pushState");
  assert.equal(runtime.historyCalls.at(-1).url, "#ai-agent");
  assert.equal(runtime.nodes.featureTabs[1].getAttribute("aria-selected"), "true");
});

test("feature selector restores its default when history returns to a hashless URL", () => {
  const runtime = bootHomepage({ carousel: true });

  runtime.nodes.featureTabs[1].click();
  runtime.changeHash("");

  assert.equal(runtime.nodes.featureRoot.dataset.activeFeature, "game-design-system");
  assert.equal(runtime.nodes.featureTabs[0].getAttribute("aria-selected"), "true");
});
