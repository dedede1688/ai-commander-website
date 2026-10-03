/* ===== 先锋营 · 样板书优惠券页 专属脚本 =====
   依赖 shared.js（导航 / 页脚 / 二维码层）。页面缺少对应元素时自动跳过。

   上线前配置区：
   - claimed：已领券号数组，如 [1,2,3] 表示 001–003 已领（数字必须与实际一致）
   - claimUrl：领券/下单链接；为空时点击「领券」按钮唤起 AI 指挥官二维码
   - trialUrl：试读链接；为空时点击「试读」按钮同样唤起二维码 */
(function () {
  var CONFIG = {
    deadline: new Date(2026, 9, 31, 23, 59, 59), // 2026-10-31 24:00 截止
    claimed: [],
    claimUrl: "", // 例："https://example.com/buy" 或小程序链接
    trialUrl: "", // 例：试读 PDF / 文章链接
  };

  var TOTAL = 30;
  var claimed = {};
  CONFIG.claimed.forEach(function (n) {
    if (n >= 1 && n <= TOTAL) claimed[n] = true;
  });
  var remain = TOTAL - Object.keys(claimed).length;

  /* ---------- 剩余席位（多处同步） ---------- */
  ["xfStockTop"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = remain;
  });
  Array.prototype.forEach.call(
    document.querySelectorAll(".xf-stock-num"),
    function (el) {
      el.textContent = remain;
    },
  );

  /* ---------- 30 席公示矩阵 ---------- */
  var grid = document.getElementById("xfGrid");
  if (grid) {
    for (var i = 1; i <= TOTAL; i++) {
      var cell = document.createElement("div");
      cell.className = "xf-cell" + (claimed[i] ? " on" : "");
      var no = ("00" + i).slice(-3);
      cell.innerHTML = no + "<em>" + (claimed[i] ? "已领 ✔" : "待领") + "</em>";
      grid.appendChild(cell);
    }
  }

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
    /* 载入某张图：按当前是否处于放大状态，决定取小图还是全分辨率大图 */
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
      load(btn);
      resetScroll();
    }
    /* 回到框内左上角：换图和切换放大状态都要复位，
       否则放大态下换一张图会停在上一次的滚动位置，看着像"图缺了一块" */
    function resetScroll() {
      if (!photo) return;
      photo.scrollTop = 0;
      photo.scrollLeft = 0;
    }
    function setZoom(on) {
      if (!photo) return;
      var cur = btnList.filter(function (b) {
        return b.classList.contains("on");
      })[0];
      photo.classList.toggle("zoomed", on);
      photo.setAttribute("aria-pressed", on ? "true" : "false");
      if (hint) hint.textContent = on ? "点击还原" : "点击放大 1:1";
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
      photo.addEventListener("click", function () {
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
          window.location.href = CONFIG.claimUrl;
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
