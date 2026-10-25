/* ===== 先锋券页脚本 =====
   依赖 shared.js（导航 / 页脚 / 二维码层）。页面缺少对应元素时自动跳过。

   已确认规则：免费领取先锋券，凭券 98 元包邮购买样板书；共 30 张，编号 001–030；
   每人限领 1 张由小程序执行；北京时间 2026-10-31 24:00 截止，到期未使用自动作废。

   本页只负责展示与小程序入口：
   - 不记录领取结果，不判断余量，不代替小程序执行限领、停券或券作废；
   - 到期后只关闭网页入口并停用按钮，小程序侧规则另行执行。 */
(function () {
  var CONFIG = {
    /* 北京时间 2026-10-31 24:00 对应 UTC 2026-10-31 15:59:59；
       用 UTC 时间戳，避免访问者设备时区造成提前或延后关闭。 */
    deadline: Date.UTC(2026, 9, 31, 15, 59, 59),
    claimUrl: "", /* 为空的现状：点击打开小程序二维码；填入后新窗口打开 */
  };

  var qrLayer = document.getElementById("qrLayer");
  var lastTrigger = null;

  /* ---------- 二维码层 ----------
     关闭按钮、遮罩点击、Escape 与焦点陷阱都在 shared.js 里；
     这里只负责打开、把初始焦点给关闭按钮、关闭后把焦点还给触发按钮。 */
  function openQr(trigger) {
    if (!qrLayer) return;
    lastTrigger = trigger || null;
    qrLayer.classList.add("on");
    var closeBtn = qrLayer.querySelector(".qr-close");
    if (closeBtn) closeBtn.focus();
  }

  if (qrLayer) {
    new MutationObserver(function () {
      if (!qrLayer.classList.contains("on") && lastTrigger) {
        var trigger = lastTrigger;
        lastTrigger = null;
        requestAnimationFrame(function () {
          if (trigger && typeof trigger.focus === "function") trigger.focus();
        });
      }
    }).observe(qrLayer, { attributes: true, attributeFilter: ["class"] });
  }

  /* ---------- 截止闸门 ----------
     只关闭本页入口并停用按钮；不停券、不处理券作废，那些由小程序执行。 */
  function deadlinePassed() {
    return CONFIG.deadline - new Date() <= 0;
  }

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

  if (deadlinePassed()) disableClaimButtons();

  /* ---------- 倒计时 ---------- */
  var cd = document.getElementById("xfCountdown");
  if (cd) {
    function pad(n) {
      return n < 10 ? "0" + n : "" + n;
    }
    function tick() {
      var diff = CONFIG.deadline - new Date();
      if (diff <= 0) {
        cd.textContent = "本页活动入口已关闭";
        disableClaimButtons();
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

  /* ---------- 领取入口：有链接走链接，没链接唤起小程序二维码 ---------- */
  Array.prototype.forEach.call(
    document.querySelectorAll("[data-xf-claim]"),
    function (el) {
      el.addEventListener("click", function () {
        if (deadlinePassed()) {
          disableClaimButtons();
          return;
        }
        if (CONFIG.claimUrl) {
          window.open(CONFIG.claimUrl, "_blank", "noopener");
        } else {
          openQr(el); /* 打开小程序二维码；是否领取成功由小程序决定 */
        }
      });
    },
  );
})();
