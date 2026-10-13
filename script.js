/* 《AI指挥官》首页脚本（script.js）
   整个文件包在 IIFE（立即执行函数 Immediately Invoked Function Expression）里，
   避免把 P / IND / openM 等名字暴露到 window 上，后续新增页面脚本时互不干扰。 */
(function () {
/* ===== 出版人名录数据（22 席）=====

   字段说明（新增成员时照此填写）：
     slug  个人主页标识，全站唯一。规则见下方 SLUG_RULE，改了等于作废旧链接
     n姓 名
     s     席号，如 NO.001
     r     主身份标签
     f照片  WebP 路径，170×240
     b     个人简介
     lv    AI 关联度：hi 已关联 / mid 可衔接 / low 待建立
     isNew 是否本轮新增（卡片带「新」角标），稳定后可去掉

   ---------- SLUG_RULE（重要）----------
   slug 会出现在分享链接里，一经上线不可更改：
     · 只用姓名拼音，不含席位号（席位会变，人不会变）
     · 不含职位、公司（都可能变）
     · 全小写 + 连字符分隔
     · 冲突时在末尾加数字后缀，如 wang-wei-2
   新增成员时先跑 tools/check-data.js 查重，重名会直接报错。 */
var P = [
  {
    slug: "yan-hai-zhen",
    n: "鄢海珍",
    s: "NO.001",
    r: "运动面料全链路操盘 · 二十余年",
    f: "素材/照片/NO001_鄢海珍.webp",
    b: "深耕服装纺织二十余年，专注运动面料研发、生产、销售与进出口贸易，具完整供应链实操经验。熟悉品质管控、外贸报关与跨境订单全链路，拥有稳定上游工厂及海内外客户渠道。以诚为本，品质为先，期待与服装品牌合作。",
    lv: "low",
  },
  {
    slug: "jin-zhao-xia",
    n: "金朝霞",
    s: "NO.002",
    r: "AI 营销生态发起人",
    f: "素材/照片/NO002_金朝霞.webp",
    b: "AI营销生态发起人，企业增长与数字化运营专家，AI智能体应用实践者。多年运营、品牌、招商孵化及数字化实战经验，专注AI获客、GEO增长与商业化落地。理念：AI不是替代企业，而是重新定义增长方式。",
    lv: "hi",
  },
  {
    slug: "hu-gong-ping",
    n: "胡公平",
    s: "NO.003",
    r: "商业地产招商运营专家",
    f: "素材/照片/NO003_胡公平.webp",
    b: '商业地产策划招商运营专家。深耕大湾区二十余年，计算机跨界，操盘数十个商业综合体与产业园，擅长前策、业态与头部品牌招商。倡导"运营赋能为王"，构建线上流量+线下实操体系，探索AI数智化赋能实体商业。',
    lv: "hi",
  },
  {
    slug: "zhang-cheng",
    n: "张成",
    s: "NO.004",
    r: "企业底层架构师 · 30年实体",
    f: "素材/照片/NO004_张成.webp",
    b: "实体产业深耕三十余年，企业底层架构师，AI全域生态规划师。著有《民企生态底层架构》《商协会资源生态》等专著。倡导制度优先、先理性再感性，坚持风险防控。探索AI+实体+全域生态，赋能民营企业与高认知群体。",
    lv: "hi",
  },
  {
    slug: "guo-rui-yuan",
    n: "郭瑞元",
    s: "NO.005",
    r: "碧水源集团董事长",
    f: "素材/照片/NO005_郭瑞元.webp",
    b: "碧水源集团董事长，广州赢联健康产业创始人，广州碧水源生物科技董事长，美国BSY集团控股公司负责人。深耕大健康产业，推动产业整合、国际化与产学研融合，以科技赋能健康，助力行业高质量发展，并坚持长期主义。",
    lv: "low",
  },
  {
    slug: "zhang-yu-jie",
    n: "张玉洁",
    s: "NO.006",
    r: "玉洁生活社区连锁创始人",
    f: "素材/照片/NO006_张玉洁.webp",
    b: "玉洁生活社区连锁创始人，家政行业特别奉献者，优秀家庭服务管理者，高级营养管理师。以社区门店为根基，提供保洁、保姆、月嫂、家电清洗、养生及绿色农特产品服务。爱生活，爱健康，爱分享，美好生活从洁净养生开始。",
    lv: "low",
  },
  {
    slug: "zhou-yi",
    n: "周一",
    s: "NO.007",
    r: "资深产业投资人",
    f: "素材/照片/NO007_周一.webp",
    b: "资深产业投资人，资本跃迁与上市培育实战专家。从工程师到集团董事，深耕实业二十余载。产业资本双视角，价值诊断、资本规划、产融对接、并购整合；优质企业上市费用最高九成垫资，合规为底线，助企业低门槛资本跃迁。",
    lv: "low",
  },
  {
    slug: "yu-ya-yong",
    n: "于亚永",
    s: "NO.008",
    r: "资深IT工程师 · Web3观察者",
    f: "素材/照片/NO008_于亚永.webp",
    b: "资深IT工程师，深耕软件开发与底层架构，具工程研发与落地经验。深耕新媒体内容生态，擅长内容策划、流量运营与商业营销。专注Web3与数字经济，融合技术、传播与产业洞察，输出深度与落地并重的行业思考。",
    lv: "mid",
  },
  {
    slug: "li-hai-chang",
    n: "李海畅",
    s: "NO.009",
    r: "AI+全域视觉战略官 · 品牌传播",
    f: "素材/照片/NO009_李海畅.webp",
    b: "大湾区本地生活联合运营中心联合创始人，广东华南经济发展研究会企业家访谈人，原中国网健康中国广东会客厅副主编、战略顾问，《企业家使命》编委。AI+全域视觉战略官，品牌传播顾问，短视频视觉传播、全域获客。",
    lv: "mid",
  },
  {
    slug: "wu-qi",
    n: "吴琦",
    s: "NO.010",
    r: "实体产业互联转型专家",
    f: "素材/照片/NO010_吴琦.webp",
    b: "原大型国企实操运营人，实体产业互联转型升级落地专家，八年互联网公域流量赋能实体应用者。湖南省驻广州天狼商务处常务副会长，数字经济早期资深投资型顾问，原南京远见生物科技首席战略运营官，并长期推动产业升级。",
    lv: "mid",
  },
  {
    slug: "xiong-li",
    n: "熊俪",
    s: "NO.011",
    r: "汉派女装 · 实业股东",
    f: "素材/照片/NO011_熊俪.webp",
    b: "深耕汉派女装批发，熟悉服装供应链与市场；广州秦火锅股份有限公司股东，参与餐饮投资；任康达（广州）品牌管理有限公司事业部经理，专注品牌管理与渠道。跨界实体与品牌运营，务实稳健，持续探索产业升级发展。",
    lv: "low",
  },
  {
    slug: "xie-tiao",
    n: "谢眺",
    s: "NO.012",
    r: "传统行业 → 互联网转型者",
    f: "素材/照片/NO012_谢眺.webp",
    b: "从教育世家走出，历经传统实体与互联网双重淬炼。承包商场、经营餐饮百货、创办食品工厂，后转战深圳互联网，从失败中成长为团队长、系统领导、运营总监、平台CEO。整合资源，坚韧务实，持续探索新商业生态。",
    lv: "mid",
  },
  {
    slug: "wei-jian",
    n: "韦健",
    s: "NO.013",
    r: "金融投融资 · 并购重组",
    f: "素材/照片/NO013_韦健.webp",
    b: "深耕金融二十余年，聚焦实体项目投融资，全流程实操丰富。参与火车站基建及大型工商投资项目尽调、研判与价值分析，完成现金流测算、收益评估与风险识别。主导多项并购重组，熟悉交易架构、估值谈判与风险把控。",
    lv: "low",
    isNew: true,
  },
  {
    slug: "li-ping",
    n: "李平",
    s: "NO.014",
    r: "理财规划师 · 财商教育者",
    f: "素材/照片/NO014_李平.webp",
    b: "理财规划师，心理咨询师，青少年财商教育实践者。多年企业规划经验，融合财务、心理与教育视角，专注财富心智、家庭成长与组织发展，助力企业高质量发展，以专业与温度陪伴个人和企业长期稳健前行，并持续创造价值。",
    lv: "low",
  },
  {
    slug: "menger",
    n: "Menger",
    s: "NO.015",
    r: "品牌上市运营总指导",
    f: "素材/照片/NO015_Menger.webp",
    b: "品牌上市运营总指导。深耕实业与资本，涉足五金、农业、电商，深谙平衡之道。专注市值管理十年，参与创建市值研究中心，是市值管理实践的传承者与践行者。以实业为根、资本为翼，务实理性，助力企业价值提升。",
    lv: "low",
  },
  {
    slug: "zhao-zhuo-yi",
    n: "赵卓一",
    s: "NO.016",
    r: "AI 全域营销专家",
    f: "素材/照片/NO016_赵卓一.webp",
    b: "深耕AI全域营销与商业落地，专注AI转化为实体、美业与创业项目的增长工具。擅长AI短剧、AIGC内容、AI获客，搭建商业化运营方案，打造低成本引流、沙龙招商与短视频矩阵，务实落地，赋能实体破局。",
    lv: "hi",
  },
  {
    slug: "zhang-wu-hong",
    n: "张武红",
    s: "NO.017",
    r: "语文老师 · 互联网投资顾问",
    f: "素材/照片/NO017_张武红.webp",
    b: "安徒生语文老师，互联网投资顾问，多个支付公司聚合码平台指导人。深耕企业投资与教育板块，对AI领域高度认同，善于跨界连接资源，以教育者与投资人双重视角，助力更多人拥抱智能时代，携手更多伙伴共创未来！",
    lv: "hi",
  },
  {
    slug: "wei-jie-mian",
    n: "危杰棉",
    s: "NO.018",
    r: "实体连续创业 · 美业大健康",
    f: "素材/照片/NO018_危杰棉.webp",
    b: "实体连续创业者，深耕美业与大健康，擅长供应链整合、私域渠道搭建与商业资源对接。从一线实体经营视角，参与梳理AI在商业场景中的落地思考，聚焦普通人如何借助AI工具，把想法转化为实际商业价值，务实推进落地。",
    lv: "hi",
    isNew: true,
  },
  {
    slug: "newton-laoshi",
    n: "牛顿老师",
    s: "NO.019",
    r: "AI 时代人才孵化 · 商学院院长",
    f: "素材/照片/NO019_牛顿老师.webp",
    b: "华中农大硕士，深耕企业人才培养与输送，兼任多家商学院院长。现聚焦AI时代核心人才孵化，定向培养讲师、店长及AI部署工程师，打通培育、训练、输送全链路，助企业搭建可落地人才梯队，解决招人难、育人慢、留不住。",
    lv: "low",
    isNew: true,
  },
  {
    slug: "wen-ni",
    n: "温妮",
    s: "NO.020",
    r: "女性健康品牌创始人",
    f: "素材/照片/NO020_温妮.webp",
    b: "女性健康品牌创始人，大湾区女性健康战略顾问。深耕私密护理与成人健康精品，融合AI仿生交互科技，研发生产硅胶娃娃，拓展国际贸易。以卓越品质、服务至上为理念，推动产业智能化、品牌化，让中国智造走向世界。",
    lv: "low",
    isNew: true,
  },
  {
    slug: "fan-qin-ming",
    n: "樊秦鸣",
    s: "NO.021",
    r: "商业顶层设计专家",
    f: "素材/照片/NO021_樊秦鸣.webp",
    b: "科技与咨询企业董事长、执行董事，商业顶层设计专家。曾策划世界小姐比赛、一带一路高峰论坛、世界科技拐点高峰论坛、香港慈善拍卖会。服务企业超100家，现聚焦AI数字经济转型，赋能平台、跨境、工厂、连锁等。",
    lv: "hi",
    isNew: true,
  },
  {
    slug: "huzi-laoshi",
    n: "胡子老师",
    s: "NO.022",
    r: "《AI指挥官》作者",
    f: "素材/照片/NO022_胡子老师.webp",
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
    m: ["郭瑞元", "张玉洁", "危杰棉", "温妮"],
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
    m: ["张成", "李海畅", "樊秦鸣"],
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

var PHOTO = {};
var AILV = {};
P.forEach(function (x) {
  PHOTO[x.n] = x.f;
  AILV[x.n] = x.lv;
});

/* ===== 结构化数据：联合出版人名录的 ItemList =====
   直接由 P 数组生成，保证「搜索引擎看到的名单」与「用户看到的照片墙」永远是同一份，
   以后增删席位不需要再回来改这段。 */
(function () {
  if (!document.querySelector('script[type="application/ld+json"]')) return;
  var el = document.createElement("script");
  el.type = "application/ld+json";
  el.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://www.ai-mmc.cn/#publishers",
    name: "《AI指挥官》联合出版人名录",
    description: "20位产业一线联合出版人，覆盖9个行业群体。",
    inLanguage: "zh-CN",
    numberOfItems: P.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: P.map(function (p, i) {
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Person",
          name: p.n,
          jobTitle: p.r,
          description: p.b,
          image: "https://www.ai-mmc.cn/" + p.f,
        },
      };
    }),
  });
  document.head.appendChild(el);
})();

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

