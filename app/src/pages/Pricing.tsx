import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Check,
  X,
  ShieldCheck,
  Bike,
  Store,
  Code,
  ChevronDown,
  Phone,
  Sparkles,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type FeatureValue = boolean | string

interface ComparisonRow {
  feature: string
  basic: FeatureValue
  standard: FeatureValue
  advanced: FeatureValue
}

interface ComparisonCategory {
  name: string
  rows: ComparisonRow[]
}

interface FAQItem {
  question: string
  answer: string
}

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

const fadeUpStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const fadeUpItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const comparisonData: ComparisonCategory[] = [
  {
    name: '用户端功能',
    rows: [
      { feature: '微信小程序扫码点餐', basic: true, standard: true, advanced: true },
      { feature: '桌台点餐', basic: true, standard: true, advanced: true },
      { feature: '菜品分类浏览', basic: true, standard: true, advanced: true },
      { feature: '购物车管理', basic: true, standard: true, advanced: true },
      { feature: '微信支付', basic: true, standard: true, advanced: true },
      { feature: '订单状态跟踪', basic: true, standard: true, advanced: true },
      { feature: '会员中心', basic: false, standard: true, advanced: true },
      { feature: '积分商城', basic: false, standard: true, advanced: true },
      { feature: '储值卡充值', basic: false, standard: true, advanced: true },
      { feature: '优惠券领取使用', basic: false, standard: true, advanced: true },
      { feature: '拼团/秒杀活动', basic: false, standard: true, advanced: true },
      { feature: '外卖下单', basic: false, standard: true, advanced: true },
      { feature: '多门店切换', basic: false, standard: true, advanced: true },
      { feature: '自营外卖配送', basic: false, standard: false, advanced: true },
    ],
  },
  {
    name: '商家后台',
    rows: [
      { feature: '独立管理后台（Web）', basic: true, standard: true, advanced: true },
      { feature: '菜品管理（上下架、分类）', basic: true, standard: true, advanced: true },
      { feature: '订单管理（实时列表）', basic: true, standard: true, advanced: true },
      { feature: '桌台二维码管理', basic: true, standard: true, advanced: true },
      { feature: '基础数据统计', basic: true, standard: true, advanced: true },
      { feature: '商家端APP', basic: false, standard: true, advanced: true },
      { feature: '会员等级管理', basic: false, standard: true, advanced: true },
      { feature: '营销活动配置', basic: false, standard: true, advanced: true },
      { feature: '完整数据报表', basic: false, standard: true, advanced: true },
      { feature: '多门店分权管理', basic: false, standard: false, advanced: true },
      { feature: '大数据可视化大屏', basic: false, standard: false, advanced: true },
      { feature: '美团/饿了么对接', basic: false, standard: false, advanced: true },
      { feature: '收银机硬件对接', basic: false, standard: false, advanced: true },
    ],
  },
  {
    name: '店员端',
    rows: [
      { feature: '店员端小程序', basic: true, standard: true, advanced: true },
      { feature: '订单接收/确认', basic: true, standard: true, advanced: true },
      { feature: '菜品状态更新', basic: true, standard: true, advanced: true },
      { feature: '叫号通知', basic: true, standard: true, advanced: true },
      { feature: '多店员账号', basic: false, standard: true, advanced: true },
    ],
  },
  {
    name: '骑手端',
    rows: [
      { feature: '骑手端APP', basic: false, standard: '可选', advanced: true },
      { feature: '地图导航配送', basic: false, standard: '可选', advanced: true },
      { feature: '订单抢单/派单', basic: false, standard: '可选', advanced: true },
    ],
  },
  {
    name: '营销功能',
    rows: [
      { feature: '满减券', basic: false, standard: true, advanced: true },
      { feature: '新人券', basic: false, standard: true, advanced: true },
      { feature: '折扣券', basic: false, standard: true, advanced: true },
      { feature: '拼团活动', basic: false, standard: true, advanced: true },
      { feature: '秒杀/限时特价', basic: false, standard: true, advanced: true },
      { feature: '会员储值营销', basic: false, standard: true, advanced: true },
      { feature: '积分兑换', basic: false, standard: true, advanced: true },
      { feature: '短信营销', basic: false, standard: false, advanced: true },
    ],
  },
  {
    name: '数据报表',
    rows: [
      { feature: '营业统计', basic: true, standard: true, advanced: true },
      { feature: '订单分析', basic: true, standard: true, advanced: true },
      { feature: '菜品销量排行', basic: true, standard: true, advanced: true },
      { feature: '会员数据分析', basic: false, standard: true, advanced: true },
      { feature: '营销效果分析', basic: false, standard: true, advanced: true },
      { feature: '多门店数据对比', basic: false, standard: true, advanced: true },
      { feature: '大数据可视化大屏', basic: false, standard: false, advanced: true },
      { feature: '自定义报表导出', basic: false, standard: false, advanced: true },
    ],
  },
  {
    name: '部署与售后',
    rows: [
      { feature: '小程序上线部署', basic: true, standard: true, advanced: true },
      { feature: '首年售后服务', basic: true, standard: true, advanced: true },
      { feature: '源码交付', basic: false, standard: true, advanced: true },
      { feature: '1-3门店支持', basic: false, standard: true, advanced: true },
      { feature: '无限制门店数量', basic: false, standard: false, advanced: true },
      { feature: '专属运维团队', basic: false, standard: false, advanced: true },
      { feature: '二次开发权限', basic: false, standard: false, advanced: true },
      { feature: '定制功能开发', basic: false, standard: false, advanced: true },
    ],
  },
]

