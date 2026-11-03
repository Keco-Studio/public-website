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
    this.open = false;
    this.scrollCalls = [];
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
    return this.trigger("click");
  }

  trigger(type, extra = {}) {
    const event = {
      currentTarget: this,
      defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; },
      target: this,
      ...extra
    };
    for (const listener of this.listeners.get(type) || []) {
      listener(event);
    }
    return event;
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

  scrollIntoView(options) {
    this.scrollCalls.push(options);
  }

  showModal() {
    this.open = true;
    this.setAttribute("open", "");
  }

  close() {
    if (!this.open) return;
    this.open = false;
    this.removeAttribute("open");
    this.trigger("close");
  }

  setSelector(selector, node) {
    this.selectors.set(selector, node);
  }

  setSelectorAll(selector, nodes) {
    this.selectorLists.set(selector, nodes);
  }
}

function bootHomepage({ storedLanguage = null, platform = "Other", userAgent = "Other", mobile = false, mobileMenuOpen = false, carousel = false, reducedMotion = false, initialHash = "" } = {}) {
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
  const primaryDownload = new FakeNode({ href: "https://example.com/releases", "data-primary-download": "" });
  const downloadDialogOpeners = [
    primaryDownload,
    ...Array.from({ length: 5 }, () => new FakeNode({ href: "https://example.com/releases" }))
  ];
  const downloadDialog = new FakeNode();
  const downloadDialogClose = new FakeNode();
  downloadDialog.setSelector("[data-download-dialog-close]", downloadDialogClose);
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
  const proofImage = new FakeNode({
    "data-i18n-alt": "hero.proofAlt",
    "data-i18n-src": "",
    "data-i18n-src-en": "assets/screenshots/englishlibraries.png",
    "data-i18n-src-zh": "assets/screenshots/chineselibraries.png"
  });
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
  const featureLinks = ["game-design-system", "ai-agent", "simulator", "script", "map"]
    .map((key) => new FakeNode({ "data-feature-link": key, href: `#${key}` }));
  const sectionLinks = [
    new FakeNode({ "data-section-link": "pricing", href: "#pricing" }),
    new FakeNode({ "data-section-link": "pricing", href: "#pricing" })
  ];
  const menuButton = new FakeNode({
    "aria-expanded": mobileMenuOpen ? "true" : "false",
    "aria-label": mobileMenuOpen ? "Close menu" : "Open menu"
  });
  const mobilePanel = new FakeNode();
  mobilePanel.hidden = !mobileMenuOpen;
  downloadDialog.showCalls = [];
  downloadDialog.showModal = function () {
    this.open = true;
    this.setAttribute("open", "");
    this.showCalls.push({ menuHidden: mobilePanel.hidden });
  };
  featureRoot.scrollIntoView = function (options) {
    this.scrollCalls.push({ ...options, menuHidden: mobilePanel.hidden });
  };
  const carouselRoot = new FakeNode();
  const carouselImage = new FakeNode();
  const carouselCaption = new FakeNode();
  const previousButton = new FakeNode();
  const nextButton = new FakeNode();
  const dots = new FakeNode();
  const carouselError = new FakeNode();
  const retryButton = new FakeNode();
  carouselRoot.setSelector("[data-carousel-image]", carouselImage);
  carouselRoot.setSelector("[data-carousel-caption]", carouselCaption);
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
  const documentElement = new FakeNode();
  documentElement.dataset = {};
  documentElement.lang = "en";
  const document = {
    documentElement,
    title: "",
    createElement() { return new FakeNode(); },
    getElementById(id) { return id === "mobile-panel" ? mobilePanel : null; },
    querySelector(selector) {
      if (selector === ".menu-btn") return menuButton;
      if (selector === "[data-download-dialog]") return downloadDialog;
      if (selector === "[data-primary-download]") return primaryDownload;
      if (selector === "[data-download-recommendation]") return downloadRecommendation;
      if (selector === 'meta[name="description"]') return meta;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-i18n]") return [headline, languageButton];
      if (selector === "[data-i18n-aria-label]") return [languageButton];
      if (selector === "[data-language-toggle]") return [languageButton];
      if (selector === "[data-i18n-alt]") return [proofImage];
      if (selector === "[data-i18n-src]") return [proofImage];
      if (selector === "[data-feature-showcase]") return carousel ? [featureRoot] : [];
      if (selector === "[data-feature-link]") return featureLinks;
      if (selector === "[data-section-link]") return sectionLinks;
      if (selector === "[data-download-dialog-open]") return downloadDialogOpeners;
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
      downloadDialog,
      downloadDialogClose,
      downloadDialogOpeners,
      dots,
      featureBody,
      featurePanel,
      featureRoot,
      featureLinks,
      featureTabs,
      featureTitle,
      headline,
      languageButton,
      menuButton,
      mobilePanel,
      nextButton,
      previousButton,
      primaryDownload,
      proofImage,
      sectionLinks,
      recommendedDownload,
      recommendedTitle,
    },
    storage,
    timeouts,
    historyCalls,
    get hash() { return window.location.hash; },
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
  assert.equal(runtime.nodes.proofImage.getAttribute("src"), "assets/screenshots/chineselibraries.png");
});

