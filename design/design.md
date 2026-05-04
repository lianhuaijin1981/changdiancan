# 畅点餐 · 餐饮小程序解决方案

**Food Ordering Mini-Program Solution**

A premium product marketing website showcasing a comprehensive food ordering mini-program system sold on Zhubajie (猪八戒). The site targets restaurant owners, franchise chains, milk tea shops, and food courts looking for a turnkey digital ordering solution. It presents three product tiers, four terminal systems, and complete feature coverage with an appetizing, professional visual identity.

---

## Page List

| Page | File | Route | Description |
|------|------|-------|-------------|
| Home | `home.md` | `/` | Hero, version showcase, feature highlights, stats, testimonials, CTA |
| Features | `features.md` | `/features` | Detailed four-end feature breakdown with interactive tabs |
| Pricing | `pricing.md` | `/pricing` | Three-version pricing comparison with feature matrix |
| Demo | `demo.md` | `/demo` | UI showcase gallery of mini-program screens |
| Contact | `contact.md` | `/contact` | Inquiry form, consultation booking, FAQ |

---

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#FF6B35` | Primary brand color, CTAs, highlights, warm food-orange |
| `--color-primary-light` | `#FF8C61` | Hover states, gradients, accents |
| `--color-primary-dark` | `#E55A2B` | Active states, shadows |
| `--color-accent` | `#C41E3A` | Accent moments, badges, urgency elements, food-red |
| `--color-accent-light` | `#E84866` | Secondary accents |

### Background Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-base` | `#FFF9F5` | Warm cream page background |
| `--color-bg-card` | `#FFFFFF` | Card surfaces |
| `--color-bg-dark` | `#1A1A2E` | Dark sections, footer |
| `--color-bg-elevated` | `#FFEDE4` | Elevated surfaces, subtle highlights |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#1A1A2E` | Headlines, primary text |
| `--color-text-secondary` | `#6B7280` | Body text, descriptions |
| `--color-text-muted` | `#9CA3AF` | Captions, metadata |
| `--color-text-inverse` | `#FFFFFF` | Text on dark backgrounds |

### Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#10B981` | Success states, online indicators |
| `--color-warning` | `#F59E0B` | Warning, pending states |
| `--color-info` | `#3B82F6` | Info badges, links |

### Gradient Definitions
| Name | Value | Usage |
|------|-------|-------|
| `gradient-hero` | `linear-gradient(135deg, #FF6B35 0%, #FF8C61 50%, #FFB088 100%)` | Hero backgrounds, CTA buttons |
| `gradient-card` | `linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 100%)` | Card backgrounds |
| `gradient-dark` | `linear-gradient(135deg, #1A1A2E 0%, #2D2D44 100%)` | Dark section backgrounds |
| `gradient-warm` | `radial-gradient(ellipse at top, #FFEDE4 0%, #FFF9F5 70%)` | Subtle section backgrounds |

---

## Typography

### Font Families
| Role | Font | Fallback | Usage |
|------|------|----------|-------|
| Display | **Noto Serif SC** | serif | Hero headlines, section titles, premium feel |
| Body | **Noto Sans SC** | sans-serif | Body text, UI labels, descriptions |
| Mono | **JetBrains Mono** | monospace | Pricing numbers, statistics, code snippets |

### Type Scale
| Token | Size | Weight | Line-Height | Letter-Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `display-1` | 72px / 4.5rem | 700 | 1.1 | -0.02em | Hero headline |
| `display-2` | 56px / 3.5rem | 700 | 1.15 | -0.02em | Section headlines |
| `heading-1` | 40px / 2.5rem | 700 | 1.2 | -0.01em | Page titles |
| `heading-2` | 32px / 2rem | 600 | 1.3 | -0.01em | Section subheadings |
| `heading-3` | 24px / 1.5rem | 600 | 1.35 | 0 | Card titles |
| `heading-4` | 20px / 1.25rem | 600 | 1.4 | 0 | Feature titles |
| `body-large` | 18px / 1.125rem | 400 | 1.6 | 0 | Lead paragraphs |
| `body` | 16px / 1rem | 400 | 1.6 | 0 | Default body text |
| `body-small` | 14px / 0.875rem | 400 | 1.5 | 0.01em | Secondary text |
| `caption` | 12px / 0.75rem | 500 | 1.4 | 0.02em | Labels, badges |

### Responsive Typography
- **Mobile (< 640px)**: `display-1` → 40px, `display-2` → 32px, `heading-1` → 28px
- **Tablet (640–1024px)**: `display-1` → 56px, `display-2` → 44px
- **Desktop (> 1024px)**: Full scale as defined above

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Micro spacing |
| `space-2` | 8px | Tight padding |
| `space-3` | 12px | Inline elements |
| `space-4` | 16px | Default padding |
| `space-5` | 20px | Component internal |
| `space-6` | 24px | Card padding |
| `space-8` | 32px | Section internal |
| `space-10` | 40px | Medium gaps |
| `space-12` | 48px | Large gaps |
| `space-16` | 64px | Section padding (mobile) |
| `space-20` | 80px | Section padding (tablet) |
| `space-24` | 96px | Section padding (desktop) |
| `space-32` | 128px | Hero spacing |

