(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.KecoSiteCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var SCREENSHOT = "assets/screenshots/屏幕截图 2026-10-30 104821.png";
  var RELEASE_BASE = "https://github.com/Keco-Studio/keco-desktop/releases/download/v0.1.7/";

  var RELEASE = Object.freeze({
    version: "v0.1.7",
    publishedAt: "2026-09-29",
    downloads: Object.freeze({
      "windows-x64": Object.freeze({
        key: "windows-x64",
        platform: "Windows",
        architecture: "x64",
        format: ".exe",
        filename: "Keco-Studio-Setup-0.1.7-windows-x64.exe",
        size: 5300935,
        url: RELEASE_BASE + "Keco-Studio-Setup-0.1.7-windows-x64.exe"
      }),
      "macos-arm64": Object.freeze({
        key: "macos-arm64",
        platform: "macOS",
        architecture: "Apple Silicon",
        format: ".dmg",
        filename: "Keco-Studio-0.1.7-macos-arm64.dmg",
        size: 1837056,
        url: RELEASE_BASE + "Keco-Studio-0.1.7-macos-arm64.dmg"
      }),
      "macos-x64": Object.freeze({
        key: "macos-x64",
        platform: "macOS",
        architecture: "Intel",
        format: ".dmg",
        filename: "Keco-Studio-0.1.7-macos-x64.dmg",
        size: 1941574,
        url: RELEASE_BASE + "Keco-Studio-0.1.7-macos-x64.dmg"
      })
    })
  });

  function slides(prefix, positions) {
    return positions.map(function (position, index) {
      return Object.freeze({
        src: SCREENSHOT,
        objectPosition: position,
        captionKey: "feature." + prefix + ".slide" + (index + 1)
      });
    });
  }

  var FEATURES = Object.freeze({
    "game-design-system": Object.freeze({
      titleKey: "feature.gds.title",
      bodyKey: "feature.gds.body",
      slides: Object.freeze(slides("gds", ["left center", "center center", "right center"]))
    }),
    "ai-agent": Object.freeze({
      titleKey: "feature.agent.title",
      bodyKey: "feature.agent.body",
      slides: Object.freeze(slides("agent", ["left bottom", "center bottom", "right bottom"]))
    }),
    simulator: Object.freeze({
      titleKey: "feature.simulator.title",
      bodyKey: "feature.simulator.body",
      slides: Object.freeze(slides("simulator", ["left center", "center center", "right center"]))
    }),
    script: Object.freeze({
      titleKey: "feature.script.title",
      bodyKey: "feature.script.body",
      slides: Object.freeze(slides("script", ["left top", "center top", "right top"]))
    }),
    map: Object.freeze({
      titleKey: "feature.map.title",
      bodyKey: "feature.map.body",
      slides: Object.freeze(slides("map", ["left center", "center center", "right center"]))
    })
  });

  var TRANSLATIONS = Object.freeze({
    en: Object.freeze({
      "meta.title": "Keco Studio - Make your game, one slice at a time",
      "meta.description": "Download Keco Studio and turn game design into structured data, art, playable Godot slices, and measurable evaluations.",
      "utility.help": "Help - Coming soon",
      "utility.release": "Release v0.1.7",
      "nav.gds": "Game Design System",
      "nav.agent": "AI Agent",
      "nav.simulator": "Simulator",
      "nav.script": "Script",
      "nav.map": "Map",
      "nav.download": "Download client",
      "nav.home": "Keco Studio home",
      "nav.features": "Product features",
      "language.switch": "中文",
      "language.switchLabel": "切换到中文",
      "theme.dark": "Use dark mode",
      "theme.light": "Use light mode",
      "theme.auto": "Follow time-based theme",
      "menu.open": "Open menu",
      "menu.close": "Close menu",
      "hero.eyebrow": "Keco Studio",
      "hero.headline": "Make your game, one slice at a time.",
      "hero.body": "Keco is a workbench for building games. You write the design; Keco turns it into data and art, helps you build a playable slice in Godot, then scores it against a fixed standard and tells you what to fix next.",
      "hero.choose": "Choose another version",
      "hero.release": "Latest stable release",
      "hero.proofLabel": "Keco Studio workspace",
      "hero.proofAlt": "Keco Studio workspace showing a game design document",
      "hero.proofCaption": "Design documents, project assets, simulation, Script, and Map stay connected in one workspace.",
      "download.windows": "Download for Windows",
      "download.macosArm": "Download for Mac - Apple Silicon",
      "download.macosIntel": "Download for Mac - Intel",
      "download.macosChoose": "Choose your Mac version",
      "download.linuxSoon": "Linux coming soon",
      "download.mobileSoon": "Send to your computer",
      "download.unknown": "Choose a desktop version",
      "download.recommended": "Recommended for this device",
      "download.available": "Available now",
      "download.comingSoon": "Coming soon",
      "download.versionMeta": "Version {version} · {size} · Published {date}",
      "download.versionMetaGeneric": "Version {version} · Published {date}",
      "download.sectionEyebrow": "Download Keco Studio",
      "download.sectionTitle": "Choose the build for your computer.",
      "download.sectionBody": "Download without registering first. Sign in or create an account when Keco Studio opens.",
      "download.statusTitle": "Your download is starting",
      "download.statusBody": "Open {filename} when your browser finishes downloading it.",
      "download.retry": "Download again",
      "download.other": "Choose another version",
      "download.direct": "Direct download",
      "download.mobileBody": "Keco Studio is currently available for desktop. Open this page on a Windows PC or Mac to download it.",
      "download.otherVersions": "All desktop versions",
      "feature.eyebrow": "Keco Studio feature",
      "feature.sectionTitle": "One connected workspace, from design to playable slice.",
      "feature.selectorLabel": "Keco Studio features",
      "feature.gds.title": "Game Design System",
      "feature.gds.body": "Version and reuse design rules, art direction, and source context across projects. Keep the decisions behind your game visible as the project changes.",
      "feature.gds.slide1": "Project library and game design documents",
      "feature.gds.slide2": "Editable design content in the shared workspace",
      "feature.gds.slide3": "Detailed project context beside reusable assets",
      "feature.agent.title": "AI Agent",
      "feature.agent.body": "The AI Agent understands the documents and data in your current project. Ask in natural language to find information, organize content, and make reviewed project changes.",
      "feature.agent.slide1": "AI assistance available across the Keco workspace",
      "feature.agent.slide2": "Project-aware content editing and generation",
      "feature.agent.slide3": "AI tools within each focused workspace",
      "feature.simulator.title": "Simulator",
      "feature.simulator.body": "A battle and numbers sandbox for testing systems before implementation. Run scenarios, inspect results, and find balance problems while they are still inexpensive to fix.",
      "feature.simulator.slide1": "Simulation access alongside project libraries",
      "feature.simulator.slide2": "Configuration grounded in project data",
      "feature.simulator.slide3": "Results connected back to the design source",
      "feature.script.title": "Script",
      "feature.script.body": "Turn design documents into editable dialogue scripts and branching flows. Keep narrative structure, character dialogue, and project context together.",
      "feature.script.slide1": "Script workspace available from the product rail",
      "feature.script.slide2": "Narrative documents within the project library",
      "feature.script.slide3": "Shared source context for branching dialogue",
      "feature.map.title": "Map",
      "feature.map.body": "Plan, generate, and iterate on game maps with reusable references. Carry design intent and project assets into every map revision.",
      "feature.map.slide1": "Map tools connected to the active project",
      "feature.map.slide2": "Reusable project references beside map work",
      "feature.map.slide3": "One workspace for planning and iteration",
      "carousel.previous": "Previous screenshot",
      "carousel.next": "Next screenshot",
      "carousel.goto": "Show screenshot {number}",
      "carousel.navigation": "Screenshot navigation",
      "carousel.status": "Screenshot {current} of {total}",
      "carousel.error": "The product screenshot could not be loaded.",
      "carousel.retry": "Reload screenshot",
      "requirements.eyebrow": "Version and requirements",
      "requirements.title": "Check your computer before installing.",
      "requirements.note": "Temporary requirements for v0.1.7. They will be updated as the desktop client evolves.",
      "requirements.tableLabel": "System requirements",
      "requirements.item": "Requirement",
      "requirements.minimum": "Minimum",
      "requirements.recommended": "Recommended",
      "requirements.os": "Operating system",
      "requirements.osMin": "Windows 10 64-bit or macOS 12",
      "requirements.osRec": "Windows 11 64-bit or current macOS",
      "requirements.memory": "Memory",
      "requirements.memoryMin": "4 GB",
      "requirements.memoryRec": "8 GB",
      "requirements.storage": "Storage",
      "requirements.storageMin": "100 MB for installation",
      "requirements.storageRec": "500 MB free space",
      "requirements.account": "Account",
      "requirements.accountMin": "Required on first launch",
      "requirements.accountRec": "Existing Keco account",
      "requirements.network": "Network",
      "requirements.networkMin": "Internet connection required",
      "requirements.networkRec": "Stable broadband connection",
      "install.windowsTitle": "Install on Windows",
      "install.windowsBody": "Download and run the official setup file, then follow the installer. The current installer is unsigned, so Windows SmartScreen may show a warning. Confirm that the publisher file came from the official Keco Studio GitHub release before continuing.",
      "install.macTitle": "Install on macOS",
      "install.macBody": "Choose the DMG matching your Mac chip, open it, and move Keco Studio to Applications. Current builds are ad-hoc signed but not notarized; use Finder Open or Privacy & Security's Open Anyway control if macOS blocks the first launch.",
      "faq.eyebrow": "FAQ",
      "faq.title": "Before and after you download",
      "faq.support": "Public support channels",
      "faq.q1": "What is Keco Studio?",
      "faq.a1": "Keco Studio is a connected workbench for game design. It turns design into structured data and art, helps build a playable Godot slice, and evaluates the result against a fixed standard.",
      "faq.q2": "Who is Keco Studio for?",
      "faq.a2": "It is built for game designers, narrative teams, technical designers, and creators who need to move from decisions and data to something playable.",
      "faq.q3": "Which computer systems are supported?",
      "faq.a3": "Version v0.1.7 provides Windows x64 and macOS builds for Apple Silicon and Intel. Linux and mobile versions are not available yet.",
      "faq.q4": "What should I do if downloading or installation fails?",
      "faq.a4": "Download the file again from this page and verify that you selected the correct platform. Review the Windows SmartScreen or macOS first-launch guidance above before contacting support.",
      "faq.q5": "Do I need an account the first time I use it?",
      "faq.a5": "You do not need an account to download the installer. Keco Studio requires you to sign in or create an account when you first launch it.",
      "faq.q6": "Is project data stored locally or in the cloud?",
      "faq.a6": "The desktop application connects to the online Keco Studio service. Do not treat the current desktop shell as a local-only storage product.",
      "faq.q7": "How do I update or uninstall the client?",
      "faq.a7": "For the current release, download the newest stable installer from this page when an update is available. Use the standard Windows Apps or macOS Applications process to remove Keco Studio.",
      "faq.q8": "Where can I find release updates or support?",
      "faq.a8": "Release files and notes are published in the Keco Studio GitHub organization. You can also use the verified community channels in the footer.",
      "closing.eyebrow": "Start with one slice",
      "closing.title": "Download Keco Studio and bring your game design into one workspace.",
      "closing.requirements": "Review system requirements",
      "footer.tagline": "Make your game, one slice at a time.",
      "footer.product": "Product",
      "footer.download": "Download",
      "footer.requirements": "System requirements",
      "footer.release": "Release notes",
      "footer.help": "Help",
      "footer.docs": "Documentation - Coming soon",
      "footer.faq": "FAQ",
      "footer.support": "Contact support - Coming soon",
      "footer.legal": "Legal",
      "footer.terms": "Terms - Coming soon",
      "footer.privacy": "Privacy - Coming soon",
      "footer.cookies": "Cookie settings - Coming soon",
      "footer.filing": "Filing - Coming soon",
      "footer.community": "Community",
      "footer.copyright": "© 2026 Keco Studio"
    }),
    "zh-CN": Object.freeze({
      "meta.title": "Keco Studio - 一次完成一个切片，做出你的游戏",
      "meta.description": "下载 Keco Studio，将游戏设计转化为结构化数据、美术资源、可玩的 Godot 切片和可衡量的评估结果。",
      "utility.help": "帮助 - 即将提供",
      "utility.release": "版本 v0.1.7",
      "nav.gds": "游戏设计系统",
      "nav.agent": "AI 助手",
      "nav.simulator": "模拟器",
      "nav.script": "剧本",
      "nav.map": "地图",
      "nav.download": "下载客户端",
      "nav.home": "Keco Studio 首页",
      "nav.features": "产品功能",
      "language.switch": "EN",
      "language.switchLabel": "Switch to English",
      "theme.dark": "使用深色模式",
      "theme.light": "使用浅色模式",
      "theme.auto": "跟随时间自动切换主题",
      "menu.open": "打开菜单",
      "menu.close": "关闭菜单",
      "hero.eyebrow": "Keco Studio",
      "hero.headline": "一次完成一个切片，做出你的游戏。",
      "hero.body": "Keco 是用于制作游戏的工作台。你负责写下设计；Keco 将设计转化为数据和美术资源，帮助你在 Godot 中构建可玩的切片，再依据固定标准进行评分，并告诉你下一步需要修正什么。",
      "hero.choose": "选择其他版本",
      "hero.release": "最新稳定版本",
      "hero.proofLabel": "Keco Studio 工作台",
      "hero.proofAlt": "显示游戏设计文档的 Keco Studio 工作台",
      "hero.proofCaption": "设计文档、项目资源、模拟器、剧本和地图在同一个工作台中保持关联。",
      "download.windows": "下载 Windows 版",
      "download.macosArm": "下载 Mac 版 - Apple 芯片",
      "download.macosIntel": "下载 Mac 版 - Intel 芯片",
      "download.macosChoose": "选择你的 Mac 版本",
      "download.linuxSoon": "Linux 版即将推出",
      "download.mobileSoon": "发送到电脑",
      "download.unknown": "选择电脑版本",
      "download.recommended": "为此设备推荐",
      "download.available": "现已提供",
      "download.comingSoon": "即将推出",
      "download.versionMeta": "版本 {version} · {size} · 发布于 {date}",
      "download.versionMetaGeneric": "版本 {version} · 发布于 {date}",
      "download.sectionEyebrow": "下载 Keco Studio",
      "download.sectionTitle": "选择适合你电脑的版本。",
      "download.sectionBody": "无需注册即可下载安装包。打开 Keco Studio 后再登录或创建账号。",
      "download.statusTitle": "下载正在开始",
      "download.statusBody": "浏览器完成下载后，请打开 {filename}。",
      "download.retry": "重新下载",
      "download.other": "选择其他版本",
      "download.direct": "直接下载",
      "download.mobileBody": "Keco Studio 目前提供电脑客户端。请在 Windows 电脑或 Mac 上打开此页面进行下载。",
      "download.otherVersions": "全部电脑版本",
      "feature.eyebrow": "Keco Studio 功能",
      "feature.sectionTitle": "从设计到可玩切片，都在同一个工作台中完成。",
      "feature.selectorLabel": "Keco Studio 功能",
      "feature.gds.title": "游戏设计系统",
      "feature.gds.body": "跨项目版本化并复用设计规则、美术方向和来源上下文。即使项目不断变化，设计决策背后的依据依然清晰可见。",
      "feature.gds.slide1": "项目资料库与游戏设计文档",
      "feature.gds.slide2": "在共享工作台中编辑设计内容",
      "feature.gds.slide3": "可复用资源旁的详细项目上下文",
      "feature.agent.title": "AI 助手",
      "feature.agent.body": "AI 助手能够理解当前项目中的文档和数据。你可以使用自然语言查找信息、整理内容，并在审核后完成项目修改。",
      "feature.agent.slide1": "覆盖 Keco 工作台的 AI 协助",
      "feature.agent.slide2": "理解项目上下文的内容编辑与生成",
      "feature.agent.slide3": "各个专用工作区中的 AI 工具",
      "feature.simulator.title": "模拟器",
      "feature.simulator.body": "用于测试战斗和数值系统的沙盒。在进入实现前运行场景、检查结果，并在调整成本较低时发现平衡问题。",
      "feature.simulator.slide1": "与项目资料库并列的模拟器入口",
      "feature.simulator.slide2": "基于项目数据的模拟配置",
      "feature.simulator.slide3": "可追溯到设计来源的模拟结果",
      "feature.script.title": "剧本",
      "feature.script.body": "把设计文档转化为可编辑的对话剧本和分支流程，让叙事结构、角色对白与项目上下文保持在一起。",
      "feature.script.slide1": "产品侧栏中的剧本工作区",
      "feature.script.slide2": "项目资料库中的叙事文档",
      "feature.script.slide3": "分支对话共享的来源上下文",
      "feature.map.title": "地图",
      "feature.map.body": "利用可复用的参考资料规划、生成并迭代游戏地图，让设计意图与项目资源贯穿每次地图修改。",
      "feature.map.slide1": "与当前项目连接的地图工具",
      "feature.map.slide2": "地图工作旁的可复用项目参考",
      "feature.map.slide3": "用于规划和迭代的统一工作台",
      "carousel.previous": "上一张截图",
      "carousel.next": "下一张截图",
      "carousel.goto": "显示第 {number} 张截图",
      "carousel.navigation": "截图导航",
      "carousel.status": "第 {current} 张，共 {total} 张",
      "carousel.error": "产品截图加载失败。",
      "carousel.retry": "重新加载截图",
      "requirements.eyebrow": "版本与系统要求",
      "requirements.title": "安装前检查你的电脑。",
      "requirements.note": "以下为 v0.1.7 的暂定要求，桌面客户端更新后会继续调整。",
      "requirements.tableLabel": "系统要求",
      "requirements.item": "要求",
      "requirements.minimum": "最低配置",
      "requirements.recommended": "推荐配置",
      "requirements.os": "操作系统",
      "requirements.osMin": "Windows 10 64 位或 macOS 12",
      "requirements.osRec": "Windows 11 64 位或最新 macOS",
      "requirements.memory": "内存",
      "requirements.memoryMin": "4 GB",
      "requirements.memoryRec": "8 GB",
      "requirements.storage": "存储空间",
      "requirements.storageMin": "安装需要 100 MB",
      "requirements.storageRec": "预留 500 MB 空间",
      "requirements.account": "账号",
      "requirements.accountMin": "首次启动时需要",
      "requirements.accountRec": "已有 Keco 账号",
      "requirements.network": "网络",
      "requirements.networkMin": "必须连接互联网",
      "requirements.networkRec": "稳定的宽带网络",
      "install.windowsTitle": "在 Windows 上安装",
      "install.windowsBody": "下载并运行官方安装文件，然后按照安装器提示操作。当前安装包尚未签名，因此 Windows SmartScreen 可能显示警告。继续之前，请确认文件来自 Keco Studio 官方 GitHub Release。",
      "install.macTitle": "在 macOS 上安装",
      "install.macBody": "选择与你的 Mac 芯片匹配的 DMG，打开后将 Keco Studio 移入“应用程序”。当前版本使用临时签名但尚未公证；如果 macOS 阻止首次启动，请使用访达中的“打开”，或前往“隐私与安全性”选择“仍要打开”。",
      "faq.eyebrow": "常见问题",
      "faq.title": "下载前后常见问题",
      "faq.support": "公开支持渠道",
      "faq.q1": "Keco Studio 是什么？",
      "faq.a1": "Keco Studio 是一个互联的游戏设计工作台。它把设计转化为结构化数据和美术资源，帮助构建可玩的 Godot 切片，并依据固定标准评估结果。",
      "faq.q2": "Keco Studio 适合哪些人？",
      "faq.a2": "它适合需要从设计决策和数据走向可玩内容的游戏设计师、叙事团队、技术设计师和创作者。",
      "faq.q3": "支持哪些电脑系统？",
      "faq.a3": "v0.1.7 提供 Windows x64、Apple 芯片 macOS 和 Intel 芯片 macOS 版本。Linux 和移动端版本尚未提供。",
      "faq.q4": "下载或安装失败怎么办？",
      "faq.a4": "请从此页面重新下载，并确认选择了正确的平台。联系支持前，请先查看上方 Windows SmartScreen 或 macOS 首次启动说明。",
      "faq.q5": "第一次使用是否需要账号？",
      "faq.a5": "下载安装包不需要账号。首次打开 Keco Studio 时需要登录或创建账号。",
      "faq.q6": "项目数据保存在本地还是云端？",
      "faq.a6": "桌面应用会连接在线 Keco Studio 服务。当前桌面外壳不是仅使用本地存储的产品。",
      "faq.q7": "如何更新或卸载客户端？",
      "faq.a7": "当前版本有更新时，请从此页面下载最新稳定安装包。卸载时使用 Windows“应用”或 macOS“应用程序”的标准方式。",
      "faq.q8": "在哪里查看版本更新和联系支持？",
      "faq.a8": "版本文件和说明会发布在 Keco Studio GitHub 组织中，你也可以使用页脚中经过确认的社区渠道。",
      "closing.eyebrow": "从一个切片开始",
      "closing.title": "下载 Keco Studio，把你的游戏设计带入同一个工作台。",
      "closing.requirements": "查看系统要求",
      "footer.tagline": "一次完成一个切片，做出你的游戏。",
      "footer.product": "产品",
      "footer.download": "下载",
      "footer.requirements": "系统要求",
      "footer.release": "版本说明",
      "footer.help": "帮助",
      "footer.docs": "使用文档 - 即将提供",
      "footer.faq": "常见问题",
      "footer.support": "联系支持 - 即将提供",
      "footer.legal": "法律",
      "footer.terms": "用户协议 - 即将提供",
      "footer.privacy": "隐私政策 - 即将提供",
      "footer.cookies": "Cookie 设置 - 即将提供",
      "footer.filing": "备案信息 - 即将提供",
      "footer.community": "社区",
      "footer.copyright": "© 2026 Keco Studio"
    })
  });

  function normalizeLanguage(value) {
    return value === "zh-CN" ? "zh-CN" : "en";
  }

  function t(language, key, replacements) {
    var lang = normalizeLanguage(language);
    var value = TRANSLATIONS[lang][key];
    if (typeof value !== "string") value = TRANSLATIONS.en[key] || key;
    Object.keys(replacements || {}).forEach(function (name) {
      value = value.replace(new RegExp("\\{" + name + "\\}", "g"), String(replacements[name]));
    });
    return value;
  }

  function detectPlatform(navigatorLike) {
    var source = navigatorLike || {};
    var userAgent = String(source.userAgent || "").toLowerCase();
    var platform = String(source.platform || "").toLowerCase();
    var architecture = String(source.architecture || "").toLowerCase();
    var isMobile = source.mobile === true || /iphone|ipad|ipod|android|mobile/.test(userAgent);

    if (isMobile) {
      return { kind: "mobile", architecture: "unknown", recommendedKey: null, supported: false, mobile: true };
    }
    if (/win/.test(platform) || /windows/.test(userAgent)) {
      return { kind: "windows", architecture: "x64", recommendedKey: "windows-x64", supported: true, mobile: false };
    }
    if (/mac/.test(platform) || /macintosh|mac os/.test(userAgent)) {
      if (/arm|aarch64/.test(architecture)) {
        return { kind: "macos", architecture: "arm64", recommendedKey: "macos-arm64", supported: true, mobile: false };
      }
      if (/x86|x64|amd64/.test(architecture)) {
        return { kind: "macos", architecture: "x64", recommendedKey: "macos-x64", supported: true, mobile: false };
      }
      return { kind: "macos", architecture: "unknown", recommendedKey: null, supported: true, mobile: false };
    }
    if (/linux/.test(platform) || /linux/.test(userAgent)) {
      return { kind: "linux", architecture: "x64", recommendedKey: null, supported: false, mobile: false };
    }
    return { kind: "unknown", architecture: "unknown", recommendedKey: null, supported: false, mobile: false };
  }

  function getDownload(key) {
    return RELEASE.downloads[key] || null;
  }

  function getDownloadView(language, detection) {
    var result = detection || detectPlatform({});
    var download = getDownload(result.recommendedKey);
    var labelKey = "download.unknown";
    if (result.kind === "windows") labelKey = "download.windows";
    else if (result.kind === "macos") labelKey = download ? (download.key === "macos-arm64" ? "download.macosArm" : "download.macosIntel") : "download.macosChoose";
    else if (result.kind === "linux") labelKey = "download.linuxSoon";
    else if (result.kind === "mobile") labelKey = "download.mobileSoon";
    return {
      label: t(language, labelKey),
      url: download ? download.url : null,
      disabled: !download,
      download: download,
      detection: result
    };
  }

  function nextSlide(index, count, direction) {
    if (!count || count < 1) return 0;
    return (index + direction % count + count) % count;
  }

  function shouldAutoplay(prefersReducedMotion) {
    return !prefersReducedMotion;
  }

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