/* ---------- 照片缺失降级 ----------
   有几张照片刻意不随仓库分发（见 .gitignore 与 tools/check-data.js 的 OPTIONAL_ASSETS）。
   线上取不到时不能给用户看浏览器自带的破图标：
   改为渲染「姓氏首字 + 深蓝底」的占位卡，名录依然完整可读。 */
var initialsOf = function (name) {
  /* 中文取姓氏首字；英文名取首字母（长度 1~2） */
  var m = /^([\u4e00-\u9fa5])/.exec(name);
  if (m) return m[1];
  return name.slice(0, 2).toUpperCase();
};
Array.prototype.forEach.call(
  document.querySelectorAll(".rc-photo"),
  function (img) {
    img.addEventListener(
      "error",
      function () {
        var ph = document.createElement("span");
        ph.className = "rc-photo-fallback";
        ph.textContent = initialsOf(img.alt || "");
        ph.setAttribute("aria-hidden", "true");
        if (img.parentNode) img.parentNode.insertBefore(ph, img);
        img.style.display = "none";
      },
      { once: true },
    );
  },
);

/* ===== 个人主页链接 ===== */
/* 页面文件由 tools/gen-member-pages.py 从 P 数组批量生成，命名为
   member-<slug>.html，放在站点根目录（shared.js 的导航按与根同级写相对路径，
   放子目录会导致全站链接失效）。

   这里不硬编码 slug 列表，而是直接从 P 数组取 —— 单一数据源，
   不会出现「名录加了人、主页链接却没跟上」的漂移。 */
