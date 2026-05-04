# 畅点餐 - 餐饮小程序完整解决方案

> 一套可直接商用的点餐小程序系统，包含用户端 H5、商家管理后台、FastAPI 后端、以及营销展示网站。支持扫码点餐、在线支付、会员体系、优惠券、营销活动、骑手配送、数据报表等完整功能。

---

## 项目概览

```
changdiancan/
├── marketing/          # 营销展示网站 (React + Vite)
├── miniapp/            # 用户端小程序 H5 (React + 移动端适配)
├── admin/              # 商家管理后台 (React + shadcn/ui + Recharts)
├── backend/            # FastAPI 后端服务 + SQLite
└── design/             # 设计文档
```

| 模块 | 技术栈 | 说明 |
|------|--------|------|
| 营销网站 | React 19 + TypeScript + Tailwind + Framer Motion | 5页面产品展示，用于猪八戒接单 |
| 用户端 H5 | React 19 + TypeScript + Tailwind + Context API | 模拟微信小程序体验，扫码点餐 |
| 商家后台 | React 19 + TypeScript + shadcn/ui + Recharts | PC端管理Dashboard，数据可视化 |
| 后端 API | FastAPI + SQLAlchemy + Pydantic + SQLite | 70+ RESTful 接口，完整业务逻辑 |

---

## 快速启动

### 1. 后端服务

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动服务 (http://localhost:8000)
python run.py
```

后端服务包含：
- API 文档：`http://localhost:8000/docs` (Swagger UI)
- 数据模型：18张表，预置演示数据

### 2. 前端项目

```bash
cd app

# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

构建产物在 `app/dist/` 目录，可部署到任意静态托管服务。

---

## 后端 API 模块

| 模块 | 接口数 | 核心功能 |
|------|--------|----------|
| `auth` | 5 | 注册/登录/微信授权/用户信息 |
| `stores` | 8 | 门店 CRUD/公告/营业状态 |
| `tables` | 7 | 桌台管理/二维码生成 |
| `categories` | 7 | 菜品分类/排序/显隐 |
| `dishes` | 10 | 菜品 CRUD/库存/规格/上下架 |
| `orders` | 8 | 订单全流程/状态流转/退款/加菜 |
| `members` | 6 | 会员等级/积分/储值充值 |
| `coupons` | 9 | 优惠券创建/领取/使用/验证 |
| `activities` | 7 | 秒杀/拼团/限时特价/第二份半价 |
| `payment` | 4 | 统一下单/支付回调/退款 |
| `riders` | 8 | 骑手接单/配送/位置更新 |
| `staff` | 7 | 后厨订单管理/上菜确认 |
| `dashboard` | 7 | 营收统计/销量排行/会员分析 |

---

## 数据库表结构

| 表名 | 说明 |
|------|------|
| `users` | 用户表（微信openid、手机号、会员等级） |
| `stores` | 门店表 |
| `tables` | 桌台表（桌号、容量、状态、二维码） |
| `categories` | 菜品分类表 |
| `dishes` | 菜品表（价格、库存、规格、标签、销量） |
| `orders` | 订单表（状态、金额、支付、配送信息） |
| `order_items` | 订单项表 |
| `member_levels` | 会员等级表 |
| `coupons` | 优惠券表 |
| `user_coupons` | 用户优惠券关联表 |
| `activities` | 营销活动表 |
| `payments` | 支付记录表 |
| `riders` | 骑手表 |
| `delivery_orders` | 配送订单表 |
| `staff` | 店员表 |
| `points_logs` | 积分记录表 |
| `banners` | 轮播图表 |

---

## 演示数据

项目预置了完整的演示数据：

- **门店**：畅点餐旗舰店（北京朝阳区）
- **分类**：6个（热销推荐、精品热菜、清爽凉菜、美味主食、时尚饮品、超值套餐）
- **菜品**：24道（红烧肉、宫保鸡丁、水煮牛肉、珍珠奶茶、小笼包等）
- **会员等级**：4级（普通/银卡/金卡/钻石）

---

## 三版本定价

| 版本 | 价格 | 适用场景 |
|------|------|----------|
| 基础版 | ¥3,999 | 夫妻店、小餐馆、奶茶店 |
| 标准版 | ¥9,999 | 连锁单店、中餐店、火锅店 |
| 高级定制版 | ¥29,999 | 大型连锁、美食广场、多门店加盟 |

---

## 部署建议

### 生产环境配置

1. **数据库**：将 `SQLite` 切换为 `MySQL` 或 `PostgreSQL`
   - 修改 `backend/app/config.py` 中的 `DATABASE_URL`

2. **支付接口**：替换微信支付模拟为真实接口
   - 修改 `backend/app/utils/wxpay.py` 接入微信官方SDK

3. **文件存储**：配置阿里云OSS/腾讯云COS
   - 图片上传接入对象存储

4. **服务器部署**：
   - 后端：使用 `gunicorn` + `uvicorn` 部署
   - 前端：`npm run build` 后部署到 Nginx/CDN

---

## 项目特点

- **完整四端覆盖**：用户端 + 商家后台 + 店员端 + 骑手端
- **真实后端**：FastAPI + 70+ 接口，非纯静态Demo
- **移动端优先**：H5小程序体验，适配微信生态
- **数据可视化**：营收趋势、销量排行、会员分析图表
- **即插即用**：预置演示数据，启动即可体验

---

## 技术栈版本

| 技术 | 版本 |
|------|------|
| React | 19 |
| TypeScript | ~5.6 |
| Tailwind CSS | 3.4.19 |
| Vite | 7.2.4 |
| FastAPI | 0.115 |
| SQLAlchemy | 2.0.36 |
| Pydantic | 2.9 |

---

## 许可

本项目为演示/接单用途开发，可根据实际需求二次开发商用。

---

> 开发日期：2026-05-04 | 适用于猪八戒等平台接单展示
