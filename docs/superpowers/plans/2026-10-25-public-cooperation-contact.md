# Public Cooperation Contact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在合作共建页和企业服务页公开用户授权的电话、邮箱和微信二维码。

**Architecture:** 两页使用相同的静态联系区块与同一张二维码素材。电话和邮箱使用原生链接，微信二维码直接展示，不再把企业合作引向官方小程序弹窗。

**Tech Stack:** 静态 HTML、CSS、Node.js 页面契约检查。

**Spec:** 用户在当前对话中明确授权公开电话、邮箱和微信二维码，并要求继续工作。

## Global Constraints

- 仅修改本地待发布文件，不部署。
- 二维码必须原样复制，不重绘或生成式修改。
- 仅在 `cooperate.html` 和 `enterprise.html` 的合作联系区域公开这些资料。
- 保留“不要先提交客户资料、账号密码等敏感信息”的提醒。

## Review Focus

- 两个页面都必须出现电话、邮箱和微信二维码。
- 电话与邮箱链接应使用正确的 `tel:` 和 `mailto:` 地址。
- 二维码素材引用必须存在且与用户上传文件逐字节一致。
- 页面不应继续声称按钮打开官方小程序码。
- 手机窄屏下联系区块和二维码不得横向溢出。

---

### Task 1: 合作联系方式与二维码

**Files:**
- Create: `素材/二维码/智能营销-胡子-微信二维码.png`
- Modify: `cooperate.html`
- Modify: `enterprise.html`
- Modify: `cooperate.css`
- Modify: `enterprise.css`
- Create: `contact.css`
- Create: `tools/test-public-cooperation-contact.cjs`

**Interfaces:**
- Consumes: 用户授权公开的电话、邮箱和二维码原图。
- Produces: 两个页面可见、可点击且响应式的合作联系入口。

- [ ] **Step 1: 写页面契约检查并确认失败**
- [ ] **Step 2: 原样复制二维码，修改两个页面与样式**
- [ ] **Step 3: 运行契约检查、项目检查和浏览器页面检查**
- [ ] **Step 4: 审阅差异，不部署**
