# Features Page — 功能详情

A comprehensive feature documentation page. Interactive tab-based navigation lets visitors explore the four terminal systems in detail. Each tab contains categorized feature lists with descriptions, screenshots, and implementation notes.

---

## Section 1: Page Header

### Layout
Full width, `gradient-hero` background. Centered content, padding `space-24` vertical.

### Elements
- **Eyebrow**: "完整功能清单" — white, `heading-4`, centered
- **Title**: "四端系统 · 全面覆盖" — `display-2`, white, centered
- **Subtitle**: "用户端、商家后台、店员端、骑手端，64+ 项核心功能\n满足不同规模餐饮商家的数字化需求" — `body-large`, white at 85%, centered, max-width 640px
- **Tab bar preview**: Four pill-shaped tab indicators at bottom, showing the four terminal icons and names (visual only, non-interactive here)

### Animations
- **Title**: `fade-up`, 600ms, GSAP SplitText character stagger 20ms
- **Subtitle**: `fade-up`, 600ms, delay 200ms
- **Tab pills**: `fade-up`, stagger 80ms, delay 400ms

---

## Section 2: Terminal Tabs Navigation

### Layout
Sticky below navbar. Full width, `--color-bg-card` background, 1px bottom shadow. Centered horizontal tab bar.

### Elements
Four tabs, each with icon + label:

| Tab | Icon | Label | Accent Color |
|-----|------|-------|-------------|
| 1 | `smartphone` | 用户端小程序 | `--color-primary` |
| 2 | `layout-dashboard` | 商家管理后台 | `--color-accent` |
| 3 | `tablet` | 店员后厨端 | `--color-info` |
| 4 | `bike` | 骑手配送端 | `--color-warning` |

- **Tab style**: Horizontal flex, gap 8px. Each tab: `radius-full` pill, padding 12px 24px.
  - Inactive: `--color-bg-elevated` bg, `--color-text-secondary` text
  - Active: Accent color background (from table), white text, subtle shadow
- **Mobile**: Horizontal scroll container, snap to tab

### Animations
- **Tab switch**: Content area crossfades, 300ms. Active tab indicator slides to new position (Framer Motion layoutId).

---

## Section 3: Tab 1 — 用户端小程序

### Layout
Tab content container. Max-width container. Two-column layout: 60% feature list, 40% phone mockup image.

### Elements

#### Module 1: 首页模块
- **Section title**: "首页模块" — `heading-3`, with `--color-primary` left border accent (4px)
- **Features** (6 items, each with check icon):
  - **门店招牌展示** — 顶部大图展示门店招牌与品牌信息
  - **营业信息** — 营业时间、门店地址、联系电话一键展示
  - **轮播海报** — 支持多张活动海报轮播，自动播放
  - **活动弹窗** — 首页加载弹出优惠提醒，支持自定义内容
  - **新品/热门推荐** — 算法推荐热门菜品与新品上架
  - **一键导航/拨号** — 地图导航到店，直接拨打电话

#### Module 2: 扫码点餐核心
- **Section title**: "扫码点餐" — `heading-3`
- **Features** (7 items):
  - **桌台二维码绑定** — 扫码自动识别桌号，无需手动输入
  - **分类菜品展示** — 热菜/凉菜/饮品/主食/套餐分类浏览
  - **菜品大图展示** — 高清菜品图片，放大查看细节
  - **规格选择** — 大份/小份、加料/不加料等规格配置
  - **口味备注** — 辣度、甜度、忌口等口味选项
  - **购物车管理** — 增减数量、已选菜品汇总、实时价格计算
  - **临时加菜** — 订单过程中随时追加菜品

#### Module 3: 下单结算
- **Features** (6 items):
  - **微信支付** — 原生微信支付，安全快捷
  - **余额支付** — 会员储值余额直接抵扣
  - **优惠券抵扣** — 自动匹配可用优惠券，手动选择
  - **订单备注** — 特殊要求备注，直达后厨
  - **撤单申请** — 提交后前可一键撤单
  - **后厨状态同步** — 实时显示接单/制作中/已完成状态

