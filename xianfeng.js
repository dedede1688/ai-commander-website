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

  /* ---------- 样书实拍画廊：点缩略图换主图 ---------- */
  var shot = document.getElementById("xfShot");
  var thumbs = document.getElementById("xfThumbs");
  if (shot && thumbs) {
    var btnList = Array.prototype.slice.call(
      thumbs.querySelectorAll(".xf-thumb"),
    );
    /* 缩略图走单独的小图，主图只在用户点开时才下载。
       指针移到某个缩略图上（或键盘聚焦）时提前取主图，点下去就不会空一下。 */
    function warm(btn) {
      if (btn.dataset.warmed) return;
      btn.dataset.warmed = "1";
      var pre = new Image();
      pre.src = btn.dataset.shot;
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
        shot.src = btn.dataset.shot;
        shot.alt = btn.dataset.alt;
        btnList.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("on", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
      });
    });
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
