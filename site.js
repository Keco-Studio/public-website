(function () {
  var core = window.KecoSiteCore || null;
  var languageKey = 'keco-language';
  var currentLanguage = 'en';
  var currentDetection = null;
  var carouselRefreshers = [];

  function readStorage(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
  }

  function writeStorage(key, value) {
    try { localStorage.setItem(key, value); } catch (error) {}
  }

  function translate(key, replacements) {
    return core ? core.t(currentLanguage, key, replacements) : key;
  }

  // Theme follows the local day/night schedule until the visitor makes an explicit choice.
  var themeButton = document.querySelector('.theme-btn');
  if (themeButton) {
    var themeRoot = document.documentElement;
    var themeKey = 'keco-theme';
    var themeTimer;

    function readSavedTheme() {
      try { return localStorage.getItem(themeKey); } catch (error) { return null; }
    }

    function saveTheme(theme) {
      try { localStorage.setItem(themeKey, theme); } catch (error) {}
    }

    function clearSavedTheme() {
      try { localStorage.removeItem(themeKey); } catch (error) {}
    }

    function updateThemeButton() {
      var isDark = themeRoot.dataset.theme === 'dark';
      var label = themeRoot.dataset.themeMode === 'manual'
        ? (core ? translate('theme.auto') : 'Follow time-based theme')
        : isDark
          ? (core ? translate('theme.light') : 'Use light mode')
          : (core ? translate('theme.dark') : 'Use dark mode');
      themeButton.setAttribute('aria-label', label);
      themeButton.setAttribute('title', label);
      themeButton.setAttribute('aria-pressed', themeRoot.dataset.themeMode === 'manual' ? 'true' : 'false');
    }

    function scheduleTheme() {
      var now = new Date();
      var seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      var nextBoundary = now.getHours() < 6 ? 6 * 3600 : now.getHours() < 18 ? 18 * 3600 : 30 * 3600;
      window.clearTimeout(themeTimer);
      themeTimer = window.setTimeout(function () {
        if (themeRoot.dataset.themeMode === 'auto') applyAutomaticTheme();
      }, (nextBoundary - seconds) * 1000 - now.getMilliseconds());
    }

    function applyAutomaticTheme() {
      var hour = new Date().getHours();
      themeRoot.dataset.theme = hour >= 18 || hour < 6 ? 'dark' : 'light';
      themeRoot.dataset.themeMode = 'auto';
      updateThemeButton();
      scheduleTheme();
    }

    var savedTheme = readSavedTheme();
    if (savedTheme === 'light' || savedTheme === 'dark') {
      themeRoot.dataset.theme = savedTheme;
      themeRoot.dataset.themeMode = 'manual';
      updateThemeButton();
    } else {
      applyAutomaticTheme();
    }

    themeButton.addEventListener('click', function () {
      if (themeRoot.dataset.themeMode === 'manual') {
        clearSavedTheme();
        applyAutomaticTheme();
      } else {
        themeRoot.dataset.theme = themeRoot.dataset.theme === 'dark' ? 'light' : 'dark';
        themeRoot.dataset.themeMode = 'manual';
        saveTheme(themeRoot.dataset.theme);
        updateThemeButton();
      }
    });
  }

  function applyLanguage(language) {
    if (!core) return;
    currentLanguage = core.normalizeLanguage(language);
    document.documentElement.lang = currentLanguage;
    document.title = translate('meta.title');
    var description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', translate('meta.description'));

    document.querySelectorAll('[data-i18n]').forEach(function (node) {
      var key = node.getAttribute('data-i18n');
      if (key) node.textContent = translate(key);
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-aria-label');
      if (key) node.setAttribute('aria-label', translate(key));
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (node) {
      var key = node.getAttribute('data-i18n-alt');
      if (key) node.setAttribute('alt', translate(key));
    });
    carouselRefreshers.forEach(function (refresh) { refresh(); });
    if (themeButton) updateThemeButton();
    if (currentDetection) renderPrimaryDownload(currentDetection);
  }

  function initLanguage() {
    if (!core) return;
    applyLanguage(readStorage(languageKey));
    document.querySelectorAll('[data-language-toggle]').forEach(function (button) {
      button.addEventListener('click', function () {
        var nextLanguage = currentLanguage === 'en' ? 'zh-CN' : 'en';
        writeStorage(languageKey, nextLanguage);
        applyLanguage(nextLanguage);
      });
    });
  }

  function formatFileSize(bytes) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function renderPrimaryDownload(detection) {
    var primary = document.querySelector('[data-primary-download]');
    if (!core || !primary) return;
    currentDetection = detection;
    var view = core.getDownloadView(currentLanguage, detection);
    primary.textContent = view.label;
    if (view.url) {
      primary.setAttribute('href', view.url);
      primary.removeAttribute('aria-disabled');
      primary.dataset.downloadKey = view.download.key;
    } else {
      primary.removeAttribute('href');
      primary.setAttribute('aria-disabled', 'true');
      delete primary.dataset.downloadKey;
    }
    var meta = document.querySelector('[data-release-meta]');
    if (meta) {
      meta.textContent = view.download
        ? translate('download.versionMeta', {
            version: core.RELEASE.version,
            size: formatFileSize(view.download.size),
            date: core.RELEASE.publishedAt
          })
        : translate('download.versionMetaGeneric', {
            version: core.RELEASE.version,
            date: core.RELEASE.publishedAt
          });
    }

    var recommendation = document.querySelector('[data-download-recommendation]');
    if (recommendation) {
      var recommendationAction = recommendation.querySelector('[data-recommended-download]');
      var recommendationTitle = recommendation.querySelector('[data-recommended-title]');
      var recommendationMeta = recommendation.querySelector('[data-recommended-meta]');
      recommendation.classList.toggle('is-supported', Boolean(view.download));
      if (recommendationTitle) {
        recommendationTitle.textContent = view.download
          ? view.download.platform + ' · ' + view.download.architecture
          : view.label;
      }
      if (recommendationMeta) {
        recommendationMeta.textContent = view.download
          ? translate('download.versionMeta', {
              version: core.RELEASE.version,
              size: formatFileSize(view.download.size),
              date: core.RELEASE.publishedAt
            })
          : translate(detection.mobile ? 'download.mobileBody' : 'download.comingSoon');
      }
      if (recommendationAction) {
        recommendationAction.textContent = view.label;
        if (view.url) {
          recommendationAction.setAttribute('href', view.url);
          recommendationAction.removeAttribute('aria-disabled');
          recommendationAction.dataset.downloadKey = view.download.key;
        } else {
          recommendationAction.removeAttribute('href');
          recommendationAction.setAttribute('aria-disabled', 'true');
          delete recommendationAction.dataset.downloadKey;
        }
      }
    }

    document.querySelectorAll('[data-download-option]').forEach(function (option) {
      var recommended = Boolean(view.download) && option.getAttribute('data-download-option') === view.download.key;
      option.classList.toggle('is-recommended', recommended);
      var badge = option.querySelector('[data-recommended-badge]');
      if (badge) badge.hidden = !recommended;
    });
  }

  function showDownloadStatus(download) {
    var status = document.querySelector('[data-download-status]');
    if (!status || !download) return;
    status.hidden = false;
    var body = status.querySelector ? status.querySelector('[data-download-status-body]') : null;
    var retry = status.querySelector ? status.querySelector('[data-download-retry]') : null;
    if (body) body.textContent = translate('download.statusBody', { filename: download.filename });
    if (retry) retry.setAttribute('href', download.url);
    window.setTimeout(function () {
      if (status.classList) status.classList.add('is-retry-ready');
    }, 3000);
  }

  function bindDownloadLinks() {
    if (!core) return;
    document.querySelectorAll('[data-download]').forEach(function (link) {
      link.addEventListener('click', function () {
        showDownloadStatus(core.getDownload(link.getAttribute('data-download')));
      });
    });
    var primary = document.querySelector('[data-primary-download]');
    if (primary) {
      primary.addEventListener('click', function () {
        if (primary.dataset.downloadKey) showDownloadStatus(core.getDownload(primary.dataset.downloadKey));
      });
    }
    var recommended = document.querySelector('[data-recommended-download]');
    if (recommended) {
      recommended.addEventListener('click', function () {
        if (recommended.dataset.downloadKey) showDownloadStatus(core.getDownload(recommended.dataset.downloadKey));
      });
    }
  }

  function initDownloads() {
    var primary = document.querySelector('[data-primary-download]');
    if (!core || !primary || typeof navigator === 'undefined') return;
    var agentData = navigator.userAgentData || {};
    var baseInfo = {
      userAgent: navigator.userAgent || '',
      platform: navigator.platform || '',
      mobile: agentData.mobile === true
    };
    renderPrimaryDownload(core.detectPlatform(baseInfo));
    bindDownloadLinks();

    if (typeof agentData.getHighEntropyValues === 'function') {
      agentData.getHighEntropyValues(['architecture']).then(function (values) {
        baseInfo.architecture = values.architecture || '';
        renderPrimaryDownload(core.detectPlatform(baseInfo));
      }).catch(function () {});
    }
  }

  function initFeatureShowcases() {
    if (!core) return;
    var reducedMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('[data-feature-showcase]').forEach(function (root) {
      var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-feature-tab]'));
      var panel = root.querySelector('[data-feature-panel]');
      var title = root.querySelector('[data-feature-title]');
      var body = root.querySelector('[data-feature-body]');
      var carousel = root.querySelector('[data-feature-carousel]');
      if (!tabs.length || !panel || !title || !body || !carousel) return;

      var image = carousel.querySelector('[data-carousel-image]');
      var caption = carousel.querySelector('[data-carousel-caption]');
      var status = carousel.querySelector('[data-carousel-status]');
      var previous = carousel.querySelector('[data-carousel-prev]');
      var next = carousel.querySelector('[data-carousel-next]');
      var dots = carousel.querySelector('[data-carousel-dots]');
      var error = carousel.querySelector('[data-carousel-error]');
      var retry = carousel.querySelector('[data-carousel-retry]');
      if (!image || !caption || !status || !previous || !next || !dots) return;

      function featureKeyFromHash() {
        if (!window.location || !window.location.hash) return null;
        var key = window.location.hash.slice(1);
        return core.FEATURES[key] ? key : null;
      }

      var defaultKey = tabs[0].getAttribute('data-feature-tab');
      var activeKey = featureKeyFromHash() || defaultKey;
      var activeIndex = 0;
      var timer = null;
      var dotButtons = [];
      var focusWithin = false;
      var pointerWithin = false;

      function getFeature() {
        return core.FEATURES[activeKey];
      }

      function render() {
        var feature = getFeature();
        if (!feature || !feature.slides.length) return;
        var slide = feature.slides[activeIndex];
        root.dataset.activeFeature = activeKey;
        carousel.dataset.activeSlide = String(activeIndex);
        title.textContent = translate(feature.titleKey);
        body.textContent = translate(feature.bodyKey);
        image.src = slide.src;
        image.alt = translate(slide.captionKey);
        image.style.objectPosition = slide.objectPosition;
        image.hidden = false;
        caption.textContent = translate(slide.captionKey);
        status.textContent = translate('carousel.status', { current: activeIndex + 1, total: feature.slides.length });
        if (error) error.hidden = true;
        dotButtons.forEach(function (button, index) {
          button.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
          button.setAttribute('aria-label', translate('carousel.goto', { number: index + 1 }));
        });
        tabs.forEach(function (tab) {
          var selected = tab.getAttribute('data-feature-tab') === activeKey;
          tab.setAttribute('aria-selected', selected ? 'true' : 'false');
          tab.setAttribute('tabindex', selected ? '0' : '-1');
          if (selected) panel.setAttribute('aria-labelledby', tab.getAttribute('id'));
        });
      }

      function stop() {
        if (timer !== null) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      function start() {
        if (!core.shouldAutoplay(reducedMotion) || timer !== null || focusWithin || pointerWithin) return;
        timer = window.setInterval(function () {
          activeIndex = core.nextSlide(activeIndex, getFeature().slides.length, 1);
          render();
        }, 3000);
      }

      function changeTo(index) {
        activeIndex = index;
        render();
        stop();
        start();
      }

      function buildDots() {
        dotButtons = [];
        dots.replaceChildren();
        getFeature().slides.forEach(function (_, index) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'carousel-dot';
          dot.addEventListener('click', function () { changeTo(index); });
          dots.appendChild(dot);
          dotButtons.push(dot);
        });
      }

      function selectFeature(key, focusTab, historyMode) {
        if (!core.FEATURES[key]) return;
        activeKey = key;
        activeIndex = 0;
        buildDots();
        render();
        stop();
        start();
        if (focusTab) {
          tabs.forEach(function (tab) {
            if (tab.getAttribute('data-feature-tab') === activeKey) tab.focus();
          });
        }
        if (historyMode && window.history && typeof window.history[historyMode] === 'function' && window.location.hash !== '#' + activeKey) {
          window.history[historyMode](null, '', '#' + activeKey);
        }
      }

      tabs.forEach(function (tab, tabIndex) {
        tab.addEventListener('click', function () {
          selectFeature(tab.getAttribute('data-feature-tab'), false, 'pushState');
        });
        tab.addEventListener('keydown', function (event) {
          var nextTabIndex = null;
          if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextTabIndex = (tabIndex + 1) % tabs.length;
          if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextTabIndex = (tabIndex - 1 + tabs.length) % tabs.length;
          if (event.key === 'Home') nextTabIndex = 0;
          if (event.key === 'End') nextTabIndex = tabs.length - 1;
          if (nextTabIndex === null) return;
          event.preventDefault();
          selectFeature(tabs[nextTabIndex].getAttribute('data-feature-tab'), true, 'replaceState');
        });
      });

      previous.addEventListener('click', function () {
        changeTo(core.nextSlide(activeIndex, getFeature().slides.length, -1));
      });
      next.addEventListener('click', function () {
        changeTo(core.nextSlide(activeIndex, getFeature().slides.length, 1));
      });
      carousel.addEventListener('pointerenter', function () {
        pointerWithin = true;
        stop();
      });
      carousel.addEventListener('pointerleave', function () {
        pointerWithin = false;
        start();
      });
      root.addEventListener('focusin', function () {
        focusWithin = true;
        stop();
      });
      root.addEventListener('focusout', function (event) {
        if (!root.contains(event.relatedTarget)) {
          focusWithin = false;
          start();
        }
      });
      image.addEventListener('error', function () {
        image.hidden = true;
        if (error) error.hidden = false;
      });
      if (retry) {
        retry.addEventListener('click', function () {
          var feature = getFeature();
          var separator = feature.slides[activeIndex].src.indexOf('?') === -1 ? '?' : '&';
          image.hidden = false;
          if (error) error.hidden = true;
          image.src = feature.slides[activeIndex].src + separator + 'retry=' + Date.now();
        });
      }

      if (typeof window.addEventListener === 'function') {
        window.addEventListener('hashchange', function () {
          var key = featureKeyFromHash();
          if (key) selectFeature(key, false, null);
          else if (!window.location.hash) selectFeature(defaultKey, false, null);
        });
      }

      carouselRefreshers.push(render);
      buildDots();
      render();
      start();
    });
  }

  initLanguage();
  initDownloads();
  initFeatureShowcases();

  // Pixel dungeon maps used as tile imagery
  var MAPS = {
    hero: ['###############', '#....#....i...#', '#.##.#.####.#.#', '#.#..........##', '#.#.###.##.#..#', '#...#e..#..#.##', '###.#.###.##..#', '#...#...P....e#', '#.#####.#####.#', '#.....#.....#.#', '#.###.#.###.#.#', '#i..#...#...i.#', '###############'],
    build: ['#######', '#..i..#', '#.###.#', '#..P..#', '#.#.#e#', '#e....#', '#######'],
    a: ['#######', '#.....#', '#.#.#.#', '#..P..#', '#.#.#.#', '#i...e#', '#######'],
    b: ['#######', '#e..#i#', '#.#.#.#', '#.#P..#', '#...#.#', '#.#...#', '#######'],
    c: ['#######', '#i#...#', '#.#.#e#', '#...#.#', '###.#.#', '#P....#', '#######']
  };
  var COLORS = { '#': '#252b3b', '.': '#121620', 'P': '#3b6cf5', 'e': '#8990a3', 'i': '#dde1ea' };
  document.querySelectorAll('[data-map]').forEach(function (el) {
    var rows = MAPS[el.getAttribute('data-map')] || [];
    var width = rows.reduce(function (w, r) { return Math.max(w, r.length); }, 0);
    el.style.gridTemplateColumns = 'repeat(' + width + ', var(--cell, 44px))';
    var frag = document.createDocumentFragment();
    rows.forEach(function (r) {
      for (var i = 0; i < width; i++) {
        var s = document.createElement('span');
        s.style.background = COLORS[r.charAt(i) || '#'];
        frag.appendChild(s);
      }
    });
    el.appendChild(frag);
  });

  // Agent tile cells
  document.querySelectorAll('.agent-cells').forEach(function (el) {
    for (var i = 0; i < 48; i++) {
      var s = document.createElement('span');
      if (i === 34) s.className = 'hot';
      el.appendChild(s);
    }
  });

  // Mobile menu
  var btn = document.querySelector('.menu-btn');
  var panel = document.getElementById('mobile-panel');
  if (btn && panel) {
    btn.addEventListener('click', function () {
      var open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', core ? translate(open ? 'menu.close' : 'menu.open') : open ? 'Close menu' : 'Open menu');
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Updates form (no backend yet)
  document.querySelectorAll('form[data-updates]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      if (status) {
        status.hidden = false;
        status.textContent = 'Sign-ups open soon. This preview form doesn’t send anything yet.';
      }
    });
  });
})();