test("language control switches localized workspace and Map screenshots together", () => {
  const runtime = bootHomepage({ carousel: true, initialHash: "#map" });

  assert.equal(runtime.nodes.proofImage.getAttribute("src"), "assets/screenshots/englishlibraries.png");
  assert.equal(runtime.nodes.carouselImage.src, "assets/screenshots/englishMap.jpg");

  runtime.nodes.languageButton.click();

  assert.equal(runtime.nodes.proofImage.getAttribute("src"), "assets/screenshots/chineselibraries.png");
  assert.equal(runtime.nodes.carouselImage.src, "assets/screenshots/chineseMap.png");
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
  runtime.nodes.primaryDownload.click();
  assert.equal(runtime.nodes.downloadDialog.open, false);
});

test("unknown platform turns the primary version selector into a dialog trigger", () => {
  const runtime = bootHomepage({ platform: "Other", userAgent: "Other", initialHash: "#map" });

  const event = runtime.nodes.primaryDownload.click();

  assert.equal(event.defaultPrevented, true);
  assert.equal(runtime.nodes.downloadDialog.open, true);
  assert.equal(runtime.nodes.primaryDownload.getAttribute("aria-disabled"), null);
  assert.equal(runtime.hash, "#map");
});

test("download version controls open the dialog without changing the current hash", () => {
  const runtime = bootHomepage({ initialHash: "#simulator", mobileMenuOpen: true });

  const event = runtime.nodes.downloadDialogOpeners[1].click();

  assert.equal(event.defaultPrevented, true);
  assert.equal(runtime.nodes.downloadDialog.open, true);
  assert.equal(runtime.hash, "#simulator");
  assert.equal(runtime.nodes.mobilePanel.hidden, true);
  assert.equal(runtime.nodes.downloadDialog.showCalls[0].menuHidden, true);
  assert.equal(runtime.nodes.downloadDialogClose.focused, true);
});

test("download dialog close control restores focus to its opener", () => {
  const runtime = bootHomepage();
  const opener = runtime.nodes.downloadDialogOpeners[2];

  opener.click();
  runtime.nodes.downloadDialogClose.click();

  assert.equal(runtime.nodes.downloadDialog.open, false);
  assert.equal(opener.focused, true);
});

test("download dialog closes when its backdrop is clicked", () => {
  const runtime = bootHomepage();

  runtime.nodes.downloadDialogOpeners[0].click();
  assert.equal(runtime.nodes.downloadDialog.open, true);
  runtime.nodes.downloadDialog.trigger("click", { target: runtime.nodes.downloadDialog });

  assert.equal(runtime.nodes.downloadDialog.open, false);
});