const faqData: FAQItem[] = [
  {
    question: '价格包含什么？有额外费用吗？',
    answer:
      '所有报价均包含：系统开发/配置、小程序上线、首年售后服务。不含：服务器费用（约￥200-500/年）、微信支付手续费（微信官方收取0.6%）、域名费用（如需独立域名）。',
  },
  {
    question: '如何付款？支持分期吗？',
    answer:
      '支持银行转账、支付宝、微信支付。标准版和高级版支持3期分期付款（首付50%，上线后30%，验收后20%）。',
  },
  {
    question: '购买后可以退款吗？',
    answer:
      '合同签订后7天内，如系统尚未开始配置，可申请全额退款。已开始配置的，扣除已产生工时的费用后退还剩余款项。',
  },
  {
    question: '基础版可以升级吗？费用怎么算？',
    answer:
      '可以随时升级。升级费用 = 目标版本价格 - 已支付价格。例如基础版（￥3,999）升级标准版（￥9,999），补差价￥6,000即可。',
  },
  {
    question: '次年运维费必须交吗？不交会怎样？',
    answer:
      '非强制。如不续费运维，系统仍可正常使用，但不再享受BUG修复、系统升级、小程序审核协助等服务。建议至少续费基础运维以保障系统稳定。',
  },
  {
    question: '高级版的定制开发怎么收费？',
    answer:
      '高级版包含一次性的定制需求评估。如超出标准功能范围，按￥500/人天计费，开发前提供详细报价单和工期评估。',
  },
  {
    question: '多门店怎么收费？',
    answer: '标准版默认支持1-3家门店。超出后每新增1家门店￥1,500。高级版无门店数量限制。',
  },
]

/* ------------------------------------------------------------------ */
/*  Price Counter Component                                            */
/* ------------------------------------------------------------------ */

