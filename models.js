/* 《AI指挥官》模型页脚本（models.js）
   整个文件包在 IIFE（立即执行函数 Immediately Invoked Function Expression）里，
   收敛 DIMS / MODELS / FAMILY_LABEL / selectedModels 等全局变量。 */
(function () {
/* ===== 维度配置 ===== */
var DIMS = [
  { key: "reasoning", label: "推理", en: "Reasoning" },
  { key: "writing", label: "写作", en: "Writing" },
  { key: "coding", label: "编程", en: "Coding" },
  { key: "image", label: "图像", en: "Image" },
  { key: "video", label: "视频", en: "Video" },
];

/* ===== 雷达图颜色循环（6 色 · 深色底增强）===== */
var RADAR_COLORS = [
  { stroke: "#00edbd", fill: "rgba(0, 237, 189, 0.22)" },
  { stroke: "#5aa7e0", fill: "rgba(90, 167, 224, 0.22)" },
  { stroke: "#b388ff", fill: "rgba(179, 136, 255, 0.22)" },
  { stroke: "#ff6b8a", fill: "rgba(255, 107, 138, 0.22)" },
  { stroke: "#ffd166", fill: "rgba(255, 209, 102, 0.22)" },
  { stroke: "#6effc9", fill: "rgba(110, 255, 201, 0.22)" },
];

/* ===== 模型数据 ===== */
var MODELS = [
  // —— 字节 / Seed ——
  {
    id: "seed-evolving", name: "Seed-Evolving", family: "ByteDance",
    group: "限时活动", tags: ["限时1折"],
    reasoning: 9.0, writing: 8.0, coding: 8.5, image: null, video: null,
    agent: 8.5, multimodal: null, longctx: 7.0,
    discount: 0.08, discountTag: "限时1折",
    star: false, composite: 8.5, positioning: "推理专精型",
  },
  {
    id: "seed-pro", name: "Seed-2.1-Pro-0915", family: "ByteDance",
    group: "限时活动", tags: ["限时1折"],
    reasoning: 8.5, writing: 8.5, coding: 8.0, image: 7.0, video: 6.5,
    agent: 8.0, multimodal: 7.5, longctx: 7.5,
    discount: 0.08, discountTag: "限时1折",
    star: false, composite: 7.7, positioning: "全能旗舰型",
  },
  {
    id: "seed-turbo", name: "Seed-2.1-Turbo", family: "ByteDance",
    group: "限时活动", tags: ["专属补贴"],
    reasoning: 7.5, writing: 7.5, coding: 7.0, image: 6.5, video: 6.0,
    agent: 7.0, multimodal: 6.5, longctx: 6.5,
    discount: 0.20, discountTag: "专属补贴",
    star: false, composite: 6.9, positioning: "高速均衡型",
  },
  {
    id: "seed-code", name: "Seed-Code", family: "ByteDance",
    group: "限时活动", tags: ["专属补贴"],
    reasoning: 7.0, writing: 6.0, coding: 9.5, image: null, video: null,
    agent: 8.0, multimodal: null, longctx: 7.0,
    discount: 0.06, discountTag: "专属补贴",
    star: false, composite: 7.5, positioning: "编程专精型",
  },

  // —— DeepSeek ——
  {
    id: "ds-v4-flash", name: "DeepSeek-V4-Flash", family: "DeepSeek",
    group: "限时活动", tags: [],
    reasoning: 7.0, writing: 7.0, coding: 7.5, image: null, video: null,
    agent: 7.0, multimodal: null, longctx: 6.5,
    discount: 0.06, discountTag: "",
    star: false, composite: 7.2, positioning: "高速均衡型",
  },
  {
    id: "ds-v4-pro", name: "DeepSeek-V4-Pro", family: "DeepSeek",
    group: "常规", tags: ["闲时折扣"],
    reasoning: 9.0, writing: 8.5, coding: 9.0, image: null, video: null,
    agent: 9.0, multimodal: null, longctx: 7.5,
    discount: 0.36, discountTag: "闲时折扣",
    star: false, composite: 8.8, positioning: "推理+编程旗舰",
  },

  // —— 智谱 / GLM ——
  {
    id: "glm-53-flashx", name: "GLM-5.3-FlashX", family: "Zhipu",
    group: "限时活动", tags: [],
    reasoning: 6.5, writing: 7.0, coding: 6.0, image: 5.0, video: null,
    agent: 6.5, multimodal: 5.5, longctx: 6.0,
    discount: 0.31, discountTag: "",
    star: false, composite: 6.1, positioning: "轻量快速型",
  },
  {
    id: "glm-53-flashi", name: "GLM-5.3-FlashI", family: "Zhipu",
    group: "限时活动", tags: [],
    reasoning: 6.5, writing: 7.0, coding: 6.0, image: 5.0, video: null,
    agent: 6.5, multimodal: 5.5, longctx: 6.0,
    discount: 0.06, discountTag: "",
    star: false, composite: 6.1, positioning: "轻量快速型",
  },
  {
    id: "glm-53", name: "GLM-5.3", family: "Zhipu",
    group: "限时活动", tags: ["会员5折"],
    reasoning: 8.0, writing: 8.5, coding: 7.5, image: 6.0, video: 5.5,
    agent: 7.5, multimodal: 7.0, longctx: 8.0,
    discount: 0.78, discountTag: "会员5折",
    star: false, composite: 7.1, positioning: "全能旗舰型",
  },
  {
    id: "glm-52", name: "GLM-5.2", family: "Zhipu",
    group: "限时活动", tags: ["会员5折"],
    reasoning: 7.5, writing: 8.0, coding: 7.0, image: 5.5, video: 5.0,
    agent: 7.0, multimodal: 6.5, longctx: 7.5,
    discount: 0.78, discountTag: "会员5折",
    star: false, composite: 6.6, positioning: "全能主力型",
  },

  // —— Kimi / Moonshot ——
  {
    id: "kimi-k3", name: "Kimi-K3", family: "Kimi",
    group: "常规", tags: ["闲时折扣"],
    reasoning: 8.5, writing: 9.0, coding: 7.5, image: 6.0, video: 6.0,
    agent: 7.5, multimodal: 6.5, longctx: 9.5,
    discount: 1.83, discountTag: "闲时折扣",
    star: false, composite: 7.4, positioning: "长文本+写作旗舰",
  },
  {
    id: "kimi-k28", name: "Kimi-K2.8-Preview", family: "Kimi",
    group: "常规", tags: [],
    reasoning: 7.5, writing: 8.0, coding: 6.5, image: 5.5, video: 5.5,
    agent: 7.0, multimodal: 6.0, longctx: 9.0,
    discount: 0.98, discountTag: "",
    star: true, composite: 6.6, positioning: "预览版待确认",
  },

  // —— 千问 / Qwen ——
  {
    id: "qwen-38-flash", name: "Qwen3.8-Flash", family: "Qwen",
    group: "常规", tags: [],
    reasoning: 7.0, writing: 7.5, coding: 7.0, image: 5.5, video: null,
    agent: 7.0, multimodal: 6.0, longctx: 6.5,
    discount: 0.08, discountTag: "",
    star: false, composite: 6.6, positioning: "高速均衡型",
  },
  {
    id: "qwen-38-max", name: "Qwen3.8-Max", family: "Qwen",
    group: "常规", tags: [],
    reasoning: 9.0, writing: 8.5, coding: 8.5, image: 7.0, video: 6.5,
    agent: 8.5, multimodal: 8.0, longctx: 8.5,
    discount: 1.50, discountTag: "",
    star: false, composite: 7.9, positioning: "全能旗舰型",
  },
  {
    id: "qwen-37-plus", name: "Qwen3.7-Plus", family: "Qwen",
    group: "常规", tags: [],
    reasoning: 8.0, writing: 8.0, coding: 7.5, image: 6.5, video: 6.0,
    agent: 7.5, multimodal: 7.0, longctx: 8.5,
    discount: 0.25, discountTag: "",
    star: false, composite: 7.2, positioning: "全能增强型",
  },

  // —— 其他 ——
  {
    id: "step-5", name: "Step-5-Preview", family: "StepFun",
    group: "限时活动", tags: [],
    reasoning: 8.0, writing: 7.5, coding: 7.5, image: null, video: null,
    agent: 8.0, multimodal: null, longctx: 7.0,
    discount: 0.48, discountTag: "",
    star: true, composite: 7.7, positioning: "待确认",
  },
  {
    id: "minimax-m3", name: "MiniMax-M3", family: "MiniMax",
    group: "常规", tags: [],
    reasoning: 7.5, writing: 8.0, coding: 6.5, image: 8.0, video: 7.5,
    agent: 7.0, multimodal: 9.0, longctx: 7.0,
    discount: 0.26, discountTag: "",
    star: false, composite: 7.5, positioning: "多模态全能型",
  },
];

/* ===== 厂商分组显示名 ===== */
var FAMILY_LABEL = {
  ByteDance: "字节 Seed",
  DeepSeek:  "DeepSeek",
  Zhipu:     "智谱 GLM",
  Kimi:      "Kimi",
  Qwen:      "千问 Qwen",
  StepFun:   "阶跃 Step",
  MiniMax:   "MiniMax",
};
var FAMILY_ORDER = ["ByteDance", "DeepSeek", "Zhipu", "Kimi", "Qwen", "StepFun", "MiniMax"];

/* ===== 折扣 -> tier ===== */
function discountTier(d) {
  if (d == null || isNaN(d)) return 0;
  if (d < 0.10) return 5;
  if (d < 0.30) return 4;
  if (d < 0.60) return 3;
  if (d < 1.00) return 2;
  return 1; // > 1.00
}
function tierLabel(t) {
  return { 5: "极致划算", 4: "高性价比", 3: "中度折扣", 2: "常规", 1: "闲时涨价", 0: "无数据" }[t] || "";
}

/* ===== Hero 区 KPI ===== */
(function () {
  var best = MODELS.reduce(function (a, b) { return b.composite > a.composite ? b : a; }, MODELS[0]);
  var cm = document.getElementById("mhModelCount");
  var cb = document.getElementById("mhBestModel");
  if (cm) cm.textContent = MODELS.length;
  if (cb) cb.textContent = best.name;
})();

/* ===== 1. 折扣热力卡 ===== */
(function () {
  var grid = document.getElementById("discountGrid");
  if (!grid) return;
  MODELS.forEach(function (m) {
    var t = discountTier(m.discount);
    var div = document.createElement("div");
    div.className = "dc-card dc-tier-" + t;
    var valText = m.discount != null ? m.discount.toFixed(2) + "x" : "—";
    div.innerHTML =
      '<div class="dc-head">' +
        '<span class="dc-name">' + m.name + (m.star ? ' <span style="color:#d0021b;font-size:10px">*</span>' : "") + '</span>' +
        (m.discountTag ? '<span class="dc-badge">' + m.discountTag + '</span>' : '') +
      '</div>' +
      '<div class="dc-val">' + valText + '</div>' +
      '<div class="dc-tag">' + tierLabel(t) + ' · ' + m.group + '</div>';
    grid.appendChild(div);
  });
})();

/* ===== 2. 模型选择：厂商分组下拉 ===== */
var selectedModels = []; // 选中的 model id
(function () {
  var sel = document.getElementById("modelSelector");
  if (!sel) return;

  // 默认选中综合最强的 4 个
  var sorted = MODELS.slice().sort(function (a, b) { return b.composite - a.composite; });
  selectedModels = sorted.slice(0, 4).map(function (m) { return m.id; });

  // 按厂商分组
  var byFamily = {};
  MODELS.forEach(function (m) {
    if (!byFamily[m.family]) byFamily[m.family] = [];
    byFamily[m.family].push(m);
  });

  // 每个厂商一个 dropdown
  FAMILY_ORDER.forEach(function (fam) {
    var models = byFamily[fam];
    if (!models || !models.length) return;

    var box = document.createElement("div");
    box.className = "fam-dd";
    /* 打上厂商标记：下拉同步时直接按厂商遍历，不必再反查内部首个模型 id */
    box.dataset.fam = fam;

    var label = FAMILY_LABEL[fam] || fam;
    var activeCount = models.filter(function (m) { return selectedModels.indexOf(m.id) >= 0; }).length;

    box.innerHTML =
      '<button class="fam-dd-toggle">' +
        '<span class="fam-label">' + label + '</span>' +
        '<span class="fam-count">' + (activeCount > 0 ? activeCount : "") + '</span>' +
        '<span class="fam-arrow">▾</span>' +
      '</button>' +
      '<div class="fam-dd-menu">' +
        models.map(function (m) {
          var on = selectedModels.indexOf(m.id) >= 0;
          return '<label class="fam-item' + (on ? " on" : "") + '">' +
            '<input type="checkbox"' + (on ? " checked" : "") + ' data-id="' + m.id + '">' +
            '<span class="fam-name">' + m.name + (m.star ? " *" : "") + '</span>' +
            '<span class="fam-val">' + m.composite.toFixed(1) + '</span>' +
          '</label>';
        }).join("") +
      '</div>';

    sel.appendChild(box);
  });

  // ✅ 末尾追加：厂商批量选择（二级·顶级）
  {
    var box = document.createElement("div");
    box.className = "fam-dd fam-bulk";
    box.innerHTML =
      '<button class="fam-dd-toggle">' +
        '<span class="fam-label">模型库</span>' +
        '<span class="fam-arrow">▾</span>' +
      '</button>' +
      '<div class="fam-dd-menu">' +
        FAMILY_ORDER.map(function (fam) {
          var models = byFamily[fam] || [];
          var label = FAMILY_LABEL[fam] || fam;
          return '<label class="fam-item fam-bulk-fam" data-fam="' + fam + '">' +
              '<input type="checkbox" data-fam="' + fam + '">' +
              '<span class="fam-name">' + label + '</span>' +
              '<span class="fam-score">' + models.length + ' 个模型</span>' +
            '</label>';
        }).join("") +
      '</div>';
    sel.appendChild(box);
  }

  // ✅ 菜单内部任何点击都不冒泡到 document（保护当前展开状态）
  sel.addEventListener("click", function (e) {
    if (e.target.closest(".fam-dd-menu")) e.stopPropagation();
  });

  // 点击 toggle 展开/收起
  sel.querySelectorAll(".fam-dd-toggle").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      sel.querySelectorAll(".fam-dd.open").forEach(function (d) {
        if (d !== btn.parentElement) d.classList.remove("open");
      });
      btn.parentElement.classList.toggle("open");
    });
  });

  // 点击 checkbox 切换选中
  sel.addEventListener("change", function (e) {
    var cb = e.target;
    if (cb.tagName !== "INPUT" || cb.type !== "checkbox") return;
    // 批量下拉的厂商 checkbox 只有 data-fam、没有 data-id，交给下方专用处理器处理
    if (cb.dataset.fam) return;
    var id = cb.dataset.id;
    if (cb.checked) {
      if (selectedModels.indexOf(id) < 0) selectedModels.push(id);
    } else {
      var i = selectedModels.indexOf(id);
      if (i >= 0 && selectedModels.length > 1) selectedModels.splice(i, 1);
      else if (selectedModels.length <= 1) { cb.checked = true; return; } // 至少保留 1 个
    }
    // 更新 count badge
    var famDD = cb.closest(".fam-dd");
    var box = famDD.querySelector(".fam-dd-menu");
    var cnt = box.querySelectorAll('input[type="checkbox"]:checked').length;
    var cntEl = famDD.querySelector(".fam-count");
    if (cntEl) cntEl.textContent = cnt > 0 ? cnt : "";
    var item = cb.closest(".fam-item");
    if (item) item.classList.toggle("on", cb.checked);
    drawRadar();
    drawRadarLegend();
  });

  // ✅ 模型库下拉：控制厂商胶囊的显示 / 隐藏
  //    勾选 = 显示该厂商 + 恢复它上次隐藏前选中的模型（从未选过则默认第一个）
  //    取消 = 隐藏胶囊 + 该厂商已选中的模型退出对比（先记住，供恢复）
  var famMemory = {}; // fam -> 该厂商被隐藏前选中的模型 id 列表
  sel.addEventListener("change", function (e) {
    var cb = e.target;
    if (cb.tagName !== "INPUT" || cb.type !== "checkbox") return;
    var fam = cb.dataset.fam;
    if (!fam) return;

    var dd = sel.querySelector('.fam-dd[data-fam="' + fam + '"]');

    // 至少保留 1 个厂商可见，否则按钮行会被清空、无法再操作
    if (!cb.checked && dd) {
      var shownCount = sel.querySelectorAll(".fam-dd:not(.fam-bulk):not(.fam-hidden)").length;
      if (shownCount <= 1) { cb.checked = true; return; }
    }

    if (cb.checked) {
      if (dd) dd.classList.remove("fam-hidden");
      // 恢复上次隐藏前选中的模型；从未隐藏过 / 当时没选任何模型 → 默认选第一个
      var prev = famMemory[fam];
      if (prev && prev.length) {
        prev.forEach(function (id) {
          if (selectedModels.indexOf(id) < 0) selectedModels.push(id);
        });
      } else {
        var first = MODELS.filter(function (m) { return m.family === fam; })[0];
        if (first && selectedModels.indexOf(first.id) < 0) selectedModels.push(first.id);
      }
    } else {
      // 先记住当前选中的该厂商模型，重新勾选时原样恢复
      famMemory[fam] = MODELS.filter(function (m) {
        return m.family === fam && selectedModels.indexOf(m.id) >= 0;
      }).map(function (m) { return m.id; });
      // 数据取消：该厂商已选中的模型一并移出对比（至少保留 1 个模型，雷达图不会完全空白）
      MODELS.filter(function (m) { return m.family === fam; }).forEach(function (m) {
        var i = selectedModels.indexOf(m.id);
        if (i >= 0 && selectedModels.length > 1) selectedModels.splice(i, 1);
      });
      if (dd) dd.classList.add("fam-hidden");
    }
    syncAllDropdowns();
  });

  // 同步：所有厂商 dropdown 的 checkbox + count badge + 批量下拉的厂商勾选状态
  function syncAllDropdowns() {
    // 1) 每个厂商菜单内部：checkbox 勾选 + count badge
    sel.querySelectorAll(".fam-dd:not(.fam-bulk)").forEach(function (dd) {
      dd.querySelectorAll('input[type="checkbox"][data-id]').forEach(function (cb) {
        cb.checked = selectedModels.indexOf(cb.dataset.id) >= 0;
        cb.closest(".fam-item").classList.toggle("on", cb.checked);
      });
      var cnt = dd.querySelectorAll('.fam-item input[type="checkbox"]:checked').length;
      var badge = dd.querySelector(".fam-count");
      if (badge) badge.textContent = cnt > 0 ? cnt : "";
    });
    // 2) 批量下拉：厂商 checkbox 的勾选状态 = 该厂商胶囊当前是否显示
    var bulkMenu = sel.querySelector(".fam-bulk .fam-dd-menu");
    if (bulkMenu) {
      bulkMenu.querySelectorAll('input[type="checkbox"][data-fam]').forEach(function (cb) {
        var dd = sel.querySelector('.fam-dd[data-fam="' + cb.dataset.fam + '"]');
        cb.checked = !!dd && !dd.classList.contains("fam-hidden");
      });
    }
    drawRadar();
    drawRadarLegend();
  }

  // 点击外部关闭
  document.addEventListener("click", function () {
    sel.querySelectorAll(".fam-dd.open").forEach(function (d) { d.classList.remove("open"); });
  });

  // 初始同步一次：让批量下拉的勾选状态与厂商胶囊的可见状态保持一致
  syncAllDropdowns();
})();

