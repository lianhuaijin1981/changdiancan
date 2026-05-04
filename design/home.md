# Home Page — 畅点餐

The main landing page. A warm, appetizing product showcase that sells the complete food ordering mini-program solution. Single-page experience with multiple full-width sections, smooth scroll navigation, and strong conversion CTAs.

---

## Section 1: Hero

### Layout
Full viewport height (100vh). Two-column layout on desktop (55% text / 45% images), stacked on mobile. Background uses `gradient-warm` with a subtle overlay.

### Elements

#### Left Column — Text Content
- **Eyebrow badge**: "专业餐饮数字化解决方案" — pill badge, `--color-primary` background, white text, `radius-full`, with a small sparkle icon (lucide: `sparkles`). Caption size.
- **Headline**: "让每一单\n都顺畅无阻" — `display-1`, Noto Serif SC, `--color-text-primary`. Line break after "每一单". The second line has a gradient text effect using `gradient-hero` on "顺畅无阻".
- **Subheadline**: "扫码点餐 · 会员营销 · 外卖配送 · 数据报表\n一套系统，四端互通，从夫妻店到连锁品牌全覆盖" — `body-large`, `--color-text-secondary`, max-width 520px.
- **CTA Group**:
  - Primary: "免费获取报价" — Large pill button, `gradient-hero`, white text, `radius-full`, with `arrow-right` icon.
  - Secondary: "查看功能演示" — Ghost button with `play-circle` icon, opens video/demo modal.
- **Trust bar**: "已有 2,000+ 餐饮商家信赖" — row of 5 small circular avatar placeholders + count text. `--color-text-muted`, `body-small`.

#### Right Column — Visual
- **Phone mockup cluster**: Three floating iPhone frames (CSS/SVG frames) showing mini-program UI screenshots (`demo-menu.jpg`, `demo-cart.jpg`, `demo-order.jpg`).
  - Center phone: upright, 60% opacity shadow
  - Left phone: rotated -12deg, positioned behind, 80% scale
  - Right phone: rotated 12deg, positioned behind, 80% scale
  - All phones have subtle floating animation (translateY ±10px, 4s infinite, offset phases)

#### Background
- `hero-bg.jpg` as full-bleed background, `object-fit: cover`, `opacity: 0.15`, with `gradient-warm` overlay on top
- Decorative floating circles in `--color-primary` at 5% opacity, blurred, slowly drifting

### Animations
- **Eyebrow badge**: `fade-in`, 400ms, delay 200ms
- **Headline**: `fade-up`, 600ms, delay 400ms. Characters stagger 30ms each (GSAP SplitText)
- **Subheadline**: `fade-up`, 600ms, delay 600ms
- **CTAs**: `fade-up`, 500ms, delay 800ms
- **Phones**: `scale-in`, 800ms, delay 300ms. Each phone has independent float animation after entrance.
- **Trust bar**: `fade-in`, 400ms, delay 1000ms

---

## Section 2: Version Showcase

### Layout
Full width, `--color-bg-base` background. Centered content, max-width container. Three-column card grid on desktop, single column on mobile.

### Elements

#### Section Header
- **Eyebrow**: "三大版本 · 按需选择" — `--color-primary` text, `heading-4`, uppercase tracking
- **Title**: "无论您是小店起步还是连锁扩张\n总有一款适合您" — `heading-1`, centered
- **Subtitle**: "从基础扫码点餐到全链路数字化运营，我们覆盖餐饮全场景" — `body-large`, `--color-text-secondary`, centered, max-width 640px

#### Version Cards (3)

**Card 1 — 基础版**
- **Image**: `version-basic.jpg`, full width top, 200px height, `radius-lg` top corners, object-fit cover
- **Badge**: "新手首选" — `--color-success` background, top-right corner, `radius-full`
- **Title**: "基础版" — `heading-3`, `--color-text-primary`
- **Subtitle**: "夫妻店 · 小餐馆 · 奶茶店 · 小吃店" — `body-small`, `--color-text-muted`
- **Price**: "¥3,999 起" — `heading-2`, `--color-primary`, JetBrains Mono
- **Price note**: "含首年运维 · 免源码部署" — `caption`, `--color-text-muted`
- **Feature list** (5 items, check icon in `--color-success`):
  - 微信小程序扫码点餐
  - 独立管理后台
  - 桌台二维码管理
  - 微信支付对接
  - 1年售后服务
