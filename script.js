/* 《AI指挥官》首页脚本（script.js）
   整个文件包在 IIFE（立即执行函数 Immediately Invoked Function Expression）里，
   避免把 P / IND / openM 等名字暴露到 window 上，后续新增页面脚本时互不干扰。 */
(function () {
/* ===== 数据源：与 01-联合出版人.md 一一对应 ===== */
var P = [
  {
    n: "鄢海珍",
    s: "NO.001",
    r: "运动面料全链路操盘 · 二十余年",
    f: "素材/照片/NO001_鄢海珍.webp",
    b: "深耕服装纺织二十余年，专注运动面料研发、生产、销售与进出口贸易，具完整供应链实操经验。熟悉品质管控、外贸报关与跨境订单全链路，拥有稳定上游工厂及海内外客户渠道。以诚为本，品质为先，期待与服装品牌合作。",
    lv: "low",
  },
  {
    n: "金朝霞",
    s: "NO.002",
    r: "AI 营销生态发起人",
    f: "素材/照片/NO002_金朝霞.webp",
    b: "AI营销生态发起人，企业增长与数字化运营专家，AI智能体应用实践者。多年运营、品牌、招商孵化及数字化实战经验，专注AI获客、GEO增长与商业化落地。理念：AI不是替代企业，而是重新定义增长方式。",
    lv: "hi",
  },
  {
    n: "胡公平",
    s: "NO.003",
    r: "商业地产招商运营专家",
    f: "素材/照片/NO003_胡公平.webp",
    b: '商业地产策划招商运营专家。深耕大湾区二十余年，计算机跨界，操盘数十个商业综合体与产业园，擅长前策、业态与头部品牌招商。倡导"运营赋能为王"，构建线上流量+线下实操体系，探索AI数智化赋能实体商业。',
    lv: "hi",
  },
  {
    n: "张成",
    s: "NO.004",
    r: "企业底层架构师 · 30年实体",
    f: "素材/照片/NO004_张成.webp",
    b: "实体产业深耕三十余年，企业底层架构师，AI全域生态规划师。著有《民企生态底层架构》《商协会资源生态》等专著。倡导制度优先、先理性再感性，坚持风险防控。探索AI+实体+全域生态，赋能民营企业与高认知群体。",
    lv: "hi",
  },
  {
    n: "郭瑞元",
    s: "NO.005",
    r: "碧水源集团董事长",
    f: "素材/照片/NO005_郭瑞元.webp",
    b: "碧水源集团董事长，广州赢联健康产业创始人，广州碧水源生物科技董事长，美国BSY集团控股公司负责人。深耕大健康产业，推动产业整合、国际化与产学研融合，以科技赋能健康，助力行业高质量发展，并坚持长期主义。",
    lv: "low",
  },
  {
    n: "张玉洁",
    s: "NO.006",
    r: "玉洁生活社区连锁创始人",
    f: "素材/照片/NO006_张玉洁.webp",
    b: "玉洁生活社区连锁创始人，家政行业特别奉献者，优秀家庭服务管理者，高级营养管理师。以社区门店为根基，提供保洁、保姆、月嫂、家电清洗、养生及绿色农特产品服务。爱生活，爱健康，爱分享，美好生活从洁净养生开始。",
    lv: "low",
  },
  {
    n: "周一",
    s: "NO.007",
    r: "资深产业投资人",
    f: "素材/照片/NO007_周一.webp",
    b: "资深产业投资人，资本跃迁与上市培育实战专家。从工程师到集团董事，深耕实业二十余载。产业资本双视角，价值诊断、资本规划、产融对接、并购整合；优质企业上市费用最高九成垫资，合规为底线，助企业低门槛资本跃迁。",
    lv: "low",
  },
  {
    n: "于亚永",
    s: "NO.008",
    r: "资深IT工程师 · Web3观察者",
    f: "素材/照片/NO008_于亚永.webp",
    b: "资深IT工程师，深耕软件开发与底层架构，具工程研发与落地经验。深耕新媒体内容生态，擅长内容策划、流量运营与商业营销。专注Web3与数字经济，融合技术、传播与产业洞察，输出深度与落地并重的行业思考。",
    lv: "mid",
  },
  {
    n: "李海畅",
    s: "NO.009",
    r: "企业战略顾问 · 互联网运营",
    f: "素材/照片/NO009_李海畅.webp",
    b: "大湾区本地生活联合运营中心联合创始人，广东华南经济发展研究会企业家访谈人，原中国网健康中国广东会客厅副主编、战略顾问，《企业家使命》编委。AI+全域视觉战略官，品牌传播顾问，短视频视觉传播、全域获客。",
    lv: "mid",
  },
  {
    n: "吴琦",
    s: "NO.010",
    r: "实体产业互联转型专家",
    f: "素材/照片/NO010_吴琦.webp",
    b: "原大型国企实操运营人，实体产业互联转型升级落地专家，八年互联网公域流量赋能实体应用者。湖南省驻广州天狼商务处常务副会长，数字经济早期资深投资型顾问，原南京远见生物科技首席战略运营官，并长期推动产业升级。",
    lv: "mid",
  },
  {
    n: "熊俪",
    s: "NO.011",
    r: "汉派女装 · 实业股东",
    f: "素材/照片/NO011_熊俪.webp",
    b: "深耕汉派女装批发，熟悉服装供应链与市场；广州秦火锅股份有限公司股东，参与餐饮投资；任康达（广州）品牌管理有限公司事业部经理，专注品牌管理与渠道。跨界实体与品牌运营，务实稳健，持续探索产业升级发展。",
    lv: "low",
  },
  {
    n: "谢眺",
    s: "NO.012",
    r: "传统行业 → 互联网转型者",
    f: "素材/照片/NO012_谢眺.webp",
    b: "从教育世家走出，历经传统实体与互联网双重淬炼。承包商场、经营餐饮百货、创办食品工厂，后转战深圳互联网，从失败中成长为团队长、系统领导、运营总监、平台CEO。整合资源，坚韧务实，持续探索新商业生态。",
    lv: "mid",
  },
  {
    n: "韦健",
    s: "NO.013",
    r: "金融投融资 · 并购重组",
    f: "素材/照片/NO013_韦健.webp",
    b: "深耕金融二十余年，聚焦实体项目投融资，全流程实操丰富。参与火车站基建及大型工商投资项目尽调、研判与价值分析，完成现金流测算、收益评估与风险识别。主导多项并购重组，熟悉交易架构、估值谈判与风险把控。",
    lv: "low",
    isNew: true,
  },
  {
    n: "李平",
    s: "NO.014",
    r: "理财规划师 · 财商教育者",
    f: "素材/照片/NO014_李平.webp",
    b: "理财规划师，心理咨询师，青少年财商教育实践者。多年企业规划经验，融合财务、心理与教育视角，专注财富心智、家庭成长与组织发展，助力企业高质量发展，以专业与温度陪伴个人和企业长期稳健前行，并持续创造价值。",
    lv: "low",
  },
  {
    n: "Menger",
    s: "NO.015",
    r: "品牌上市运营总指导",
    f: "素材/照片/NO015_Menger.webp",
    b: "品牌上市运营总指导。深耕实业与资本，涉足五金、农业、电商，深谙平衡之道。专注市值管理十年，参与创建市值研究中心，是市值管理实践的传承者与践行者。以实业为根、资本为翼，务实理性，助力企业价值提升。",
    lv: "low",
  },
  {
    n: "赵卓一",
    s: "NO.016",
    r: "AI 全域营销专家",
    f: "素材/照片/NO016_赵卓一.webp",
    b: "深耕AI全域营销与商业落地，专注AI转化为实体、美业与创业项目的增长工具。擅长AI短剧、AIGC内容、AI获客，搭建商业化运营方案，打造低成本引流、沙龙招商与短视频矩阵，务实落地，赋能实体破局。",
    lv: "hi",
  },
  {
    n: "张武红",
    s: "NO.017",
    r: "语文老师 · 互联网投资顾问",
    f: "素材/照片/NO017_张武红.webp",
    b: "安徒生语文老师，互联网投资顾问，多个支付公司聚合码平台指导人。深耕企业投资与教育板块，对AI领域高度认同，善于跨界连接资源，以教育者与投资人双重视角，助力更多人拥抱智能时代，携手更多伙伴共创未来！",
    lv: "hi",
  },
  {
    n: "危杰棉",
    s: "NO.018",
    r: "实体连续创业 · 美业大健康",
    f: "素材/照片/NO018_危杰棉.webp",
    b: "实体连续创业者，深耕美业与大健康，擅长供应链整合、私域渠道搭建与商业资源对接。从一线实体经营视角，参与梳理AI在商业场景中的落地思考，聚焦普通人如何借助AI工具，把想法转化为实际商业价值，务实推进落地。",
    lv: "hi",
    isNew: true,
  },
  {
    n: "牛顿老师",
    s: "NO.019",
    r: "AI 人才孵化 · 商学院院长",
    f: "素材/照片/NO019_牛顿老师.webp",
    b: "华中农大硕士，深耕企业人才培养与输送，兼任多家商学院院长。现聚焦AI时代核心人才孵化，定向培养讲师、店长及AI部署工程师，打通培育、训练、输送全链路，助企业搭建可落地人才梯队，解决招人难、育人慢、留不住。",
    lv: "low",
    isNew: true,
  },
  {
    n: "胡子老师",
    s: "NO.020",
    r: "《AI指挥官》作者",
    f: "素材/照片/NO020_胡子老师.webp",
    b: '资本视角商业策划师，首席战略官，资本运作专家。精通财务模型与资本架构，擅长模式创新与组织激活。独创"商学院+招商+资本"铁三角，打通治理、模式、资产证券化。理念：AI是参谋，你是司令。《AI指挥官》作者。',
    lv: "hi",
  },
];

/* ===== 行业分组数据（每组的成员名单驱动下方行业卡渲染）===== */
var IND = [
  {
    name: "金融·资本·投资",
    icon: '<path d="M3 20h18M6 20V11M11 20V6M16 20v-7M21 20V9"/>',
    m: ["韦健", "周一", "Menger", "李平", "张武红"],
  },
  {
    name: "传统实业·制造",
    icon: '<path d="M3 21V10l6-4 6 4v11M9 21v-5h6v5M21 21v-7l-3-2"/>',
    m: ["鄢海珍", "熊俪"],
  },
  {
    name: "大健康·生活服务",
    icon: '<path d="M12 21s-7.5-5-7.5-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3.5C19.5 16 12 21 12 21z"/><path d="M12 11v4M10 13h4"/>',
    m: ["郭瑞元", "张玉洁", "危杰棉"],
  },
  {
    name: "IT·互联网·数字化",
    icon: '<path d="M8.5 6.5L3 12l5.5 5.5M15.5 6.5L21 12l-5.5 5.5"/>',
    m: ["于亚永", "吴琦", "谢眺"],
  },
  {
    name: "AI 原生·AI 营销",
    icon: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/><path d="M10 2.5v4M14 2.5v4M10 17.5v4M14 17.5v4M2.5 10h4M2.5 14h4M17.5 10h4M17.5 14h4"/>',
    m: ["金朝霞", "赵卓一"],
  },
  {
    name: "咨询·战略·架构",
    icon: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    m: ["张成", "李海畅"],
  },
  {
    name: "商业地产·产业园",
    icon: '<path d="M4 21V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15M14 21V12h4a2 2 0 0 1 2 2v7M8 8h2M8 12h2M8 16h2"/>',
    m: ["胡公平"],
  },
  {
    name: "教育·人才",
    icon: '<path d="M12 4L2 9l10 5 10-5-10-5z"/><path d="M6.5 11.5V16c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4.5"/><path d="M22 9v5"/>',
    m: ["牛顿老师"],
  },
  {
    name: "本书作者",
    icon: '<path d="M20 3L9 14l-4 1 1-4L17 0l3 3z"/><path d="M9 14v6H3"/>',
    m: ["胡子老师"],
  },
];

var PHOTO = {},
  AILV = {};
P.forEach(function (x) {
  PHOTO[x.n] = x.f;
  AILV[x.n] = x.lv;
});

/* ===== 行业卡（HTML 渲染）=====
   每个行业一张卡：图标 + 行业名 + 人数 ／ 头像行 ／ 姓名行 ／ 档位分布条。
   头像与文字都是 HTML 元素，尺寸由 CSS 固定，不随容器宽度缩放。 */
var LVNAME = { hi: "已关联", mid: "可衔接", low: "待建立" };
var LVIDX = ["hi", "mid", "low"];

var netGrid = document.getElementById("netGrid");
IND.forEach(function (ind) {
  var counts = { hi: 0, mid: 0, low: 0 };
  ind.m.forEach(function (nm) {
    counts[AILV[nm] || "low"]++;
  });

  var avatars = "";
  ind.m.forEach(function (nm) {
    var lv = AILV[nm] || "low";
    avatars +=
      '<span class="ind-av lv-' +
      lv +
      '" aria-hidden="true" title="' +
      nm +
      " · " +
      LVNAME[lv] +
      '"><img src="' +
      PHOTO[nm] +
      '" alt="" loading="lazy" decoding="async"></span>';
  });

  /* 分布条：宽度按本行业人数归一化，全绿即该行业全员已关联 AI */
  var bar = "";
  LVIDX.forEach(function (lv) {
    if (counts[lv] > 0) {
      bar += '<i class="bar-' + lv + '" style="flex:' + counts[lv] + '"></i>';
    }
  });

  var blk = document.createElement("div");
  blk.className = "ind-card";
  blk.innerHTML =
    '<div class="ind-head">' +
    '<svg class="ind-ico" viewBox="0 0 24 24" aria-hidden="true">' +
    ind.icon +
    "</svg>" +
    '<span class="ind-name">' +
    ind.name +
    "</span>" +
    '<span class="ind-num">' +
    ind.m.length +
    "<small>人</small></span>" +
    "</div>" +
    '<div class="ind-body">' +
    avatars +
    "</div>" +
    '<div class="ind-names">' +
    ind.m.join(" · ") +
    "</div>" +
    '<div class="ind-bar">' +
    bar +
    "</div>";
  netGrid.appendChild(blk);
});

/* ===== 渲染名录照片墙 ===== */
var roster = document.getElementById("roster");
P.forEach(function (p, i) {
  var d = document.createElement("div");
  d.className = "rc" + (p.isNew ? " new" : "");
  d.innerHTML =
    '<img class="rc-photo" src="' +
    p.f +
    '" alt="' +
    p.n +
    '" loading="lazy" decoding="async">' +
    '<div class="rc-seat">' +
    p.s +
    "</div>" +
    '<div class="rc-name">' +
    p.n +
    "</div>" +
    '<div class="rc-tag">' +
    p.r +
    "</div>" +
    '<div class="rc-hint">点击查看介绍</div>';
  d.onclick = function () {
    openM(i);
  };
  roster.appendChild(d);
});

/* ===== 弹窗 ===== */
function openM(i) {
  var p = P[i];
  document.getElementById("mPhoto").src = p.f;
  document.getElementById("mName").textContent = p.n;
  document.getElementById("mRole").textContent = p.r;
  document.getElementById("mSeat").textContent =
    "席位 " + p.s + " ｜ CO-PUBLISHER";
  document.getElementById("mBio").textContent = p.b;
  document.getElementById("modal").classList.add("on");
}
function closeM() {
  document.getElementById("modal").classList.remove("on");
}
document.getElementById("modal").addEventListener("click", function (e) {
  if (e.target === this) closeM();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeM();
});

/* ===== 顶部导航：点击跳转 + 滚动高亮 ===== */
(function () {
  var links = Array.prototype.slice.call(
    document.querySelectorAll(".nav-link"),
  );
  var targets = links
    .map(function (l) {
      return document.querySelector(l.getAttribute("href"));
    })
    .filter(Boolean);

  var navLinks = document.querySelector(".nav-links");
  function scrollLinkIntoView(l) {
    /* 下拉收起时菜单项不可见（rect 全 0），跳过避免误滚导航条 */
    if (!navLinks || !l.offsetParent) return;
    var cr = navLinks.getBoundingClientRect();
    var lr = l.getBoundingClientRect();
    var left = lr.left - cr.left;
    var right = lr.right - cr.left;
    var pad = 8;
    if (left < pad) {
      navLinks.scrollBy({ left: left - pad, behavior: "smooth" });
    } else if (right > navLinks.clientWidth - pad) {
      navLinks.scrollBy({
        left: right - navLinks.clientWidth + pad,
        behavior: "smooth",
      });
    }
  }
  links.forEach(function (l) {
    l.addEventListener("click", function (e) {
      var el = document.querySelector(this.getAttribute("href"));
      if (!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.pageYOffset - 62;
      window.scrollTo({ top: y < 0 ? 0 : y, behavior: "smooth" });
      links.forEach(function (x) {
        x.classList.remove("active");
      });
      this.classList.add("active");
      /* 窄屏：把被点击项滚到可见区，避免后续项被遮挡 */
      scrollLinkIntoView(this);
    });
  });
  /* 滚动侦测高亮切换时，同步让高亮项可见 */
  function spy() {
    var y = window.pageYOffset + 92;
    /* 取「已滚过参考线」的区块中物理位置最深的一个。
       「联合出版」下拉重排后，链接的 DOM 顺序不再等于页面区块顺序，
       不能再按数组顺序取最后一个满足项。 */
    var cur = null;
    var curTop = -Infinity;
    targets.forEach(function (t) {
      var top = t.getBoundingClientRect().top + window.pageYOffset;
      if (top <= y && top > curTop) {
        cur = t;
        curTop = top;
      }
    });
    if (!cur) {
      /* 模型页没有本页区块，保持页面级高亮（如「AI 模型」）不动 */
      if (!targets.length) return;
      /* 首页顶部没有任何区块过线：清除全部高亮。
         原来兜底点亮第一项，但「AI 前线」删除后首项是页面中部的
         「指挥官军团」，回到顶部时点亮它属于误亮。 */
      links.forEach(function (l) {
        l.classList.toggle("active", false);
      });
      var dropBtnTop = document.querySelector(".nav-drop");
      if (dropBtnTop) dropBtnTop.classList.remove("active");
      return;
    }
    var curHref = "#" + cur.id;
    var changed = false;
    links.forEach(function (l) {
      var on = l.getAttribute("href") === curHref;
      if (on !== l.classList.contains("active")) {
        l.classList.toggle("active", on);
        if (on) changed = true;
      }
    });
    /* 高亮项变化且不可见时，自动滚到可见（窄屏关键：手动滚动浏览时下一项不被遮挡） */
    if (changed) {
      var act = document.querySelector(".nav-link.active");
      if (act) scrollLinkIntoView(act);
    }
    /* 下拉子项处于高亮时，顶级「联合出版」同步亮起（子项在下拉里，用户看不见） */
    var dropBtn = document.querySelector(".nav-drop");
    if (dropBtn) {
      var dropOn = !!document.querySelector(".dd-link.active");
      if (dropOn !== dropBtn.classList.contains("active")) {
        dropBtn.classList.toggle("active", dropOn);
        if (dropOn) scrollLinkIntoView(dropBtn);
      }
    }
  }
  window.addEventListener("scroll", spy, { passive: true });
  window.addEventListener("resize", spy);
  spy();
})();

/* ===== 动态日期 ===== */
(function () {
  var d = new Date();
  var txt =
    d.getFullYear() +
    "年" +
    (d.getMonth() + 1) +
    "月" +
    d.getDate() +
    "日";
  var el = document.getElementById("genDate");
  if (el) {
    el.textContent = "修订日期：" + txt;
  }
})();

/* ===== 点击品牌区回到页面顶端 ===== */
(function () {
  var brand = document.getElementById("navBrand");
  if (!brand) return;
  brand.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ===== 记住滚动位置：刷新后回到原处，不被广告弹窗或刷新带回页顶 ===== */
(function () {
  var KEY = "__aiScrollY";
  var y = 0;
  try {
    y = parseInt(sessionStorage.getItem(KEY) || "0", 10) || 0;
  } catch (e) {}

  /* 关掉浏览器自带的滚动恢复，改由本脚本接管：
     否则它会和页面里的平滑滚动互相打断，最后停在页顶 */
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function save() {
    try {
      sessionStorage.setItem(KEY, String(Math.round(window.pageYOffset)));
    } catch (e) {}
  }
  window.addEventListener("pagehide", save);
  window.addEventListener("beforeunload", save);

  if (y <= 0) return;

  /* 用户自己滚动过之后就不再干预，避免把滚动位置抢回来 */
  var moved = false;
  ["wheel", "touchstart", "keydown"].forEach(function (ev) {
    window.addEventListener(
      ev,
      function () {
        moved = true;
      },
      { passive: true },
    );
  });

  /* 首屏图片会撑开高度，先定位一次，整页加载完再校正一次 */
  window.scrollTo(0, y);
  window.addEventListener("load", function () {
    if (!moved) window.scrollTo(0, y);
  });
})();

/* ===== 广告弹窗：书本式出版人轮播 · 每 3 分钟弹一次 · 3 秒后缩飞进「AI 大礼包」 ===== */
(function () {
  var adModal = document.getElementById("adModal");
  if (!adModal) return;
  var adBox = document.getElementById("adBox");
  var qrLayer = document.getElementById("qrLayer");
  var navGift = document.getElementById("navGift");
  var adAvatar = document.getElementById("adAvatar");
  var adPName = document.getElementById("adPName");
  var adPSeat = document.getElementById("adPSeat");
  var adPRole = document.getElementById("adPRole");
  var adCta = document.getElementById("adCta");

  /* 本次打开页面随机选一位起始出版人，之后按席位顺序 1→20 轮下去；刷新页面重新随机 */
  var idx = Math.floor(Math.random() * P.length);

  /* 退场：整体缩小并飞向导航栏「AI 大礼包」按钮 */
  function closeAd() {
    /* 已在退场中或已隐藏时跳过，防止自动退场定时器与点击重复触发 */
    if (!adModal.classList.contains("on")) return;
    if (adBox && navGift) {
      var gr = navGift.getBoundingClientRect();
      var br = adBox.getBoundingClientRect();
      var dx = gr.left + gr.width / 2 - (br.left + br.width / 2);
      var dy = gr.top + gr.height / 2 - (br.top + br.height / 2);
      adBox.style.setProperty("--fly-x", dx.toFixed(0) + "px");
      adBox.style.setProperty("--fly-y", dy.toFixed(0) + "px");
      adBox.classList.add("ad-away");
    }
    /* 动画结束后再真正隐藏并复位，供下次弹出 */
    setTimeout(function () {
      adModal.classList.remove("on");
      if (adBox) {
        adBox.classList.remove("ad-away");
        adBox.style.removeProperty("--fly-x");
        adBox.style.removeProperty("--fly-y");
      }
    }, 500);
  }

  function showAd() {
    var p = P[idx];
    if (adAvatar) {
      adAvatar.src = p.f;
      adAvatar.alt = p.n;
    }
    if (adPName) adPName.textContent = p.n;
    if (adPSeat) adPSeat.textContent = p.s + " · 联合出版人";
    if (adPRole) adPRole.textContent = p.r;
    adModal.classList.add("on");
    /* 下一次弹窗换下一位，到 NO.020 后回到 NO.001 */
    idx = (idx + 1) % P.length;
    /* 3 秒后自动退场，缩飞进「AI 大礼包」 */
    setTimeout(closeAd, 3000);
  }

  /* 打开页面不立即弹出（首次弹出已按需求去掉），之后每 3 分钟弹一次 */
  setInterval(showAd, 180000);

  /* 点击广告：按钮「共建 AI 生态」→ 弹出 AI 大礼包二维码（广告同时退场）；
     点其它任何位置 → 按原方式退场（缩飞进「AI 大礼包」） */
  adModal.addEventListener("click", function (e) {
    if (e.target === adCta && qrLayer) {
      qrLayer.classList.add("on");
    }
    closeAd();
  });

  /* 导航「AI 大礼包」与 data-open-qr 元素的绑定已抽到 shared.js（全站共享层），此处不再重复绑定 */
})();

/* ===== 国庆海报弹窗：上线即弹 · 至 2026-10-10 23:59 结束 · 之后每 30 分钟弹一次 · 两张轮播 ===== */
(function () {
  var posterModal = document.getElementById("posterModal");
  if (!posterModal) return;

  /* 时间窗口：2026-10-10 23:59:59 之后不再弹出（代码可保留，明年复用改日期即可） */
  var END = new Date(2026, 9, 10, 23, 59, 59);
  if (new Date() > END) return;

  var slides = document.querySelectorAll("#posterTrack .poster-slide");
  var prevBtn = document.getElementById("posterPrev");
  var nextBtn = document.getElementById("posterNext");
  var closeBtn = document.getElementById("posterClose");
  var dots = [
    document.getElementById("posterDot0"),
    document.getElementById("posterDot1"),
  ];
  var page = 0;
  var TOTAL = 2;
  var AUTO_MS = 4000; /* 自动轮播间隔：4 秒 */
  var autoTimer = null;

  function go(n) {
    var next = (n + TOTAL) % TOTAL; /* 取模实现循环：最后一张 → 第一张 */
    if (next === page) return;
    /* 分屏合拢入场：新海报左右两半从屏幕两侧向中间合拢，旧海报淡出 */
    slides[page].classList.remove("on");
    slides[page].classList.add("out");
    slides[next].classList.remove("out");
    void slides[next].offsetWidth; /* 强制重排，确保合拢动画每次都重新触发 */
    slides[next].classList.add("on");
    page = next;
    dots.forEach(function (d, i) {
      d.classList.toggle("on", i === page);
    });
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(function () {
      go(page + 1);
    }, AUTO_MS);
  }
  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function show() {
    posterModal.classList.add("on");
    /* 重播当前海报的分屏合拢入场动画（弹窗隐藏期间动画不会自动重新触发） */
    var cur = slides[page];
    cur.classList.remove("on");
    void cur.offsetWidth;
    cur.classList.add("on");
    startAuto();
  }
  function hide() {
    posterModal.classList.remove("on");
    stopAuto();
  }

  prevBtn.addEventListener("click", function () {
    go(page - 1);
    startAuto(); /* 手动切换后重置倒计时，避免刚切完立刻被自动翻页打断 */
  });
  nextBtn.addEventListener("click", function () {
    go(page + 1);
    startAuto();
  });
  dots.forEach(function (d, i) {
    d.style.cursor = "pointer";
    d.addEventListener("click", function () {
      go(i);
      startAuto();
    });
  });
  /* 鼠标悬停时暂停自动轮播，移开后恢复（仅弹窗打开时生效） */
  var posterBox = posterModal.querySelector(".poster-box");
  posterBox.addEventListener("mouseenter", stopAuto);
  posterBox.addEventListener("mouseleave", function () {
    if (posterModal.classList.contains("on")) startAuto();
  });
  closeBtn.addEventListener("click", hide);
  /* 点击海报以外的遮罩区域关闭 */
  posterModal.addEventListener("click", function (e) {
    if (e.target === posterModal) hide();
  });

  /* 打开页面立即弹出一次，之后每 30 分钟再弹一次 */
  show();
  setInterval(show, 1800000);
})();
})();