/* ===== 3. 雷达图 Canvas 绘制（深色科技风）===== */
function drawRadar() {
  var canvas = document.getElementById("radarCanvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var W = canvas.width, H = canvas.height;
  var cx = W / 2, cy = H / 2;
  var R = Math.min(cx, cy) - 70;

  // 背景直接画深蓝
  ctx.fillStyle = "#0a1226";
  ctx.fillRect(0, 0, W, H);

  // ① 中心光晕（青色辉光）
  var bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.3);
  bgGrad.addColorStop(0, "rgba(0, 237, 189, 0.10)");
  bgGrad.addColorStop(0.4, "rgba(0, 237, 189, 0.03)");
  bgGrad.addColorStop(1, "rgba(0, 237, 189, 0)");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ② 同心六边形
  var gridSteps = [2, 4, 6, 8, 10];
  gridSteps.forEach(function (s) {
    var r = R * s / 10;
    ctx.beginPath();
    DIMS.forEach(function (d, i) {
      var angle = -Math.PI / 2 + (2 * Math.PI / DIMS.length) * i;
      var x = cx + Math.cos(angle) * r;
      var y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    if (s === 10) {
      ctx.strokeStyle = "rgba(0, 237, 189, 0.70)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#00edbd";
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(0, 237, 189, 0.05)";
      ctx.fill();
    } else {
      ctx.strokeStyle = "rgba(0, 237, 189, 0.18)";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  });

  // ③ 坐标轴（渐变）+ 顶点小点
  DIMS.forEach(function (d, i) {
    var angle = -Math.PI / 2 + (2 * Math.PI / DIMS.length) * i;
    var xEnd = cx + Math.cos(angle) * R;
    var yEnd = cy + Math.sin(angle) * R;
    var axGrad = ctx.createLinearGradient(cx, cy, xEnd, yEnd);
    axGrad.addColorStop(0, "rgba(0, 237, 189, 0.05)");
    axGrad.addColorStop(1, "rgba(0, 237, 189, 0.45)");
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(xEnd, yEnd);
    ctx.strokeStyle = axGrad;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(xEnd, yEnd, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#00edbd";
    ctx.shadowColor = "#00edbd";
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // ④ 刻度数字（青色）
  gridSteps.forEach(function (s) {
    var r = R * s / 10;
    ctx.font = "9px Consolas, monospace";
    ctx.fillStyle = "rgba(0, 237, 189, 0.45)";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(s.toString(), cx - 5, cy - r);
  });

  // ⑤ 顶点标签（白色中文 + 青色英文）
  DIMS.forEach(function (d, i) {
    var angle = -Math.PI / 2 + (2 * Math.PI / DIMS.length) * i;
    var labelR = R + 36;
    var lx = cx + Math.cos(angle) * labelR;
    var ly = cy + Math.sin(angle) * labelR;
    ctx.font = "bold 14px -apple-system, 'Microsoft YaHei', sans-serif";
    ctx.fillStyle = "#e8f4f0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(d.label, lx, ly);
    ctx.font = "10px Consolas, monospace";
    ctx.fillStyle = "rgba(0, 237, 189, 0.55)";
    ctx.fillText(d.en, lx, ly + 16);
  });

  // ⑥ 数据多边形（发光描边 + 半透明深底填充）
  selectedModels.forEach(function (id, idx) {
    var m = MODELS.find(function (x) { return x.id === id; });
    if (!m) return;
    var color = RADAR_COLORS[idx % RADAR_COLORS.length];
    var points = [];
    DIMS.forEach(function (d, i) {
      var v = m[d.key];
      if (v == null) return;
      var angle = -Math.PI / 2 + (2 * Math.PI / DIMS.length) * i;
      var r = R * Math.max(0, Math.min(10, v)) / 10;
      points.push({ i: i, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    });
    if (points.length < 3) return;

    ctx.beginPath();
    var first = true;
    points.forEach(function (p) {
      if (first) { ctx.moveTo(p.x, p.y); first = false; }
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    // 深色底 + 对应色透明填充
    ctx.fillStyle = color.fill;
    ctx.fill();

    ctx.strokeStyle = color.stroke;
    ctx.lineWidth = 2;
    ctx.shadowColor = color.stroke;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 顶点点：深色圈 + 彩色实心
    points.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#0a1226";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.strokeStyle = color.stroke;
      ctx.lineWidth = 2;
      ctx.shadowColor = color.stroke;
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  });

  // ⑦ 中心点（发光青点 + 十字辅助线）
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#00edbd";
  ctx.shadowColor = "#00edbd";
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy); ctx.lineTo(cx + 12, cy);
  ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy + 12);
  ctx.strokeStyle = "rgba(0, 237, 189, 0.35)";
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

/* 找到某个模型在某个维度之前最近的有效维度索引（用于雷达图跳过 null 维度时的连线）——实际上上面简化处理已不需要 */
function findPrevValid(m, i) {
  for (var k = i - 1; k >= 0; k--) {
    if (m[DIMS[k].key] != null) return k;
  }
  return -1;
}

/* ===== 4. 雷达图右侧：详细数据面板 ===== */
function drawRadarLegend() {
  var box = document.getElementById("radarLegend");
  if (!box) return;

  if (!selectedModels.length) {
    box.innerHTML = '<div class="rl-empty">请在上方选择模型</div>';
    return;
  }

  var html = "";
  selectedModels.forEach(function (id, idx) {
    var m = MODELS.find(function (x) { return x.id === id; });
    if (!m) return;
    var c = RADAR_COLORS[idx % RADAR_COLORS.length];

    // 五维分数
    var dims = DIMS.map(function (d) {
      var v = m[d.key];
      var text = v != null ? v.toFixed(1) : "—";
      var naCls = v == null ? " rl-dim-na" : "";
      return '<div class="rl-dim' + naCls + '">' +
        '<span class="rl-dim-name">' + d.label + '</span>' +
        '<span class="rl-dim-val">' + text + '</span>' +
      '</div>';
    }).join("");

    html +=
      '<div class="rl-item">' +
        '<div class="rl-head">' +
          '<span class="rl-swatch" style="background:' + c.stroke + ';color:' + c.stroke + '"></span>' +
          '<span class="rl-name">' + m.name + (m.star ? ' <span class="rl-star">*</span>' : '') + '</span>' +
          '<span class="rl-score"><span class="rl-label">均分</span>' + m.composite.toFixed(1) + '</span>' +
        '</div>' +
        '<div class="rl-dims">' + dims + '</div>' +
      '</div>';
  });

  box.innerHTML = html;
}

/* ===== 右侧面板：滚动穿透拦截 ===== */
(function () {
  var box = document.getElementById("radarLegend");
  if (!box) return;
  box.addEventListener("wheel", function (e) {
    var canUp = box.scrollTop > 0;
    var canDown = box.scrollTop + box.clientHeight < box.scrollHeight - 1;
    if ((e.deltaY < 0 && !canUp) || (e.deltaY > 0 && !canDown)) {
      e.preventDefault();
    }
  }, { passive: false });
})();

/* ===== getTier：根据分数返回梯队 class ===== */
function getTier(v) {
  if (v == null) return "bc-na";
  if (v >= 8.5) return "tier-1";
  if (v >= 6.0) return "tier-2";
  if (v >= 4.0) return "tier-3";
  return "tier-4";
}

/* ===== 5. 条形对比渲染（Tab 切换当前维度）===== */
var currentDim = "reasoning";

function renderBarCompare() {
  var box = document.getElementById("barCompare");
  if (!box) return;

  var sorted;
  if (currentDim === "composite") {
    sorted = MODELS.slice().sort(function (a, b) { return b.composite - a.composite; });
  } else {
    sorted = MODELS.slice().sort(function (a, b) {
      var av = a[currentDim];
      var bv = b[currentDim];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return bv - av;
    });
  }

  var html = "";
  sorted.forEach(function (m) {
    var v = currentDim === "composite" ? m.composite : m[currentDim];
    var pct = v != null ? (v / 10 * 100).toFixed(1) + "%" : null;
    var tierCls = v != null ? getTier(v) : "bc-na";
    var starCls = m.star ? " has-star" : "";

    if (v == null) {
      html +=
        '<div class="bc-row">' +
          '<span class="bc-name">' + m.name + '</span>' +
          '<div class="bc-empty">不支持</div>' +
          '<span class="bc-val">—</span>' +
        '</div>';
    } else {
      html +=
        '<div class="bc-row ' + tierCls + '">' +
          '<span class="bc-name">' + m.name + '</span>' +
          '<div class="bc-track"><div class="bc-fill' + starCls + '" style="width:' + pct + '"></div></div>' +
          '<span class="bc-val">' + v.toFixed(1) + '</span>' +
        '</div>';
    }
  });
  box.innerHTML = html;
}

/* Tab 点击绑定 */
(function () {
  var tabs = document.querySelectorAll(".dim-tab");
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x) { x.classList.remove("active"); });
      t.classList.add("active");
      currentDim = t.dataset.dim;
      renderBarCompare();
    });
  });
})();

/* ===== 6. 用户推荐卡 ===== */
(function () {
  var RECS = [
    { icon: "🧮", title: "科研 / 数学工作者", need: "复杂推理、数学证明",
      main: "DeepSeek-V4-Pro", mainId: "ds-v4-pro",
      alts: ["Qwen3.8-Max", "Seed-Evolving"] },
    { icon: "💻", title: "程序员 / 开发者", need: "代码生成、调试、工程化",
      main: "Seed-Code", mainId: "seed-code",
      alts: ["DeepSeek-V4-Pro"] },
    { icon: "✍️", title: "内容创作者 / 作家", need: "长文写作、创意内容",
      main: "Kimi-K3", mainId: "kimi-k3",
      alts: ["GLM-5.3"] },
    { icon: "🎨", title: "多模态创作者", need: "图文视频一体化生产",
      main: "MiniMax-M3", mainId: "minimax-m3",
      alts: ["Qwen3.8-Max"] },
    { icon: "📝", title: "日常办公 / 学生", need: "摘要、改写、快速问答",
      main: "Qwen3.8-Flash", mainId: "qwen-38-flash",
      alts: ["DeepSeek-V4-Flash"] },
    { icon: "🏢", title: "企业全能需求", need: "推理+写作+编程均衡",
      main: "Qwen3.8-Max", mainId: "qwen-38-max",
      alts: ["Seed-2.1-Pro-0915"] },
  ];
  var box = document.getElementById("recommendGrid");
  if (!box) return;
  RECS.forEach(function (r) {
    var html =
      '<div class="rec-card">' +
        '<div class="rec-icon">' + r.icon + '</div>' +
        '<div class="rec-title">' + r.title + '</div>' +
        '<div class="rec-need">核心需求：' + r.need + '</div>' +
        '<div class="rec-pick"><span class="rec-pick-label">首选</span><span class="rec-pick-main">' + r.main + '</span></div>' +
        '<div class="rec-alt">备选：' + r.alts.join(" ／ ") + '</div>' +
      '</div>';
    box.innerHTML += html;
  });
})();

/* ===== 7. 成本效益卡 ===== */
(function () {
  var COSTS = [
    { color: "cc-green", top: "0.06x", bot: "编程神价",
      model: "Seed-Code", scene: "编程任务", why: "编程能力顶级（9.5 分），闲时折扣 0.06x，性价比无出其右。" },
    { color: "cc-green", top: "0.06x", bot: "极速日常",
      model: "DeepSeek-V4-Flash", scene: "日常问答 / 轻量编程", why: "速度快、成本极低，日常高频使用最佳选择。" },
    { color: "cc-blue", top: "0.08x", bot: "全能轻量",
      model: "Qwen3.8-Flash", scene: "日常办公 / 摘要改写", why: "全能均衡，五维无明显短板，闲时折扣 0.08x 成本极低。" },
    { color: "cc-orange", top: "0.26x", bot: "多模态超值",
      model: "MiniMax-M3", scene: "图文视频内容创作", why: "唯一同时支持图像+视频生成的全能型，0.26x 折扣划算。" },
    { color: "cc-purple", top: "0.25x", bot: "全能增强",
      model: "Qwen3.7-Plus", scene: "通用增强型需求", why: "均衡无短板，各维度均在第一/第二梯队，折扣力度合理。" },
    { color: "cc-blue", top: "0.08x", bot: "极速高速",
      model: "Seed-2.1-Turbo", scene: "高速均衡任务", why: "Turbo 版本响应速度快，适合高频轻量推理场景。" },
  ];
  var box = document.getElementById("costGrid");
  if (!box) return;
  COSTS.forEach(function (c) {
    var html =
      '<div class="cost-card">' +
        '<div class="cc-tag ' + c.color + '">' +
          '<div class="cc-top">' + c.top + '</div>' +
          '<div class="cc-bot">' + c.bot + '</div>' +
        '</div>' +
        '<div class="cc-body">' +
          '<div class="cc-model">' + c.model + '</div>' +
          '<div class="cc-scene">适用场景：' + c.scene + '</div>' +
          '<div class="cc-why">' + c.why + '</div>' +
        '</div>' +
      '</div>';
    box.innerHTML += html;
  });
})();

/* ===== 启动绘制 ===== */
drawRadar();
drawRadarLegend();
renderBarCompare();

/* 窗口 resize 时重绘雷达图 */
window.addEventListener("resize", drawRadar);
})();
