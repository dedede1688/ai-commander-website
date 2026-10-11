/* ===== 先锋营 · 样板书优惠券页 专属脚本 =====
   依赖 shared.js（导航 / 页脚 / 二维码层）。页面缺少对应元素时自动跳过。

   上线前配置区：
   - claimUrl：快团团等下单链接；配置后点「领取」新窗口直达付款，为空时唤起 AI 指挥官二维码
   - trialUrl：试读链接；为空时点击「试读」按钮同样唤起二维码
   - 已发出的张数不在这里配：见下方 BASE_CLAIMED，每卖出一张改大1 并提交，
     这样页面上的「剩 N 张」始终等于真实余量，不会变成一句兑现不了的承诺。 */
(function () {
  var CONFIG = {
    deadline: new Date(2026, 9, 31, 23, 59, 59), // 2026-10-31 24:00 截止
    total: 30, /* 本批券总量，编号 001–030 */
    claimUrl: "", /* 快团团下单链接：填入后点「领取」新窗口直达付款；为空则唤起二维码 */
    trialUrl: "", /* 试读链接：填入后新窗口打开试读；为空则唤起二维码 */
  };

  /* ==========================================================================
     剩余席位：真实递减，不是写死的数字
     ==========================================================================
     背景：原先这里是一个常量 remain: 30，页面从头到尾显示同一个数字。
     问题是它不可验证——就算实际发出去了 35 张，页面依然显示 30，
     「仅30 席、发完即止」就成了无法兑现的承诺。

     现在的做法（三层，取最严格的）：
       1) 后台基线 BASE_CLAIMED：你在 CONFIG 里填「已确认发出的张数」，
          这是唯一权威值 —— 每卖出一张就改一次并提交。
       2) 本机计数 localCount：用户在本站点过几次领券，本地累加。
          只影响该用户自己看到的数字，不会污染全局。
       3) 两者相加得到 remain，任一层都不会被伪造，也不会互相覆盖。

     这样「剩N 张」= 真实基线 − 本机领券，永远不会显示成一个不可能的数字。
     ======================================================================== */
  var KEY_CLAIMED = "__xfClaimCount";
  var BASE_CLAIMED = 0; /* 后台基线：已实际发出的张数。每卖出一张 → 改大1 并提交。 */

  var TOTAL = CONFIG.total;
  var remain, claimed;

  function readLocalCount() {
    try {
      var n = parseInt(localStorage.getItem(KEY_CLAIMED), 10);
      return isNaN(n) || n < 0 ? 0 : n;
    } catch (e) {
      /* 隐私模式下不可用：降级为 0，不影响主流程 */
      return 0;
    }
  }

  function writeLocalCount(n) {
    try {
      localStorage.setItem(KEY_CLAIMED, String(n));
    } catch (e) {
      /* 存不了就只在本次页面内生效 */
    }
  }

  function computeRemain() {
    var local = readLocalCount();
    /* 基线 + 本机领过 = 全局已发出；超出总量时钳到 0，不出现负数 */
    claimed = Math.min(TOTAL, BASE_CLAIMED + local);
    remain = Math.max(0, TOTAL - claimed);
  }

  function renderStock() {
    computeRemain();
    /* 页面上「席位余量」区块已按需求删除，展示位 xfStockTop / xfRemain /
       xfClaimed 目前不存在。这里保留代码：以后若要恢复该区块，把 HTML 元素
       加回去即可自动生效，无需改 JS。所有赋值都做了存在性判断。 */
    ["xfStockTop", "xfRemain"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = remain;
    });
    var claimedEl = document.getElementById("xfClaimed");
    if (claimedEl) claimedEl.textContent = claimed;

    /* 归零后停用领券入口 —— 券发完就是发完，
       不能让人点了没反应还以为是坏了 */
    if (remain <= 0) disableClaimButtons();
  }

  renderStock();

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
        /* 过了截止日就同步停用领券按钮，
           避免出现「倒计时结束了但按钮还能点」的空承诺 */
        if (typeof disableClaimButtons === "function") disableClaimButtons();
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

  /* ---------- 领券是否仍然开放 ----------
     两道闸：券没发完 + 没过截止日。
     任何一道不满足，都不能让用户点「立即领券」却拿不到 —— 那等于虚假承诺。 */
  function claimOpen() {
    computeRemain();
    if (remain <= 0) return false;
    if (CONFIG.deadline - new Date() <= 0) return false;
    return true;
  }

  /* 统一禁用所有领券按钮的视觉状态 */
  function disableClaimButtons() {
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-xf-claim]"),
      function (el) {
        el.setAttribute("disabled", "disabled");
        el.setAttribute("aria-disabled", "true");
        el.style.opacity = "0.5";
        el.style.cursor = "not-allowed";
      },
    );
  }

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-xf-claim]"),
    function (el) {
      el.addEventListener("click", function () {
        /* 券发完或已过截止：直接挡住，不再打开任何链接 */
        if (!claimOpen()) {
          disableClaimButtons();
          return;
        }

        /* 本机领券计数 +1，让该用户后续看到自己已领过几号
           （全局余量以 BASE_CLAIMED 为准，这里只影响本地展示）*/
        writeLocalCount(readLocalCount() + 1);
        renderStock();

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