#### Module 4: 订单中心
- **Features** (4 items):
  - **订单分类筛选** — 全部/待上菜/已完成/已取消
  - **订单详情查看** — 菜品清单、价格明细、支付记录
  - **退款申请** — 在线提交退款，商家审核
  - **再来一单** — 历史订单一键复购

#### Module 5: 会员体系
- **Features** (6 items):
  - **手机号登录** — 微信授权+手机号一键注册
  - **会员等级** — 消费累计升级，享受等级权益
  - **积分系统** — 消费返积分，积分可抵现
  - **储值卡** — 充值余额，消费快捷支付
  - **余额查询** — 实时查看账户余额与积分
  - **充值赠送** — 充值满额自动赠送余额

#### Module 6: 营销活动
- **Features** (6 items):
  - **满减券** — 满XX元减XX元，刺激客单价
  - **新人券** — 首次注册自动发放，拉新利器
  - **折扣券** — 全场折扣或指定菜品折扣
  - **拼团活动** — 邀请好友拼团，享受更低价格
  - **秒杀/限时特价** — 倒计时秒杀，制造紧迫感
  - **第二份半价** — 饮品/甜品经典促销

#### Right Column — Visual
- **Phone mockup**: CSS iPhone frame containing `demo-menu.jpg` (menu page)
- **Secondary image**: Below phone, `demo-dish.jpg` and `demo-cart.jpg` as small thumbnails
- **Phone float animation**: Subtle translateY ±8px, 3.5s infinite

### Animations
- **Module titles**: `fade-up`, 500ms, stagger 150ms between modules
- **Feature items**: `fade-up`, stagger 60ms within each module
- **Phone**: `slide-left`, 800ms, delay 400ms

---

## Section 4: Tab 2 — 商家管理后台

### Layout
Same structure. Left feature list, right laptop mockup.

### Elements

#### Module 1: 门店管理
- **Features** (5 items):
  - **单/多门店管理** — 新增、编辑、开关门店状态
  - **桌台管理** — 新增桌号、设置人数、锁定/空闲状态
  - **桌码生成** — 自动生成二维码，支持批量导出打印
  - **门店状态** — 一键暂停营业/恢复营业
  - **门店信息配置** — 招牌、电话、地址、营业时间

#### Module 2: 菜品管理
- **Features** (6 items):
  - **分类管理** — 新增/编辑/删除/排序菜品分类
  - **菜品上下架** — 一键上架/下架，批量操作
  - **菜品信息** — 名称、图片、价格、描述、标签
  - **规格配置** — 多规格多价格，如大/中/小份
  - **库存管控** — 设置每日库存，售罄自动下架
  - **套餐组合** — 组合多个菜品，设置套餐优惠价

#### Module 3: 订单管理
- **Features** (7 items):
  - **实时订单列表** — 新订单实时推送，声音提醒
  - **订单状态管理** — 待接单/制作中/已完成/已退款
  - **后台接单** — 手动确认接单，自动通知后厨
  - **订单改价** — 特殊情况下手动调整订单金额
  - **作废订单** — 异常订单后台作废处理
  - **订单导出** — 按日期/状态筛选导出Excel
  - **历史查询** — 任意时间段订单检索

#### Module 4: 会员与营销
- **Features** (6 items):
  - **会员列表** — 查看所有会员信息与消费记录
  - **余额/积分管理** — 手动调整会员余额与积分
  - **优惠券创建** — 创建满减/折扣/新人券，设置规则
  - **活动配置** — 秒杀、拼团、限时特价活动创建
  - **充值赠送设置** — 配置充值档位与赠送金额
  - **消费返积分规则** — 设置积分获取比例

