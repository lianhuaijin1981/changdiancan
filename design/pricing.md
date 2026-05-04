# Pricing Page — 版本定价

A clear, conversion-focused pricing page. Three-tier pricing cards with detailed feature breakdown, FAQ, and strong CTAs. Designed to guide restaurant owners toward the right tier and convert to inquiry.

---

## Section 1: Page Header

### Layout
Full width, `gradient-hero` background. Centered content, padding `space-24` vertical.

### Elements
- **Eyebrow**: "透明定价 · 无隐藏费用" — white, `heading-4`, centered
- **Title**: "选择适合您的版本" — `display-2`, white, centered
- **Subtitle**: "一次投入，长期使用，所有版本均含首年售后服务\n支持随时升级，数据完整保留" — `body-large`, white at 85%, centered
- **Trust badges row**: "✓ 无隐藏费用" "✓ 7天无理由退款" "✓ 数据安全加密" — three pills, white border, white text, `radius-full`, horizontal row

### Animations
- **Title**: `fade-up`, GSAP SplitText word stagger 40ms
- **Subtitle**: `fade-up`, 600ms, delay 200ms
- **Trust badges**: `fade-up`, stagger 100ms, delay 400ms

---

## Section 2: Pricing Cards

### Layout
Full width, `--color-bg-base` background. Centered max-width container. Three-column card grid on desktop, stacked on mobile.

### Elements

#### Card 1 — 基础版
- **Header bar**: `--color-success` background, `radius-lg` top corners
  - "基础版" — `heading-3`, white
  - "新手首选" — `caption`, white at 90%, `radius-full` badge
- **Icon area**: `version-basic.jpg`, 160px height, object-fit cover
- **Price**: "¥3,999" — `display-2`, `--color-text-primary`, JetBrains Mono
- **Price unit**: "/套" — `heading-4`, `--color-text-secondary`
- **Price note**: "含首年运维 · 免源码部署" — `body-small`, `--color-text-muted`
- **CTA**: "立即购买" — Secondary button (border `--color-success`, text `--color-success`), full width
- **Feature list**:
  - ✅ 微信小程序扫码点餐
  - ✅ 独立管理后台
  - ✅ 桌台二维码管理
  - ✅ 微信支付对接
  - ✅ 菜品分类与上下架
  - ✅ 实时订单列表
  - ✅ 1年售后服务
  - ❌ 会员等级与积分
  - ❌ 优惠券/营销活动
  - ❌ 外卖配送功能
  - ❌ 源码交付
- **Delivery note**: "交付周期：3-5天" — `caption`, `--color-text-muted`, bottom of card

#### Card 2 — 标准版 (FEATURED)
- **Header bar**: `gradient-hero` background
  - "标准版" — `heading-3`, white
  - "最受欢迎" — `caption`, white badge, with subtle pulse animation
- **Ribbon**: "热销" — Top-right corner, diagonal red ribbon with white text
- **Icon area**: `version-standard.jpg`
- **Price**: "¥9,999" — `display-2`, `--color-primary`, JetBrains Mono
- **Price unit**: "/套" 
- **Price note**: "源码交付 · 基础运维"
- **CTA**: "立即咨询" — Primary button (`gradient-hero`), full width, elevated
- **Feature list**:
  - ✅ 基础版全部功能
  - ✅ 会员等级与积分体系
  - ✅ 储值卡充值与余额查询
  - ✅ 满减券/新人券/折扣券
  - ✅ 拼团/秒杀/限时特价
  - ✅ 外卖到店配送
  - ✅ 商家端APP
  - ✅ 骑手端APP（可选）
  - ✅ 数据统计报表（完整版）
  - ✅ 1-3门店支持
  - ✅ 源码交付
- **Delivery note**: "交付周期：5-7天"
- **Special highlight**: Card has `translateY(-12px)`, deeper shadow, 2px `--color-primary` border

#### Card 3 — 高级定制版
- **Header bar**: `--color-accent` background
  - "高级定制版" — `heading-3`, white
  - "旗舰方案" — `caption`, white badge
- **Icon area**: `version-advanced.jpg`
- **Price**: "¥29,999" — `display-2`, `--color-accent`, JetBrains Mono
- **Price unit**: "/起" 
- **Price note**: "全端定制 · 源码全交付 · 专属运维"
- **CTA**: "预约方案定制" — Secondary button (border `--color-accent`, text `--color-accent`), full width
- **Feature list**:
  - ✅ 标准版全部功能
  - ✅ 多门店加盟分权管理
  - ✅ 无限制门店数量
  - ✅ 大数据可视化大屏
  - ✅ 自营外卖配送体系
  - ✅ 收银机硬件对接
  - ✅ 美团/饿了么平台对接
  - ✅ 专属运维团队
  - ✅ 二次开发权限
  - ✅ 源码全部交付
  - ✅ 定制功能开发
- **Delivery note**: "交付周期：2-4周"

### Animations
- **Cards**: `fade-up`, stagger 150ms, 700ms each, trigger at `top 75%`
- **Featured card**: `scale-in` from 0.95→1.02, then settle, with `ease-bounce`
- **Price numbers**: Counter animation from 0 to final value, 1.5s, on scroll trigger
- **Checkmarks**: Stagger 50ms, `scale-in` with bounce

---

## Section 3: Add-ons & Extras

### Layout
Full width, `--color-bg-elevated` background. Centered max-width container.

### Elements

#### Header
- **Title**: "可选增值服务" — `heading-1`, centered
- **Subtitle**: "根据实际需要灵活搭配" — `body-large`, centered

#### Add-on Cards (3 columns)