/* 个人页是否可显示入口。
   这里刻意不做运行时探测（曾经用 fetch HEAD 逐个探测 22 个页面，代价高且脆弱：
   一是每个新会话首次打开首页就要发 22 个请求，白耗带宽、拖慢首屏；
   二是 Promise.all 一票否决 —— 只要有一个人页缺失，全部 22 个入口一起消失）。

   改为「直接用已生成的有效链接」：
     · 页面由 tools/gen-member-pages.py 从 P 数组批量生成，天然与名录一一对应；
     · 缺页在部署前就被 tools/check-data.js 拦住（member-*.html 的素材引用、
       canonical、姓名一致性都在校验范围内），不会漏到线上；
     · 因此运行时无需再判断，直接给链接即可。

   保留一层极轻的兜底：仅检查 slug 是否存在。名单里若有人没填 slug，
   那一条就不给入口—— 属于数据问题，应当在 check-data 阶段报错，而不是
   在页面上静默隐藏。 */
function memberPageOf(p) {
  if (!p || !p.slug) return "";
  return "member-" + p.slug + ".html";
}
function hasMemberPage(p) {
  return !!memberPageOf(p);
}

/* ===== 弹窗 ===== */
function openM(i) {
  var p = P[i];
  var mPhoto = document.getElementById("mPhoto");
  /* 先复位上一次的状态，否则从「占位态」再开另一位时图片不会重新加载 */
  mPhoto.style.display = "";
  var old = document.querySelector(".m-photo-fallback");
  if (old && old.parentNode) old.parentNode.removeChild(old);
  mPhoto.src = p.f;
  document.getElementById("mName").textContent = p.n;
  document.getElementById("mRole").textContent = p.r;
  document.getElementById("mSeat").textContent =
    "席位 " + p.s + " ｜ CO-PUBLISHER";
  document.getElementById("mBio").textContent = p.b;
  var mLink = document.getElementById("mLink");
  if (mLink) {
    if (hasMemberPage(p)) {
      mLink.href = memberPageOf(p);
      mLink.hidden = false;
    } else {
      mLink.hidden = true;
    }
  }
  document.getElementById("modal").classList.add("on");
}
function closeM() {
  document.getElementById("modal").classList.remove("on");
}
document.getElementById("modal").addEventListener("click", function (e) {
  if (e.target === this) closeM();
});
/* 弹窗大图同样走降级：作者本人的照片不随仓库分发，线上取不到时用首字占位 */
(function () {
  var mp = document.getElementById("mPhoto");
  if (!mp) return;
  mp.addEventListener(
    "error",
    function () {
      mp.style.display = "none";
      if (mp.parentNode.querySelector(".m-photo-fallback")) return;
      var ph = document.createElement("span");
      ph.className = "m-photo-fallback";
      ph.textContent = initialsOf(
        document.getElementById("mName").textContent || "",
      );
      ph.setAttribute("aria-hidden", "true");
      mp.parentNode.insertBefore(ph, mp);
    },
    { once: false },
  );
})();
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
  var topnav = document.querySelector(".topnav");
  /* 导航实际高度：窄窗口下导航换行会变高（52px → 逾百像素），
     锚点让位与高亮参考线都按实际高度取值，写死会让标题藏到导航后面 */
  function navH() {
    return topnav ? topnav.offsetHeight : 52;
  }
  function scrollLinkIntoView(l) {
    if (Date.now() < navLockUntil) return;
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
  /* 点击标签时把它平滑滚到可视区中部（"翻书"动效）：
     点右侧看不见的标签时，后面的标签滑出来，前面的标签向左滑进品牌区下面；
     点本就在中部的标签位移极小甚至为零，不会无谓乱动。
     scrollBy 超出可滚范围会被浏览器自动钳制，首尾标签天然安全。 */
  var navLockUntil = 0;
  function centerNavLink(l) {
    if (!navLinks || !l.offsetParent) return;
    var lr = l.getBoundingClientRect();
    var nr = navLinks.getBoundingClientRect();
    var delta = lr.left + lr.width / 2 - (nr.left + nr.width / 2);
    if (Math.abs(delta) >= 8) {
      navLinks.scrollBy({ left: delta, behavior: "smooth" });
    }
    /* 关键：页面平滑滚向目标区块的途中 spy 会连环切换高亮，
       每次切换都触发 scrollLinkIntoView，把导航条来回反拽
       （实测会先拉回最左再推到最右）。点击后冻结 1.5s，
       让居中动效独占导航条；期间手动滚轮不受影响。 */
    navLockUntil = Date.now() + 1500;
  }
  links.forEach(function (l) {
    l.addEventListener("click", function (e) {
      var el = document.querySelector(this.getAttribute("href"));
      if (!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.pageYOffset - navH() - 12;
      window.scrollTo({ top: y < 0 ? 0 : y, behavior: "smooth" });
      links.forEach(function (x) {
        x.classList.remove("active");
      });
      this.classList.add("active");
      /* 窄屏：把被点击项平滑滚到中部，带出后面的标签、收起前面的标签 */
      centerNavLink(this);
    });
  });
  /* 滚动侦测高亮切换时，同步让高亮项可见 */
  function spy() {
    var y = window.pageYOffset + navH() + 30;
    /* 取「已滚过参考线」的区块中物理位置最深的一个，不依赖链接的 DOM 顺序 */
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

/* ===== 全站弹窗频控（广告弹窗与海报弹窗共用一套计数）=====
   原来的问题是两套机制各弹各的：广告每 3 分钟一次、海报每 30 分钟一次，
   一次下午的阅读会被打断 40 次以上。而且都没记住「用户已经关过几次」。

   现在的规则（集中在这一处，改这里就够）：
     - 用 sessionStorage 记住本次会话已弹次数上限 3 次；
     - 用户手动关闭过弹窗后，不再自动弹（主动关 = 明确不接受）；
     - 广告与海报共享同一份额度，不叠加。*/
var POPUP_CTRL = (function () {
  var KEY = "__aiPopupState";
  var MAX_PER_SESSION = 3;
  var state = { shown: 0, dismissed: false };
  try {
    var raw = sessionStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch (e) {
    /* 隐私模式下 sessionStorage 不可用，退化为「本次页面有效」 */
  }
  function save() {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* 存不了就不存，仅影响跨页面记忆 */
    }
  }
  return {
    /** 是否还允许再弹一次 */
    canShow: function () {
      return !state.dismissed && state.shown < MAX_PER_SESSION;
    },
    /** 占用一次额度 */
    consume: function () {
      state.shown += 1;
      save();
    },
    /** 用户主动关闭：本次会话不再打扰 */
    markDismissed: function () {
      state.dismissed = true;
      save();
    },
  };
})();

/* ===== 广告弹窗：书本式出版人轮播 · 3 秒后缩飞进「AI 大礼包」 ===== */
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
  /* 宣传弹窗里的个人主页入口。与手动详情弹窗（#mLink）是两个组件，
     但取数与生成逻辑完全一致，都走 memberPageOf()。 */
  var adProfile = document.getElementById("adProfile");

  /* 本次打开页面随机选一位起始出版人，之后按席位顺序 1→20 轮下去；刷新页面重新随机 */
  var idx = Math.floor(Math.random() * P.length);
  /* 定时器句柄前置声明：showAd 里的 clearInterval(adTimer) 会用到它 */
  var adTimer = null;

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
    /* 额度已用尽或用户已明确关闭过 → 不再打扰 */
    if (!POPUP_CTRL.canShow()) {
      clearInterval(adTimer);
      return;
    }
    var p = P[idx];
    if (adAvatar) {
      adAvatar.src = p.f;
      adAvatar.alt = p.n;
    }
    if (adPName) adPName.textContent = p.n;
    if (adPSeat) adPSeat.textContent = p.s + " · 联合出版人";
    if (adPRole) adPRole.textContent = p.r;
    /* 同步个人主页链接。注意：idx 在本函数末尾才递增，
       所以此处取的是「即将展示的那位」—— idx 的上一个值，
       不能直接用 idx，否则按钮会指向上一个人。 */
    if (adProfile) {
      if (hasMemberPage(p)) {
        adProfile.href = memberPageOf(p);
        adProfile.hidden = false;
      } else {
        adProfile.hidden = true;
      }
    }
    adModal.classList.add("on");
    POPUP_CTRL.consume();
    /* 下一次弹窗换下一位，到 NO.020 后回到 NO.001 */
    idx = (idx + 1) % P.length;
    /* 3 秒后自动退场，缩飞进「AI 大礼包」 */
    setTimeout(closeAd, 3000);
  }

  /* 打开页面不立即弹出（首次弹出已按需求去掉），之后每 8 分钟弹一次。
     间隔从 3 分钟拉到 8 分钟：一次长阅读的打扰次数降到原来的四分之一，
     而导航「AI 大礼包」与各页 data-open-qr 按钮始终在位，转化入口并未减少。 */
  adTimer = setInterval(showAd, 480000);

  /* 点击广告：按钮「共建 AI 生态」→ 弹出 AI 大礼包二维码（广告同时退场）；
     点其它任何位置 → 按原方式退场（缩飞进「AI 大礼包」）。
     用户主动点掉弹窗，视为「这类弹窗我不需要」，本次会话不再自动出现。 */
  adModal.addEventListener("click", function (e) {
    if (e.target === adCta && qrLayer) {
      qrLayer.classList.add("on");
    }
    /* 点「查看个人主页」是在接受内容，不是拒绝弹窗。
       若在此标记 dismissed，用户点一次主页后本次会话就再也看不到宣传了 ——
       那属于误伤。放行即可，跳页后本次会话自然结束。 */
    if (e.target.closest && e.target.closest("#adProfile")) {
      return;
    }
    POPUP_CTRL.markDismissed();
    closeAd();
  });

  /* 导航「AI 大礼包」与 data-open-qr 元素的绑定已抽到 shared.js（全站共享层），此处不再重复绑定 */
})();

