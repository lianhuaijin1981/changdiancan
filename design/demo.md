# Demo Page — UI 演示

An immersive UI showcase gallery. Visitors can browse mini-program and admin dashboard screenshots in realistic device frames. Mix of gallery view, detailed lightbox, and interactive demo feel.

---

## Section 1: Page Header

### Layout
Full width, `gradient-hero` background. Centered content, padding `space-24` vertical.

### Elements
- **Eyebrow**: "真实界面 · 所见即所得" — white, `heading-4`
- **Title**: "小程序 UI 演示" — `display-2`, white
- **Subtitle**: "用户端、商家后台、店员端、骑手端完整界面预览\n扁平化设计，圆角卡片，大图展示，舒适配色" — `body-large`, white at 85%
- **Filter tabs**: "全部" "用户端" "商家后台" "店员端" "骑手端" — pill tabs, white border, white text, active filled white with `--color-primary` text

### Animations
- **Title**: `fade-up`, GSAP SplitText character stagger
- **Filter tabs**: `fade-up`, stagger 60ms, delay 300ms

---

## Section 2: Gallery Grid

### Layout
Full width, `--color-bg-base` background. CSS Grid: 4 columns desktop, 2 tablet, 1 mobile. Gap 24px. Padding `space-16` vertical.

### Elements

#### Gallery Item Component (reused 12 times)
Each item:
- **Device frame**: CSS-drawn device frame (iPhone for mobile, MacBook for desktop, iPad for tablet)
  - iPhone frame: Notch at top, rounded corners, thin dark border, subtle shadow
  - MacBook frame: Thin bezel, camera dot, rounded bottom corners, stand suggestion
  - iPad frame: Uniform bezel, rounded corners
- **Screen image**: Fitted inside frame with `object-fit: cover`
- **Overlay**: On hover, semi-transparent `--color-bg-dark` at 70% covers image
- **Overlay content**: Screen name + "查看详情" text, centered, white
- **Label tag**: Bottom-left of frame, `radius-sm` pill, `--color-primary` bg, white text, showing category

#### Gallery Items

**Row 1 — User End (4 items)**
1. `demo-menu.jpg` — "首页菜单" — iPhone frame — "用户端"
2. `demo-dish.jpg` — "菜品详情" — iPhone frame — "用户端"
3. `demo-cart.jpg` — "购物车" — iPhone frame — "用户端"
4. `demo-order.jpg` — "订单中心" — iPhone frame — "用户端"

**Row 2 — User + Admin (4 items)**
5. `demo-member.jpg` — "会员中心" — iPhone frame — "用户端"
6. `demo-admin-orders.jpg` — "订单管理" — MacBook frame — "商家后台"
7. `demo-admin-data.jpg` — "数据报表" — MacBook frame — "商家后台"
8. `feature-staff.jpg` — "后厨接单" — iPad frame — "店员端"

**Row 3 — Additional (4 items)**
9. `feature-rider.jpg` — "骑手配送" — iPhone frame — "骑手端"
10. `demo-menu.jpg` (reused with crop focus on category tabs) — "分类浏览" — iPhone frame — "用户端"
11. `demo-dish.jpg` (reused with crop focus on specs) — "规格选择" — iPhone frame — "用户端"
12. `demo-admin-orders.jpg` (reused with crop focus on order detail) — "订单详情" — MacBook frame — "商家后台"

### Animations
- **Gallery items**: `fade-up`, stagger 80ms, 600ms, trigger at `top 85%`
- **Hover**: Image scale 1.05 within frame (overflow hidden), overlay fade-in 200ms
- **Filter change**: Grid items animate out (scale 0.95, opacity 0, 200ms) then new items animate in with stagger

---

## Section 3: Interactive Phone Demo

### Layout
Full width, `--color-bg-dark` background. Centered content. Two-column: left text, right interactive phone.

### Elements

#### Left Column
- **Eyebrow**: "交互体验" — `--color-primary`
- **Title**: "流畅的点餐体验" — `heading-1`, white
- **Description**: "从扫码到下单，只需30秒\n购物车实时计算，优惠券自动匹配，支付一气呵成" — `body-large`, white at 70%
- **Feature bullets** (3 items, white):
  - "扫码即点，无需等待"
  - "规格口味，一键选择"
  - "支付成功，后厨秒接"
- **CTA**: "预约完整演示" — Ghost button, white border, white text

