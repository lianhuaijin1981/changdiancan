# Contact Page — 联系我们

A conversion-focused contact and inquiry page. Form-based lead capture with multiple contact channels, consultation booking, and trust-building elements.

---

## Section 1: Page Header

### Layout
Full width, `gradient-hero` background. Centered content, padding `space-24` vertical.

### Elements
- **Eyebrow**: "畅点餐团队 · 随时为您服务" — white, `heading-4`
- **Title**: "开始您的数字化升级" — `display-2`, white
- **Subtitle**: "填写下方表单，我们的顾问将在 30 分钟内与您联系\n为您推荐最适合的解决方案" — `body-large`, white at 85%

### Animations
- **Title**: `fade-up`, GSAP SplitText word stagger
- **Subtitle**: `fade-up`, 600ms, delay 200ms

---

## Section 2: Contact Form + Info

### Layout
Full width, `--color-bg-base`. Centered max-width container. Two-column: 60% form, 40% contact info.

### Elements

#### Left Column — Inquiry Form
- **Form title**: "免费咨询获取方案" — `heading-2`
- **Form subtitle**: "请填写您的信息，带 * 为必填项" — `body-small`, `--color-text-muted`

**Form fields** (stacked vertically, gap 20px):

1. **姓名** * — Text input, `radius-md`, placeholder "您的称呼"
2. **联系电话** * — Tel input, `radius-md`, placeholder "手机号码"
3. **微信（选填）** — Text input, `radius-md`, placeholder "微信号（方便发送资料）"
4. **门店类型** * — Select dropdown, `radius-md`
   - 请选择门店类型
   - 夫妻店/小餐馆
   - 奶茶店/小吃店
   - 中餐店/火锅店
   - 茶饮连锁店
   - 大型连锁/美食广场
   - 其他
5. **门店数量** * — Select dropdown
   - 1家
   - 2-3家
   - 4-10家
   - 10家以上
6. **感兴趣版本** * — Radio group (horizontal on desktop, stacked mobile)
   - 基础版（¥3,999）
   - 标准版（¥9,999）
   - 高级定制版（¥29,999起）
   - 不确定，需要推荐
7. **需求描述（选填）** — Textarea, 4 rows, `radius-md`, placeholder "请简述您的需求，如：需要外卖功能、多门店管理、对接收银机等"
8. **Submit**: "提交咨询" — Primary button, `gradient-hero`, full width, `radius-md`, with `send` icon
9. **Privacy note**: "提交即表示您同意我们的隐私政策，我们将保护您的信息安全" — `caption`, `--color-text-muted`, centered

**Input styling**:
- Border: 1px `rgba(0,0,0,0.1)`
- Focus: Border `--color-primary`, subtle shadow `0 0 0 3px rgba(255,107,53,0.1)`
- Padding: 14px 16px
- Font: `body`, Noto Sans SC

**Validation states**:
- Error: Border `--color-accent`, error message below in `--color-accent`, `caption`
- Success: Border `--color-success`

#### Right Column — Contact Info
- **Card background**: `--color-bg-card`, `radius-lg`, padding `space-8`, shadow

**Contact methods** (stacked, gap 24px):

1. **电话咨询**
   - Icon: `phone`, 24px, `--color-primary`, in 48px circle `rgba(255,107,53,0.1)`
   - Title: "400-888-6688" — `heading-3`, `--color-text-primary`
   - Note: "工作日 9:00-21:00" — `body-small`, `--color-text-muted`

2. **微信咨询**
   - Icon: `message-circle`, 24px, `--color-success`
   - Title: "扫码添加顾问微信" — `heading-4`
   - QR code placeholder: `qr-demo.png`, 160px, `radius-md`, shadow
   - Note: "回复最快，推荐首选" — `caption`, `--color-success`

3. **邮件联系**
   - Icon: `mail`, 24px, `--color-info`
   - Title: "support@changdiancan.com" — `body`, `--color-text-primary`
   - Note: "24小时内回复" — `body-small`, `--color-text-muted`

4. **在线咨询**
   - Icon: `clock`, 24px, `--color-warning`
   - Title: "平均响应时间：30分钟" — `heading-4`
   - Note: "专业顾问一对一服务" — `body-small`

**Divider**: 1px `rgba(0,0,0,0.06)` between items

### Animations
- **Form**: `slide-right`, 700ms
- **Contact card**: `slide-left`, 700ms, delay 200ms
- **Form fields**: Stagger 60ms, `fade-up`, after form container entrance

---

## Section 3: Why Choose Us

### Layout
Full width, `--color-bg-elevated`. Centered max-width container.

### Elements

#### Header
- **Title**: "选择畅点餐的 6 大理由" — `heading-1`, centered
- **Subtitle**: "我们用专业和服务赢得信赖" — `body-large`, centered

#### Reason Cards (3×2 grid desktop, 2×3 tablet, single column mobile)

**Card 1 — 快速上线**
- Icon: `rocket`, 40px, `--color-primary`
- Title: "3-7天快速上线" — `heading-4`
- Description: "标准化流程，资料齐全后最快3天即可上线使用，不耽误营业" — `body-small`

**Card 2 — 源码交付**
- Icon: `code-2`, 40px, `--color-accent`
- Title: "标准版起源码交付" — `heading-4`
- Description: "源码完全属于您，可自主维护或委托第三方，不被任何服务商绑定" — `body-small`