- **CTA**: "了解详情" — Secondary button, full width
- **Border accent**: 3px solid `--color-success` on left edge

**Card 2 — 标准版 (FEATURED)**
- **Image**: `version-standard.jpg`
- **Badge**: "最受欢迎" — `gradient-hero` background, pulsing subtle animation
- **Title**: "标准版"
- **Subtitle**: "连锁单店 · 中餐店 · 火锅店 · 茶饮连锁"
- **Price**: "¥9,999 起"
- **Price note**: "源码交付 · 基础运维"
- **Feature list** (7 items):
  - 基础版全部功能
  - 会员等级与积分体系
  - 优惠券/秒杀/拼团营销
  - 外卖到店配送
  - 商家端 + 骑手端
  - 数据统计报表
  - 1-3 门店支持
- **CTA**: "立即咨询" — Primary button, full width, elevated shadow
- **Border accent**: 3px solid `--color-primary` on all sides (elevated card)
- **Card elevation**: Higher shadow, `translateY(-8px)` by default (not just on hover)

**Card 3 — 高级定制版**
- **Image**: `version-advanced.jpg`
- **Badge**: "旗舰方案" — `--color-accent` background
- **Title**: "高级定制版"
- **Subtitle**: "大型连锁 · 美食广场 · 多门店加盟"
- **Price**: "¥29,999 起"
- **Price note**: "全端定制 · 源码全交付"
- **Feature list** (7 items):
  - 标准版全部功能
  - 多门店加盟分权管理
  - 大数据可视化报表
  - 自营外卖体系
  - 收银机硬件对接
  - 美团/饿了么对接
  - 专属运维 + 二次开发
- **CTA**: "预约方案定制" — Secondary button, full width
- **Border accent**: 3px solid `--color-accent` on left edge

### Animations
- **Section header**: `fade-up`, trigger at `top 80%`
- **Cards**: `fade-up`, stagger 150ms between cards, trigger at `top 75%`
- **Featured card**: Slight `scale-in` at 1.02x, then settles

---

## Section 3: Four Ends Overview

### Layout
Full width, `--color-bg-elevated` background. Two-row layout: header top, 2×2 feature grid below.

### Elements

#### Section Header
- **Eyebrow**: "四端互通 · 数据互联"
- **Title**: "一套系统，打通全链路"
- **Subtitle**: "用户端、商家后台、店员端、骑手端，数据实时同步，经营无死角"

#### Feature Grid (2×2)

**Card A — 用户端小程序**
- **Icon**: `smartphone` from lucide, 48px, `--color-primary`, contained in 80px circle with `rgba(255,107,53,0.1)` background
- **Title**: "用户端小程序" — `heading-4`
- **Description**: "扫码点餐、在线支付、会员积分、优惠券、拼团秒杀，提升顾客体验和复购率" — `body`, `--color-text-secondary`
- **Tags**: "扫码点餐" "微信支付" "会员体系" — small pills, `--color-bg-elevated` bg, `--color-primary` text
- **Image preview**: `feature-user.jpg` thumbnail, 280px wide, `radius-md`, subtle shadow

**Card B — 商家管理后台**
- **Icon**: `layout-dashboard`, `--color-accent` tint
- **Title**: "商家管理后台"
- **Description**: "电脑端完整后台，菜品管理、订单处理、会员营销、数据报表，经营决策有依据"
- **Tags**: "菜品管理" "订单处理" "数据统计"
- **Image preview**: `feature-admin.jpg`

**Card C — 店员后厨端**
- **Icon**: `tablet`, `--color-info` tint
- **Title**: "店员后厨端"
- **Description**: "手机/平板实时接单，菜品制作提醒，桌台状态管理，告别漏单错单"
- **Tags**: "实时接单" "制作提醒" "上菜确认"
- **Image preview**: `feature-staff.jpg`