#### Module 5: 数据统计
- **Features** (5 items):
  - **营业额统计** — 日/周/月/年营业额汇总
  - **订单量分析** — 订单量趋势图，高峰时段分析
  - **菜品销量排行** — TOP热销菜品，滞销菜品提醒
  - **会员消费分析** — 会员活跃度、消费频次、客单价
  - **数据导出** — 所有报表支持Excel导出

#### Module 6: 系统设置
- **Features** (5 items):
  - **小程序配置** — 名称、Logo、主题色、分享设置
  - **支付接口** — 微信支付商户号配置
  - **营业时间** — 设置每日营业时间段
  - **营业状态** — 全局一键暂停/恢复
  - **公告/海报** — 轮播图上传、公告文案编辑

#### Right Column — Visual
- **Laptop mockup**: CSS MacBook-style frame showing `demo-admin-orders.jpg`
- **Below**: Small thumbnail of `demo-admin-data.jpg`

---

## Section 5: Tab 3 — 店员后厨端

### Layout
Left feature list, right tablet mockup.

### Elements

#### Module 1: 订单接收
- **Features** (4 items):
  - **实时新订单推送** — 语音+震动提醒，锁屏通知
  - **订单详情查看** — 桌号、菜品、规格、备注一目了然
  - **接单确认** — 一键确认接单，同步用户端状态
  - **拒单处理** — 缺货等特殊情况可拒单并填写原因

#### Module 2: 菜品制作
- **Features** (4 items):
  - **按分类展示订单** — 热菜/凉菜/饮品分栏显示
  - **制作状态标记** — 未制作/制作中/已完成
  - **菜品完成确认** — 单个菜品标记完成或整单完成
  - **催单提醒** — 用户催单实时显示，优先处理

#### Module 3: 桌台管理
- **Features** (3 items):
  - **桌台订单绑定** — 按桌号查看当前订单
  - **上菜完成确认** — 服务员确认已上菜，更新状态
  - **桌台清空** — 结账后一键清空桌台，恢复空闲

#### Module 4: 防漏单机制
- **Features** (3 items):
  - **订单超时提醒** — 长时间未处理订单红色高亮
  - **已接/未接筛选** — 快速查看待处理订单
  - **完成率统计** — 当班完成订单数与平均耗时

#### Right Column — Visual
- **Tablet mockup**: CSS iPad-style frame showing `feature-staff.jpg`

---

## Section 6: Tab 4 — 骑手配送端

### Layout
Left feature list, right phone mockup.

### Elements

#### Module 1: 订单配送
- **Features** (4 items):
  - **待接订单列表** — 附近可接外卖订单，显示距离与金额
  - **一键接单** — 确认接单，同步商家与用户端
  - **配送路线** — 内置地图导航，最优路线规划
  - **送达确认** — 送达后拍照/签名确认

#### Module 2: 订单管理
- **Features** (3 items):
  - **配送中订单** — 当前配送订单详情与导航
  - **历史配送记录** — 已完成订单列表与收入统计
  - **异常上报** — 拒收、地址错误等情况上报

#### Module 3: 个人中心
- **Features** (3 items):
  - **今日收入** — 实时统计当日配送收入
  - **工作统计** — 接单数、完成率、平均配送时长
  - **账户设置** — 资料修改、休息状态切换

#### Right Column — Visual
- **Phone mockup**: CSS iPhone frame showing `feature-rider.jpg`

---

## Section 7: Feature Comparison Matrix

### Layout
Full width, `--color-bg-elevated` background. Centered, max-width container. Large comparison table.

### Elements

#### Header
- **Title**: "三版本功能对比" — `heading-1`, centered
- **Subtitle**: "根据您的经营规模，选择最适合的方案" — `body-large`, centered

#### Comparison Table