**Card 1 — 次年运维**
- **Icon**: `shield-check`, 40px, `--color-primary`
- **Title**: "次年运维服务" — `heading-4`
- **Price**: "¥1,999 /年" — `heading-3`, `--color-primary`
- **Description**: "基础版续费维护，包含BUG修复、系统升级、小程序审核协助" — `body-small`

**Card 2 — 骑手端扩展**
- **Icon**: `bike`, 40px, `--color-accent`
- **Title**: "骑手端额外开通" — `heading-4`
- **Price**: "¥2,999 /端" — `heading-3`, `--color-accent`
- **Description**: "标准版如需额外开通骑手端APP，按端口数收费" — `body-small`

**Card 3 — 门店扩容**
- **Icon**: `store`, 40px, `--color-info`
- **Title**: "门店数量扩容" — `heading-4`
- **Price**: "¥1,500 /家" — `heading-3`, `--color-info`
- **Description**: "标准版超出3家门店后，每新增1家门店的费用" — `body-small`

**Card 4 — 定制开发**
- **Icon**: `code`, 40px, `--color-warning`
- **Title**: "定制功能开发" — `heading-4`
- **Price**: "¥500 /人天" — `heading-3`, `--color-warning`
- **Description**: "高级版专属，超出标准功能的定制开发按人天计费" — `body-small`

### Animations
- **Cards**: `fade-up`, stagger 100ms, 600ms

---

## Section 4: Comparison Table

### Layout
Full width, `--color-bg-base`. Centered max-width container.

### Elements

#### Header
- **Title**: "详细功能对比" — `heading-1`, centered
- **Toggle**: "仅显示差异项" — Switch toggle, filters to only rows where versions differ

#### Table (same as Features page comparison matrix but expanded)

Full comparison table with all features. Three columns (基础版/标准版/高级定制版). Check/X marks.

**Table styling**:
- Header row: `--color-bg-dark` background, white text
- Feature category rows: `--color-bg-elevated` background, bold text
- Feature rows: alternating white/`--color-bg-base`
- Sticky first column on mobile
- Row hover: highlight with `--color-primary` at 3% opacity

**Categories**:
1. 用户端功能
2. 商家后台
3. 店员端
4. 骑手端
5. 营销功能
6. 数据报表
7. 部署与售后

### Animations
- **Table rows**: `fade-up`, stagger 40ms
- **Toggle**: Framer Motion layout animation on filter

---

## Section 5: FAQ

### Layout
Full width, `--color-bg-base`. Centered max-width container (720px for accordion).

### Elements

#### Header
- **Title**: "价格相关常见问题" — `heading-1`, centered
- **Subtitle**: "关于费用、付款、升级的疑问" — `body-large`, centered

#### Accordion (7 items)

1. **"价格包含什么？有额外费用吗？"**
   所有报价均包含：系统开发/配置、小程序上线、首年售后服务。不含：服务器费用（约￥200-500/年）、微信支付手续费（微信官方收取0.6%）、域名费用（如需独立域名）。

2. **"如何付款？支持分期吗？"**
   支持银行转账、支付宝、微信支付。标准版和高级版支持3期分期付款（首付50%，上线后30%，验收后20%）。

3. **"购买后可以退款吗？"**
   合同签订后7天内，如系统尚未开始配置，可申请全额退款。已开始配置的，扣除已产生工时的费用后退还剩余款项。

4. **"基础版可以升级吗？费用怎么算？"**
   可以随时升级。升级费用 = 目标版本价格 - 已支付价格。例如基础版（￥3,999）升级标准版（￥9,999），补差价￥6,000即可。

5. **"次年运维费必须交吗？不交会怎样？"**
   非强制。如不续费运维，系统仍可正常使用，但不再享受BUG修复、系统升级、小程序审核协助等服务。建议至少续费基础运维以保障系统稳定。

6. **"高级版的定制开发怎么收费？"**
   高级版包含一次性的定制需求评估。如超出标准功能范围，按￥500/人天计费，开发前提供详细报价单和工期评估。

7. **"多门店怎么收费？"**
   标准版默认支持1-3家门店。超出后每新增1家门店￥1,500。高级版无门店数量限制。

### Animations
- **Accordion**: Same as home FAQ — height animation 300ms, icon rotate 45deg

---

## Section 6: CTA Banner

### Layout
Full width, `gradient-hero` background.

### Elements
- **Title**: "还有疑问？我们为您一对一解答" — `heading-1`, white
- **CTA**: "免费咨询" — Large white button
- **Contact**: "400-888-6688" — `display-2`, white, JetBrains Mono
- **Note**: "工作日 9:00-21:00" — `body`, white at 70%

### Animations
- **Phone number**: `fade-up`, 600ms
- **CTA**: `fade-up`, delay 200ms

---

## Footer

Same global footer.

---

## Assets Used

| Asset | Section | Usage |
|-------|---------|-------|
| `version-basic.jpg` | Pricing Cards | Card 1 image |
| `version-standard.jpg` | Pricing Cards | Card 2 image |
| `version-advanced.jpg` | Pricing Cards | Card 3 image |

---

## Interactions

- **Card CTAs**: Navigate to `/contact` with version pre-selected
- **Toggle filter**: Animates table rows in/out with Framer Motion layout
- **Accordion**: Standard expand/collapse
- **Price counter**: Animates on scroll into view
- **Hover on cards**: Subtle lift and shadow

---

## Responsive Notes

- **Cards**: Stack vertically on mobile, featured card at top
- **Table**: Horizontal scroll, first column sticky
- **Add-ons**: 2×2 grid on tablet, single column on mobile