### Container
| Breakpoint | Max-Width | Padding |
|------------|-----------|---------|
| Mobile | 100% | 16px |
| Tablet | 100% | 24px |
| Desktop | 1200px | 32px |
| Wide | 1400px | 48px |

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | 8px | Buttons, badges |
| `radius-md` | 12px | Cards, inputs |
| `radius-lg` | 16px | Feature cards |
| `radius-xl` | 24px | Hero cards, modals |
| `radius-full` | 9999px | Pills, avatars |

---

## Component Design

### Navigation Bar
- **Height**: 72px desktop, 64px mobile
- **Background**: `#FFFFFF` with `backdrop-filter: blur(12px)` and `background: rgba(255,255,255,0.9)`
- **Shadow**: `0 1px 3px rgba(0,0,0,0.05)`
- **Logo**: Left-aligned, "畅点餐" wordmark in Noto Serif SC, 24px, `--color-primary`
- **Links**: Centered, Noto Sans SC 16px weight 500, `--color-text-primary`, hover transitions to `--color-primary`
- **CTA Button**: Right-aligned, "立即咨询" pill button, `gradient-hero`, white text, `radius-full`
- **Mobile**: Hamburger menu with full-screen overlay, staggered link entrance

### Footer
- **Background**: `--color-bg-dark`
- **Padding**: `space-24` top, `space-12` bottom
- **Layout**: 4-column grid (Brand | Product | Support | Contact)
- **Text**: `--color-text-inverse` at 70% opacity, `--color-text-inverse` for headings
- **Divider**: 1px `rgba(255,255,255,0.1)`
- **Bottom Bar**: Copyright, ICP备案, social links

### Cards
- **Background**: `--color-bg-card`
- **Border**: 1px `rgba(0,0,0,0.04)`
- **Shadow**: `0 4px 24px rgba(0,0,0,0.06)`
- **Border Radius**: `radius-lg`
- **Padding**: `space-6` to `space-8`
- **Hover**: Transform `translateY(-4px)`, shadow deepens to `0 12px 40px rgba(0,0,0,0.1)`, 300ms ease

### Buttons

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| Primary | `gradient-hero` | White | none | Scale 1.02, shadow deepen |
| Secondary | Transparent | `--color-primary` | 2px `--color-primary` | Fill with `--color-primary`, text white |
| Ghost | Transparent | `--color-text-primary` | 1px `rgba(0,0,0,0.1)` | Background `rgba(0,0,0,0.04)` |
| Dark | `--color-bg-dark` | White | none | Background `#2D2D44` |

- **Border Radius**: `radius-full` for CTA, `radius-sm` for standard
- **Padding**: 14px 28px (standard), 16px 32px (large CTA)
- **Font**: Noto Sans SC, 16px, weight 600
- **Transition**: All 200ms ease

### Badges
- **New/Pro**: `--color-accent` background, white text, `radius-full`
- **Tag**: `--color-bg-elevated` background, `--color-primary` text, `radius-sm`
- **Status**: Green dot + text for online, amber for pending

---

## Animation & Motion