| 功能模块 | 基础版 | 标准版 | 高级定制版 |
|----------|--------|--------|-----------|
| 微信小程序用户端 | ✅ | ✅ | ✅ |
| 扫码点餐 · 桌台管理 | ✅ | ✅ | ✅ |
| 微信支付 · 在线结算 | ✅ | ✅ | ✅ |
| 菜品管理 · 分类上下架 | ✅ | ✅ | ✅ |
| 订单管理 · 实时处理 | ✅ | ✅ | ✅ |
| 管理后台（电脑端） | ✅ | ✅ | ✅ |
| 会员注册 · 手机号登录 | ❌ | ✅ | ✅ |
| 会员等级 · 积分体系 | ❌ | ✅ | ✅ |
| 储值卡 · 余额充值 | ❌ | ✅ | ✅ |
| 优惠券 · 满减/折扣 | ❌ | ✅ | ✅ |
| 秒杀 · 拼团 · 限时特价 | ❌ | ✅ | ✅ |
| 外卖配送 · 运费规则 | ❌ | ✅ | ✅ |
| 商家端 APP | ❌ | ✅ | ✅ |
| 骑手端 APP | ❌ | ✅（可选） | ✅ |
| 数据统计报表 | 基础 | 完整 | 高级可视化 |
| 多门店管理 | ❌ | 1-3家 | 无限制 |
| 加盟分权体系 | ❌ | ❌ | ✅ |
| 收银机硬件对接 | ❌ | ❌ | ✅ |
| 美团/饿了么对接 | ❌ | ❌ | ✅ |
| 大数据可视化大屏 | ❌ | ❌ | ✅ |
| 源码交付 | ❌ | ✅ | ✅ |
| 二次开发权限 | ❌ | ❌ | ✅ |
| 专属运维支持 | 基础 | 基础 | 专属 |

- **Checkmark style**: ✅ in `--color-success` for included, ❌ in `--color-text-muted` for not included
- **Row hover**: `--color-bg-elevated` background highlight
- **Sticky header**: Column headers stick on scroll

### Animations
- **Table**: Rows stagger in 40ms, `fade-up`, trigger at `top 85%`
- **Checkmarks**: Scale 0→1 with `ease-bounce`, stagger within each row

---

## Section 8: CTA Banner

### Layout
Full width, `gradient-hero` background. Same style as home CTA.

### Elements
- **Title**: "找到适合您的方案了吗？" — `heading-1`, white
- **Subtitle**: "联系我们的顾问，为您定制最佳方案" — `body-large`, white
- **CTA**: "立即咨询" — Primary white button
- **Secondary**: "返回 pricing 对比" — Ghost white border button

---

## Footer

Same as global footer.

---

## Assets Used

| Asset | Section | Usage |
|-------|---------|-------|
| `demo-menu.jpg` | 用户端 | Phone mockup content |
| `demo-dish.jpg` | 用户端 | Secondary thumbnail |
| `demo-cart.jpg` | 用户端 | Secondary thumbnail |
| `demo-admin-orders.jpg` | 商家后台 | Laptop mockup |
| `demo-admin-data.jpg` | 商家后台 | Secondary thumbnail |
| `feature-staff.jpg` | 店员端 | Tablet mockup |
| `feature-rider.jpg` | 骑手端 | Phone mockup |

---

## Interactions

- **Tab switching**: Click tab → content crossfade 300ms, active indicator slides (layoutId)
- **Feature items**: Hover → subtle `translateX(4px)`, 200ms
- **Comparison table**: Horizontal scroll on mobile, first column sticky
- **Module titles**: Anchor links in a sidebar (desktop) for quick navigation within tab
- **CTA**: Navigate to `/contact`

---

## Responsive Notes

- **Tabs**: Horizontal scroll with snap on mobile
- **Two-column layouts**: Stack to single column on tablet/mobile, image above text
- **Comparison table**: First column sticky, horizontal scroll for version columns
- **Mockups**: Reduce to 80% scale on tablet, 60% on mobile