function AnimatedPrice({ value, colorClass }: { value: number; colorClass: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const duration = 1500
    const start = performance.now()
    let raf: number

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(eased * value))
      if (progress < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isInView, value])

  return (
    <span ref={ref} className={`font-mono ${colorClass}`}>
      ¥{display.toLocaleString()}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Page Header                                                        */
/* ------------------------------------------------------------------ */

function PageHeader() {
  const trustBadges = ['无隐藏费用', '7天无理由退款', '数据安全加密']

  return (
    <section className="relative overflow-hidden">
      <div className="gradient-hero py-24 sm:py-32 lg:py-36">
        <div className="container-main text-center">
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="font-body text-xl font-semibold text-white mb-4"
          >
            透明定价 · 无隐藏费用
          </motion.p>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-tight mb-6"
          >
            选择适合您的版本
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="font-body text-lg text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            一次投入，长期使用，所有版本均含首年售后服务
            <br />
            支持随时升级，数据完整保留
          </motion.p>

          <motion.div
            variants={fadeUpStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="flex flex-wrap justify-center gap-3"
          >
            {trustBadges.map((badge) => (
              <motion.span
                key={badge}
                variants={fadeUpItem}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full border border-white/40 text-white text-sm font-medium"
              >
                <Check className="w-4 h-4" />
                {badge}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Pricing Cards                                                      */
/* ------------------------------------------------------------------ */

const tierData = [
  {
    key: 'basic',
    name: '基础版',
    tag: '新手首选',
    tagColor: 'bg-[#10B981]',
    image: '/version-basic.jpg',
    price: 3999,
    priceUnit: '/套',
    priceNote: '含首年运维 · 免源码部署',
    priceColor: 'text-[#1A1A2E]',
    ctaText: '立即购买',
    ctaVariant: 'secondary' as const,
    ctaColor: 'border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white',
    features: [
      { ok: true, text: '微信小程序扫码点餐' },
      { ok: true, text: '独立管理后台' },
      { ok: true, text: '桌台二维码管理' },
      { ok: true, text: '微信支付对接' },
      { ok: true, text: '菜品分类与上下架' },
      { ok: true, text: '实时订单列表' },
      { ok: true, text: '1年售后服务' },
      { ok: false, text: '会员等级与积分' },
      { ok: false, text: '优惠券/营销活动' },
      { ok: false, text: '外卖配送功能' },
      { ok: false, text: '源码交付' },
    ],
    delivery: '交付周期：3-5天',
    featured: false,
  },
  {
    key: 'standard',
    name: '标准版',
    tag: '最受欢迎',
    tagColor: 'gradient-hero',
    image: '/version-standard.jpg',
    price: 9999,
    priceUnit: '/套',
    priceNote: '源码交付 · 基础运维',
    priceColor: 'text-[#FF6B35]',
    ctaText: '立即咨询',
    ctaVariant: 'primary' as const,
    ctaColor: '',
    features: [
      { ok: true, text: '基础版全部功能' },
      { ok: true, text: '会员等级与积分体系' },
      { ok: true, text: '储值卡充值与余额查询' },
      { ok: true, text: '满减券/新人券/折扣券' },
      { ok: true, text: '拼团/秒杀/限时特价' },
      { ok: true, text: '外卖到店配送' },
      { ok: true, text: '商家端APP' },
      { ok: true, text: '骑手端APP（可选）' },
      { ok: true, text: '数据统计报表（完整版）' },
      { ok: true, text: '1-3门店支持' },
      { ok: true, text: '源码交付' },
    ],
    delivery: '交付周期：5-7天',
    featured: true,
  },
  {
    key: 'advanced',
    name: '高级定制版',
    tag: '旗舰方案',
    tagColor: 'bg-[#C41E3A]',
    image: '/version-advanced.jpg',
    price: 29999,
    priceUnit: '/起',
    priceNote: '全端定制 · 源码全交付 · 专属运维',
    priceColor: 'text-[#C41E3A]',
    ctaText: '预约方案定制',
    ctaVariant: 'secondary' as const,
    ctaColor: 'border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white',
    features: [
      { ok: true, text: '标准版全部功能' },
      { ok: true, text: '多门店加盟分权管理' },
      { ok: true, text: '无限制门店数量' },
      { ok: true, text: '大数据可视化大屏' },
      { ok: true, text: '自营外卖配送体系' },
      { ok: true, text: '收银机硬件对接' },
      { ok: true, text: '美团/饿了么平台对接' },
      { ok: true, text: '专属运维团队' },
      { ok: true, text: '二次开发权限' },
      { ok: true, text: '源码全部交付' },
      { ok: true, text: '定制功能开发' },
    ],
    delivery: '交付周期：2-4周',
    featured: false,
  },
]

function PricingCards() {
  return (
    <section className="bg-[#FFF9F5] py-20 lg:py-24">
      <div className="container-main">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {tierData.map((tier, index) => (
            <motion.div
              key={tier.key}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-75px' }}
              transition={{ delay: index * 0.15 }}
              className={`relative rounded-2xl bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 ${
                tier.featured
                  ? 'lg:-translate-y-3 lg:shadow-[0_12px_40px_rgba(0,0,0,0.12)] border-2 border-[#FF6B35]'
                  : ''
              }`}
            >
              {/* Featured Ribbon */}
              {tier.featured && (
                <div className="absolute top-4 right-[-28px] z-10 bg-[#C41E3A] text-white text-xs font-bold px-8 py-1 rotate-45 shadow-md">
                  热销
                </div>
              )}

              {/* Header */}
              <div
                className={`${tier.tagColor} px-6 py-5 flex items-center justify-between ${
                  tier.featured ? 'gradient-hero' : ''
                }`}
              >
                <h3 className="font-display text-xl font-semibold text-white">{tier.name}</h3>
                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm">
                  {tier.tag}
                </span>
              </div>

              {/* Image */}
              <div className="h-40 overflow-hidden">
                <img
                  src={tier.image}
                  alt={tier.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Price */}
              <div className="px-6 pt-6 pb-2 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight">
                    <AnimatedPrice value={tier.price} colorClass={tier.priceColor} />
                  </span>
                  <span className="font-body text-lg text-[#6B7280]">{tier.priceUnit}</span>
                </div>
                <p className="mt-1 text-sm text-[#9CA3AF]">{tier.priceNote}</p>
              </div>

              {/* CTA */}
              <div className="px-6 py-4">
                <Link
                  to="/contact"
                  className={`block w-full text-center py-3.5 rounded-lg font-body font-semibold text-base transition-all duration-200 hover:scale-[1.02] ${
                    tier.ctaVariant === 'primary'
                      ? 'gradient-hero text-white shadow-md hover:shadow-lg'
                      : `border-2 bg-transparent ${tier.ctaColor}`
                  }`}
                >
                  {tier.ctaText}
                </Link>
              </div>

              {/* Features */}
              <div className="px-6 pb-4">
                <ul className="space-y-2.5">
                  {tier.features.map((feat, i) => (
                    <motion.li
                      key={feat.text}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: i * 0.04,
                        duration: 0.3,
                        ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                      }}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      {feat.ok ? (
                        <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-[#9CA3AF] mt-0.5 shrink-0" />
                      )}
                      <span
                        className={
                          feat.ok ? 'text-[#1A1A2E]' : 'text-[#9CA3AF] line-through'
                        }
                      >
                        {feat.text}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Delivery Note */}
              <div className="px-6 py-4 bg-[#FFF9F5] border-t border-black/[0.04]">
                <p className="text-xs text-[#9CA3AF] text-center">{tier.delivery}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Add-ons Section                                                    */
/* ------------------------------------------------------------------ */

const addOnsData = [
  {
    icon: ShieldCheck,
    iconColor: 'text-[#FF6B35]',
    title: '次年运维服务',
    price: '¥1,999 /年',
    priceColor: 'text-[#FF6B35]',
    description: '基础版续费维护，包含BUG修复、系统升级、小程序审核协助',
  },
  {
    icon: Bike,
    iconColor: 'text-[#C41E3A]',
    title: '骑手端额外开通',
    price: '¥2,999 /端',
    priceColor: 'text-[#C41E3A]',
    description: '标准版如需额外开通骑手端APP，按端口数收费',
  },
  {
    icon: Store,
    iconColor: 'text-[#3B82F6]',
    title: '门店数量扩容',
    price: '¥1,500 /家',
    priceColor: 'text-[#3B82F6]',
    description: '标准版超出3家门店后，每新增1家门店的费用',
  },
  {
    icon: Code,
    iconColor: 'text-[#F59E0B]',
    title: '定制功能开发',
    price: '¥500 /人天',
    priceColor: 'text-[#F59E0B]',
    description: '高级版专属，超出标准功能的定制开发按人天计费',
  },
]

function AddOns() {
  return (
    <section className="bg-[#FFEDE4] py-20 lg:py-24">
      <div className="container-main">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-3">
            可选增值服务
          </h2>
          <p className="font-body text-lg text-[#6B7280]">根据实际需要灵活搭配</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {addOnsData.map((addon, index) => (
            <motion.div
              key={addon.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)]"
            >
              <addon.icon className={`w-10 h-10 ${addon.iconColor} mb-4`} />
              <h4 className="font-body text-lg font-semibold text-[#1A1A2E] mb-2">
                {addon.title}
              </h4>
              <p className={`font-mono text-xl font-bold ${addon.priceColor} mb-3`}>
                {addon.price}
              </p>
              <p className="text-sm text-[#6B7280] leading-relaxed">{addon.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Comparison Table                                                   */
/* ------------------------------------------------------------------ */

function ComparisonTable() {
  const [showDiffOnly, setShowDiffOnly] = useState(false)

  const allRows = comparisonData.flatMap((cat) =>
    cat.rows.map((row) => ({ ...row, category: cat.name }))
  )

  const filteredRows = showDiffOnly
    ? allRows.filter((row) => {
        const vals = [row.basic, row.standard, row.advanced]
        const strs = vals.map((v) => String(v))
        return new Set(strs).size > 1
      })
    : allRows

  const renderCell = (val: FeatureValue) => {
    if (val === true) return <Check className="w-5 h-5 text-[#10B981] mx-auto" />
    if (val === false) return <X className="w-5 h-5 text-[#9CA3AF] mx-auto" />
    return <span className="text-sm text-[#6B7280]">{val}</span>
  }

  return (
    <section className="bg-[#FFF9F5] py-20 lg:py-24">
      <div className="container-main">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">
            详细功能对比
          </h2>

          {/* Toggle */}
          <label className="inline-flex items-center gap-3 cursor-pointer select-none">
            <span className="text-sm text-[#6B7280]">仅显示差异项</span>
            <button
              onClick={() => setShowDiffOnly(!showDiffOnly)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                showDiffOnly ? 'bg-[#FF6B35]' : 'bg-[#E5E7EB]'
              }`}
              aria-pressed={showDiffOnly}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  showDiffOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
        </motion.div>

        <div className="overflow-x-auto rounded-2xl border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="bg-[#1A1A2E] text-white">
                <th className="text-left px-5 py-4 font-body font-semibold sticky left-0 bg-[#1A1A2E] z-10 min-w-[200px]">
                  功能项目
                </th>
                <th className="text-center px-5 py-4 font-body font-semibold min-w-[120px]">
                  基础版
                </th>
                <th className="text-center px-5 py-4 font-body font-semibold min-w-[120px]">
                  标准版
                </th>
                <th className="text-center px-5 py-4 font-body font-semibold min-w-[120px]">
                  高级定制版
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {!showDiffOnly &&
                  comparisonData.map((category) => (
                    <>
                      <motion.tr
                        key={`cat-${category.name}`}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-[#FFEDE4]"
                      >
                        <td
                          colSpan={4}
                          className="px-5 py-3 font-body font-semibold text-[#1A1A2E] sticky left-0 bg-[#FFEDE4]"
                        >
                          {category.name}
                        </td>
                      </motion.tr>
                      {category.rows.map((row, i) => (
                        <motion.tr
                          key={`${category.name}-${row.feature}`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: i * 0.02 }}
                          className={`border-b border-black/[0.03] transition-colors hover:bg-[#FF6B35]/[0.03] ${
                            i % 2 === 0 ? 'bg-white' : 'bg-[#FFF9F5]'
                          }`}
                        >
                          <td className="px-5 py-3.5 text-[#1A1A2E] sticky left-0 bg-inherit z-[5]">
                            {row.feature}
                          </td>
                          <td className="px-5 py-3.5 text-center">{renderCell(row.basic)}</td>
                          <td className="px-5 py-3.5 text-center">{renderCell(row.standard)}</td>
                          <td className="px-5 py-3.5 text-center">{renderCell(row.advanced)}</td>
                        </motion.tr>
                      ))}
                    </>
                  ))}

                {showDiffOnly &&
                  filteredRows.map((row, i) => (
                    <motion.tr
                      key={`diff-${row.category}-${row.feature}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.03 }}
                      className={`border-b border-black/[0.03] transition-colors hover:bg-[#FF6B35]/[0.03] ${
                        i % 2 === 0 ? 'bg-white' : 'bg-[#FFF9F5]'
                      }`}
                    >
                      <td className="px-5 py-3.5 text-[#1A1A2E] sticky left-0 bg-inherit z-[5]">
                        <span className="text-xs text-[#9CA3AF] block mb-0.5">{row.category}</span>
                        {row.feature}
                      </td>
                      <td className="px-5 py-3.5 text-center">{renderCell(row.basic)}</td>
                      <td className="px-5 py-3.5 text-center">{renderCell(row.standard)}</td>
                      <td className="px-5 py-3.5 text-center">{renderCell(row.advanced)}</td>
                    </motion.tr>
                  ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  FAQ Section                                                        */
/* ------------------------------------------------------------------ */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-[#FFF9F5] py-20 lg:py-24">
      <div className="container-main max-w-[720px]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-3">
            价格相关常见问题
          </h2>
          <p className="font-body text-lg text-[#6B7280]">关于费用、付款、升级的疑问</p>
        </motion.div>

        <div className="space-y-3">
          {faqData.map((item, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="font-body font-semibold text-[#1A1A2E] text-base pr-4">
                  {item.question}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-[#6B7280]" />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-[#6B7280] text-sm leading-relaxed border-t border-black/[0.04] pt-4">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  CTA Banner                                                         */
/* ------------------------------------------------------------------ */

function CTABanner() {
  return (
    <section className="gradient-hero py-20 lg:py-24">
      <div className="container-main text-center">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="font-display text-3xl sm:text-4xl font-bold text-white mb-6"
        >
          还有疑问？我们为您一对一解答
        </motion.h2>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-white text-[#FF6B35] font-body font-semibold text-base px-8 py-4 rounded-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          >
            <Sparkles className="w-5 h-5" />
            免费咨询
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-3 text-white">
            <Phone className="w-6 h-6" />
            <span className="font-mono text-3xl sm:text-4xl font-bold tracking-tight">
              400-888-6688
            </span>
          </div>
          <p className="text-white/70 text-sm">工作日 9:00-21:00</p>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Pricing Page                                                  */
/* ------------------------------------------------------------------ */

export default function Pricing() {
  return (
    <div>
      <PageHeader />
      <PricingCards />
      <AddOns />
      <ComparisonTable />
      <FAQSection />
      <CTABanner />
    </div>
  )
}
