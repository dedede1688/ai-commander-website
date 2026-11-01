/* ===== AI指挥官·个人AI指挥系统实战课（course.js，1688 升级版）=====
   数据驱动渲染五阶段十课卡片：每课含 问题/为什么学/准备/课堂30分钟四段/课堂最小成果/
   课后20—40分钟任务/配套工具表/最终可用成果/完成标准/蓝图位置。
   纵向折叠、一次仅展开一节；空格/回车可展开收起；刷新后恢复展开状态。
   存储键 ai-course-official-open-lesson 为正式课程页独立键名，不与 V4—V9 历史小样共用。 */
(function () {
  const stages = [
    { name: "第一阶段 · 明确方向", brief: "看清起点，选定第一条行动路线", outcome: "阶段成果：一个真实场景与第一项任务", lessons: [
      { no: "01", title: "看清你的AI使用起点", problem: "工具听了很多，却不知道该从哪里开始。",
        why: "从“AI 能帮你做什么”出发，比从“有什么工具”出发更靠谱。这一课把你的使用起点、可切入的场景和第一条路线摆到桌面上。",
        prep: "写下三件你最近最想让 AI 帮忙的事，每件一句话。",
        agenda: ["5分钟｜看清当下AI能做什么", "10分钟｜盘点你的使用起点", "10分钟｜圈出可切入的场景", "5分钟｜填完场景判断表"],
        mini: "一份《AI应用场景与目标判断表》草稿，圈出 1—2 个可启动场景。",
        homework: "用 20—40 分钟把三条需求逐条核对“AI 可否参与、资料在不在你手里、结果怎么验证”，删掉不可行的，把留下的 1—2 个场景写成能向别人讲清楚的一句话。",
        tool: "《AI应用场景与目标判断表》",
        final: "一句话能说清的 AI 应用判断：我要 AI 帮我做什么、我自己验什么。",
        done: "能说出哪些事 AI 可参与、哪些不可直接交给它、第一步先做什么。",
        pos: "这是蓝图的“定位”部分——整个系统从你的真实场景起步。" },
      { no: "02", title: "选定第一项AI真实任务", problem: "知道 AI 有用，但一直停在“试试看”，没有一件真实任务真正交给它。",
        why: "系统从一件真实任务开始。这一课教你用“一周内能完成、结果可验证”的标准筛出第一项任务，并为它选对工具、跑通第一次。",
        prep: "从第 1 课圈出的场景里挑一个；准备一段可以公开处理的文字或资料。",
        agenda: ["5分钟｜用三个条件筛任务", "8分钟｜按任务类型选工具", "12分钟｜用工具跑通第一次真实任务", "5分钟｜记下选择与理由"],
        mini: "用一件 AI 工具完成一个小任务（改写、总结或整理），结果当场可用。",
        homework: "用 20—40 分钟把结果打磨成可直接放进工作的一版，并在工具表里补齐“这个任务为什么选这个工具、下次遇到同类任务怎么选”。",
        tool: "《个人AI工具选择表》",
        final: "一件完成的真实任务＋一套“什么任务配什么工具”的可复用选择依据。",
        done: "任务结果经过人工检查，能直接交给下一步使用。",
        pos: "这是蓝图的“装备”部分——你的工具组合从这件任务开始定型。" } ] },
    { name: "第二阶段 · 建立方法", brief: "建立发令、修正与结果验收方法", outcome: "阶段成果：一张发令卡＋一套核查标准", lessons: [
      { no: "03", title: "把需求变成可执行命令", problem: "AI 的回答总是答非所问，改几次还是不像你要的。",
        why: "答非所问的根源多半是没把需求说清。带上背景、任务、资料、格式与限制的命令，结果质量完全不同——发令是本课的核心技能。",
        prep: "准备一个你过去“总是说不清楚”的真实需求。",
        agenda: ["5分钟｜看懂命令五要素", "8分钟｜拆开你的模糊需求", "12分钟｜完成三轮迭代改进", "5分钟｜把有效命令存成卡片"],
        mini: "一条产出合格结果、五要素齐全的命令。",
        homework: "用 20—40 分钟把这条命令换到另一类任务上再测一次，修正成可反复套用的模板，誊入发令卡。",
        tool: "《个人AI发令卡》",
        final: "一张你随时可以套用的发令模板卡。",
        done: "别人照着你的命令也能复现出合格结果。",
        pos: "这是蓝图的“发令”机制——决定 AI 能不能准确理解你要什么。" },
      { no: "04", title: "建立AI结果核查标准", problem: "要么不敢信 AI 的输出，要么全信吃了亏。",
        why: "AI 会编造内容。没有核查标准，你既不敢把成果交出去，也分不清哪里错了。核查方法让你敢用 AI，也不被 AI 带偏。",
        prep: "准备一份包含人名、数字或来源的 AI 回答。",
        agenda: ["5分钟｜认识四类常见错误", "8分钟｜标记高风险信息", "12分钟｜完成一次交叉核查", "5分钟｜固化五步核查流程"],
        mini: "对一份 AI 回答完成“确定／推测／未知”三档标记的核查结果。",
        homework: "用 20—40 分钟把核查步骤整理成日常可用的清单，并用它实际核查两份你最近得到的 AI 输出。",
        tool: "《AI结果核查表》",
        final: "一套你自己的核查标准：哪些必须查、哪些必须人来定。",
        done: "输出中的关键信息都有对应核查动作，最终判断由人做出并签字负责。",
        pos: "这是蓝图的“质检”机制——所有 AI 产出进入你的工作前都要过的关口。" } ] },
    { name: "第三阶段 · 进入实战", brief: "让AI进入工作与经营场景", outcome: "阶段成果：工作协同样本＋经营行动方案", lessons: [
      { no: "05", title: "用AI协同完成一项工作", problem: "AI 会聊天，却不能真正参与你的报表、方案与总结。",
        why: "AI 在工作里的价值不在于生成初稿，而在于“协同”：你给材料与判断，AI 给草稿与结构，各自做擅长的事。",
        prep: "从会议记录、周报或汇报方案中选一项你近期真要交的东西。",
        agenda: ["5分钟｜判断哪部分适合交给AI", "8分钟｜准备真实材料与要求", "12分钟｜生成并逐段修改初稿", "5分钟｜按标准人工验收"],
        mini: "一份经过事实、结构、语气三项检查的工作成果初稿。",
        homework: "用 20—40 分钟把初稿改成可直接交付的版本，并在协同表里记录：哪些环节 AI 参与、每个环节人定了什么。",
        tool: "《AI工作任务协同表》",
        final: "一份可交付的工作文档＋一份可复用的 AI 协同分工记录。",
        done: "文档可交给真实场合；分工表能说明每一步谁做了什么、谁拍板。",
        pos: "这是蓝图的“工作场景”模块——AI 参与你日常工作的第一个完整样本。" },
      { no: "06", title: "用AI辅助完成经营分析", problem: "做经营的人想用 AI 帮忙决策，却只会拿它闲聊。",
        why: "经营分析是 AI 价值最直观的放大器：把真实条件给它，它给你方案与盲区提醒；判断和决定依然由你做。",
        prep: "准备一个真实产品或服务，写清客户、场景、价格与限制四条信息。",
        agenda: ["5分钟｜补齐经营背景", "8分钟｜整理客户与卖点", "12分钟｜生成分析与行动方案", "5分钟｜删掉空话与风险假设"],
        mini: "一份围绕真实产品的经营分析草稿（目标客户、卖点、行动、风险齐备）。",
        homework: "用 20—40 分钟逐条核对方案里每个动作的数据与假设，删掉做不到的，改成一页你近期敢动手执行的行动计划。",
        tool: "《AI经营分析与行动表》",
        final: "一份能直接拿去试行的经营行动计划，附风险标注。",
        done: "计划里每个行动有核对办法；你能说清哪部分是 AI 建议、哪部分是你决定。",
        pos: "这是蓝图的“经营场景”模块——让 AI 帮你算账，决策留在你手里。" } ] },
    { name: "第四阶段 · 形成流程", brief: "把零散使用沉淀为稳定流程", outcome: "阶段成果：内容生产流程＋标准工作流程", lessons: [
      { no: "07", title: "建立AI内容生产流程", problem: "内容生产靠灵感爆发，文字、图片、声音各做各的。",
        why: "稳定的内容输出来自流程而不是灵感。这一课让文字、图片、声音围绕同一个主题协同，产出从主题到成片每一步都有分工。",
        prep: "确定一个主题、一类受众、一个希望受众完成的行动目标。",
        agenda: ["5分钟｜锁定受众与行动目标", "8分钟｜搭建口播与结构", "12分钟｜拆出画面与声音分工", "5分钟｜完成版权边界检查"],
        mini: "一套围绕同一主题的短视频内容方案（口播稿＋分镜＋声音安排）。",
        homework: "用 20—40 分钟按方案实际产出或沙盘推演一遍，把卡壳的地方改进方案里，形成一张可重复执行的内容流程表。",
        tool: "《AI内容生产方案表》",
        final: "一条从主题到成片的内容生产流程，换主题也能重复使用。",
        done: "方案各部分围绕同一主题、通过版权检查，可交给协作者按表执行。",
        pos: "这是蓝图的“内容场景”模块——把“偶尔出爆款”变成“按流程稳定产出”。" },
      { no: "08", title: "设计个人AI工作流程", problem: "每次用 AI 都从零开始，经验沉淀不下来。",
        why: "把重复的工作拆成“输入—处理—审核—输出”，流程才可能被 AI 稳定参与；你的方法也从一次性劳动变成可复用资产。",
        prep: "选一项你每周至少重复一次、规则相对稳定的任务。",
        agenda: ["5分钟｜选定重复任务", "8分钟｜拆出输入处理审核输出四步", "12分钟｜标注资料去向与确认点", "5分钟｜画出流程初图"],
        mini: "一张包含输入、处理、审核、输出与人工确认点的流程初图。",
        homework: "用 20—40 分钟按流程完整跑一遍（AI 参与），记录哪里卡、哪里不放心，修订成一张别人也能照着执行的标准流程。",
        tool: "《AI工作流程拆解表》",
        final: "一条可重复执行的标准流程，附资料清单与确认点。",
        done: "流程包含输入、处理、审核、输出与人工确认点；换人照图也能执行。",
        pos: "这是蓝图的“流程”层——把前面积累的方法装进稳定的流水线。" } ] },
    { name: "第五阶段 · 完成蓝图", brief: "明确AI分工、人工确认边界与行动路线", outcome: "阶段成果：分工确认机制＋个人AI指挥系统蓝图", lessons: [
      { no: "09", title: "设计AI能力分工与确认机制", problem: "AI 能力越来越多，不知道该怎么分工、哪些必须人来把关。",
        why: "组织 AI 协同的关键不是让 AI 做更多，而是设计清楚分工与红线：搜索、整理、生成可以派活；发送、删除、付款、发布必须人工确认。",
        prep: "准备一个需要“搜索—整理—表达”多步协作的复杂目标。",
        agenda: ["5分钟｜分清对话与智能体的差别", "8分钟｜把目标拆成可分工步骤", "12分钟｜安排能力分工与交接方式", "5分钟｜划定人工确认红线"],
        mini: "一张复杂目标的能力分工草稿（每项职责与交接点明确）。",
        homework: "用 20—40 分钟给分工草稿的每个关键操作补上人工确认点，并预演三个可能出错的场景与你的应对。",
        tool: "《AI团队分工与人工确认表》",
        final: "一张带红线清单的 AI 分工架构：谁来做什么、谁停下来等确认。",
        done: "每项能力职责清楚；发送、删除、付款、发布等关键操作全部设人工确认。",
        pos: "这是蓝图的“治理”层——系统不仅跑得起，还刹得住。" },
      { no: "10", title: "完成个人AI指挥系统蓝图", problem: "前面九课做了不少成果，但它们还散落在各个文件里。",
        why: "最后一课做整合：把前九课的成果各归其位，连成一张你随时能看、能改、能继续执行的蓝图——结课不是结束，而是迭代的起点。",
        prep: "带齐第 1—9 课的工具表成果；没做完的先做缺口标记。",
        agenda: ["5分钟｜盘点九课成果与缺口", "8分钟｜补齐或标记待定项", "12分钟｜把成果连成一张蓝图", "5分钟｜定下未来 7 天行动"],
        mini: "一份把定位、发令、核查、场景、流程、分工、路线放到一张纸上的蓝图初版。",
        homework: "用 20—40 分钟对照每课完成标准修订蓝图，把 7 天行动写成具体任务，蓝图转为可持续更新的活文档。",
        tool: "《个人AI指挥系统行动路线表》",
        final: "一套完整的《个人AI指挥系统蓝图》＋未来 7 天行动路线。",
        done: "蓝图包含一条主线、下一步行动和风险边界；你能向别人讲清每个部分从哪来、往哪去。",
        pos: "整合前九课成果，形成最终蓝图——本课交付点，就是你的迭代起点。" } ] }
  ];
  const LS_KEY = "ai-course-official-open-lesson";
  const journey = document.getElementById("journey");
  if (!journey) return;
  stages.forEach((stage, stageIndex) => {
    const section = document.createElement("section");
    section.className = "stage";
    section.innerHTML = `<div class="rail"><div class="stage-index">0${stageIndex + 1}</div><div class="stage-name">${stage.name}</div><div class="stage-brief">${stage.brief}</div><div class="stage-outcome">${stage.outcome}</div></div><div class="pair"></div>`;
    const pair = section.querySelector(".pair");
    stage.lessons.forEach((lesson) => {
      const details = document.createElement("details");
      details.className = "lesson";
      details.dataset.lesson = lesson.no;
      details.innerHTML = `<summary><span class="no">${lesson.no}</span><div class="lesson-main"><span class="stage-tag">${stage.name}</span><h3>${lesson.title}</h3><p>本课解决的问题：${lesson.problem}</p><span class="final"><b>本课成果：</b>${lesson.final}</span></div><div class="meta"><b>课堂 30 分钟</b>课后 20—40 分钟</div><span class="toggle" aria-hidden="true">＋</span></summary><div class="expand"><p class="why-label">为什么要学这一课</p><p class="why">${lesson.why}</p><div class="expand-cols"><div><p class="label">课堂 30 分钟 · 四段安排</p><ol class="agenda">${lesson.agenda.map((x) => `<li>${x}</li>`).join("")}</ol><div class="mini"><b>课堂最小成果</b>${lesson.mini}</div></div><div><p class="label">课后 20—40 分钟 · 完善任务</p><div class="homework">${lesson.homework}</div><div class="criteria" style="margin-top:14px"><div class="criterion"><b>开始前准备</b>${lesson.prep}</div><div class="criterion tool"><b>配套工具表</b>${lesson.tool}</div><div class="criterion done"><b>最终可用成果</b>${lesson.final}</div><div class="criterion done"><b>完成标准</b>${lesson.done}</div></div></div></div><div class="blueprint"><strong>进入蓝图：</strong>${lesson.pos}</div></div>`;
      details.addEventListener("toggle", () => {
        if (!details.open) {
          // 主动收起时清除记忆：全部收起后刷新不应重新打开上次课程
          try { if (localStorage.getItem(LS_KEY) === lesson.no) localStorage.removeItem(LS_KEY); } catch (e) {}
          return;
        }
        document.querySelectorAll(".lesson[open]").forEach((item) => { if (item !== details) item.open = false; });
        try { localStorage.setItem(LS_KEY, lesson.no); } catch (e) {}
      });
      const sum = details.querySelector("summary");
      let sw = false;
      sum.addEventListener("keydown", (e) => {
        if (e.key === " " || e.code === "Space") { e.preventDefault(); sw = true; details.open = !details.open; setTimeout(() => sw = false, 300); }
      });
      sum.addEventListener("click", (e) => { if (sw) { sw = false; e.preventDefault(); } });
      pair.appendChild(details);
    });
    journey.appendChild(section);
  });
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved && /^\d{2}$/.test(saved)) { const target = document.querySelector(`.lesson[data-lesson="${saved}"]`); if (target) target.setAttribute("open", ""); }
  } catch (e) {}
})();
