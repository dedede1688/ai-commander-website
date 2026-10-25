/* 首页导航与滚动记忆：
   1. 旧锚点兼容（#sec-book 等转向新页）；
   2. 离开首页时记录位置，返回首页（浏览器后退或站内「首页」入口）时恢复；
   3. 链接明确指定首页栏目（带 hash）时以栏目为准，不恢复旧位置。 */
(function () {
  /* 军团卡片跳转到所属篇章时，同时展开折叠内容。 */
  function openPart(hash) {
    if (!/^#part-\d{2}$/.test(hash)) return;
    var part = document.getElementById(hash.slice(1));
    if (part && part.tagName === 'DETAILS') part.open = true;
  }
  openPart(location.hash);
  window.addEventListener('hashchange', function () { openPart(location.hash); });
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#part-"]');
    if (link) openPart(link.getAttribute('href'));
  });
  if (document.body.dataset.page !== 'index') return;

  /* ---------- 旧首页链接兼容 ---------- */
  var destinations = {
    'sec-book': 'book.html',
    'sec-roster': 'builders.html#members',
    'sec-intro': 'explore.html#sec-intro',
    'sec-industry': 'builders.html#structure',
    'sec-ai': 'explore.html#sec-ai',
    'sec-honor': 'builders.html#honors',
    'cooperate': 'cooperate.html',
    'courses': 'learning.html#courses',
    'club': 'learning.html#club',
    'tools': 'learning.html#tools',
    'articles': 'learning.html#articles',
    'community': 'learning.html#community',
    'business-contact': 'enterprise.html#contact'
  };
  function routeLegacyHash() {
    var destination = destinations[location.hash.slice(1)];
    if (destination) location.replace(destination);
  }
  routeLegacyHash();
  window.addEventListener('hashchange', routeLegacyHash);

  /* ---------- 首页滚动记忆 ---------- */
  var SCROLL_KEY = '__aiHomeScroll';
  var RESTORE_ATTR = 'data-home-restore';
  var MAX_AGE = 24 * 60 * 60 * 1000; /* 同一标签页内一天有效，避免极旧记录误用 */
  var leavingViaLink = false;

  function readSaved() {
    try {
      return JSON.parse(sessionStorage.getItem(SCROLL_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function savePosition(viaLink) {
    try {
      sessionStorage.setItem(
        SCROLL_KEY,
        JSON.stringify({
          y: Math.round(window.scrollY || window.pageYOffset || 0),
          t: Date.now(),
          viaLink: viaLink ? 1 : 0,
          path: location.pathname,
        }),
      );
    } catch (e) {
      /* 隐私模式等场景不可用：不记录，也不影响浏览 */
    }
  }

  /* 只有「点击站内链接离开」才记 viaLink；
     切换标签页也会触发 visibilitychange，此时不应把 viaLink 覆盖成 0。 */
  document.addEventListener(
    'click',
    function (event) {
      var link = event.target.closest && event.target.closest('a[href]');
      if (!link) return;
      if (link.target && link.target !== '_self') return;
      if (link.hasAttribute('download')) return;
      var url;
      try {
        url = new URL(link.getAttribute('href'), location.href);
      } catch (e) {
        return;
      }
      if (url.origin !== location.origin) return;
      var here = location.pathname.replace(/\/index\.html$/, '/');
      var there = url.pathname.replace(/\/index\.html$/, '/');
      if (there === here) return; /* 同页锚点不算离开 */
      leavingViaLink = true;
    },
    true,
  );

  function saveNow() {
    savePosition(leavingViaLink);
  }
  window.addEventListener('pagehide', saveNow);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') saveNow();
  });

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  /* 不靠固定延时：持续把目标位置应用到布局稳定为止。
     先到目标高度就结束；内容比目标短时，等 load 完成并稳定后再结束。 */
  function restoreTo(target, done) {
    var finished = false;
    var stableAtTarget = 0;
    var stableClamped = 0;
    var loadFired = document.readyState === 'complete';
    var startedAt = Date.now();

    function finish() {
      if (finished) return;
      finished = true;
      document.documentElement.removeAttribute(RESTORE_ATTR);
      if (typeof done === 'function') done();
    }

    function apply() {
      var y = Math.min(target, maxScroll());
      window.scrollTo(0, y);
      return y;
    }

    function tick() {
      if (finished) return;
      var y = apply();
      if (Math.abs(y - target) <= 2) {
        stableAtTarget += 1;
        if (stableAtTarget >= 2) return finish();
      } else {
        stableAtTarget = 0;
      }
      if (loadFired && Math.abs(y - maxScroll()) <= 2 && Math.abs(y - target) > 2) {
        stableClamped += 1;
        if (stableClamped >= 6) return finish(); /* 内容确实比目标短，停在页面底部 */
      } else {
        stableClamped = 0;
      }
      if (Date.now() - startedAt > 6000) return finish(); /* 仅兜底，正常不会走到 */
      requestAnimationFrame(tick);
    }

    window.addEventListener(
      'load',
      function () {
        loadFired = true;
      },
      { once: true },
    );
    requestAnimationFrame(tick);
  }

  function clearViaLink() {
    try {
      var saved = readSaved();
      if (saved) {
        saved.viaLink = 0;
        sessionStorage.setItem(SCROLL_KEY, JSON.stringify(saved));
      }
    } catch (e) {
      /* 存储不可用时忽略 */
    }
  }

  function maybeRestore() {
    if (location.hash) {
      document.documentElement.removeAttribute(RESTORE_ATTR);
      clearViaLink();
      return; /* 明确指定栏目时，以栏目为准 */
    }
    var saved = readSaved();
    if (!saved || !saved.y) {
      document.documentElement.removeAttribute(RESTORE_ATTR);
      return;
    }
    var nav = performance.getEntriesByType('navigation')[0] || {};
    var fresh = Date.now() - (saved.t || 0) < MAX_AGE;
    var eligible = fresh && (saved.viaLink === 1 || nav.type === 'back_forward');
    if (!eligible) {
      document.documentElement.removeAttribute(RESTORE_ATTR);
      return;
    }
    clearViaLink(); /* 已决定恢复：之后手动输入首页地址不再自动跳回旧位置 */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    restoreTo(saved.y);
  }

  /* head 里的早期脚本已根据记录决定是否隐藏页面；这里负责真正恢复。 */
  maybeRestore();

  /* 从 bfcache 回来时页面状态被保留，若被浏览器重置则按记录校正。 */
  window.addEventListener('pageshow', function (event) {
    if (!event.persisted || location.hash) return;
    var saved = readSaved();
    if (saved && saved.y) window.scrollTo(0, Math.min(saved.y, maxScroll()));
  });
})();