**Card D — 骑手配送端**
- **Icon**: `bike`, `--color-warning` tint
- **Title**: "骑手配送端"
- **Description**: "外卖接单、配送路线、送达确认，自营外卖无需第三方平台抽成"
- **Tags**: "路线规划" "送达确认" "运费规则"
- **Image preview**: `feature-rider.jpg`

### Animations
- **Header**: `fade-up`, 600ms
- **Cards**: `fade-up`, stagger 120ms, 600ms each. Icons have `scale-in` at 0.8→1 with bounce easing.

---

## Section 4: Core Features Preview

### Layout
Full width, `--color-bg-base`. Alternating left-right feature rows (3 rows). Each row: 50/50 split, image on one side, text on other.

### Elements

#### Feature Row 1 — 扫码点餐 (Image Left)
- **Image**: `demo-menu.jpg` in a phone frame mockup, tilted slightly, `radius-xl` shadow
- **Eyebrow**: "核心功能"
- **Title**: "扫码点餐，30秒完成下单"
- **Description**: "桌台二维码自动绑定桌号，顾客扫码即点，无需等待服务员。分类菜品清晰展示，规格、口味、辣度一键选择，购物车随时增减。"
- **Bullet points**:
  - 桌台二维码自动生成与打印
  - 菜品分类展示，支持多规格多口味
  - 购物车实时汇总，一键结算
  - 下单后厨实时接单，状态同步
- **Link**: "查看完整用户端功能 →" — `--color-primary` text with arrow

#### Feature Row 2 — 会员营销 (Image Right)
- **Image**: `demo-member.jpg` in phone frame
- **Eyebrow**: "营销增长"
- **Title**: "会员体系 + 营销活动，复购率翻倍"
- **Description**: "手机号授权登录即会员，等级积分自动累计。满减券、新人券、折扣券灵活配置，拼团秒杀拉新裂变，充值赠送锁定资金。"
- **Bullet points**:
  - 三级会员等级，积分抵现
  - 储值卡充值，余额实时查询
  - 满减券/新人券/折扣券三种类型
  - 拼团、秒杀、限时特价、第二份半价
- **Link**: "查看营销功能详情 →"

#### Feature Row 3 — 数据报表 (Image Left)
- **Image**: `demo-admin-data.jpg` in a laptop/browser frame mockup
- **Eyebrow**: "数据驱动"
- **Title**: "经营数据一目了然"
- **Description**: "营业额实时统计，每日/每周/每月报表自动生成。菜品销量排行、会员消费分析、营收趋势曲线，导出Excel轻松做账。"
- **Bullet points**:
  - 实时营业额与订单量统计
  - 菜品销量 TOP 排行分析
  - 会员消费频次与金额画像
  - 多维度数据导出 Excel
- **Link**: "查看后台功能详情 →"

### Animations
- **Rows**: GSAP ScrollTrigger, `start: "top 75%"`
  - Text side: `slide-left` or `slide-right` (depending on side)
  - Image side: `fade-up` with slight rotation settle (from 3deg tilt to 0deg)
- **Bullet points**: Stagger 80ms, `fade-up`

---

## Section 5: Stats Banner

### Layout
Full width, `gradient-hero` background. Single row of 4 stat blocks, centered. Padding `space-16` vertical.

### Elements

| Stat | Value | Label |
|------|-------|-------|
| 服务商家 | "2,000+" | 覆盖城市 |
| 日处理订单 | "50,000+" | 峰值并发 |
| 客户满意度 | "98.5%" | 好评率 |
| 上线周期 | "3-7天" | 快速部署 |

- **Value**: `display-2`, white, JetBrains Mono, bold
- **Label**: `body`, white at 80% opacity
- **Dividers**: 1px `rgba(255,255,255,0.2)` vertical lines between stats (desktop only)

### Animations
- **Counter animation**: Numbers count up from 0 to final value over 2s on scroll trigger
- **Container**: `fade-in`, 400ms
- **Stats**: Stagger 150ms, `fade-up`

---

## Section 6: UI Design Showcase

