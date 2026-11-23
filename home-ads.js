/* ============================================================
   李忠仁 · 联合出版人形象广告（限时活动）
   - 首页：打开即弹的轮播弹窗；桌面横版、手机竖版（由 <picture> 切图）
   - 切换：两张图同格叠放，交叉淡入淡出（opacity 过渡，无位移）
   - 每次加载首页都弹（用户选定口径），到期后不再弹
   - 无依赖，IIFE，与站内其他脚本同风格
   ============================================================ */
(function () {
  'use strict';

  var modal = document.getElementById('adsModal');
  if (!modal) return;

  /* ---------- 1. 到期判定 ---------- */
  var endRaw = modal.getAttribute('data-ads-end');
  var endAt = endRaw ? Date.parse(endRaw) : NaN;
  if (isFinite(endAt) && Date.now() > endAt) return;

  var track = document.getElementById('adsModalTrack');
  var slides = track ? Array.prototype.slice.call(track.children) : [];
  var dotsWrap = document.getElementById('adsModalDots');
  var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.children) : [];
  var prevBtn = modal.querySelector('[data-ads-prev]');
  var nextBtn = modal.querySelector('[data-ads-next]');
  var closeBtns = Array.prototype.slice.call(modal.querySelectorAll('[data-ads-close]'));

  var idx = 0;
  var timer = null;
  var HOLD = 2000;  /* 每张完整显示的停留时间：2s，让海报看得清 */
  var FADE = 2000;  /* 同步交叉淡化时长，与 CSS --ads-fade 一致 */
  var goAt = 0;     /* 本轮淡化起始时刻，用来让停留排在淡化结束之后 */
  var watchEl = null;   /* 正在等待 transitionend 的图，停止时解绑 */
  var watchFn = null;
  var lastFocus = null;

  function render() {
    slides.forEach(function (slide, i) {
      var on = i === idx;
      slide.classList.toggle('is-active', on);
      if (on) {
        slide.removeAttribute('aria-hidden');
        slide.removeAttribute('tabindex');
      } else {
        slide.setAttribute('aria-hidden', 'true');
        slide.setAttribute('tabindex', '-1');
      }
    });
    dots.forEach(function (dot, i) {
      if (i === idx) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function go(next) {
    if (!slides.length) return;
    idx = (next + slides.length) % slides.length;
    goAt = Date.now();
    render();
  }

  /* 节奏：停留 HOLD → 融化 FADE → 再停留，链式 setTimeout，
     保证“融化结束”与“下一次停留开始”严丝合缝，不随轮次漂移 */
  function play() {
    stop();
    if (document.hidden) return;
    /* 若本轮淡化尚未走完（手动切换、指针移出等触发），先补足剩余过渡时长，
       保证节奏始终是“2s 淡化结束 → 2s 完整停留 → 下一次淡化”，不被中途打断 */
    var rest = Math.max(0, FADE - (Date.now() - goAt));
    timer = window.setTimeout(function () {
      go(idx + 1);
      timer = window.setTimeout(play, FADE);
    }, rest + HOLD);
  }

  /* 用户手动切换（箭头/指示点/滑动/方向键）后的节奏：
     淡化若在途中被反向，浏览器会按 CSS 规范缩短过渡时长，
     这里以真实 transitionend 为锚点，过渡结束后再完整停留 HOLD，避免多停一秒 */
  function resume() {
    stop();
    if (document.hidden) return;
    if (Date.now() - goAt >= FADE) { play(); return; }   /* 没有进行中的淡化：走常规节奏 */
    var el = slides[idx];
    var settle = function () {
      stop();
      timer = window.setTimeout(function () {
        go(idx + 1);
        play();
      }, HOLD);
    };
    if (el) {
      watchEl = el;
      watchFn = function (e) { if (e.propertyName === 'opacity') settle(); };
      el.addEventListener('transitionend', watchFn);
    }
    /* 兜底：过渡事件缺失（不渲染/被取消）时按名义时长收口，避免卡死 */
    timer = window.setTimeout(settle, FADE + 150);
  }

  function stop() {
    if (watchEl && watchFn) watchEl.removeEventListener('transitionend', watchFn);
    watchEl = null;
    watchFn = null;
    if (timer) { window.clearTimeout(timer); timer = null; }
  }

  /* ---------- 2. 开关 ---------- */
  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('ads-locked');
    /* 首张直接完整出现，停留 2s 后开始融化 */
    var closeBtn = modal.querySelector('.ads-modal-close');
    if (closeBtn) closeBtn.focus();
    render();
    play();
  }

  function closeModal() {
    stop();
    modal.hidden = true;
    document.body.classList.remove('ads-locked');
    if (lastFocus && typeof lastFocus.focus === 'function') {
      try { lastFocus.focus(); } catch (e) {}
    } else if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  }

  closeBtns.forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.classList.contains('ads-modal-backdrop')) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); resume(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); resume(); }
  });

  /* ---------- 3. 轮播控件 ---------- */
  if (prevBtn) prevBtn.addEventListener('click', function () { go(idx - 1); resume(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { go(idx + 1); resume(); });

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { if (i !== idx) go(i); resume(); });
  });

  var stage = modal.querySelector('.ads-modal-stage');
  if (stage) {
    stage.addEventListener('pointerenter', stop);
    stage.addEventListener('pointerleave', resume);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (!modal.hidden) resume();
  });

  /* 触摸滑动：左滑看下一张、右滑回上一张（切换仍是淡化） */
  var startX = null;
  if (track) {
    track.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      stop();
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      startX = null;
      resume();
    }, { passive: true });
  }

  /* 点击图片跳个人页：先解除滚动锁，避免返回时页面仍锁滚动 */
  slides.forEach(function (slide) {
    slide.addEventListener('click', function () {
      document.body.classList.remove('ads-locked');
    });
  });

  /* ---------- 4. 每次加载都弹（等首屏渲染后再弹，避免抢首帧） ---------- */
  var start = function () { openModal(); };
  if (document.readyState === 'complete') {
    window.setTimeout(start, 400);
  } else {
    window.addEventListener('load', function () { window.setTimeout(start, 400); });
  }
})();