**Card 3 — 四端覆盖**
- Icon: `smartphone`, 40px, `--color-success`
- Title: "用户+商家+店员+骑手" — `heading-4`
- Description: "一套系统四端互通，数据实时同步，告别信息孤岛" — `body-small`

**Card 4 — 营销赋能**
- Icon: `gift`, 40px, `--color-warning`
- Title: "会员营销全配齐" — `heading-4`
- Description: "优惠券、秒杀、拼团、积分、储值，帮您提升客单价和复购率" — `body-small`

**Card 5 — 数据驱动**
- Icon: `bar-chart-3`, 40px, `--color-info`
- Title: "经营数据可视化" — `heading-4`
- Description: "营业额、订单量、菜品排行、会员画像，让决策有数据支撑" — `body-small`

**Card 6 — 售后无忧**
- Icon: `shield-check`, 40px, `--color-primary`
- Title: "1年售后 + 可续费维护" — `heading-4`
- Description: "首年免费售后，系统问题及时响应，也可按年续费长期维护" — `body-small`

### Animations
- **Cards**: `fade-up`, stagger 100ms, 600ms, trigger at `top 80%`
- **Icons**: `scale-in` with `ease-bounce`

---

## Section 4: Service Process

### Layout
Full width, `--color-bg-base`. Centered max-width container.

### Elements

#### Header
- **Title**: "服务流程" — `heading-1`, centered
- **Subtitle**: "从咨询到上线，全程专人对接" — `body-large`, centered

#### Timeline (horizontal desktop, vertical mobile)

**Step 1 — 需求咨询**
- Number: "01" — `display-2`, `--color-primary`, JetBrains Mono
- Title: "需求咨询" — `heading-4`
- Description: "提交表单或电话咨询，顾问了解您的门店规模和需求" — `body-small`
- Icon: `message-circle`, 32px

**Connector**: Arrow line or dotted line between steps

**Step 2 — 方案定制**
- Number: "02"
- Title: "方案定制"
- Description: "根据需求推荐版本和功能配置，提供详细报价单"
- Icon: `file-text`

**Step 3 — 签订合同**
- Number: "03"
- Title: "签订合同"
- Description: "确认方案和报价后签订合同，支付首款"
- Icon: `pen-tool`

**Step 4 — 系统配置**
- Number: "04"
- Title: "系统配置"
- Description: "技术团队配置系统，导入菜品数据，设置支付方式"
- Icon: `settings`

**Step 5 — 测试上线**
- Number: "05"
- Title: "测试上线"
- Description: "内部测试通过后提交微信审核，审核通过即正式上线"
- Icon: `check-circle`

**Step 6 — 售后维护**
- Number: "06"
- Title: "售后维护"
- Description: "上线后持续提供技术支持，问题及时响应处理"
- Icon: `wrench`

### Animations
- **Timeline**: GSAP ScrollTrigger, horizontal scroll on desktop (pinned for 150vh, scroll drives horizontal movement)
- **Each step**: `fade-up` + number counter animation
- **Connectors**: Draw-in animation (SVG stroke dashoffset)

---

## Section 5: Trust Indicators

### Layout
Full width, `--color-bg-dark`. Centered content.

### Elements

- **Title**: "我们值得信赖" — `heading-1`, white, centered
- **Trust row** (3 columns):
  - **2000+** "合作商家" — `display-2`, white, JetBrains Mono
  - **50+** "覆盖城市" — `display-2`, white
  - **99.8%** "系统稳定性" — `display-2`, white
- **Partner logos**: 5 placeholder brand logos (`case-logo-1.svg` through `case-logo-5.svg`), grayscale, opacity 50%, hover to full color
- **Certifications**: "微信支付服务商" "微信小程序认证" — badge pills, white border, white text

### Animations
- **Numbers**: Counter animation 0→final, 2s
- **Logos**: `fade-up`, stagger 80ms

---

## Section 6: Final CTA

### Layout
Full width, `gradient-hero` background.

### Elements
- **Title**: "现在就行动" — `display-2`, white
- **Subtitle**: "每延迟一天，就可能错过更多订单" — `body-large`, white
- **CTA**: "立即免费咨询" — Large white button, `radius-full`
- **Phone**: "或拨打 400-888-6688" — `heading-3`, white

### Animations
- **Pulse ring**: Around CTA button, subtle `scale` animation 1→1.1→1, 2s infinite, `--color-primary` at 20%

---

## Footer

Same global footer.

---

## Assets Used

| Asset | Section | Usage |
|-------|---------|-------|
| `qr-demo.png` | Contact Info | WeChat QR code |
| `case-logo-1.svg` | Trust | Partner logo 1 |
| `case-logo-2.svg` | Trust | Partner logo 2 |
| `case-logo-3.svg` | Trust | Partner logo 3 |

---

## Interactions

- **Form submit**: Validation first, then success state (form fades, "提交成功" message with checkmark, "我们会尽快联系您")
- **Radio selection**: Animated circle fill, 200ms
- **Input focus**: Border color transition + shadow
- **QR code**: Click to enlarge in modal
- **Phone number**: Click to copy or `tel:` link on mobile
- **Email**: `mailto:` link
- **Process timeline**: Scroll-driven on desktop, static vertical on mobile

---

## Responsive Notes

- **Form + Info**: Stack vertically on mobile, form first
- **Reason cards**: Single column on mobile
- **Timeline**: Vertical on mobile with connecting line on left
- **Trust stats**: Single column on mobile
- **Partner logos**: Horizontal scroll on mobile