### Layout
Full width, `--color-bg-dark` background. Horizontal scrolling gallery of mini-program UI screenshots in phone frames. Header centered above.

### Elements

#### Header
- **Eyebrow**: "UI 设计"
- **Title**: "精心设计，只为更好的用餐体验" — `heading-1`, white, centered
- **Subtitle**: "扁平化风格、圆角卡片、大图展示、舒适配色，兼容所有微信机型" — `body-large`, white at 70%

#### Gallery
- Horizontal scroll container (CSS scroll-snap or drag-enabled)
- 6 phone frames in a row, each showing a different mini-program screen:
  1. `demo-menu.jpg` — 首页/菜单
  2. `demo-dish.jpg` — 菜品详情
  3. `demo-cart.jpg` — 购物车
  4. `demo-order.jpg` — 订单中心
  5. `demo-member.jpg` — 会员中心
  6. `demo-admin-orders.jpg` — 商家后台
- Phone frame: CSS-drawn iPhone notch frame, dark border, `radius-xl` inner
- Active/hovered phone: Scale 1.05, glow effect with `--color-primary` at 20%
- Navigation: Left/right arrow buttons, `--color-primary` circles with white arrows

### Animations
- **Header**: `fade-up`, 600ms
- **Phones**: `fade-up`, stagger 100ms, trigger at `top 80%`
- **Hover**: Scale 1.05, 300ms ease

---

## Section 7: Testimonials

### Layout
Full width, `--color-bg-base`. Three-column card grid.

### Elements

#### Section Header
- **Eyebrow**: "客户证言"
- **Title**: "他们都在用畅点餐"
- **Subtitle**: "来自真实商家的使用反馈"

#### Testimonial Cards (3)

**Card 1**
- **Avatar**: Generic restaurant owner photo placeholder (40px circle)
- **Name**: "王老板" — `heading-4`
- **Role**: "重庆老火锅 · 3家门店" — `body-small`, `--color-text-muted`
- **Quote**: "以前高峰期总是忙不过来，顾客等得着急。用了畅点餐之后，顾客自己扫码点，后厨直接出单，翻台率提升了30%。" — `body`, italic
- **Stars**: 5 filled stars, `--color-warning`

**Card 2**
- **Name**: "李店长"
- **Role**: "茶语时光 · 奶茶连锁"
- **Quote**: "会员积分和优惠券功能太好用了，顾客为了凑满减会多点一杯，客单价从18块涨到26块。"
- **Stars**: 5

**Card 3**
- **Name**: "张总"
- **Role**: "美食广场 · 12家档口"
- **Quote**: "多门店统一管理，每个档口的营业额实时能看到，月底对账省了一半时间。高级版的钱花得值。"
- **Stars**: 5

### Animations
- **Cards**: `fade-up`, stagger 120ms, 600ms

---

## Section 8: CTA Banner

### Layout
Full width, `gradient-hero` background. Centered content, padding `space-24` vertical.

### Elements
- **Title**: "准备好升级您的餐厅了吗？" — `heading-1`, white, centered
- **Subtitle**: "立即咨询，获取专属方案和报价\n3-7天快速上线，1年售后无忧" — `body-large`, white at 90%, centered
- **Primary CTA**: "免费咨询获取报价" — Large pill, white background, `--color-primary` text, `radius-full`, with `arrow-right` icon
- **Secondary CTA**: "预约产品演示" — Ghost pill, white border, white text, `radius-full`
- **Contact info**: "或拨打 400-888-6688" — `body`, white at 80%, centered below buttons
- **Decorative**: Subtle floating food-related line icons (utensils, cup, burger) at low opacity in background

### Animations
- **Title**: `fade-up`, 600ms
- **Buttons**: `fade-up`, stagger 100ms, delay 300ms
- **Background icons**: Slow drift animation (translateX ±20px, 8s infinite)

---

## Section 9: FAQ Preview

### Layout
Full width, `--color-bg-base`. Two-column: left header, right accordion.

### Elements