/* ===== 国庆海报弹窗（已过截止日，当前不弹；保留代码与图片待复用）=====
   再次启用只需改下面这个 END 日期。启用后自动接入 POPUP_CTRL 全局频控，
   不会与广告弹窗叠加打扰用户。 */
(function () {
  var posterModal = document.getElementById("posterModal");
  if (!posterModal) return;

  /* 时间窗口：2026-10-10 23:59:59 之后不再弹出 */
  var END = new Date(2026, 9, 10, 23, 59, 59);
  if (new Date() > END) return;
  /* 额度已用尽（如：先看了模型页、又被广告弹窗占用）→ 不弹 */
  if (typeof POPUP_CTRL !== "undefined" && !POPUP_CTRL.canShow()) return;

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
    if (typeof POPUP_CTRL !== "undefined") {
      if (!POPUP_CTRL.canShow()) return;
      POPUP_CTRL.consume();
    }
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
  closeBtn.addEventListener("click", function () {
    if (typeof POPUP_CTRL !== "undefined") POPUP_CTRL.markDismissed();
    hide();
  });
  /* 点击海报以外的遮罩区域关闭 */
  posterModal.addEventListener("click", function (e) {
    if (e.target === posterModal) {
      if (typeof POPUP_CTRL !== "undefined") POPUP_CTRL.markDismissed();
      hide();
    }
  });

  /* 打开页面立即弹出一次，之后每 30 分钟再弹一次。
     例外：从其他页面点「四级荣誉」「关于本书」等锚点进来时，网址会带 #（如
     index.html#sec-honor），那属于「跳到首页的某一段」，不是「打开首页」，
     此时不弹——否则刚跳过去就被海报盖住，看不到想看的那一段。
     但「刷新」要照常弹：刷新带 # 的地址时 hash 仍在，故用导航类型把它区分开
     （reload = 刷新，navigate = 点链接跳转）。 */
  var navEntry = performance.getEntriesByType
    ? performance.getEntriesByType("navigation")[0]
    : null;
  var navType = navEntry ? navEntry.type : "";
  var isAnchorJump =
    location.hash && location.hash !== "#" && navType !== "reload";
  if (!isAnchorJump) show();
  /* 30 分钟一次；额度用尽时 show() 自行跳过并停掉本定时器 */
  var posterTimer = setInterval(function () {
    if (typeof POPUP_CTRL !== "undefined" && !POPUP_CTRL.canShow()) {
      clearInterval(posterTimer);
      return;
    }
    show();
  }, 1800000);
})();
})();
