# 南鲸商城 — Cursor 上手指南

> 供 AI / 开发者快速了解本仓库。每次新会话建议先读本文件，再按需打开下方「必读文档」。

---

## 1. 项目简介

**南鲸商城**是一个专注国货品牌的在线购物平台，支持四类角色协作：

| 角色 | 标识 | 典型能力 |
|------|------|----------|
| 游客 | 未登录 | 浏览商店、商品、评论 |
| 顾客 | `CUSTOMER` | 购物车、下单、地址、优惠券、评价 |
| 门店员工 | `STAFF` | 本店商品/库存/订单/优惠券、门店报表 |
| 平台管理员 | `ADMIN` | 创建商店、全局优惠券、全局报表 |

**本仓库当前内容**：React 前端（根目录 `src/`）。Spring Boot 后端可能在独立仓库或本机其他目录，联调时默认 `http://localhost:8080`。

---

## 2. 技术栈（前端）

| 类别 | 选型 |
|------|------|
| 框架 | React 18 |
| 构建 | Vite 5 |
| UI | Ant Design 5 |
| 请求 | Axios |
| 路由 | React Router v6 |
| 规范 | ESLint + Prettier |

**常用命令**（在项目根目录）：

```bash
npm install          # 首次安装依赖
npm run dev          # 开发服务器 http://localhost:5173，/api 代理到 8080
npm run build        # 生产构建
npm run lint         # 代码检查
npm run format       # Prettier 格式化 src
```

---

## 3. 文档地图（按场景阅读）

### 3.1 首次上手 / 新功能开发

| 优先级 | 文件 | 用途 |
|--------|------|------|
| ① | [`docs/requirements.md`](docs/requirements.md) | 业务需求、角色、功能模块、**暂不实现**范围 |
| ② | [`docs/api-spec.md`](docs/api-spec.md) | REST 路径、请求/响应、权限、分页格式 |
| ③ | [`docs/实现细节.md`](docs/实现细节.md) | 各模块实现要点、页面交互、边界情况 |
| ④ | [`docs/前端进度.md`](docs/前端进度.md) | 前端页面与 API 对接进度（改 UI 前先看） |
| ⑤ | [`docs/进度.md`](docs/进度.md) | **后端**实现进度 |

### 3.2 排错 / 联调失败

| 文件 | 用途 |
|------|------|
| [`docs/踩坑记录.md`](docs/踩坑记录.md) | 已知 Bug、现象、原因、解法（**先查再改**） |

### 3.3 理解「为什么这样写」

| 文件 | 用途 |
|------|------|
| [`docs/设计决策.md`](docs/设计决策.md) | 技术选型、架构取舍（ADR 简版） |

### 3.4 改代码时快速定位

| 文件 | 用途 |
|------|------|
| [`vite.config.js`](vite.config.js) | `/api` → `http://localhost:8080` 开发代理 |
| [`src/api/request.js`](src/api/request.js) | Axios、JWT、`401`、Result 解包（待完善） |
| [`src/router/index.jsx`](src/router/index.jsx) | 路由与登录守卫 |
| [`package.json`](package.json) | 依赖与脚本 |

---

## 4. 目录结构（前端）

```
cursorTry/
├── CURSOR.md              ← 本文件（入口）
├── docs/
│   ├── requirements.md    # 需求
│   ├── api-spec.md        # API 契约
│   ├── 进度.md            # 后端进度
│   ├── 前端进度.md        # 前端进度
│   ├── 踩坑记录.md        # Bug & 解法
│   ├── 设计决策.md        # 重要设计决策
│   └── 实现细节.md        # 各模块实现细节
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── api/request.js
│   ├── router/index.jsx
│   └── pages/
├── vite.config.js
└── package.json
```

---

## 5. 与后端对接约定

- **Base URL**：`/api`（开发环境由 Vite 代理到 `8080`）
- **认证**：`Authorization: Bearer <token>`，token 存 `localStorage`，键名 `token`
- **统一响应**（见 `api-spec.md`）：

  ```json
  { "code": 200, "message": "success", "data": { ... } }
  ```

  业务数据在 `data` 字段；列表分页为 `data.records` + `total` / `current` / `size` / `pages`。

- **登录接口**：`POST /api/auth/login`，请求体 `{ phone, password }`；响应 `data` 含 `token`、`userId`、`nickname`、`role`。
- **角色路由**：登录后按 `CUSTOMER` / `STAFF` / `ADMIN` 进入不同布局（见 `设计决策.md` D-006）。

---

## 6. 当前前端状态（摘要）

- ✅ 项目脚手架、代理、Axios 封装、基础路由、登录页占位、Dashboard 占位
- ⚠️ 登录表单仍用 `username`，需改为 `phone`；响应需适配 `Result` 包装（见 `踩坑记录.md` #001 #002）
- ⚠️ 未按角色拆分布局与业务页面
- 📋 模块勾选见 [`docs/前端进度.md`](docs/前端进度.md)

---

## 7. 建议实现顺序（前端）

1. 对齐登录与 `request.js`（`Result` 解包、`phone`、存 `role` / `userId`）
2. 按角色配置路由与布局（Customer / Staff / Admin）
3. 商品浏览（商店列表、商品列表/详情/搜索）
4. 购物车 → 地址 → 订单
5. Staff/Admin 管理端

各步细节见 [`docs/实现细节.md`](docs/实现细节.md)。

---

## 8. 文档维护约定（重要）

开发过程中请**同步更新**以下文档，便于下次会话或他人接手：

| 何时 | 更新哪个文件 |
|------|----------------|
| 遇到 Bug 并解决（或暂避） | [`docs/踩坑记录.md`](docs/踩坑记录.md) — 用文末模板追加 #0XX |
| 做出重要技术/产品取舍 | [`docs/设计决策.md`](docs/设计决策.md) — 新增 D-0XX |
| 完成某模块页面或摸清接口边界 | [`docs/前端进度.md`](docs/前端进度.md) + [`docs/实现细节.md`](docs/实现细节.md) 对应章节状态 |
| 后端模块状态变化 | [`docs/进度.md`](docs/进度.md)（后端仓库维护） |

**AI 协作提示**：修 Bug 前先检索 `踩坑记录.md`；改架构前看 `设计决策.md`；实现某模块前读 `实现细节.md` 对应节 + `api-spec.md`。

---

## 9. 注意事项

- **MVP 范围外**功能见 `requirements.md` 第 5 节，不要过度实现。
- `docs/进度.md` 总览 JWT 可能与 checklist 不一致，**以 checklist 与联调结果为准**（见 `踩坑记录.md` #008）。
- 需求文档实际路径为 [`docs/requirements.md`](docs/requirements.md)（非 `Requirement.md`）。
- 联调前确认 Spring Boot 在 `8080` 运行。

---

*最后更新：2026-06-03*