#### Left Column (40%)
- **Eyebrow**: "常见问题"
- **Title**: "您可能想知道的" — `heading-1`
- **Description**: "如果以下没有解答您的疑问，欢迎随时联系我们" — `body`, `--color-text-secondary`
- **Link**: "查看全部 FAQ →" — `--color-primary`

#### Right Column (60%)
Accordion with 5 items:

1. **"小程序多久能上线？"**
   Content: "基础版3-5天即可上线，标准版5-7天，高级定制版根据需求复杂度约2-4周。我们提供全程技术配置，您只需提供门店信息和菜品资料。"

2. **"需要准备什么资料？"**
   Content: "营业执照、食品经营许可证、法人身份证、银行卡（用于微信支付商户号申请）。菜品图片、名称、价格、规格信息。我们会提供资料清单和模板。"

3. **"支持哪些支付方式？"**
   Content: "微信支付（默认标配）、余额支付（会员储值卡）、优惠券抵扣。高级版可额外对接支付宝、POS收银机。"

4. **"后期可以升级版本吗？"**
   Content: "完全可以。基础版可随时补差价升级至标准版或高级版，数据和配置完整保留，不影响正常营业。"

5. **"售后包含哪些服务？"**
   Content: "1年免费售后包含：BUG修复、小程序审核协助、系统功能咨询、数据备份。超出1年后可按年续费维护，或选择一次性买断源码自行维护。"

### Animations
- **Left**: `slide-left`, 700ms
- **Accordion items**: `fade-up`, stagger 80ms, 500ms each. Plus icon rotates 45deg on open.

---

## Footer

See global component design in `design.md`.

Additional content:
- **Brand column**: "畅点餐" logo + tagline "专业餐饮数字化解决方案" + brief description
- **Product column**: 基础版、标准版、高级定制版、功能介绍、定价方案
- **Support column**: 帮助中心、常见问题、更新日志、API文档（高级版）
- **Contact column**: 电话 400-888-6688、邮箱 support@changdiancan.com、工作时间 9:00-21:00、微信二维码占位
- **Bottom**: © 2024 畅点餐 版权所有 | 粤ICP备XXXXXXXX号 | 隐私政策 | 服务条款

---

## Assets Used

| Asset | Section | Usage |
|-------|---------|-------|
| `hero-bg.jpg` | Hero | Background image |
| `hero-phones.png` | Hero | Alternative to CSS phone frames |
| `version-basic.jpg` | Versions | Card 1 image |
| `version-standard.jpg` | Versions | Card 2 image |
| `version-advanced.jpg` | Versions | Card 3 image |
| `feature-user.jpg` | Four Ends | Card A image |
| `feature-admin.jpg` | Four Ends | Card B image |
| `feature-staff.jpg` | Four Ends | Card C image |
| `feature-rider.jpg` | Four Ends | Card D image |
| `demo-menu.jpg` | Core Features | Feature row 1 |
| `demo-member.jpg` | Core Features | Feature row 2 |
| `demo-admin-data.jpg` | Core Features | Feature row 3 |
| `demo-*.jpg` | UI Showcase | Gallery items |
| `pattern-dots.svg` | Various | Subtle background texture |

---

## Interactions

- **Version cards**: Clicking "了解详情/立即咨询/预约方案" scrolls to or navigates to `/pricing` or `/contact`
- **Feature row links**: Navigate to `/features` with relevant tab pre-selected
- **Gallery arrows**: Smooth horizontal scroll by one phone width
- **FAQ accordion**: Click to expand/collapse with 300ms height animation and icon rotation
- **CTA buttons**: All primary CTAs track click and navigate to `/contact`
- **Smooth scroll**: All anchor links use Lenis smooth scroll

---

## Responsive Notes

- **Hero**: Mobile stacks vertically, phones become single centered image
- **Versions**: Mobile becomes stacked cards with horizontal swipe option
- **Four Ends**: 2×2 grid becomes single column on mobile
- **Feature rows**: Image stacks above text on mobile
- **Stats**: 2×2 grid on mobile, full row on desktop
- **UI Gallery**: Horizontal swipe mandatory on mobile
- **FAQ**: Full width accordion on mobile, header above accordion
