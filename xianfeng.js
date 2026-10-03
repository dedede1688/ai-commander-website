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