### Easing Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Primary entrances |
| `ease-out-quart` | `cubic-bezier(0.25, 1, 0.5, 1)` | Subtle movements |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Scroll-driven |
| `ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful interactions |

### Entrance Animations
| Name | Properties | Duration | Easing |
|------|-----------|----------|--------|
| `fade-up` | Opacity 0→1, translateY 40px→0 | 600ms | ease-out-expo |
| `fade-in` | Opacity 0→1 | 400ms | ease-out-quart |
| `scale-in` | Scale 0.95→1, opacity 0→1 | 500ms | ease-out-expo |
| `slide-left` | translateX 60px→0, opacity 0→1 | 700ms | ease-out-expo |
| `slide-right` | translateX -60px→0, opacity 0→1 | 700ms | ease-out-expo |

### Stagger Patterns
- **Cards grid**: 100ms between items, 0ms initial delay
- **Feature list**: 80ms between items
- **Nav links**: 50ms between items (mobile menu)
- **Stats row**: 120ms between items

### Scroll Behaviors
- **Lenis smooth scroll**: Enabled globally, `duration: 1.2`, `easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))`
- **Section reveals**: GSAP ScrollTrigger, `start: "top 80%"`, `toggleActions: "play none none none"`
- **Parallax**: Hero background elements at 0.3x scroll speed
- **Pin sections**: Feature comparison section, pinned for 200vh while content scrolls horizontally

### Micro-interactions
- **Button hover**: Scale 1.02, 200ms
- **Card hover**: translateY -4px, shadow deepen, 300ms
- **Link hover**: Color transition 200ms, underline slide-in from left
- **Badge pulse**: Subtle scale pulse on "限时优惠" badges, 2s infinite
- **Icon hover**: Rotate 5deg or scale 1.1, 200ms

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `gsap` | ^3.12 | Scroll animations, timelines, ScrollTrigger |
| `lenis` | ^1.1 | Smooth scrolling |
| `framer-motion` | ^11.0 | React component animations, layout transitions |
| `lucide-react` | ^0.400 | Icon system |

---

## Assets

| Filename | Description | Location | Dimensions | Type |
|----------|-------------|----------|------------|------|
| `hero-bg.jpg` | Warm, appetizing food photography background with blurred restaurant ambiance, warm orange and amber tones, bokeh lights, subtle gradient overlay compatible area on left side for text | Home Hero | 1920×1080 16:9 | Image |
| `hero-phones.png` | Three floating iPhone mockups showing mini-program UI screens (menu, cart, order), slightly tilted at different angles, soft drop shadow, transparent background | Home Hero | 1200×800 3:2 | PNG |
| `version-basic.jpg` | Cozy small restaurant interior - family-run noodle shop or milk tea store, warm lighting, simple decor, inviting atmosphere | Home Versions | 800×600 4:3 | Image |
| `version-standard.jpg` | Modern mid-size restaurant - hot pot or Chinese cuisine, clean interior design, bustling but organized | Home Versions | 800×600 4:3 | Image |
| `version-advanced.jpg` | Premium food court or franchise chain interior, sleek modern design, digital displays, upscale ambiance | Home Versions | 800×600 4:3 | Image |
| `feature-user.jpg` | User-end mini-program screenshot collage - menu browsing, dish detail, cart, payment, arranged in a clean grid with rounded corners and subtle shadow | Home/Features | 1200×900 4:3 | Image |
| `feature-admin.jpg` | Admin dashboard screenshot showing order management interface, data charts, clean modern UI with warm accent colors | Home/Features | 1200×900 4:3 | Image |
| `feature-staff.jpg` | Kitchen/staff tablet interface showing order queue, dish preparation status, clean UI designed for quick scanning | Features | 800×600 4:3 | Image |
| `feature-rider.jpg` | Delivery rider app interface showing map, order list, delivery route, minimal clean design | Features | 800×600 4:3 | Image |
| `demo-menu.jpg` | Mini-program menu page - category tabs, dish cards with photos, prices, add-to-cart buttons, warm orange accent | Demo Gallery | 750×1334 9:16 | Image |
| `demo-dish.jpg` | Mini-program dish detail page - large food photo, price, specs, options, add button, clean layout | Demo Gallery | 750×1334 9:16 | Image |
| `demo-cart.jpg` | Mini-program cart page - ordered items list, quantity controls, coupon section, checkout button | Demo Gallery | 750×1334 9:16 | Image |
| `demo-order.jpg` | Mini-program order page - order status timeline, restaurant info, payment method | Demo Gallery | 750×1334 9:16 | Image |
| `demo-member.jpg` | Mini-program member center - points, level, balance, recharge options | Demo Gallery | 750×1334 9:16 | Image |
| `demo-admin-orders.jpg` | Admin backend - real-time order list with status badges, action buttons | Demo Gallery | 1440×900 16:9 | Image |
| `demo-admin-data.jpg` | Admin backend - data dashboard with charts, revenue graphs, statistics cards | Demo Gallery | 1440×900 16:9 | Image |
| `case-logo-1.svg` | Generic hot pot restaurant brand logo placeholder, warm red tones, simple wordmark | Cases | 200×80 SVG | SVG |
| `case-logo-2.svg` | Generic milk tea chain brand logo placeholder, green tones, modern typography | Cases | 200×80 SVG | SVG |
| `case-logo-3.svg` | Generic Chinese cuisine restaurant logo, golden tones, traditional-modern blend | Cases | 200×80 SVG | SVG |
| `pattern-dots.svg` | Subtle dot pattern decoration, low opacity, warm orange tint, used as section background texture | Global | 400×400 1:1 | SVG |
| `pattern-lines.svg` | Subtle diagonal line pattern, very low opacity, decorative | Global | 400×400 1:1 | SVG |
| `qr-demo.png` | Sample table QR code with "扫码点餐" label, framed in a phone-like container | Home/Contact | 400×400 1:1 | Image |

---

## Responsive Breakpoints

| Name | Min Width | Tailwind Prefix | Notes |
|------|-----------|-----------------|-------|
| Mobile | 0px | (default) | Single column, stacked layouts |
| Tablet | 640px | `sm:` | 2-column grids begin |
| Laptop | 1024px | `lg:` | Full navigation, 3+ column grids |
| Desktop | 1280px | `xl:` | Max container width, generous spacing |
| Wide | 1536px | `2xl:` | Extra-wide layouts, larger type |

---

## Notes

- All Chinese text must use proper punctuation (Chinese full-width: ，。！？）
- Currency display: ¥ symbol with price (e.g., ¥3,999)
- Phone numbers: 400-xxx-xxxx format for contact
- Maintain warm, appetizing, trustworthy atmosphere throughout
- Avoid high-saturation jarring colors; keep food-comfortable palette
- QR code references should feel authentic and scannable-looking
- Mini-program frame should use standard iPhone proportions (375×812 base)
- Animation performance: max 8-10 animated elements per viewport