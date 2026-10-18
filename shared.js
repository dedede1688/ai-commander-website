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
    { hash: "courses", text: "AI 课程" },
    { hash: "club", text: "会员俱乐部" },
    { hash: "tools", text: "AI 工具" },
    { hash: "articles", text: "知识中心" },
    { hash: "community", text: "学习交流" },
    { hash: "business", text: "商务合作" },
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

    links +=
      '<a class="nav-link nav-gift" id="navGift" data-track="qr|open|导航大礼包">AI 大礼包</a>';

    nav.innerHTML =
      '<div class="nav-inner">' +
      '<a class="nav-brand" id="navBrand" href="index.html">' +
      '<img class="nav-logo" src="' +
      LOGO +
      '" width="84" height="84" alt="AI 指挥官" /><span class="nav-brand-text">AI 指挥官</span></a>' +
      '<div class="nav-links">' +
      links +
      "</div>" +
      // ===== Phase 1B-1 新增：移动端汉堡菜单按钮 =====
      '<button class="menu-toggle" id="navToggle" type="button" ' +
        'aria-controls="navDrawer" aria-expanded="false" ' +
        'aria-label="打开导航菜单">' +
        '<span class="menu-toggle-icon" aria-hidden="true">☰</span>' +
      '</button>' +
      "</div>" +
      // ===== Phase 1B-1 新增：抽屉 + 遮罩 =====
      '<div class="nav-backdrop" id="navBackdrop" hidden></div>' +
      '<div class="nav-drawer" id="navDrawer" role="dialog" ' +
        'aria-modal="true" aria-label="导航菜单" hidden>' +
        '<div class="nav-drawer-inner">' +
        links +
        "</div>" +
      "</div>";

    /* ---------- 窄屏单行滚动的可达性 ----------
       窄屏下放不下的标签会被裁掉一半露在右缘（露出一点 = 滚动暗示），
       但滚动条是隐藏的，鼠标用户没有任何办法滚到后面 —— 这里补上两种手段：
       1. 指针悬停导航时，纵向滚轮直接转为横向滚动（触控板横扫走原生通道）；
       2. 载入后把当前页高亮标签居中滚入可视区，用户立刻能看到自己站在哪。 */
    var navLinks = nav.querySelector(".nav-links");
    if (navLinks) {
      navLinks.addEventListener(
        "wheel",
        function (e) {
          /* 无横向溢出（宽屏）或本来就是横向手势时不接管 */
          if (navLinks.scrollWidth <= navLinks.clientWidth) return;
          if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
          e.preventDefault();
          navLinks.scrollLeft += e.deltaY;
        },
        { passive: false },
      );

      var active = nav.querySelector(".nav-link.active");
      if (active) {
        /* 用几何中心对齐而不是 offsetLeft：offsetLeft 相对的是定位祖先
           （sticky 的 .topnav），不是滚动容器本身，直接用会算错 */
        var lr = active.getBoundingClientRect();
        var nr = navLinks.getBoundingClientRect();
        navLinks.scrollLeft +=
          lr.left + lr.width / 2 - (nr.left + nr.width / 2);
      }

      /* 滚过一点后给左缘加渐隐（.nav-links.scrolled 在 base.css）：
         被滚出去的标签看起来是滑到「AI 指挥官」品牌区下面，而不是生硬切断 */
      function syncFade() {
        navLinks.classList.toggle("scrolled", navLinks.scrollLeft > 4);
      }
      navLinks.addEventListener("scroll", syncFade, { passive: true });
      syncFade();
    }

    /* ---------- Phase 1B-1：移动端汉堡菜单 + 抽屉交互 ----------
       桌面端 .menu-toggle 与 .nav-drawer 由 base.css 默认 display:none，移动端 @media 切换。 */
    var navToggle = document.getElementById("navToggle");
    var navDrawer = document.getElementById("navDrawer");
    var navBackdrop = document.getElementById("navBackdrop");
    if (navToggle && navDrawer) {
      function openDrawer() {
        navDrawer.hidden = false;
        if (navBackdrop) navBackdrop.hidden = false;
        navToggle.setAttribute("aria-expanded", "true");
        navToggle.setAttribute("aria-label", "关闭导航菜单");
        document.body.style.overflow = "hidden";
        // 焦点移到第一个链接（可达性）
        var firstLink = navDrawer.querySelector("a");
        if (firstLink) setTimeout(function () { firstLink.focus(); }, 0);
      }
      function closeDrawer() {
        navDrawer.hidden = true;
        if (navBackdrop) navBackdrop.hidden = true;
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "打开导航菜单");
        document.body.style.overflow = "";
        // 焦点回到按钮（可达性）
        navToggle.focus();
      }
      function toggleDrawer() {
        if (navDrawer.hidden) openDrawer();
        else closeDrawer();
      }
      // 汉堡按钮点击
      navToggle.addEventListener("click", function (e) {
        e.preventDefault();
        toggleDrawer();
      });
      // 链接点击 → 关闭抽屉
      navDrawer.addEventListener("click", function (e) {
        if (e.target.closest("a")) closeDrawer();
      });
      // 遮罩点击 → 关闭
      if (navBackdrop) {
        navBackdrop.addEventListener("click", closeDrawer);
      }
      // Esc 键 → 关闭
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !navDrawer.hidden) closeDrawer();
      });
      /* ---------- Phase 1B-1 修复1：抽屉焦点陷阱 ----------
         抽屉打开时，Tab/Shift+Tab在抽屉链接间循环，不跳出也不关闭。
         正向Tab：最后一项 → 循环回第一项；
         反向Shift+Tab：第一项 → 循环回最后一项。
         仅Esc / 菜单按钮 / 遮罩点击 / 链接点击可关闭抽屉。 */
      navDrawer.addEventListener("keydown", function (e) {
        if (e.key !== "Tab" || navDrawer.hidden) return;
        var focusable = navDrawer.querySelectorAll('a[href]');
        if (focusable.length === 0) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          // Shift+Tab：第一项 → 循环到抽屉最后一项（不关闭）
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab：最后一项 → 循环回第一项
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      });
      /* ---------- Phase 1B-1 修复2：窗口resize复位 ----------
         当视口从移动端（<=768px）切换到桌面端（>768px）时，
         自动关闭抽屉、清除body overflow锁定、复位aria状态。
         从桌面端切回移动端也让残留的hidden/overflow状态清零。 */
      window.addEventListener("resize", function () {
        if (!navDrawer.hidden) {
          // 抽屉当前开着：切换到桌面则关闭（CSS会自动接管显示方式）
          if (window.innerWidth > 768) {
            closeDrawer();
          }
        }
        /* 无论抽屉是否打开，只要视口回到桌面就强制清除可能残留的body锁定 */
        if (window.innerWidth > 768) {
          document.body.style.overflow = "";
        }
      });
    }
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
    var _qrTrigger = null; /* 记录触发按钮，关闭时焦点返回 */

    function openQr(e) {
      _qrTrigger = e && e.target && e.target.closest ? e.target.closest("[data-open-qr]") : null;
      qrLayer.classList.add("on");
      /* 打开后将焦点移到关闭按钮，提高键盘可访问性 */
      var closeBtn = qrLayer.querySelector(".qr-close");
      if (closeBtn) closeBtn.focus();
    }

    function closeQr() {
      var trigger = _qrTrigger;
      _qrTrigger = null;
      qrLayer.classList.remove("on");
      /* 关闭后焦点返回到触发按钮；MutationObserver 已同步清除 inert */
      if (trigger && typeof trigger.focus === "function") {
        requestAnimationFrame(function () { trigger.focus(); });
      }
    }

    /* 导航栏「AI 大礼包」按钮 */
    var navGift = document.getElementById("navGift");
    if (navGift) {
      navGift.addEventListener("click", function (e) {
        e.preventDefault();
        openQr(e);
      });
    }

    /* 任意带 data-open-qr 的元素（扫码咨询 / CTA 条） */
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-open-qr]"),
      function (el) {
        el.addEventListener("click", openQr);
        /* 为 role=button 类元素添加键盘支持（Enter/Space 触发） */
        if (el.getAttribute("role") === "button") {
          el.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              var ev = new MouseEvent("click", { bubbles: true, cancelable: true });
              el.dispatchEvent(ev);
            }
          });
        }
      },
    );

    /* 关闭按钮 */
    var qrCloseEl = qrLayer.querySelector(".qr-close");
    if (qrCloseEl) {
      qrCloseEl.addEventListener("click", closeQr);
    }

    /* 面板内部点击不冒泡，防止误关闭 */
    var qrPanelEl = qrLayer.querySelector(".qr-panel");
    if (qrPanelEl) {
      qrPanelEl.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    /* 点击面板外的遮罩区域 → 关闭 */
    qrLayer.addEventListener("click", function (e) {
      /* 仅当点击的是 .qr-layer 本身（遮罩）时关闭 */
      if (e.target === qrLayer) {
        closeQr();
      }
    });

    /* Escape 关闭 */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && qrLayer.classList.contains("on")) {
        e.preventDefault();
        closeQr();
      }
    });
    /* ---------- 焦点陷阱：弹窗打开时 Tab/Shift+Tab 在弹窗内循环 ---------- */
    qrLayer.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !qrLayer.classList.contains("on")) return;
      var focusable = qrLayer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    /* 打开弹窗时对所有背景兄弟节点（nav、.wrap）加 inert，弹窗自身及其祖先不被禁用 */
    var _inertTargets = [];
    var _inertOrigState = [];
    function _forEachNode(node, fn) { NodeList.prototype.forEach.call(node, fn); }
    var qrLayerObserver = new MutationObserver(function () {
      var on = qrLayer.classList.contains("on");
      if (on) {
        _inertTargets = [];
        _inertOrigState = [];
        _forEachNode(document.body.children, function (child) {
          if (child.id === "qrLayer" || child.classList.contains("qr-layer")) return;
          if (child.tagName === "SCRIPT" || child.tagName === "STYLE") return;
          _inertTargets.push(child);
          _inertOrigState.push({ el: child, wasInert: child.hasAttribute("inert") });
          child.inert = true;
        });
      } else {
        _inertOrigState.forEach(function (s) {
          if (s.wasInert) { s.el.inert = true; } else { s.el.removeAttribute("inert"); }
        });
        _inertTargets = [];
        _inertOrigState = [];
      }
    });
    qrLayerObserver.observe(qrLayer, { attributes: true, attributeFilter: ["class"] });
  }

  /* ---------- 4. 统计与转化埋点（全站唯一入口） ----------
     三页原本各留一段百度统计注释，填的时候容易漏、也容易填错域名。
     现在集中在这里：一处配置，三页自动生效。

     ===== 怎么拿到百度统计的「站点代码」？=====
     1. 打开 https://tongji.baidu.com，用百度账号登录并注册；
     2. 按提示填站点域名：www.ai-mmc.cn      （只填域名，不要带 https:// 和路径）
     3. 提交后会进入「管理」页，站点列表里有一行——
        右侧「代码」图标点开后，会看到一段这样的代码：
            <script>
            var _hmt = _hmt || [];
            (function () {
              var hm = document.createElement("script");
              hm.src = "https://hm.baidu.com/hm.js?xxxxxxxx";
                                          ^^^^^^^^^
                                          这串就是「站点代码」
              ...
            })();
            </script>
     4. 把那串字符（hm.js?后面的一串字母数字，通常 8-16 位）
        填到下面BAIDU_SITE_ID 的引号里，保存本页文件即可。
     5. 部署上线后约 30 分钟，进百度统计后台「实时访客」看到数据就说明接通了。

     留空（现在的状态）= 不加载任何统计代码，站点访问不受影响。

     ===== 转化埋点怎么用 =====
     任何元素加上 data-track="类别|动作|标签" 即会被自动上报。
     例：<span data-track="claim|click|领券按钮1">立即领券</span>
     三段分别是「类别-动作-标签」，后台可按层级筛选。
     当前已埋：先锋营领券 4 处、试读 2 处、首页荣誉席位 4 处、荣誉CTA 2 处、导航大礼包 1 处。 */
  var BAIDU_SITE_ID = ""; /* 填百度统计的站点代码；留空则不启用 */
  var STATS_ENABLED = true;

  if (STATS_ENABLED && BAIDU_SITE_ID) {
    var hmScript = document.createElement("script");
    hmScript.src = "https://hm.baidu.com/hm.js?" + BAIDU_SITE_ID;
    hmScript.async = true;
    document.head.appendChild(hmScript);
    window._hmt = window._hmt || [];
    window._hmt.push(["_setAccount", BAIDU_SITE_ID]);

    /* 自动上报页面 PV（共享层已知道当前页标识） */
    if (pageKey) window._hmt.push(["trackPageview", "/" + pageKey]);

    document.addEventListener("click", function (e) {
      if (!e.target || !e.target.closest) return;
      var el = e.target.closest("[data-track]");
      if (!el) return;
      var parts = (el.getAttribute("data-track") || "").split("|");
      if (parts.length < 2 || !window._hmt) return;
      window._hmt.push(["trackEvent", parts[0], parts[1], parts[2] || ""]);
    });
  }

  /* 未启用时也给一个空实现，页面里调用 trackAction 不会报错 */
  window.trackAction = function (category, action, label) {
    if (!window._hmt) return;
    window._hmt.push(["trackEvent", category, action, label || ""]);
  };

  /* ---------- 5. 通用弹窗关闭（事件委托） ----------
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