test("Linux detection presents a coming-soon label that still opens version choices", () => {
  const runtime = bootHomepage({ platform: "Linux x86_64", userAgent: "X11; Linux x86_64" });

  assert.equal(runtime.nodes.primaryDownload.href, "https://example.com/releases");
  assert.equal(runtime.nodes.primaryDownload.getAttribute("aria-disabled"), null);
  assert.equal(runtime.nodes.primaryDownload.textContent, "Linux coming soon");
  runtime.nodes.primaryDownload.click();
  assert.equal(runtime.nodes.downloadDialog.open, true);
});

test("unsupported devices still receive complete Chinese image text", () => {
  const runtime = bootHomepage({ storedLanguage: "zh-CN", platform: "Linux x86_64", userAgent: "Linux" });

  assert.equal(runtime.nodes.proofImage.getAttribute("alt"), "显示游戏设计文档的 Keco Studio 工作台");
});

test("single real feature screenshots hide inactive carousel controls", () => {
  const runtime = bootHomepage({ carousel: true });

  assert.equal(runtime.nodes.carousel.dataset.activeSlide, "0");
  assert.equal(runtime.intervalCount, 0);
  assert.equal(runtime.nodes.previousButton.hidden, true);
  assert.equal(runtime.nodes.nextButton.hidden, true);
  assert.equal(runtime.nodes.dots.hidden, true);
});

test("Map preview follows the current interface language", () => {
  const english = bootHomepage({ carousel: true, initialHash: "#map" });
  const chinese = bootHomepage({ carousel: true, storedLanguage: "zh-CN", initialHash: "#map" });

  assert.equal(english.nodes.carouselImage.src, "assets/screenshots/englishMap.jpg");
  assert.equal(chinese.nodes.carouselImage.src, "assets/screenshots/chineseMap.png");
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

test("product navigation switches both columns and scrolls the shared showcase into view", () => {
  const runtime = bootHomepage({ carousel: true });

  const event = runtime.nodes.featureLinks[4].click();

  assert.equal(event.defaultPrevented, true);
  assert.equal(runtime.nodes.featureRoot.dataset.activeFeature, "map");
  assert.equal(runtime.nodes.featureTabs[4].getAttribute("aria-selected"), "true");
  assert.equal(runtime.nodes.featureTitle.textContent, "Map");
  assert.equal(runtime.nodes.featureRoot.scrollCalls.length, 1);
  assert.equal(runtime.nodes.featureRoot.scrollCalls[0].block, "start");
  assert.equal(runtime.nodes.featureRoot.scrollCalls[0].behavior, "smooth");
  assert.equal(runtime.historyCalls.at(-1).url, "#map");
});

test("mobile feature navigation closes the menu before scrolling the showcase", () => {
  const runtime = bootHomepage({ carousel: true, mobileMenuOpen: true });

  runtime.nodes.featureLinks[3].click();

  assert.equal(runtime.nodes.mobilePanel.hidden, true);
  assert.equal(runtime.nodes.menuButton.getAttribute("aria-expanded"), "false");
  assert.equal(runtime.nodes.menuButton.getAttribute("aria-label"), "Open menu");
  assert.equal(runtime.nodes.featureRoot.scrollCalls[0].menuHidden, true);
});

test("mobile pricing navigation closes the menu and keeps native anchor scrolling", () => {
  const runtime = bootHomepage({ mobileMenuOpen: true });

  const event = runtime.nodes.sectionLinks[1].click();

  assert.equal(event.defaultPrevented, false);
  assert.equal(runtime.nodes.mobilePanel.hidden, true);
  assert.equal(runtime.nodes.menuButton.getAttribute("aria-expanded"), "false");
});

test("feature navigation respects reduced-motion scrolling", () => {
  const runtime = bootHomepage({ carousel: true, reducedMotion: true });

  runtime.nodes.featureLinks[1].click();

  assert.equal(runtime.nodes.featureRoot.scrollCalls[0].behavior, "auto");
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
