/* ===== 先锋营 · 样板书优惠券页 专属脚本 =====
   依赖 shared.js（导航 / 页脚 / 二维码层）。页面缺少对应元素时自动跳过。

   上线前配置区：
   - remain：剩余张数（后台调控：每领出一张就减 1，也可增减），页面所有"剩 N"自动同步
   - claimUrl：快团团等下单链接；配置后点「领取」新窗口直达付款，为空时唤起 AI 指挥官二维码
   - trialUrl：试读链接；为空时点击「试读」按钮同样唤起二维码 */
(function () {
  var CONFIG = {
    deadline: new Date(2026, 9, 31, 23, 59, 59), // 2026-10-31 24:00 截止
    remain: 30, /* 【席位后台调控】每领出一张就把这个数字减 1（也可增减），页面所有"剩 N"自动同步 */
    total: 30, /* 本批券总量，编号 001–030 */
    claimUrl: "", /* 快团团下单链接：填入后点「领取」新窗口直达付款；为空则唤起二维码 */
    trialUrl: "", /* 试读链接：填入后新窗口打开试读；为空则唤起二维码 */
  };

  var TOTAL = CONFIG.total;
  var remain = Math.max(0, Math.min(TOTAL, CONFIG.remain));
  var claimed = TOTAL - remain;

  /* ---------- 剩余席位（多处同步） ---------- */
  ["xfStockTop", "xfRemain"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = remain;
  });
  var claimedEl = document.getElementById("xfClaimed");
  if (claimedEl) claimedEl.textContent = claimed;

  /* ---------- 样书实拍画廊：点缩略图换主图 + 点主图在框内按 1:1 放大 ---------- */
  var shot = document.getElementById("xfShot");
  var thumbs = document.getElementById("xfThumbs");
  var photo = document.getElementById("xfPhoto");
  var hint = document.getElementById("xfZoomHint");
  if (shot && thumbs) {
    var btnList = Array.prototype.slice.call(
      thumbs.querySelectorAll(".xf-thumb"),
    );

    /* 缩略图走单独的小图，主图与 1:1 大图都按需加载：
       - 指针移到缩略图上（或键盘聚焦）时提前取主图，点下去不空一下
       - 大图只在真正点击放大时才下载，不占首屏流量 */
    function warm(btn) {
      if (btn.dataset.warmed) return;
      btn.dataset.warmed = "1";
      var pre = new Image();
      pre.src = btn.dataset.shot;
    }
    function zoomed() {
      return !!(photo && photo.classList.contains("zoomed"));
    }
    /* 载入某张图：按当前是否处于放大状态，决定取小图还是大图。
       放大是 2 倍，需要的实际像素不多，
       但「大图」更清楚，放大后看着不糊，所以放大时仍取大图。 */
    function load(btn) {
      var want = zoomed() ? btn.dataset.full : btn.dataset.shot;
      if (want && shot.getAttribute("src") !== want) shot.src = want;
    }
    function apply(btn) {
      btnList.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      shot.alt = btn.dataset.alt;
      /* 切换图片一律回到全图模式：新图不继承上一张的放大状态 */
      setZoomUI(false);
      load(btn);
      resetScroll();
    }
    /* 只同步放大相关的界面状态（类名 / aria / 提示文案），不负责加载图片 */
    function setZoomUI(on) {
      if (!photo) return;
      photo.classList.toggle("zoomed", on);
      photo.setAttribute("aria-pressed", on ? "true" : "false");
      if (hint) hint.textContent = on ? "点击还原" : "点击放大 2 倍";
    }
    /* 回到框内左上角：换图和切换放大状态都要复位，
       否则放大态下换一张图会停在上一次的滚动位置，看着像"图缺了一块" */
    function resetScroll() {
      if (!photo) return;
      photo.scrollTop = 0;
      photo.scrollLeft = 0;
    }
    function setZoom(on) {
      var cur = btnList.filter(function (b) {
        return b.classList.contains("on");
      })[0];
      setZoomUI(on);
      if (cur) load(cur);
      resetScroll();
    }

    btnList.forEach(function (btn) {
      btn.addEventListener("mouseenter", function () {
        warm(btn);
      });
      btn.addEventListener("focus", function () {
        warm(btn);
      });
      btn.addEventListener("click", function () {
        if (btn.classList.contains("on")) return;
        apply(btn);
      });
    });

    if (photo) {
      /* 放大后按住鼠标左键拖动平移。用「滚动位置」实现，而不是改 transform：
         浏览器会把 scrollLeft/scrollTop 自动钳制在 [0, 最大滚动量] 内，
         因此图片不可能被拖到完全脱离可视区，边界情况天然安全，
         松手即停在当前位置，不做惯性滚动，放大状态保持不变。 */
      var drag = null;
      var suppressClick = false; /* 刚发生过拖动时，抑制随之而来的 click（否则会误还原） */
      var DRAG_MIN = 4; /* 位移超过 4px 才算拖动，用来区分「点击还原」与「拖动平移」 */

      function pannable() {
        return (
          zoomed() &&
          (photo.scrollWidth > photo.clientWidth ||
            photo.scrollHeight > photo.clientHeight)
        );
      }

      photo.addEventListener("pointerdown", function (e) {
        /* 只接管鼠标左键：触摸设备交给浏览器原生滚动，手感更自然 */
        suppressClick = false;
        if (e.pointerType !== "mouse" || e.button !== 0 || !pannable()) return;
        drag = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          left: photo.scrollLeft,
          top: photo.scrollTop,
          moved: false,
        };
      });

      photo.addEventListener("pointermove", function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        var dx = e.clientX - drag.x;
        var dy = e.clientY - drag.y;
        if (!drag.moved) {
          if (Math.abs(dx) + Math.abs(dy) < DRAG_MIN) return;
          drag.moved = true;
          suppressClick = true;
          photo.classList.add("dragging");
          /* 捕获指针：拖出框外也能继续平移，不会中途"丢手"。
             指针恰好已失效时该调用会抛错，兜住即可，拖动照常进行 */
          if (photo.setPointerCapture) {
            try {
              photo.setPointerCapture(drag.id);
            } catch (err) {
              /* 忽略：拿不到捕获不影响框内拖动 */
            }
          }
        }
        /* 只写不读，避免逐帧触发布局抖动；拖动方向与图片移动方向一致 */
        photo.scrollLeft = drag.left - dx;
        photo.scrollTop = drag.top - dy;
      });

      function endDrag(e) {
        if (!drag || (e && e.pointerId !== drag.id)) return;
        photo.classList.remove("dragging");
        drag = null;
      }
      photo.addEventListener("pointerup", endDrag);
      photo.addEventListener("pointercancel", endDrag);

      photo.addEventListener("click", function () {
        if (suppressClick) {
          suppressClick = false; /* 刚才是拖动，不当作点击 */
          return;
        }
        setZoom(!zoomed());
      });
      photo.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          setZoom(!zoomed());
        }
      });
    }
  }

  /* ---------- 倒计时 ---------- */
  var cd = document.getElementById("xfCountdown");
  if (cd) {
    function pad(n) {
      return n < 10 ? "0" + n : "" + n;
    }
    function tick() {
      var diff = CONFIG.deadline - new Date();
      if (diff <= 0) {
        cd.textContent = "领券通道已关闭";
        return;
      }
      var d = Math.floor(diff / 864e5);
      var h = Math.floor((diff % 864e5) / 36e5);
      var m = Math.floor((diff % 36e5) / 6e4);
      var s = Math.floor((diff % 6e4) / 1e3);
      cd.innerHTML =
        "<i>" + d + "</i>天 <i>" + pad(h) + "</i>时 <i>" + pad(m) + "</i>分 <i>" + pad(s) + "</i>秒";
      setTimeout(tick, 1000);
    }
    tick();
  }

  /* ---------- 领券 / 试读：有链接走链接，没链接唤起二维码 ---------- */
  function openQr() {
    var layer = document.getElementById("qrLayer");
    if (layer) layer.classList.add("on");
  }
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-xf-claim]"),
    function (el) {
      el.addEventListener("click", function () {
        if (CONFIG.claimUrl) {
          /* 快团团等下单页：新窗口直达付款，本页保留继续浏览 */
          window.open(CONFIG.claimUrl, "_blank", "noopener");
        } else {
          openQr(); /* 链接未配置：唤起 AI 指挥官二维码（私域咨询） */
        }
      });
    },
  );
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-xf-trial]"),
    function (el) {
      el.addEventListener("click", function () {
        if (CONFIG.trialUrl) {
          window.open(CONFIG.trialUrl, "_blank", "noopener");
        } else {
          openQr(); /* 试读链接未配置：唤起 AI 指挥官二维码 */
        }
      });
    },
  );
})();