#### Right Column — Interactive Phone
- **CSS iPhone frame**: 375px × 812px base, scaled to fit container
- **Screen content**: A simplified interactive mini-program UI built with HTML/CSS (not actual image)
  - Header: Store name + table number
  - Category tabs: 热菜/凉菜/饮品/主食 (scrollable)
  - Dish cards: Image, name, price, "+" button
  - Floating cart bar: Item count + total price + "去结算"
- **Interactive elements**:
  - Category tabs: Click to switch active tab, content updates
  - "+" buttons: Scale bounce on click, cart count increments
  - Cart bar: Hover lifts slightly
- **Decorative**: Phone floats with subtle shadow, slight tilt angle (5deg), animated float

### Animations
- **Phone**: `slide-left`, 800ms, delay 300ms
- **Screen UI elements**: Stagger in after phone, 50ms each
- **Interactive feedback**: Framer Motion `whileTap={{ scale: 0.9 }}` on buttons

---

## Section 4: Design Specifications

### Layout
Full width, `--color-bg-base`. Centered max-width container.

### Elements

#### Header
- **Title**: "设计规范一览" — `heading-1`, centered
- **Subtitle**: "标准化设计，兼容所有机型" — `body-large`, centered

#### Spec Cards (4 columns desktop)

**Card 1 — 配色方案**
- **Swatches**: 5 color circles in a row
  - `--color-primary` (#FF6B35)
  - `--color-accent` (#C41E3A)
  - `--color-success` (#10B981)
  - `--color-bg-base` (#FFF9F5)
  - `--color-text-primary` (#1A1A2E)
- **Title**: "暖橙主色调" — `heading-4`
- **Description**: "以暖橙/餐饮红为主色，搭配舒适米白背景，提升食欲感" — `body-small`

**Card 2 — 布局规范**
- **Icon**: `layout-grid`, 40px, `--color-primary`
- **Title**: "标准导航布局" — `heading-4`
- **Description**: "顶部导航栏 + 中间内容区 + 底部Tab栏，符合微信小程序用户习惯" — `body-small`

**Card 3 — 卡片设计**
- **Visual**: Mini card mockup with shadow, rounded corners
- **Title**: "圆角卡片 + 大图" — `heading-4`
- **Description**: "统一圆角16px，菜品大图清晰展示，价格醒目突出" — `body-small`

**Card 4 — 字体规范**
- **Sample text**: "菜品名称 ¥28" — showing both Chinese and price
- **Title**: "清晰可读字体" — `heading-4`
- **Description**: "Noto Sans SC 为主字体，标题使用 Noto Serif SC，价格使用等宽字体" — `body-small`

### Animations
- **Cards**: `fade-up`, stagger 100ms

---

## Section 5: CTA Banner

### Layout
Full width, `gradient-hero` background.

### Elements
- **Title**: "看对眼了？马上开启您的数字化升级" — `heading-1`, white
- **CTA**: "免费咨询" — Primary white button
- **Secondary**: "下载功能清单PDF" — Ghost white button with `download` icon

---

## Footer

Same global footer.

---

## Assets Used

| Asset | Section | Usage |
|-------|---------|-------|
| `demo-menu.jpg` | Gallery | Item 1, 10 |
| `demo-dish.jpg` | Gallery | Item 2, 11 |
| `demo-cart.jpg` | Gallery | Item 3 |
| `demo-order.jpg` | Gallery | Item 4 |
| `demo-member.jpg` | Gallery | Item 5 |
| `demo-admin-orders.jpg` | Gallery | Item 6, 12 |
| `demo-admin-data.jpg` | Gallery | Item 7 |
| `feature-staff.jpg` | Gallery | Item 8 |
| `feature-rider.jpg` | Gallery | Item 9 |

---

## Interactions

- **Gallery hover**: Overlay with screen name, click opens lightbox
- **Lightbox**: Full-screen overlay, image centered with close button, prev/next navigation
- **Filter tabs**: Filter gallery items by category with animated transition
- **Interactive phone**: Clickable tabs and buttons with state changes
- **PDF download**: Triggers file download (placeholder)

---

## Responsive Notes

- **Gallery**: 2 columns on tablet, 1 on mobile
- **Interactive phone**: Scale down to 80% on tablet, 65% on mobile
- **Lightbox**: Full screen on mobile with swipe navigation
- **Spec cards**: 2×2 on tablet, single column on mobile
