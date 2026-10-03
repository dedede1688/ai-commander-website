/* ===== 全站共享交互层 =====
   被 index.html 与 models.html 共同引用，后续新增页面直接引入即可复用。

   设计原则：
   1. 页面若缺少对应元素，所有绑定自动跳过，不报错。
   2. 导航与页脚在此统一生成，页面只保留空容器，从此不再各页手写一遍。

   新增一个页面的标准动作：
   <body data-page="页面标识" data-footer="页脚第一行|页脚第二行">
     <nav class="topnav" id="topnav"></nav>          ← 空容器，内容由本文件注入
     ...
     <div class="footer-note" id="footerNote"></div> ← 空容器，内容由本文件注入
     <script src="shared.js?v=1"></script>           ← 本文件
     <script src="页面专属.js"></script>
*/
(function () {
  /* ---------- 站点配置（改这里，全站生效） ---------- */
  /* 同页锚点栏目：首页直接用 #hash，其他页面自动补 index.html 前缀。
     数组顺序 = 导航栏从左到右的顺序，与页面区块顺序一致。 */
  var ANCHORS = [
    { hash: "sec-book", text: "关于本书" },
    { hash: "sec-roster", text: "指挥官军团" },
    { hash: "sec-ai", text: "共建指数" },
    { hash: "sec-honor", text: "四级荣誉" },
  ];
  /* 独立页面：key 与 body[data-page] 对应，用于判断当前页高亮 */
  var PAGES = [
    { file: "models.html", key: "models", text: "AI 模型" },
    { file: "xianfeng.html", key: "xianfeng", text: "先锋营" },
  ];
  var LOGO = "素材/logo.webp";
  var SITE_URL = "https://www.ai-mmc.cn";
  var SITE_DOMAIN = "www.ai-mmc.cn";
  var COPY = "© 2026 《AI指挥官》 保留所有权利";

  var body = document.body;
  var pageKey = body ? body.dataset.page || "" : "";
  /* 当前页是否为站点首页：是 → 锚点不带前缀；否 → 锚点前缀为 index.html */
  var isHome = /\/$|\/index\.html$/i.test(location.pathname);
  var prefix = isHome ? "" : "index.html";

  /* ---------- 1. 导航注入 ---------- */
  var nav = document.getElementById("topnav");
  if (nav) {
    function anchorLink(a) {
      return (
        '<a class="nav-link" href="' + prefix + "#" + a.hash + '">' + a.text + "</a>"
      );
    }

    /* 锚点栏目按 ANCHORS 数组顺序平铺，全部是直接可见的独立导航项 */
    var links = ANCHORS.map(function (a) {
      return anchorLink(a);
    }).join("");

    PAGES.forEach(function (p) {
      links +=
        '<a class="nav-link' +
        (pageKey === p.key ? " active" : "") +
        '" href="' +
        p.file +
        '">' +
        p.text +
        "</a>";
    });

    links += '<a class="nav-link nav-gift" id="navGift">AI 大礼包</a>';

    nav.innerHTML =
      '<div class="nav-inner">' +
      '<a class="nav-brand" id="navBrand" href="index.html">' +
      '<img class="nav-logo" src="' +
      LOGO +
      '" width="84" height="84" alt="AI 指挥官" /><span class="nav-brand-text">AI 指挥官</span></a>' +
      '<div class="nav-links">' +
      links +
      "</div>" +
      "</div>";
  }

  /* ---------- 2. 页脚注入 ---------- */
  var foot = document.getElementById("footerNote");
  if (foot) {
    var lines = (foot.dataset.footer || "")
      .split("|")
      .filter(function (s) {
        return s.length > 0;
      });

    foot.innerHTML =
      lines.join("<br />") +
      '<div class="ft-meta">' +
      '<span>官网地址：<a class="ft-link" href="' +
      SITE_URL +
      '" target="_blank" rel="noopener">' +
      SITE_DOMAIN +
      "</a></span>" +
      "</div>" +
      '<div class="ft-copy">' +
      COPY +
      "</div>";
  }

  /* ---------- 3. AI 大礼包二维码层 ---------- */
  var qrLayer = document.getElementById("qrLayer");
  if (qrLayer) {
    function openQr() {
      qrLayer.classList.add("on");
    }

    /* 导航栏「AI 大礼包」按钮 */
    var navGift = document.getElementById("navGift");
    if (navGift) {
      navGift.addEventListener("click", function (e) {
        e.preventDefault();
        openQr();
      });
    }

    /* 任意带 data-open-qr 的元素（扫码咨询 / CTA 条） */
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-open-qr]"),
      function (el) {
        el.addEventListener("click", openQr);
      },
    );

    /* 点击二维码层任意位置 → 关闭 */
    qrLayer.addEventListener("click", function () {
      qrLayer.classList.remove("on");
    });
  }

  /* ---------- 4. 通用弹窗关闭（事件委托） ----------
     任何带 data-close-modal 的元素被点击时，关闭它所在的 .modal。
     这样页面里不必再写内联 onclick，页面脚本才能安全地包进 IIFE。 */
  document.addEventListener("click", function (e) {
    if (!e.target || !e.target.closest) return;
    var closer = e.target.closest("[data-close-modal]");
    if (!closer) return;
    var modal = closer.closest(".modal");
    if (modal) modal.classList.remove("on");
  });
})();