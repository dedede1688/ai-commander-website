/* 模型页呈现与交互。数据仍来自根目录两份公开导出，本文件不改写数据；
   旧 models.js 的推断分数、综合冠军、排名与折扣不接入本页。 */
if(!window.REAL_DATA||!window.REAL_SCORES){
  var de=document.getElementById('data-error');if(de)de.hidden=false;
  var hs=document.getElementById('hero-sub');if(hs)hs.textContent='候选数据未加载，请检查 models-candidates-data.js 与 models-scores-data.js。';
  if(window.__modelsMarkHandled)window.__modelsMarkHandled();
}else{(function(){
/* 顶部导航由 shared.js 注入且为 sticky：滚动定位统一让出它的实际高度 */
var NAVH=function(){var n=document.getElementById("topnav");return n?Math.round(n.getBoundingClientRect().height):0};
document.getElementById('workspace').hidden=false;
var ST={y:{cls:"yes",icon:"✔",text:"支持"},n:{cls:"no",icon:"✕",text:"不支持"},u:{cls:"unk",icon:"？",text:"资料待确认"}};
var FILL={y:"#0d8066",n:"#ae5353",u:"#937429"};
var CAPS=[{key:"text",label:"文本生成"},{key:"image",label:"图片理解"},{key:"video",label:"视频理解"},{key:"imgGen",label:"图像生成"},{key:"vidGen",label:"视频生成"},{key:"tool",label:"工具调用"},{key:"reasoning",label:"推理"},{key:"coding",label:"编程"},{key:"longWriting",label:"长文写作"}];
/* 本轮展示范围：国内 9 家＋国际 5 家（协调方建议名单）。按 vendor 字段精确匹配，
   不做模糊匹配；名单外厂商不进入选择器、搜索结果、详情与统计，资料库与原始数据不改。 */
var VENDORS=[
 {vendor:"字节跳动 Seed",name:"字节跳动",region:"国内"},
 {vendor:"阿里巴巴通义实验室",name:"阿里巴巴",region:"国内"},
 {vendor:"深度求索 DeepSeek",name:"DeepSeek",region:"国内"},
 {vendor:"智谱AI（Z.ai / 北京智谱华章）",name:"智谱",region:"国内"},
 {vendor:"月之暗面 Moonshot AI",name:"月之暗面",region:"国内"},
 {vendor:"MiniMax（稀宇科技）",name:"MiniMax",region:"国内"},
 {vendor:"阶跃星辰 StepFun",name:"阶跃星辰",region:"国内"},
 {vendor:"腾讯（腾讯混元 Hunyuan）",name:"腾讯",region:"国内"},
 {vendor:"百度（文心 ERNIE）",name:"百度",region:"国内"},
 {vendor:"OpenAI",name:"OpenAI",region:"国际"},
 {vendor:"Anthropic",name:"Anthropic",region:"国际"},
 {vendor:"Google DeepMind",name:"Google DeepMind",region:"国际"},
 {vendor:"Meta",name:"Meta",region:"国际"},
 {vendor:"xAI（2026-02 起为 SpaceX 旗下）",name:"xAI",region:"国际"}
];
var DATA=window.REAL_DATA,MODELS=[];
VENDORS.forEach(function(v){v.models=DATA.models.filter(function(m){return m.vendor===v.vendor});MODELS=MODELS.concat(v.models)});
var VENDOR_BY_KEY={};VENDORS.forEach(function(v){VENDOR_BY_KEY[v.vendor]=v});
/* 初始展示样例：批 M（Meta 官方表）两款，可绘两维四格；不代表排名或推荐 */
var DEFAULT_IDS=['intl-meta-llama-4-maverick','intl-meta-llama-4-scout'];
var colors=['#00c5a0','#7395ff','#dc9b37','#de699d','#44a5d9','#a786df','#afbf49','#de8261','#38b8bd','#8c92ad','#b08f4d','#bc6fce','#72b97b','#d66c77'];
function colorFor(id){return colors[MODELS.findIndex(function(m){return m.id===id})%colors.length]}
var picked=DEFAULT_IDS.slice(),expandedSelection=false,filtered=[],focusedId=null;
function getModel(id){return MODELS.find(function(m){return m.id===id})}
function status(c){return '<span class="st '+ST[c].cls+'">'+ST[c].icon+' '+ST[c].text+'</span>'}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
/* 白名单内统一按“开放方式＋风险开关”筛选；国内/国际两组始终展示 */
function inScope(m){var risk=document.getElementById('include-risk').checked;
 var fs=[].slice.call(document.querySelectorAll('#form-chips input:checked')).map(function(x){return x.dataset.openness});
 return (risk||!m.risk)&&fs.indexOf(m.openness)>=0}
function scopeModels(){return MODELS.filter(inScope)}
function updateStats(){
 var mc=document.getElementById('mhModelCount');if(mc)mc.textContent=MODELS.length;
 var vc=document.getElementById('mhVendorCount');if(vc)vc.textContent=VENDORS.length;
 var pc=document.getElementById('mhPlotCells');if(pc)pc.textContent=(typeof STATS!=="undefined"&&STATS)?STATS.plottable:'—';
}
function updateCount(){
 var riskOn=document.getElementById('include-risk').checked,shown=scopeModels().length;
 var sub=document.getElementById('hero-sub');
 if(sub)sub.textContent='国内 9 家 × 国际 5 家，共纳入 '+MODELS.length+' 款在库型号'+(riskOn?'（已包含 3 款退役风险）':'（默认不含 3 款退役风险）')+'；当前筛选可见 '+shown+' 款。组 M 两维四格可绘，组 Q 暂无同口径可比分数。';
}
function searchItemHTML(m){var on=picked.indexOf(m.id)>=0;
 return '<label class="search-item'+(on?' is-picked':'')+'"><input type="checkbox" data-model="'+esc(m.id)+'"'+(on?' checked':'')+'><span><strong>'+esc(m.name)+'</strong><small>'+esc(m.name===m.vendor?m.openness:m.vendor)+' · '+esc(m.openness)+'</small></span></label>'}
function renderSearchResults(){
 var panel=document.getElementById('search-panel'),q=document.getElementById('search').value.trim().toLowerCase();
 if(!q){filtered=[];panel.hidden=true;return}
 filtered=scopeModels().filter(function(m){return (m.name+' '+(m.official||'')+' '+m.vendor).toLowerCase().indexOf(q)>=0});
 panel.hidden=false;
 document.getElementById('result-count').textContent='匹配 '+filtered.length+' 款';
 document.getElementById('no-results').hidden=filtered.length>0;
 document.getElementById('choices').innerHTML=filtered.map(searchItemHTML).join('');
}
function modelItemHTML(m){var on=picked.indexOf(m.id)>=0;
 return '<label class="fam-item'+(on?' on':'')+'"><input type="checkbox" data-model="'+esc(m.id)+'"'+(on?' checked':'')+'><span class="fam-name">'+esc(m.name)+(m.risk?' <em class="risk-inline">风险</em>':'')+'<small>'+esc(m.openness)+'</small></span></label>'}
/* 每家先列出主力型号（数据首项），其余型号折叠展开；勾选数量不限 */
function vendorMenuHTML(v){
 var vis=v.models.filter(inScope),principal=vis.slice(0,1),rest=vis.slice(1);
 var sel=v.models.filter(function(m){return picked.indexOf(m.id)>=0}).length;
 var head='<div class="fam-menu-head"><span data-vendor-head="'+esc(v.vendor)+'">'+esc(v.region)+' · '+vis.length+' 款'+(sel?' · 已选 '+sel:'')+'</span>'+(vis.length?'<button type="button" class="text-btn" data-vendor-all="'+esc(v.vendor)+'">全选本厂商</button>':'')+'</div>';
 var body=vis.length?principal.map(modelItemHTML).join('')+(rest.length?'<div class="fam-more" hidden>'+rest.map(modelItemHTML).join('')+'</div><button type="button" class="text-btn fam-more-toggle" data-more="'+esc(v.vendor)+'" aria-expanded="false">其余 '+rest.length+' 款 ▾</button>':''):'<p class="fam-empty">当前筛选下暂无型号</p>';
 return '<button type="button" class="fam-dd-toggle" aria-expanded="false"><span class="fam-label">'+esc(v.name)+'</span><span class="fam-count">'+v.models.length+'</span><span class="fam-arrow" aria-hidden="true">⌄</span></button><div class="fam-dd-menu" role="group" aria-label="'+esc(v.name)+' 型号">'+head+body+'</div>';
}
function renderVendorPills(){
 var host=document.getElementById('vendorPills');
 host.innerHTML=['国内','国际'].map(function(region){
  var vs=VENDORS.filter(function(v){return v.region===region});
  return '<div class="vg-row"><span class="vg-label">'+region+'<b>'+vs.length+'</b>家</span><div class="vg-items">'+vs.map(function(v){return '<div class="fam-dd" data-vendor="'+esc(v.vendor)+'">'+vendorMenuHTML(v)+'</div>'}).join('')+'</div></div>';
 }).join('');
}
function syncChoiceChecks(){
 [].slice.call(document.querySelectorAll('#vendorPills input[data-model],#choices input[data-model]')).forEach(function(cb){
  var on=picked.indexOf(cb.dataset.model)>=0;cb.checked=on;
  var lb=cb.closest('.fam-item')||cb.closest('.search-item');if(lb)lb.classList.toggle('on',on);if(lb&&lb.classList.contains('search-item'))lb.classList.toggle('is-picked',on);
 });
 VENDORS.forEach(function(v){
  var dd=document.querySelector('#vendorPills .fam-dd[data-vendor="'+(window.CSS&&CSS.escape?CSS.escape(v.vendor):v.vendor)+'"]');if(!dd)return;
  var sel=v.models.filter(function(m){return picked.indexOf(m.id)>=0}).length;
  var head=dd.querySelector('[data-vendor-head]');
  if(head)head.textContent=v.region+' · '+v.models.filter(inScope).length+' 款'+(sel?' · 已选 '+sel:'');
  dd.classList.toggle('has-pick',sel>0);
 });
}
function renderSelected(){
 var visible=expandedSelection?picked:picked.slice(0,8);
 var html='<span class="sel-count">已选 '+picked.length+' 款</span>';
 if(picked.length){
  html+=visible.map(function(id){var m=getModel(id);return '<button class="token" data-remove="'+esc(id)+'" aria-label="取消选择 '+esc(m.name)+'"><i style="background:'+colorFor(id)+'"></i>'+esc(m.name)+(m.risk?'<span class="rk">风险</span>':'')+'<b aria-hidden="true">×</b></button>'}).join('');
  if(picked.length>8)html+='<button class="text-btn" data-expand-selection="true">'+(expandedSelection?'收起选择':'另有 '+(picked.length-8)+' 款 · 展开')+'</button>';
  html+='<button class="text-btn" id="clear">清空选择</button>';
 }else html+='<span>点开上方厂商胶囊，勾选需要对比的型号，数量不限</span>';
 document.getElementById('selected').innerHTML=html;
 var sn=document.getElementById('sample-note');
 if(sn){var isDefault=picked.length===DEFAULT_IDS.length&&DEFAULT_IDS.every(function(id){return picked.indexOf(id)>=0});sn.hidden=!(mode()==="real"&&isDefault)}
}
function officialLine(m){return m.official?('官方标识（调用 ID）：'+esc(m.official)):'官方标识：调用标识待核验'}
function specLine(m){var parts=[];if(m.version)parts.push('版本：'+esc(m.version));if(m.form)parts.push('形态：'+esc(m.form));if(m.contextWindow&&m.contextWindow.value)parts.push('上下文：'+esc(m.contextWindow.value));if(m.price&&m.price.detail)parts.push('价格：'+esc(m.price.detail));return parts.length?'<p class="specs">'+parts.join('　·　')+'</p>':''}
/* ===== 九维百分制评分：待复核数据小样本（待复核数据）/ 固定模拟值（演示模式），两模式互不回填 ===== */
var SC=window.REAL_SCORES;
var DIMS=SC.dims.map(function(d){return {k:d.key,label:d.label}});
var DIMRULE={};SC.dims.forEach(function(d){DIMRULE[d.key]=d});
var BATCH={};SC.batches.forEach(function(b){BATCH[b.id]=b});
var SC_MAP={};SC.models.forEach(function(m){SC_MAP[m.id]=m});
var KIND={not_tested:"未测",missing_data:"资料缺失",not_applicable:"不适用",pending:"待核验",config_unconfirmed:"配置待确认"};
var GAPKINDS='未测／资料缺失／不适用／待核验／配置待确认';
var GRADE={verified_comparable:"已核实且可比条件确认（可绘分）",verified_config_unconfirmed:"原始成绩已核实，适用配置待确认（不绘分）",verified_incomparable:"已核实但口径不可比",pending:"待核验（不绘分）",not_tested:"未测",missing_data:"资料缺失",not_applicable:"不适用"};
var STATS=SC.stats||{models:SC.models.length,cells:0,gaps:0,rawVerified:0,plottable:0,held:0,groups:[]};
var GROUPS=STATS.groups||[];
var DEMO_META={nature:"演示模拟值（非真实测评）",date:"2026-10-31",review:"模拟数据，不进入研究资料"};
/* 样本款数与格数全部由数据文件推导，避免手工计数与真实层不一致 */
(function(){
  var t=document.getElementById('rc-notice'),u=document.getElementById('rc-mode');
  if(t)t.textContent=STATS.models+' 款 · 原始成绩已核实 '+STATS.rawVerified+' 格／当前可绘 '+STATS.plottable+' 格（分 '+GROUPS.length+' 个评分组，跨组不叠加）';
  if(u)u.textContent='（'+STATS.models+' 款 · 待复核）';})();
var hidden={},soloId=null,labelId=null,hoverId=null,rzT=null;
/* 演示模式分数：页内固定常量，只用于验证九维折线、百分制刻度、分数标签、多款叠加与缺分留空渲染。
   不写入资料库与研究数据，切换到待复核数据时绝不作为回退值。 */
var DEMO_SERIES=[
{id:"cn-bytedance-doubao-seed-2-1-pro",cells:{text:93,reasoning:89,coding:88,longWriting:84,imageUnderstand:90,videoUnderstand:82,imageGen:null,videoGen:null,tool:86}},
{id:"cn-moonshot-kimi-k3",cells:{text:90,reasoning:91,coding:93,longWriting:86,imageUnderstand:87,videoUnderstand:79,imageGen:null,videoGen:null,tool:90}},
{id:"cn-stepfun-step-5-preview",cells:{text:86,reasoning:84,coding:82,longWriting:80,imageUnderstand:83,videoUnderstand:74,imageGen:78,videoGen:70,tool:81}},
{id:"cn-alibaba-qwen3.8-max",cells:{text:91,reasoning:92,coding:94,longWriting:85,imageUnderstand:89,videoUnderstand:88,imageGen:null,videoGen:null,tool:93}},
{id:"cn-deepseek-deepseek-flash",cells:{text:85,reasoning:87,coding:90,longWriting:79,imageUnderstand:76,videoUnderstand:60,imageGen:null,videoGen:null,tool:84}},
{id:"cn-zhipu-glm-5.3-flash",cells:{text:84,reasoning:82,coding:83,longWriting:81,imageUnderstand:78,videoUnderstand:66,imageGen:74,videoGen:null,tool:80}},
{id:"intl-openai-gpt-5.6-sol",cells:{text:92,reasoning:93,coding:91,longWriting:88,imageUnderstand:88,videoUnderstand:85,imageGen:86,videoGen:83,tool:92}},
{id:"intl-anthropic-claude-opus-5",cells:{text:94,reasoning:95,coding:95,longWriting:92,imageUnderstand:89,videoUnderstand:86,imageGen:null,videoGen:null,tool:94}},
{id:"intl-meta-llama-4-maverick",cells:{text:80,reasoning:70,coding:44,longWriting:72,imageUnderstand:73,videoUnderstand:null,imageGen:null,videoGen:null,tool:68}},
{id:"intl-google-gemini-4-argon",cells:{text:90,reasoning:88,coding:85,longWriting:83,imageUnderstand:91,videoUnderstand:90,imageGen:89,videoGen:null,tool:87}}
];
var DEMO_IDS=DEMO_SERIES.map(function(m){return m.id});
var DEMO_MAP={};DEMO_SERIES.forEach(function(x){
 var rec={id:x.id,batch:null,versionNote:"演示模式：九维分数为固定模拟值，不对应任何真实评测，仅用于图形与交互验证",cells:{},gaps:{}};
 DIMS.forEach(function(d){var v=x.cells[d.k];
  if(v==null)rec.gaps[d.k]={kind:"not_tested",why:"演示空缺格：用于验证缺分不连线、不封闭、不填 0 分的渲染"};
  else rec.cells[d.k]={value:v,benchmark:"模拟分值",metric:"演示用固定分值，无真实测评口径",convert:"不适用（模拟数据）",proxy:false,corroboration:"",date:DEMO_META.date,review:DEMO_META.review,limits:"该分值不构成能力评价，不得用于选型结论或对外发布"};
 });
 DEMO_MAP[x.id]=rec;
});
function esc2(v){return esc(v==null?"":v)}
function mode(){var el=document.querySelector('input[name="datamode"]:checked');return el?el.value:"real"}
function recOf(id){return mode()==="demo"?(DEMO_MAP[id]||null):(SC_MAP[id]||null)}
function cellOf(id,k){var r=recOf(id);if(!r)return null;
 if(r.cells&&r.cells[k])return {kind:"value",v:r.cells[k].value,cell:r.cells[k]};
 if(r.gaps&&r.gaps[k])return {kind:"gap",g:r.gaps[k]};
 return null}
function natureOf(id){var r=recOf(id);if(!r)return "";return mode()==="demo"?DEMO_META.nature:(BATCH[r.batch]?BATCH[r.batch].nature:"")}
function srcsOf(id){var r=recOf(id);if(!r||mode()==="demo"||!BATCH[r.batch])return [];return BATCH[r.batch].sources}
function groupOf(id){var r=SC_MAP[id];return r?r.batch:null}
function pickedIn(id){return picked.indexOf(id)>=0}
function pickedGroups(){return GROUPS.filter(function(g){return g.models.some(pickedIn)})}
var groupId=null,groupIdUser=false;
function activeGroup(){
 if(mode()==="demo")return null;
 var av=pickedGroups();if(!av.length){groupId=null;groupIdUser=false;return null}
 if(groupIdUser&&av.some(function(g){return g.id===groupId}))return groupId;
 groupId=(av.filter(function(g){return g.plottableModels.some(pickedIn)})[0]||av[0]).id;
 groupIdUser=false;
 return groupId}
function allSeriesIds(){return picked.filter(function(id){return !!recOf(id)})}
/* 评分组隔离：待复核数据一张图只画一个组；演示模式仍可自由叠加 */
function seriesIds(){var s=allSeriesIds();if(mode()==="real"){var g=activeGroup();if(g)s=s.filter(function(id){return groupOf(id)===g})}return s}
function otherGroupIds(){var g=activeGroup();return g?allSeriesIds().filter(function(id){return groupOf(id)!==g}):[]}
function uncovered(){return picked.filter(function(id){return !recOf(id)})}
function shown(){var s=seriesIds();if(soloId)return s.filter(function(id){return id===soloId});return s.filter(function(id){return !hidden[id]})}
function valTxt(v){return (v%1?v.toFixed(1):String(v))}
/* 图内说明折行：只允许在标点或作者断点（¦）处断开，词内不拆（"暂不绘制""补画"不得分家） */
function chunks(t){var out=[],cur='';for(var i=0;i<t.length;i++){var c=t.charAt(i),nx=t.charAt(i+1)||'';
 if(c==='¦'){if(cur){out.push(cur);cur=''}continue}
 cur+=c;
 if('，。；）！'.indexOf(c)>=0||'（「'.indexOf(nx)>=0){out.push(cur);cur=''}}
 if(cur)out.push(cur);return out}
/* 单个词块仍宽过整行时才逐字强断，且保证断口两侧都不少于 4 字 */
function splitWide(cs,fs,lim){var o=[];cs.forEach(function(t){if(tw(t,fs)<=lim){o.push(t);return}
 var cur='';for(var q=0;q<t.length;q++){var ch=t.charAt(q);
  if(cur&&tw(cur+ch,fs)>lim&&cur.length>=4&&t.length-q>=4){o.push(cur);cur=ch}else cur+=ch}
 o.push(cur)});return o}
/* 任一行不足 4 字：先并入上一行（须容得下），放不下就把上一行末尾词块下移 */
function fixShort(rows,fs,lims){var i=1;
 while(i<rows.length){var cur=rows[i],prev=rows[i-1];
  if(cur.join('').length>=4){i++;continue}
  var merged=prev.concat(cur);
  if(tw(merged.join(''),fs)<=Math.min(lims[i-1],lims[i])){rows[i-1]=merged;rows.splice(i,1);lims.splice(i,1);if(i>1)i--;continue}
  var nl=[prev[prev.length-1]].concat(cur);
  if(prev.length>1&&tw(nl.join(''),fs)<=lims[i]){rows[i]=nl;rows[i-1]=prev.slice(0,prev.length-1);continue}
  i++}
 return rows}
/* 折行宽度＝逐行可占净宽：面板净宽减去与该行竖直区间相交的轴名安全区（刻度随后自动让位）。
   行位随行数外扩、安全区随之收紧，故从最少行数试排，取首个"每行都不越安全区"的排法。 */
function layoutNote(items,g,boxes){
 var lh=g.fsz*1.62,fs0=g.fsz;
 function netW(y){var lo=6,hi=g.w-6,top=y-fs0*1.02,bot=y+fs0*0.28,i;
  for(i=0;i<boxes.length;i++){var b=boxes[i];
   if(b.y1>top&&b.y0<bot){
    if(b.x1<=g.cx)lo=Math.max(lo,b.x1+6);else if(b.x0>=g.cx)hi=Math.min(hi,b.x0-6);else{lo=g.cx-2;hi=g.cx+2}}}
  return Math.max(g.fsz*4,Math.min(hi-g.cx,g.cx-lo)*2)}
 /* 把两段文案的词块依次填入给定行宽；行先用完则返回 null，换更多行再试 */
 function pack(lims){var out=[],meta=[],li=0,i;
  for(i=0;i<items.length;i++){var it=items[i],rows=[],line=[],
    cs=splitWide(chunks(it.t),it.fs,Math.min.apply(null,lims));
   for(var q=0;q<cs.length;q++){
    if(li>=lims.length)return null;
    if(line.length&&tw(line.join('')+cs[q],it.fs)>lims[li]){rows.push(line);line=[cs[q]];li++}
    else line.push(cs[q])}
   if(line.length){if(li>=lims.length)return null;rows.push(line);li++}
   fixShort(rows,it.fs,lims.slice(out.length)).forEach(function(c){out.push(c);meta.push(it)});
   li=out.length}
  return out.map(function(c,j){return {t:c.join(''),fs:meta[j].fs,a:meta[j].a}})}
 var res=null,last=null,T,k;
 for(T=1;T<=10;T++){var yT=g.cy-((T-1)*lh)/2,lims=[];
  for(k=0;k<T;k++)lims.push(netW(yT+k*lh));
  var rows=pack(lims);if(!rows)continue;
  last=rows;
  var y0=g.cy-((rows.length-1)*lh)/2,ok=true;
  for(k=0;k<rows.length;k++)if(tw(rows[k].t,rows[k].fs)>netW(y0+k*lh)+1){ok=false;break}
  if(ok){res={rows:rows,y0:y0,lh:lh};break}}
 return res||{rows:last||[],y0:g.cy-(((last||[]).length-1)*lh)/2,lh:lh}}
function valsOf(id){return DIMS.map(function(d){var c=cellOf(id,d.k);return c&&c.kind==="value"?c.v:null})}
function modeTag(){return mode()==="demo"?"模拟":"小样本"}
function srcLinks(arr){return arr.map(function(s){return '<a href="'+esc(s.u)+'" target="_blank" rel="noopener">'+esc(s.t)+'（'+esc(s.e)+' 类，核对 '+esc(s.d)+'）↗</a>'}).join('')}
function defaultInfo(){
 var nSel=picked.length,inSample=allSeriesIds().length;
 if(mode()==="demo")return '<span class="hd">演示模式</span>　图内分数为<b>固定模拟值，非真实测评</b>，不写入研究资料，也不作为待复核数据的回退数据。本次所选 '+nSel+' 款'+(inSample?('，其中 '+inSample+' 款有演示分值'):'（演示内置 '+DEMO_IDS.length+' 款可勾选）')+'。点击／悬停／键盘聚焦顶点或下方分值表任一格，可查看分值与说明。';
 var g=activeGroup(),gr=GROUPS.filter(function(x){return x.id===g})[0]||null;
 var inGr=seriesIds(),plotIn=inGr.filter(function(id){return valsOf(id).some(function(v){return v!=null})}).length,oth=otherGroupIds().length;
 var scope;
 if(!nSel)scope='本次未勾选模型（待复核样本共 '+STATS.models+' 款，分属 '+GROUPS.length+' 个评分组；在左侧「查找模型」中勾选后绘制）';
 else if(!gr)scope='本次所选 '+nSel+' 款都不在待复核样本内（样本共 '+STATS.models+' 款），图中不绘制任何曲线、不补分';
 else if(!plotIn)scope='当前绘制评分组「'+esc(gr.short)+'」：本组所选 '+inGr.length+' 款<b>没有满足组内可比条件的分值</b>，图中只有网格'+(oth?('；另有 '+oth+' 款属其他评分组'):'')+'，数值与来源见下方对照表';
 else scope='当前绘制评分组「'+esc(gr.short)+'」：本次所选 '+nSel+' 款，其中本组 '+inGr.length+' 款参与绘制（有可绘分值 '+plotIn+' 款）'+(oth?('；另有 '+oth+' 款属其他评分组，保留选择、对照表与详情，不混画曲线'):'');
 return '<span class="hd">待复核数据</span>　'+scope+'　样本共 '+STATS.models+' 款／原始成绩已核实 '+STATS.rawVerified+' 格，其中满足组内可比条件可绘分 '+STATS.plottable+' 格（复核状态：'+SC.reviewStatus+'）。点击／悬停或用键盘（Tab＋回车）聚焦顶点、轴名称，或<b>点击下方分值表任一格（含留空格）</b>，可查看分数、基准依据、来源性质与测评日期。';
}
function resetInfo(){document.getElementById('radar-info').innerHTML=defaultInfo()}
/* 留空格的分级名称与复核日期：数据里只有 config_unconfirmed／pending 带 grade／verifiedAt，
   其余类别按 kind 取同名分级，日期回退到批次核对日期（不编造逐格日期） */
function gapGrade(g){return GRADE[g.grade]||GRADE[g.kind]||((KIND[g.kind]||'未分类')+'（无原始成绩，不参与核验分级）')}
function gapVerified(g){return g.verifiedAt||(mode()==="demo"?'演示格无复核记录':'随批次核对 '+SC.generatedAt)}
/* 格内空间有限：逐格 verifiedAt 直接显示，无逐格日期时标注日期来自批次核对 */
function gapVerifiedInCell(g){return g.verifiedAt||(mode()==="demo"?'演示无记录':SC.generatedAt+'（批次）')}
function gapRows(id,k,gg){
 var hasRaw=!!gg.raw;
 return [['缺口类别',KIND[gg.kind]||'未分类'],
  ['处理',hasRaw?'不绘分（留空）：原始成绩与来源保留，但不进入当前可比较曲线':'留空：不计 0 分、不补平均分、不连向圆心'],
  ['缺口原因',gg.why],
  ['原始成绩',gg.raw],
  ['基准与指标',[gg.benchmark,gg.metricLabel||gg.metric].filter(Boolean).join('　·　')],
  ['换算与公式',gg.formula?(esc2(gg.convert)+'（'+esc2(gg.formula)+'）'):gg.convert],
  ['来源性质',gg.nature||natureOf(id)],
  ['测评日期',gg.date],
  ['复核状态',gg.review],
  ['核验分级',gapGrade(gg)],
  ['复核日期',gapVerified(gg)],
  ['原文位置',gg.table],
  ['官方原文行',gg.quote],
  ['测评条件',gg.conditions],
  ['限制',gg.limits],
  ['次要基准（佐证，不入分值）',gg.corroboration]
 ].filter(function(r){return String(r[1]==null?'':r[1]).trim()!==''});
}
function dimNote(k){var d=DIMRULE[k];return d?d.label+"：主基准 "+(d.primary||"本轮无")+"；"+d.rule:""}
function showDim(k){
 var d=DIMRULE[k];if(!d)return;
 var cmp=SC.comparability[k]||{};
 var cb=cmp.crossBatch==="conditional"?"有条件可比（同名基准，测评配置未逐项核对）":cmp.crossBatch==="single"?"单批次有值，不构成跨批比较":"跨批次不可比（基准不同）或本维度无分值";
 document.getElementById('radar-info').innerHTML='<span class="hd">维度定义 · '+esc(d.label)+'</span><br>主基准：'+esc(d.primary||"本轮无符合口径主基准")+'<br>评分规则与换算：'+esc(d.rule)+'<br>适用范围与限制：'+esc(d.note)+'<br>跨批次可比性：'+esc(cb)+(mode()==="demo"?'<br><b>当前为演示模式，各分数均为模拟值。</b>':'');
}
function infoBack(){return '<br><button type="button" class="text-btn" data-clear-info="1">返回汇总说明</button>'}
function showInfo(id,k){
 var m=getModel(id),c=cellOf(id,k);
 if(!m){resetInfo();return}
 var d=DIMRULE[k],box=document.getElementById('radar-info'),cmp=SC.comparability[k]||{};
 if(!c){box.innerHTML='<span class="hd">'+esc(m.name)+' · '+esc(d.label)+'</span>　该格在当前数据层无任何记录（既无分值也无留空类别）→ 不补分、不按 0 处理。'+infoBack();return}
 if(c.kind==="gap"){
  var gg=c.g;
  box.innerHTML='<span class="hd">'+esc(m.name)+' · '+esc(d.label)+'</span>　<span class="gapchip">'+KIND[gg.kind]+'</span>'+(gg.proxy?' <span class="gapchip">'+esc(DIMRULE[k].labelFull||'代理指标')+'</span>':'')+
   gapRows(id,k,gg).map(function(r){return '<br>'+esc(r[0])+'：'+esc(r[1])}).join('')+
   (gg.url?'<br>来源：<a href="'+esc(gg.url)+'" target="_blank" rel="noopener">原始页↗</a>':'')+
   '<br>规则：留空不按 0 分处理、不补平均分、不连向圆心。'+(mode()==="demo"?'<br><b>演示模式：该空缺格同为演示用。</b>':'')+infoBack();
  return;
 }
 var cc=c.cell;
 box.innerHTML='<span class="hd">'+esc(m.name)+' · '+esc(d.label)+'</span>　<b style="color:#f3cb7e;font-size:15px">'+valTxt(c.v)+'</b> / 100 分'+(cc.proxy?' <span class="gapchip">'+esc(DIMRULE[k].labelFull||'代理指标')+'</span>':'')+'<br>基准：'+esc2(cc.benchmark)+'　指标：'+esc2(cc.metricLabel||cc.metric)+'　原始成绩：'+esc2(cc.raw)+'<br>换算：'+esc2(cc.convert)+'（'+esc2(cc.formula)+'）<br>来源性质：'+esc(natureOf(id))+'　测评／核对日期：'+esc2(cc.date)+'<br>复核状态：'+esc2(cc.review)+'<br>核验分级：'+(GRADE[cc.grade]||(mode()==="demo"?'模拟分值，不参与核验分级':esc(cc.grade||'')))+'　复核日期：'+esc2(cc.verifiedAt||(mode()==="demo"?'演示格无复核记录':'未记录'))+(cc.table?'<br>原文位置：'+esc2(cc.table):'')+(cc.conditions?'<br>测评条件：'+esc2(cc.conditions):'')+(cc.corroboration?'<br>次要基准（佐证，不入分值）：'+esc2(cc.corroboration):'')+(cmp.crossBatch==="conditional"?'<br>跨批次：同名基准有条件可比，配置未逐项核对':'')+(cc.limits?'<br>限制：'+esc2(cc.limits):'')+(m.versionNote?'<br>版本／配置：'+esc2(m.versionNote):'')+'<br>来源：'+(srcLinks(srcsOf(id))||'演示模式无外部来源（模拟值）')+infoBack()+'<br><button type="button" class="text-btn" data-solo="'+esc(id)+'" data-dim="'+esc(k)+'" style="color:#7fd8c4">'+(soloId===id?'退出单款查看':'只看这一款')+'</button>';
}
function dimGridHTML(id){
 return '<div class="lt-dims">'+DIMS.map(function(d){
  var c=cellOf(id,d.k),cls='ltd',val='—',tt=d.label+'：';
  if(c&&c.kind==='value'){val=String(c.v);tt+='当前可绘分值 '+val+' / 100'}
  else if(c&&c.kind==='gap'){cls+=' na';tt+=(KIND[c.g.kind]||'未测')+'，留空，不按 0 分处理'}
  else{cls+=' na';tt+='无记录，留空，不按 0 分处理'}
  return '<span class="'+cls+'" title="'+esc(tt)+'"><b>'+esc(d.label)+'</b><i>'+esc(val)+'</i></span>'
 }).join('')+'</div>';
}
function renderLegend(){
 var all=seriesIds(),vis=shown(),unc=uncovered(),tools=[];
 if(all.length>1)tools.push('<button type="button" data-lg="all">显示全部曲线（'+all.length+' 款）</button>');
 if(soloId)tools.push('<button type="button" data-lg="unsolo">退出单款查看</button>');
 if(Object.keys(hidden).length)tools.push('<button type="button" data-lg="restore">恢复隐藏曲线（'+Object.keys(hidden).length+'）</button>');
 document.getElementById('lg-tools').innerHTML=tools.join('');
 document.getElementById('legend').innerHTML=all.map(function(id){var m=getModel(id),on=vis.indexOf(id)>=0;
  return '<div class="lt-row"><button type="button" class="lt'+(id===labelId?' solo':'')+'" data-toggle="'+esc(id)+'" aria-pressed="'+on+'" aria-label="'+esc(m.name)+' 曲线'+(on?'已显示，点击隐藏':'已隐藏，点击恢复显示并查看其分数')+'（不取消选择）；悬停可临时查看该款分数"><i style="background:'+colorFor(id)+'"></i>'+esc(m.name)+'<em>'+modeTag()+'</em></button>'+dimGridHTML(id)+'</div>'}).join('');
 var names=mode()==="demo"?DEMO_IDS.map(function(id){return esc(getModel(id).name)}):SC.models.map(function(x){return esc(getModel(x.id).name)});
 var note='';
 if(!picked.length)note='先在左侧勾选模型（数量不限）；雷达图按当前数据源绘制。';
 else if(picked.length>1)note='分数标注规则：多款叠加时只常驻当前聚焦模型的分数（默认第一款），点击顶点或悬停图例可切换；完整分值见下方对照表（保留全部 '+picked.length+' 款）。';
 else if(!all.length)note='所选 '+picked.length+' 款都不在当前'+(mode()==="demo"?"演示（内置 "+DEMO_IDS.length+" 款模拟分数模型）":"评分小样本（"+SC.models.length+" 款）")+'内，因此没有曲线可画，也不补分；能力状态对照与详情仍完整保留。可勾选：'+names.slice(0,4).join('、')+(names.length>4?' 等':'')+'。';
 else if(unc.length)note='另有 '+unc.length+' 款所选模型不在当前'+(mode()==="demo"?"演示":"小样本")+'数据源内，不绘制、不补分（'+unc.slice(0,4).map(function(id){return esc(getModel(id).name)}).join('、')+(unc.length>4?' 等':'')+'）。';
 else note='图例只切换曲线显示（'+(mode()==="demo"?'分数为<b>模拟值，非真实测评</b>':'分数为<b>已核实且可比条件确认</b>的小样本成绩，每格分级见顶点说明')+'）：隐藏不取消选择，也不删除下方对照表与模型详情；悬停图例可临时查看该款分数，点击顶点可固定该款的分数标注。';
 var oth=otherGroupIds();
 if(mode()==="real"&&all.length&&!all.some(function(id){var r=recOf(id);return r&&Object.keys(r.cells||{}).length}))
  note='<b>本组 '+all.length+' 款当前没有可绘分值：</b>不画曲线、不标点、不以估算值补画；原始成绩与来源保留在下方对照表（切换上方评分组可看另一组）。';
 if(oth.length)note+='<br><b>评分组隔离：</b>另有 '+oth.length+' 款属于其他评分组（'+oth.slice(0,4).map(function(id){return esc(getModel(id).name)}).join('、')+(oth.length>4?' 等':'')+'），保留选择、对照表与详情，但<b>不与本组叠加绘制</b>。';
 document.getElementById('lg-note').innerHTML=note;
}
function renderGroupBar(){
 var el=document.getElementById('groupbar');if(!el)return;
 var av=mode()==="demo"?[]:pickedGroups();
 if(!av.length){el.hidden=true;el.innerHTML='';return}
 var g=activeGroup();
 el.hidden=false;
 el.innerHTML='<span class="gb-legend">评分组（跨组不叠加绘制）</span>'+av.map(function(x){
  var mods=x.models.filter(pickedIn).length;
  var det=x.plottableCells?('可绘 '+x.plottableCells+' 格／'+mods+' 款'):('无可绘分（已核实 '+x.rawCells+' 格·配置或基准待确认）');
  return '<button type="button" data-group="'+esc(x.id)+'" aria-pressed="'+(x.id===g)+'" title="'+esc(x.rule||'')+'">'+esc(x.short)+'<small>'+det+'</small></button>'}).join('')+
  (av.length>1?'<span class="gb-note">当前只绘制「'+esc((av.filter(function(x){return x.id===g})[0]||{}).short||'')+'」；其他组 '+otherGroupIds().length+' 款保留选择、对照表与详情，不混画曲线。</span>':'');
}
function scoreIntroHTML(){
 if(mode()==="demo")return '<div id="score-intro" class="score-intro">演示模式 · <b>模拟分数，非真实测评</b>。九维分值是页内固定常量，只用于验证折线、百分制刻度、分数标签、多款叠加与缺分留空；不写入研究资料，切换到待复核数据时不作为回退数据。演示内置 '+DEMO_IDS.length+' 款。</div>';
 var gp=GROUPS.map(function(g){return g.short+'（可绘 '+g.plottableCells+' 格／已核实数值 '+g.rawCells+' 格）'}).join('、');
 return '<div id="score-intro" class="score-intro">待复核数据 · '+STATS.models+' 款 × 9 维 = '+STATS.total+' 格：<b>原始成绩已核实 '+STATS.rawVerified+' 格</b>，其中<b>满足组内可比条件、当前可绘分 '+STATS.plottable+' 格</b>；<b>因版本／配置／代理指标限制暂不绘制 '+STATS.held+' 格</b>（配置待确认 '+STATS.configUnconfirmed+'＋待核验 '+STATS.pending+'，数值与来源仍列在对照表）；未测 '+STATS.notTested+'／不适用 '+STATS.notApplicable+' 格留空。<br>评分组：'+gp+'。<b>「成绩已取得」不等于「可以比较」</b>：跨评分组不叠加绘制，切换组只换当前图形。规则：主基准原始百分比恒等映射为百分制，不做样本内归一化；'+GAPKINDS+'一律留空，不填 0、不补平均、不连向圆心；存在留空维度时不画封闭区域。本轮不计算综合总分、不做总排名。方法见资料库 '+SC.methodDoc+'。</div>';
}
function stateTableHTML(ids){
 if(!ids.length)return '';
 return '<p class="score-scroll-hint">模型较多时可左右滑动查看完整状态（共 '+ids.length+' 款，全部保留）</p><div class="score-scroll" tabindex="0" role="region" aria-label="模型能力状态对照，共 '+ids.length+' 款"><table class="score-table" style="--table-width:'+Math.max(320,85+ids.length*110)+'px"><caption>能力状态对照（真实资料 · 三态，非分值 · 共 '+ids.length+' 款）</caption><thead><tr><th>能力</th>'+ids.map(function(id){return '<th>'+esc(getModel(id).name)+'</th>'}).join('')+'</tr></thead><tbody>'+CAPS.map(function(c,i){return '<tr><td>'+c.label+'</td>'+ids.map(function(id){return '<td>'+status(getModel(id).caps[i])+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div><p class="score-foot">能力状态依据官方资料逐项证据，可展开详情查看来源与核验日期。状态与评分分开建模：支持／不支持不换算为分数。</p>';
}
function scoreTableHTML(ids,g){
 if(!ids.length)return '';
 var body=DIMS.map(function(d){
  var bset=[];
  ids.forEach(function(id){var c=cellOf(id,d.k);if(!c)return;
   var b=c.kind==="value"?c.cell.benchmark:(c.g.raw?c.g.benchmark:null);
   if(b&&bset.indexOf(b)<0)bset.push(b)});
  var warn=bset.length>1?'<span class="gapchip">本组该维基准不同 · 不可直接比较</span>':'';
  var prox=!!DIMRULE[d.k].proxy;
  var gapn=ids.filter(function(id){var c=cellOf(id,d.k);return c&&c.kind==="gap"}).length;
  return '<tr><td class="dimhead">'+d.label+(prox?'<span class="proxychip">'+esc(DIMRULE[d.k].labelFull||'代理指标')+'</span>':'')+warn+(gapn?'<span class="gapchip">留空 '+gapn+' 款</span>':'')+'</td>'+ids.map(function(id){
   var c=cellOf(id,d.k);
   if(!c)return '<td><button type="button" class="cellbtn" data-cell-model="'+esc(id)+'" data-cell-dim="'+esc(d.k)+'" aria-label="'+esc(getModel(id).name+' '+d.label+'：无记录，点击查看说明')+'"><span class="cellu">无记录</span><span class="cellk">不补分</span></button></td>';
   if(c.kind==="gap"){var gg=c.g;
    return '<td title="'+esc2(gg.why)+'"><button type="button" class="cellbtn" data-cell-model="'+esc(id)+'" data-cell-dim="'+esc(d.k)+'" aria-label="'+esc(getModel(id).name+' '+d.label+'：'+(KIND[gg.kind]||'留空')+'，点击查看完整依据')+'">'+
     '<span class="cellu">'+KIND[gg.kind]+'</span>'+
     (gg.raw?'<span class="cellk">'+esc2(gg.benchmark)+'：'+esc2(gg.raw)+'（已核实·不绘分）</span>':'<span class="cellk">留空，不计 0 分</span>')+
     '<span class="cellk">分级：'+esc(gapGrade(gg))+'　复核：'+esc(gapVerifiedInCell(gg))+'</span></button>'+
     (gg.url?'<a class="cellraw" href="'+esc(gg.url)+'" target="_blank" rel="noopener">原始页↗</a>':'')+'</td>'}
   return '<td><button type="button" class="cellbtn" data-cell-model="'+esc(id)+'" data-cell-dim="'+esc(d.k)+'" aria-label="'+esc(getModel(id).name+' '+d.label+'：'+valTxt(c.v)+' 分，点击查看完整依据')+'"><span class="cellv" style="color:'+colorFor(id)+'">'+valTxt(c.v)+'</span><span class="cellk">'+esc2(c.cell.benchmark)+(c.cell.proxy?'（'+esc(DIMRULE[d.k].labelFull||'代理指标')+'）':'')+'</span></button></td>';
  }).join('')+'</tr>'}).join('');
 var cap=mode()==="demo"?"九维评分对照（演示模式 · 模拟分数，非真实测评）":"九维评分对照（待复核评测数据 · 评分组 "+esc(g.short)+" · "+SC.reviewStatus+"）";
 return '<p class="score-scroll-hint">分值与依据逐格列出；留空格标注类别（'+GAPKINDS+'）、核验分级与复核日期，已核实但不绘分的格保留原始成绩与来源。<b>点击任一格（含留空格）即可在图下信息条查看完整依据</b>，键盘 Tab＋回车同样可用</p><div class="score-scroll" tabindex="0" role="region" aria-label="九维评分对照表'+(g?'，评分组 '+esc(g.short):'')+'"><table class="score-table" style="--table-width:'+Math.max(340,95+ids.length*125)+'px"><caption>'+cap+'　共 '+ids.length+' 款</caption><thead><tr><th>能力</th>'+ids.map(function(id){return '<th>'+esc(getModel(id).name)+'</th>'}).join('')+'</tr></thead><tbody>'+body+'</tbody></table></div><p class="score-foot">'+(mode()==="demo"?"演示分值为页内模拟常量，仅用于验证图形与交互。":esc(g.rule||""))+'　来源性质：'+esc(natureOf(ids[0]))+'　核对日期：'+esc(mode()==="demo"?DEMO_META.date:SC.generatedAt)+'</p>';
}
/* 待复核数据：每个评分组各出一张对照表，跨组不合并；演示模式单表自由叠加 */
function scoreTablesHTML(){
 if(mode()==="demo")return scoreTableHTML(seriesIds(),null);
 return pickedGroups().map(function(g){
  var ids=allSeriesIds().filter(function(id){return groupOf(id)===g.id});
  return scoreTableHTML(ids,g)}).join('');
}
function renderTable(){
 renderLegend();renderGroupBar();
 var intro=document.getElementById('score-intro');
 if(intro)intro.outerHTML=scoreIntroHTML();
 document.getElementById('score-values').innerHTML=(mode()==="demo"?'<p class="score-scroll-hint" style="color:#8a5a00">以下分值全部为<b>模拟分数，非真实测评</b></p>':'')+(scoreTablesHTML()||'<p class="empty">所选模型中没有可评分的型号<br>待复核评测数据共 '+STATS.models+' 款，分属 '+GROUPS.length+' 个评分组；或切换演示模式查看九维折线渲染</p>')+'<div class="model-head"><span class="flabel">能力状态（与评分分开建模）</span></div>'+stateTableHTML(picked);
}
function geoBox(){
 var panel=document.querySelector('.radar-solo');
 var pw=panel?panel.clientWidth:0;
 var w=Math.max(280,(pw||600)-16);
 var h=Math.round(Math.min(620,Math.max(Math.min(300,w*0.92),w*0.74)));
 var fsz=Math.max(11,Math.min(15,Math.round(w/62)));
 var gapTag=w>=620;
 var rx=(gapTag?6.8:4.9)*fsz+10,ry=fsz+27;
 var r=Math.min(w/2-rx,h/2-ry,w*0.44,h*0.47);
 return {w:w,h:h,cx:w/2,cy:h/2+fsz*0.3,r:r,fsz:fsz,gapTag:gapTag};
}
function angOf(i,n){return -Math.PI/2+i*Math.PI*2/n}
function polyRing(g,frac){var s='';for(var i=0;i<DIMS.length;i++){var a=angOf(i,DIMS.length);s+=(i?'L':'M')+(g.cx+Math.cos(a)*g.r*frac).toFixed(1)+' '+(g.cy+Math.sin(a)*g.r*frac).toFixed(1)}return s+'Z'}
function ptOf(g,i,v){var a=angOf(i,DIMS.length),rad=g.r*v/100;return {x:g.cx+Math.cos(a)*rad,y:g.cy+Math.sin(a)*rad,a:a,cos:Math.cos(a)}}
function runsOf(vals){var runs=[],cur=[];vals.forEach(function(v,i){if(v==null){if(cur.length>1)runs.push(cur);cur=[]}else cur.push(i)});if(cur.length>1)runs.push(cur);return runs}
function tw(t,fs){var w=0;for(var i=0;i<t.length;i++)w+=/[\x00-\xff]/.test(t[i])?fs*.58:fs;return w}
function box(x,y,anchor,t,fs){var w=tw(t,fs)+3,h=fs*1.34;return{x0:(anchor==='start'?x:anchor==='end'?x-w:x-w/2)-1.5,x1:(anchor==='start'?x+w:anchor==='end'?x:x+w/2)+1.5,y0:y-h/2,y1:y+h/2}}
function clash(b,boxes){return boxes.some(function(o){return b.x0<o.x1&&b.x1>o.x0&&b.y0<o.y1&&b.y1>o.y0})}
function renderRadar(){
 var g=geoBox(),vis=shown(),all=seriesIds(),N=DIMS.length;
 var s='';
 for(var n=1;n<=5;n++)s+='<path d="'+polyRing(g,n/5)+'" fill="none" stroke="#ffffff'+(n===5?'2a':'18')+'"/>';
 for(var i=0;i<N;i++){var a=angOf(i,N);s+='<line x1="'+g.cx+'" y1="'+g.cy+'" x2="'+(g.cx+Math.cos(a)*g.r).toFixed(1)+'" y2="'+(g.cy+Math.sin(a)*g.r).toFixed(1)+'" stroke="#ffffff1c"/>'}
 var ticks=[];for(var n2=1;n2<=5;n2++)ticks.push({y:g.cy+g.r*n2/5+3.5,t:(n2*20)+(n2===5?'分':'')});
 var boxes=[];
 DIMS.forEach(function(d,i){
  var gapn=vis.filter(function(id){var c=cellOf(id,d.k);return c&&c.kind==="gap"}).length;
  var cos=Math.cos(angOf(i,N)),lr=g.r+g.fsz+7,x=g.cx+cos*lr,y=g.cy+Math.sin(angOf(i,N))*lr;
  var anchor=cos>0.25?'start':cos<-0.25?'end':'middle',lw=(d.label.length+(gapn&&g.gapTag?2.6:0))*g.fsz+2;
  if(anchor==='start')x=Math.min(x,g.w-lw-3);else if(anchor==='end')x=Math.max(x,lw+3);else x=Math.max(lw/2+3,Math.min(g.w-lw/2-3,x));
  y=Math.max(g.fsz+3,Math.min(g.h-4,y));
  boxes.push(box(x,y,anchor,d.label+(gapn&&g.gapTag?'缺'+gapn:''),g.fsz));
  var aria=esc(d.label+'：'+dimNote(d.k)+'，回车查看评分规则与限制');
  s+='<text class="axl" x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" font-size="'+g.fsz+'" text-anchor="'+anchor+'" dominant-baseline="middle" tabindex="0" role="button" data-dim="'+d.k+'" aria-label="'+aria+'"><title>'+esc(d.label+'｜主基准 '+(DIMRULE[d.k].primary||'本轮无')+'｜'+DIMRULE[d.k].rule)+'</title>'+d.label+(gapn&&g.gapTag?'<tspan class="axgap" dx="3">缺'+gapn+'</tspan>':'')+'</text>';
 });
 var dot=Math.max(4,Math.round(g.r*0.026)),hit=Math.max(13,Math.round(g.r*0.085));
 var dotBoxes=[];
 vis.forEach(function(id){valsOf(id).forEach(function(v,i){if(v==null)return;var p=ptOf(g,i,v);dotBoxes.push({x0:p.x-dot-2.5,x1:p.x+dot+2.5,y0:p.y-dot-2.5,y1:p.y+dot+2.5})})});
 vis.forEach(function(id){
  var col=colorFor(id),vals=valsOf(id);
  var known=vals.filter(function(v){return v!=null}).length;
  if(known===N){var dd='';vals.forEach(function(v,i){var p=ptOf(g,i,v);dd+=(i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)});
   s+='<path d="'+dd+'Z" fill="'+col+'" fill-opacity="0.12" stroke="'+col+'" stroke-width="2.2" stroke-linejoin="round"/>';
  }else{
   runsOf(vals).forEach(function(run){var dd='';run.forEach(function(idx,k){var p=ptOf(g,idx,vals[idx]);dd+=(k?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)});
    s+='<path d="'+dd+'" fill="none" stroke="'+col+'" stroke-width="2.2" stroke-linecap="round"/>'});
  }
 });
 var focusId=(hoverId&&vis.indexOf(hoverId)>=0)?hoverId:((labelId&&vis.indexOf(labelId)>=0)?labelId:vis[0]);
 var labHidden=0;
 vis.forEach(function(id){
  var m=getModel(id),col=colorFor(id),vals=valsOf(id);
  var known=vals.filter(function(v){return v!=null}).length;
  var showLab=id===focusId;
  DIMS.forEach(function(d,i){var v=vals[i];if(v==null)return;
   var p=ptOf(g,i,v),cc=cellOf(id,d.k).cell,vt=valTxt(v);
   if(showLab){
    var placed=null,sgn=v<96?[1,-1]:[-1,1],offs=[dot+g.fsz*0.95,dot+g.fsz*1.95,dot+g.fsz*2.95],tangs=[0,g.fsz*1.5,-g.fsz*1.5,g.fsz*3,-g.fsz*3];
    for(var a=0;a<sgn.length&&!placed;a++)for(var b=0;b<offs.length&&!placed;b++)for(var c2=0;c2<tangs.length&&!placed;c2++){
     var sg=sgn[a],lx=p.x+Math.cos(p.a)*offs[b]*sg-Math.sin(p.a)*tangs[c2],ly=p.y+Math.sin(p.a)*offs[b]*sg+Math.cos(p.a)*tangs[c2];
     var la=p.cos>0.25?(sg>0?'start':'end'):p.cos<-0.25?(sg>0?'end':'start'):'middle';
     var bb=box(lx,ly,la,vt,g.fsz-1);
     if(bb.x0<2||bb.x1>g.w-2||bb.y0<2||bb.y1>g.h-4)continue;
     if(clash(bb,boxes)||clash(bb,dotBoxes))continue;
     placed={x:lx,y:ly,a:la,b:bb};
    }
    if(placed){boxes.push(placed.b);s+='<text class="vlabel" x="'+placed.x.toFixed(1)+'" y="'+placed.y.toFixed(1)+'" font-size="'+(g.fsz-1)+'" fill="'+col+'" text-anchor="'+placed.a+'" dominant-baseline="middle">'+vt+'</text>'}else labHidden++;
   }
   var aria=esc(m.name+' · '+d.label+'：'+vt+' 分（'+natureOf(id)+'，'+cc.benchmark+'，核对 '+cc.date+'）');
   s+='<g class="vtx" tabindex="0" role="button" data-model="'+esc(id)+'" data-dim="'+d.k+'" aria-label="'+aria+'"><title>'+aria+'</title><circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="'+hit+'" fill="transparent" stroke="transparent" pointer-events="all"/><circle class="dot" cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="'+dot+'" fill="'+col+'" stroke="#0b1430" stroke-width="1.3"/></g>';
  });
  if(vis.length===1&&known<N){
   var hy=g.cy+g.r+g.fsz*2.9,htxt=m.name+'：留空 '+(N-known)+' 维，不封闭图形',hb=box(g.cx,hy,'middle',htxt,g.fsz-2);
   if(!clash(hb,boxes)&&!clash(hb,dotBoxes))s+='<text class="solo-hint" x="'+g.cx+'" y="'+hy.toFixed(1)+'" text-anchor="middle" font-size="'+(g.fsz-2)+'">'+esc(htxt)+'</text>';
  }
 });
 var drawable=vis.filter(function(id){return valsOf(id).some(function(v){return v!=null})});
 if(!drawable.length){
  /* 本组有型号但全组无可绘分值 → 组空态；只有"确有曲线被图例藏起"才说隐藏 */
  var nogroup=mode()==="real"&&all.length>0&&all.every(function(id){return !valsOf(id).some(function(v){return v!=null})});
  var hiddenAll=!nogroup&&vis.length===0&&all.length>0;
  var l1=hiddenAll?('当前 '+all.length+' 款曲线已被图例隐藏：')
    :nogroup?(vis.length?('本评分组当前¦没有满足组内可比条件的分值'):'本组无可绘分，图例仅控制显示')
    :!picked.length?(mode()==="demo"?'未勾选模型（演示内置 '+DEMO_IDS.length+' 款¦模拟分数模型可勾选）':'未勾选模型（待复核样本共 '+STATS.models+' 款，分属 '+GROUPS.length+' 个评分组）')
    :(mode()==="demo"?'所选 '+picked.length+' 款不在演示内置的 '+DEMO_IDS.length+' 款¦模拟分数模型内':'所选 '+picked.length+' 款¦不在待复核评测数据内');
  var l2=hiddenAll?'点击图例可恢复显示'
    :nogroup?('本组 '+all.length+' 款共 '+(((GROUPS.filter(function(x){return x.id===activeGroup()})[0]||{}).rawCells)||0)+' 格已核实，但配置／基准名待确认，暂不绘制；不以 0 分或估算值补画（详见下方对照表）')
    :!picked.length?('在左侧「查找模型」中¦勾选后绘制，数量不限；未勾选时图中只有网格，不补分')
    :(mode()==="demo"?'演示模式内置 '+DEMO_IDS.length+' 款模拟分数模型，¦可勾选其中 1、3、8 款':'待复核样本共 '+STATS.models+' 款，分属 '+GROUPS.map(function(x){return x.short}).join('、'));
  /* 折行宽度＝逐行可占净宽（面板净宽减去轴名／刻度安全区）：宽屏排 2 行长行，窄屏按视口均分 */
  var segs=layoutNote([{t:l1,fs:g.fsz,a:1},{t:l2,fs:g.fsz-1,a:0}],g,boxes);
  segs.rows.forEach(function(sg,i){var yy=segs.y0+i*segs.lh;
    /* 说明文字占位登记给刻度避让，空态图里刻度让位 */
    boxes.push(box(g.cx,yy,'middle',sg.t,sg.fs));
    s+='<text x="'+g.cx+'" y="'+yy.toFixed(1)+'" text-anchor="middle" fill="'+(sg.a?'#cfe0f7':'#95aacd')+'" font-size="'+sg.fs+'">'+esc(sg.t)+'</text>'}); }
 ticks.forEach(function(tk){
  var bb=box(g.cx+6,tk.y,'start',tk.t,g.fsz-2);
  if(!clash(bb,boxes))s+='<text class="glvl" x="'+(g.cx+6)+'" y="'+tk.y.toFixed(1)+'" font-size="'+(g.fsz-2)+'">'+tk.t+'</text>';
 });
 var svg=document.getElementById('radar');
 svg.setAttribute('data-focus',focusId||'');
 svg.setAttribute('data-group',activeGroup()||'demo');
 svg.setAttribute('viewBox','0 0 '+g.w+' '+g.h);
 var grec=GROUPS.filter(function(x){return x.id===activeGroup()})[0]||null;
 var gname=grec?grec.short:(picked.length?'所选模型不在待复核样本内':'未勾选模型');
 svg.setAttribute('aria-label','九维能力百分制雷达图（0—100 分'+(mode()==="demo"?'，演示模式分数为模拟值':'，评分组 '+gname)+'）：'+(drawable.length?drawable.map(function(id){return getModel(id).name}).join('；'):'当前无可见曲线'));
 svg.innerHTML=s;
 document.getElementById('radar-label').textContent=mode()==="demo"?"演示模式：分数为固定模拟值，非真实测评（可自由叠加）":"待复核评测数据 · 评分组："+gname+"（跨组不叠加绘制）　复核状态 "+SC.reviewStatus;
 var ruleTxt=drawable.length>1?("分数标注：多款叠加时只常驻当前聚焦模型（"+(getModel(focusId)?getModel(focusId).name:'—')+"）的分数，点击顶点或悬停图例可切换；完整分值见下方对照表（保留全部 "+picked.length+" 款）。"):"分数标注：单款时常驻显示九维分数；多款时只常驻当前聚焦模型，点击顶点或悬停图例切换，完整分值见下方对照表。";
 if(all.length&&!drawable.length&&mode()==="real")ruleTxt='分数标注：本组 '+all.length+' 款当前没有可绘分值（见图内说明与下方对照表），因此图中只有网格，不画线、不标点。';
 if(labHidden)ruleTxt+=labHidden+" 处分数与轴名称／刻度／圆点相撞且无空位，图中未显示，点击顶点或查下方分值表。";
 document.getElementById('radar-bottom').textContent=ruleTxt+"刻度：内圈 20 分至外圈 100 分，顶点位置即得分。"+(mode()==="demo"?"演示分数为模拟值，可自由叠加；":(grec?"本图只绘制评分组「"+gname+"」，跨组模型保留选择、对照表与详情，不混画曲线；":"本图未绘制任何评分组（"+gname+"），不画线、不补分；"))+"留空维度（"+GAPKINDS+"）不绘制、不连向圆心"+(mode()==="demo"?"、不封闭图形":"；存在留空维度时不画封闭区域");
 renderPartialNote(grec);
}
/* 「本图为部分结果」定位说明：DOM 文本（非 SVG <text>），可绘维度数、维度名、款数与格数全部由数据文件推导。
   折行交给浏览器，但断点只设在冒号／逗号／分号／句号之后（每段最短 5 字），既不会词内断开，也不会剩两三字孤行。 */
function noteClauses(t){var out=[],cur='';
 for(var i=0;i<t.length;i++){var c=t.charAt(i);cur+=c;
  if('，。；：'.indexOf(c)>=0){out.push(cur);cur=''}}
 if(cur)out.push(cur);return out}
function appendNoteText(el,t){noteClauses(t).forEach(function(s){var n=document.createElement('span');n.className='pnc';n.textContent=s;el.appendChild(n)})}
function renderPartialNote(grec){
 var el=document.getElementById('partial-note');if(!el)return;
 if(mode()!=="real"||!grec){el.hidden=true;el.textContent="";return}
 var dims=DIMS.filter(function(d){return grec.models.some(function(id){var r=SC_MAP[id];return !!(r&&r.cells&&r.cells[d.k])})});
 var body=dims.length?("本图仅呈现组内具备同口径可比条件的 "+dims.length+" 个维度："+dims.map(function(d){return d.label}).join("、")+"；其余 "+(DIMS.length-dims.length)+" 个维度暂无同口径可比分数，不绘制、不以 0 分或估算值补画。")
  :("本组暂无可绘维度："+grec.models.length+" 款共 "+(grec.rawCells||0)+" 格原始成绩已核实，但配置／基准名待确认，暂无同口径可比分数，不以 0 分或估算值补画。");
 el.textContent="";
 appendNoteText(el,body);
 var tag=document.createElement("b");
 appendNoteText(tag,dims.length?"本图为部分结果，不代表模型整体能力。":"本图为部分结果。");
 el.appendChild(tag);
 el.hidden=false;
}
function scoreBlockHTML(id){
 var rec=recOf(id),md=mode();
 var head='<div class="model-head"><span class="flabel">九维评分（'+(md==="demo"?"演示模式 · 模拟分数":"待复核评测数据 · 原始成绩逐格核验，可比性逐格另判")+'）</span></div>';
 if(!rec)return head+'<p class="specs">'+(md==="demo"?"该款不在演示内置的 "+DEMO_IDS.length+" 款模拟分数模型内。":"该款不在待复核评测数据（"+SC.models.map(function(x){return x.name}).join("、")+"）内，且无符合口径的可比评测数据；未测／资料缺失／不适用一律留空，不按 0 分处理。")+'</p>';
 var rows=DIMS.map(function(d){var c=cellOf(id,d.k);
  if(!c||c.kind==="gap"){var gg=c&&c.g;
   return '<li><span class="capn">'+d.label+(DIMRULE[d.k].proxy&&gg&&gg.proxy?'<small class="score-dim">'+esc(DIMRULE[d.k].labelFull||'代理指标')+'</small>':'')+'</span><span class="cellu">'+(gg?KIND[gg.kind]:'无记录')+
    (gg&&gg.raw?'　已核实原始成绩 '+esc2(gg.raw)+'（不绘分）'+(gg.url?' <a href="'+esc(gg.url)+'" target="_blank" rel="noopener">原始页↗</a>':''):'')+
    (gg?'<small class="score-dim">核验分级：'+esc(gapGrade(gg))+'｜复核日期：'+esc(gapVerified(gg))+'</small>':'')+
    '<small class="score-dim">'+esc2(gg?gg.why:'')+'</small></span></li>'}
  return '<li><span class="capn">'+d.label+'</span><b class="cellv">'+valTxt(c.v)+'</b><small class="score-dim">'+esc2(c.cell.benchmark)+'｜'+esc(natureOf(id))+'｜核对 '+esc2(c.cell.date)+(c.cell.proxy?'｜'+esc(DIMRULE[d.k].labelFull||'代理指标'):'')+'</small></li>'}).join('');
 var audit=(rec.configAudit||[]).map(function(a){return '<div class="evidence"><b>'+esc(a.item)+'</b>　'+esc(a.status)+'：'+esc(a.detail)+'</div>'}).join('');
 var srcs=srcLinks(srcsOf(id)),r=rec;
 return head+'<ul class="caps scl">'+rows+'</ul>'+(md==="demo"?'<p class="specs">演示分值＝页内固定模拟常量，仅验证图形与交互，不进入研究资料，不作为待复核数据回退。</p>':'<p class="specs">评分组：'+esc(BATCH[r.batch]?BATCH[r.batch].label:"")+'｜'+esc(r.versionNote||'')+'</p>'+(audit?'<details><summary>可比性逐格检查（指标／版本／快照／推理档位／工具与框架／采样配置）</summary>'+audit+'</details>':'')+'<p class="official">评分来源：'+(srcs||'暂无')+'</p>');
}
function renderDetails(){
 var sec=document.getElementById('details');sec.hidden=!picked.length;
 var g=document.getElementById('detail-grid');g.dataset.count=picked.length;
 g.innerHTML=picked.length?picked.map(function(id){var m=getModel(id);return '<article class="detail-card" id="dc-'+esc(id)+'"><div class="detail-head" style="border-top:3px solid '+colorFor(id)+'"><h3>'+esc(m.name)+'</h3><small>'+esc(m.vendor)+' · '+esc(m.region||'')+' · 开放方式：'+esc(m.openness)+'</small>'+(m.risk?'<span class="risk-badge">⚠ 存在下线或退役风险：'+esc(m.riskNote||'')+'</span>':'')+'</div><div class="detail-body"><p class="official">'+officialLine(m)+'</p><p class="official">开放方式依据：'+esc(m.opennessBasis||'')+'</p>'+specLine(m)+'<p class="position">'+esc(m.pos||'')+'</p>'+scoreBlockHTML(id)+'<ul class="caps">'+m.caps.map(function(c,i){return '<li><span>'+CAPS[i].label+'</span>'+status(c)+'</li>'}).join('')+'</ul><details><summary>来源与核验依据（含核验日期）</summary>'+m.ev.map(function(e,i){var links=(e.links||[]).map(function(l){return '<a href="'+esc(l.u)+'" target="_blank" rel="noopener">'+esc(l.t)+'（'+esc(l.e)+' 类，核验 '+esc(l.d)+'）↗</a>'}).join('');return '<div class="evidence"><b>'+CAPS[i].label+'</b>　'+status(m.caps[i])+'<br>'+esc(e.q)+(links?'':(m.caps[i]==='u'?'':'<p>暂无专项核验依据</p>'))+links+'</div>'}).join('')+'</details><p class="date">能力状态核验日期以各来源标注为准（2026-10-30／10-31）；评分核对日期见上方评分块。本轮不计算综合总分。</p></div></article>'}).join(''):'<p class="empty">左侧选中模型后，对应详情会直接显示在这里</p>';
}
function refreshModeNote(){
 var el=document.getElementById('mode-note');if(!el)return;
 var txt=mode()==="demo"
  ?'<b>演示模式 · 以下分数全部为模拟值，非真实测评。</b>仅用于验证九维折线、0—100 刻度、分数标注、多款叠加与缺分留空等图形交互；不写入研究资料，切换到待复核数据后不会作为回退数据。'
  :'<b>待复核评测数据 · 保留原始来源与复核状态，不作为发布或选型依据。</b>九维样本 '+STATS.models+' 款分属 '+GROUPS.length+' 个评分组（'+GROUPS.map(function(x){return x.short}).join('、')+'）；<b>「成绩已取得」不等于「可以比较」</b>：原始成绩已核实 '+STATS.rawVerified+' 格，其中满足组内可比条件（指标／版本／档位／工具／配置逐项确认）可绘分 '+STATS.plottable+' 格，因版本、配置或代理指标限制暂不绘制 '+STATS.held+' 格（数值与来源保留在对照表）。<b>一张图只画一个评分组</b>，跨组选中的模型保留选择、对照表与详情，不混画曲线；'+GAPKINDS+'一律留空，不填 0、不补平均、不连向圆心，存在留空维度时不画封闭区域。演示模式的固定分值不会回填到此处。';
 var out=uncovered();
 if(out.length)txt+='　当前模式下无评分记录：'+out.slice(0,3).map(function(id){return esc(getModel(id).name)}).join('、')+(out.length>3?' 等 '+out.length+' 款':'')+'（图形不补分，能力状态与详情仍完整）。';
 el.className='mode-note'+(mode()==="real"?' real':'');
 el.innerHTML=txt;
}
function refreshSelection(){syncChoiceChecks();renderSelected();renderDetails();renderTable();refreshModeNote();renderRadar();resetInfo()}
function update(){refreshSelection()}
var WSVG=document.getElementById('radar');
// 多款曲线在同处几乎重叠时，按几何最近点判定要查看的顶点，避免被上层圆点挡住而点不到
function vertexAt(e){
 var vs=[].slice.call(WSVG.querySelectorAll('.vtx'));if(!vs.length)return null;
 var best=null,bd=1e9;
 vs.forEach(function(g){var c=g.querySelector('.dot');if(!c)return;
  var b=c.getBoundingClientRect();var dx=e.clientX-(b.left+b.width/2),dy=e.clientY-(b.top+b.height/2);
  var d=Math.hypot(dx,dy);if(d<bd){bd=d;best=g}});
 var lim=vs.length?Math.max(16,(+vs[0].querySelector('circle').getAttribute('r'))+2):0;
 return bd<=lim?best:null;
}
WSVG.addEventListener('click',function(e){var ax=e.target.closest('.axl');if(ax){showDim(ax.dataset.dim);return}var g=vertexAt(e);if(g){labelId=g.dataset.model;showInfo(g.dataset.model,g.dataset.dim);renderLegend();renderRadar()}});
WSVG.addEventListener('mouseover',function(e){var g=e.target.closest('.vtx');if(g){showInfo(g.dataset.model,g.dataset.dim);return}var ax=e.target.closest('.axl');if(ax)ax.classList.add('hot')});
WSVG.addEventListener('mouseout',function(e){var ax=e.target.closest('.axl');if(ax)ax.classList.remove('hot')});
WSVG.addEventListener('focusin',function(e){var g=e.target.closest('.vtx');if(g)showInfo(g.dataset.model,g.dataset.dim);else{var ax=e.target.closest('.axl');if(ax)showDim(ax.dataset.dim)}});
WSVG.addEventListener('keydown',function(e){var g=e.target.closest('.vtx'),ax=e.target.closest('.axl');if((g||ax)&&(e.key==='Enter'||e.key===' ')){e.preventDefault();if(g)showInfo(g.dataset.model,g.dataset.dim);else showDim(ax.dataset.dim)}});
document.getElementById('radar-info').addEventListener('click',function(e){
 if(e.target.closest('[data-clear-info]')){resetInfo();return}
 var btn=e.target.closest('[data-solo]');if(!btn)return;var id=btn.dataset.solo,k=btn.dataset.dim;soloId=(soloId===id?null:id);labelId=id;renderLegend();renderRadar();showInfo(id,k)});
/* 分值表逐格点击（含留空格）：完整依据显示在图下信息条；信息条不在视口内时滚到可见处 */
function revealInfo(){
 var el=document.getElementById('radar-info');if(!el)return;
 var nav=NAVH(),lim=window.innerHeight-16,topPad=nav+8,r=el.getBoundingClientRect();
 /* 信息条能整条放下时优先露出顶部；过高时退化为底部对齐，避免标题被固定导航遮住 */
 if(r.height<=window.innerHeight-topPad-8){if(r.top<topPad||r.bottom>lim)window.scrollBy(0,r.top-topPad)}
 else if(r.bottom>lim||r.bottom<8)window.scrollBy(0,r.bottom-lim)}
document.getElementById('score-values').addEventListener('click',function(e){var b=e.target.closest('[data-cell-model]');if(!b)return;
 showInfo(b.dataset.cellModel,b.dataset.cellDim);revealInfo()});
document.getElementById('legend').addEventListener('click',function(e){var btn=e.target.closest('[data-toggle]');if(!btn)return;var id=btn.dataset.toggle;
 if(hidden[id]){delete hidden[id];soloId=null;labelId=id}
 else{hidden[id]=1;soloId=null;if(labelId===id)labelId=null}
 renderLegend();renderRadar();var nb=document.querySelector('#legend [data-toggle="'+(window.CSS&&CSS.escape?CSS.escape(id):id)+'"]');if(nb)nb.focus({preventScroll:true})});
document.getElementById('legend').addEventListener('mouseover',function(e){var b=e.target.closest('[data-toggle]');if(!b||b.dataset.toggle===hoverId)return;hoverId=b.dataset.toggle;renderRadar()});
document.getElementById('legend').addEventListener('mouseleave',function(){if(!hoverId)return;hoverId=null;renderRadar()});
document.getElementById('lg-tools').addEventListener('click',function(e){var btn=e.target.closest('[data-lg]');if(!btn)return;var k=btn.dataset.lg;if(k==='all'){hidden={};soloId=null}else if(k==='unsolo'){soloId=null}else if(k==='restore'){hidden={}}renderLegend();renderRadar();btn.focus({preventScroll:true})});
[].slice.call(document.querySelectorAll('input[name="datamode"]')).forEach(function(r){r.addEventListener('change',function(){hidden={};soloId=null;labelId=null;groupId=null;groupIdUser=false;resetInfo();refreshSelection()})});
document.getElementById('groupbar').addEventListener('click',function(e){var b=e.target.closest('[data-group]');if(!b)return;
 groupId=b.dataset.group;groupIdUser=true;soloId=null;labelId=null;hidden={};resetInfo();refreshSelection();
 var nb=document.querySelector('#groupbar [data-group="'+(window.CSS&&CSS.escape?CSS.escape(groupId):groupId)+'"]');if(nb)nb.focus({preventScroll:true})});
window.addEventListener('resize',function(){clearTimeout(rzT);rzT=setTimeout(function(){renderRadar();if(window.innerWidth>768)closeMenus()},180)});
function pickFrom(e){var cb=e.target.closest('input[type=checkbox][data-model]');if(!cb)return;var id=cb.dataset.model;
 if(cb.checked){if(picked.indexOf(id)<0)picked.push(id)}else picked=picked.filter(function(x){return x!==id});
 refreshSelection()}
function closeMenus(){
 document.querySelectorAll('#vendorPills .fam-dd.open').forEach(function(d){d.classList.remove('open');var t=d.querySelector('.fam-dd-toggle');if(t)t.setAttribute('aria-expanded','false')});
 var pn=document.getElementById('search-panel');if(pn)pn.hidden=true;
}
document.getElementById('include-risk').addEventListener('change',function(){renderVendorPills();renderSearchResults();updateCount();document.getElementById('selection-msg').textContent=this.checked?'已包含 3 款退役风险型号，选择时请注意风险标注。':''});
document.getElementById('form-chips').addEventListener('change',function(){renderVendorPills();renderSearchResults();updateCount()});
document.getElementById('reset-filters').addEventListener('click',function(){document.querySelectorAll('#form-chips input').forEach(function(x){x.checked=true});document.getElementById('include-risk').checked=false;renderVendorPills();renderSearchResults();updateCount();document.getElementById('selection-msg').textContent=''});
document.getElementById('search').addEventListener('input',renderSearchResults);
document.getElementById('search').addEventListener('focus',renderSearchResults);
document.getElementById('vendorPills').addEventListener('click',function(e){
 var tg=e.target.closest('.fam-dd-toggle');
 if(tg){var dd=tg.closest('.fam-dd'),wasOpen=dd.classList.contains('open');closeMenus();if(!wasOpen){dd.classList.add('open');tg.setAttribute('aria-expanded','true');var menu=dd.querySelector('.fam-dd-menu');if(window.innerWidth<=768){var r=tg.getBoundingClientRect(),gap=6,pad=12,vh=window.innerHeight;var below=vh-r.bottom-gap-pad,above=r.top-gap-pad,maxH=Math.min(430,vh*0.62);var top=r.bottom+gap,avail=below;if(below<Math.min(maxH,220)&&above>below){avail=above;top=r.top-gap-Math.min(maxH,above)}menu.classList.add('menu-fixed');menu.style.top=Math.max(pad,top)+'px';menu.style.maxHeight=Math.max(140,Math.min(maxH,avail))+'px'}else{menu.classList.remove('menu-fixed');menu.style.top='';menu.style.maxHeight=''}}return}
 var all=e.target.closest('[data-vendor-all]');
 if(all){var v=VENDOR_BY_KEY[all.dataset.vendorAll];if(!v)return;v.models.filter(inScope).forEach(function(m){if(picked.indexOf(m.id)<0)picked.push(m.id)});refreshSelection();return}
 var more=e.target.closest('[data-more]');
 if(more){var box=more.closest('.fam-dd').querySelector('.fam-more');box.hidden=!box.hidden;more.setAttribute('aria-expanded',String(!box.hidden));more.textContent=box.hidden?('其余 '+box.children.length+' 款 ▾'):'收起其余型号 ▴'}
});
document.getElementById('vendorPills').addEventListener('change',pickFrom);
document.getElementById('choices').addEventListener('change',pickFrom);
document.getElementById('selected').addEventListener('click',function(e){
 var b=e.target.closest('[data-remove]');
 if(b){picked=picked.filter(function(x){return x!==b.dataset.remove});refreshSelection();return}
 if(e.target.closest('#clear')){picked=[];focusedId=null;expandedSelection=false;refreshSelection();return}
 if(e.target.closest('[data-expand-selection]')){expandedSelection=!expandedSelection;renderSelected()}
});
document.getElementById('select-filtered').addEventListener('click',function(){filtered.forEach(function(m){if(picked.indexOf(m.id)<0)picked.push(m.id)});refreshSelection()});
document.addEventListener('click',function(e){if(!e.target.closest('.fam-dd')&&!e.target.closest('.search-box'))closeMenus()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeMenus()});
document.querySelectorAll('#form-chips .cb').forEach(function(lb){var b=lb.querySelector('input');var c=MODELS.filter(function(m){return m.openness===b.dataset.openness}).length;lb.querySelector('span').textContent=b.dataset.openness+' ('+c+')'});
updateStats();renderVendorPills();renderSearchResults();updateCount();refreshSelection();resetInfo();
if(window.__modelsMarkHandled)window.__modelsMarkHandled();
var _de=document.getElementById('data-error');if(_de)_de.hidden=true;
})()}
