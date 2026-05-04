import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Sparkles, ArrowRight, PlayCircle, Check, Smartphone,
  LayoutDashboard, Tablet, Bike, ChevronRight, Star,
  Plus, Minus, ArrowLeft, Utensils, Coffee, CakeSlice,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.4, delay, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (delay = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

const slideLeft = {
  hidden: { opacity: 0, x: 60 },
  visible: (delay = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

const slideRight = {
  hidden: { opacity: 0, x: -60 },
  visible: (delay = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
}

function SectionHeader({ eyebrow, title, subtitle, light = false }: { eyebrow: string; title: string; subtitle?: string; light?: boolean }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <div ref={ref} className="text-center mb-12 md:mb-16">
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        custom={0}
        className={`font-body text-base font-semibold tracking-wide mb-3 ${light ? 'text-[#FF8C61]' : 'text-[#FF6B35]'}`}
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        variants={fadeUp}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        custom={0.1}
        className={`font-display text-3xl md:text-4xl lg:text-[2.5rem] font-bold leading-tight mb-4 ${light ? 'text-white' : 'text-[#1A1A2E]'}`}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.2}
          className={`font-body text-base md:text-lg max-w-[640px] mx-auto ${light ? 'text-white/70' : 'text-[#6B7280]'}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}

/* ========== HERO SECTION ========== */
function HeroSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="relative min-h-[100dvh] flex items-center overflow-hidden gradient-warm">
      <img src="/hero-bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none" />
      <div className="absolute inset-0 gradient-warm pointer-events-none" />

      {/* Decorative floating circles */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#FF6B35]/5 blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-[#FF8C61]/5 blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative container-main w-full py-24 md:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left — Text */}
          <div className="max-w-xl">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.2}
              className="inline-flex items-center gap-1.5 bg-[#FF6B35] text-white text-xs font-medium px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              专业餐饮数字化解决方案
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.4}
              className="font-display text-4xl sm:text-5xl lg:text-[4.5rem] font-bold leading-[1.1] tracking-tight text-[#1A1A2E] mb-6"
            >
              让每一单
              <br />
              都<span className="text-gradient-hero">顺畅无阻</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.6}
              className="font-body text-base md:text-lg text-[#6B7280] leading-relaxed max-w-[520px] mb-8"
            >
              扫码点餐 · 会员营销 · 外卖配送 · 数据报表
              <br />
              一套系统，四端互通，从夫妻店到连锁品牌全覆盖
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.8}
              className="flex flex-wrap items-center gap-4 mb-8"
            >
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 gradient-hero text-white font-body text-base font-semibold px-8 py-4 rounded-full transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              >
                免费获取报价
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center gap-2 bg-transparent text-[#1A1A2E] font-body text-base font-medium px-6 py-4 rounded-full border border-black/10 hover:bg-black/5 transition-all duration-200">
                <PlayCircle className="w-5 h-5 text-[#FF6B35]" />
                查看功能演示
              </button>
            </motion.div>

            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={1.0}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF8C61] to-[#FFB088] border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="text-[#9CA3AF] text-sm font-body">已有 2,000+ 餐饮商家信赖</span>
            </motion.div>
          </div>

          {/* Right — Phone mockups */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={0.3}
            className="relative hidden lg:flex items-center justify-center h-[500px]"
          >
            <div className="relative w-[320px] h-[540px]">
              {/* Left phone */}
              <div className="absolute top-8 -left-12 w-[200px] h-[400px] rounded-[32px] bg-white shadow-card border border-black/5 overflow-hidden animate-float" style={{ animationDelay: '1s', transform: 'rotate(-12deg) scale(0.8)' }}>
                <img src="/demo-menu.jpg" alt="菜单" className="w-full h-full object-cover" />
              </div>
              {/* Right phone */}
              <div className="absolute top-8 -right-12 w-[200px] h-[400px] rounded-[32px] bg-white shadow-card border border-black/5 overflow-hidden animate-float" style={{ animationDelay: '2s', transform: 'rotate(12deg) scale(0.8)' }}>
                <img src="/demo-order.jpg" alt="订单" className="w-full h-full object-cover" />
              </div>
              {/* Center phone */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[240px] h-[440px] rounded-[32px] bg-white shadow-elevated border border-black/5 overflow-hidden z-10 animate-float">
                <img src="/demo-cart.jpg" alt="购物车" className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ========== VERSION SHOWCASE ========== */
function VersionSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const versions = [
    {
      name: '基础版',
      badge: '新手首选',
      badgeColor: 'bg-[#10B981]',
      image: '/version-basic.jpg',
      subtitle: '夫妻店 · 小餐馆 · 奶茶店 · 小吃店',
      price: '¥3,999',
      priceNote: '含首年运维 · 免源码部署',
      features: ['微信小程序扫码点餐', '独立管理后台', '桌台二维码管理', '微信支付对接', '1年售后服务'],
      cta: '了解详情',
      border: 'border-l-[3px] border-l-[#10B981]',
      featured: false,
    },
    {
      name: '标准版',
      badge: '最受欢迎',
      badgeColor: 'gradient-hero',
      image: '/version-standard.jpg',
      subtitle: '连锁单店 · 中餐店 · 火锅店 · 茶饮连锁',
      price: '¥9,999',
      priceNote: '源码交付 · 基础运维',
      features: ['基础版全部功能', '会员等级与积分体系', '优惠券/秒杀/拼团营销', '外卖到店配送', '商家端 + 骑手端', '数据统计报表', '1-3 门店支持'],
      cta: '立即咨询',
      border: 'border-[3px] border-[#FF6B35]',
      featured: true,
    },
    {
      name: '高级定制版',
      badge: '旗舰方案',
      badgeColor: 'bg-[#C41E3A]',
      image: '/version-advanced.jpg',
      subtitle: '大型连锁 · 美食广场 · 多门店加盟',
      price: '¥29,999',
      priceNote: '全端定制 · 源码全交付',
      features: ['标准版全部功能', '多门店加盟分权管理', '大数据可视化报表', '自营外卖体系', '收银机硬件对接', '美团/饿了么对接', '专属运维 + 二次开发'],
      cta: '预约方案定制',
      border: 'border-l-[3px] border-l-[#C41E3A]',
      featured: false,
    },
  ]

  return (
    <section ref={ref} className="py-space-24 bg-[#FFF9F5]">
      <div className="container-main">
        <SectionHeader
          eyebrow="三大版本 · 按需选择"
          title="无论您是小店起步还是连锁扩张\n总有一款适合您"
          subtitle="从基础扫码点餐到全链路数字化运营，我们覆盖餐饮全场景"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12">
          {versions.map((v, i) => (
            <motion.div
              key={v.name}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={i * 0.15}
              className={`relative bg-white rounded-radius-lg shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${v.border} ${v.featured ? '-translate-y-2 shadow-elevated' : ''}`}
            >
              {v.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <span className={`inline-block text-white text-xs font-semibold px-3 py-1 rounded-full ${v.badgeColor} animate-pulse-badge`}>
                    {v.badge}
                  </span>
                </div>
              )}
              {!v.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <span className={`inline-block text-white text-xs font-semibold px-3 py-1 rounded-full ${v.badgeColor}`}>
                    {v.badge}
                  </span>
                </div>
              )}

              <div className="h-[200px] overflow-hidden">
                <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
              </div>

              <div className="p-6">
                <h3 className="font-display text-2xl font-bold text-[#1A1A2E] mb-1">{v.name}</h3>
                <p className="text-[#9CA3AF] text-sm font-body mb-4">{v.subtitle}</p>

                <div className="mb-1">
                  <span className="font-mono text-3xl font-bold text-[#FF6B35]">{v.price}</span>
                  <span className="text-[#9CA3AF] text-sm font-body ml-1">起</span>
                </div>
                <p className="text-[#9CA3AF] text-xs font-body mb-5">{v.priceNote}</p>

                <ul className="space-y-2.5 mb-6">
                  {v.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm font-body text-[#6B7280]">
                      <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/contact"
                  className={`block text-center font-body text-base font-semibold py-3 rounded-radius-sm transition-all duration-200 ${
                    v.featured
                      ? 'gradient-hero text-white hover:shadow-lg'
                      : 'border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white'
                  }`}
                >
                  {v.cta}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ========== FOUR ENDS ========== */
function FourEndsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const ends = [
    {
      icon: Smartphone,
      iconColor: 'text-[#FF6B35]',
      bgColor: 'bg-[#FF6B35]/10',
      title: '用户端小程序',
      desc: '扫码点餐、在线支付、会员积分、优惠券、拼团秒杀，提升顾客体验和复购率',
      tags: ['扫码点餐', '微信支付', '会员体系'],
      image: '/feature-user.jpg',
    },
    {
      icon: LayoutDashboard,
      iconColor: 'text-[#C41E3A]',
      bgColor: 'bg-[#C41E3A]/10',
      title: '商家管理后台',
      desc: '电脑端完整后台，菜品管理、订单处理、会员营销、数据报表，经营决策有依据',
      tags: ['菜品管理', '订单处理', '数据统计'],
      image: '/feature-admin.jpg',
    },
    {
      icon: Tablet,
      iconColor: 'text-[#3B82F6]',
      bgColor: 'bg-[#3B82F6]/10',
      title: '店员后厨端',
      desc: '手机/平板实时接单，菜品制作提醒，桌台状态管理，告别漏单错单',
      tags: ['实时接单', '制作提醒', '上菜确认'],
      image: '/feature-staff.jpg',
    },
    {
      icon: Bike,
      iconColor: 'text-[#F59E0B]',
      bgColor: 'bg-[#F59E0B]/10',
      title: '骑手配送端',
      desc: '外卖接单、配送路线、送达确认，自营外卖无需第三方平台抽成',
      tags: ['路线规划', '送达确认', '运费规则'],
      image: '/feature-rider.jpg',
    },
  ]

  return (
    <section ref={ref} className="py-space-24 bg-[#FFEDE4]">
      <div className="container-main">
        <SectionHeader
          eyebrow="四端互通 · 数据互联"
          title="一套系统，打通全链路"
          subtitle="用户端、商家后台、店员端、骑手端，数据实时同步，经营无死角"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mt-12">
          {ends.map((end, i) => (
            <motion.div
              key={end.title}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={i * 0.12}
              className="bg-white rounded-radius-lg p-6 lg:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-4">
                <motion.div
                  variants={scaleIn}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  custom={i * 0.12 + 0.1}
                  className={`w-16 h-16 rounded-full ${end.bgColor} flex items-center justify-center shrink-0`}
                >
                  <end.icon className={`w-8 h-8 ${end.iconColor}`} />
                </motion.div>
                <div className="flex-1">
                  <h4 className="font-display text-xl font-semibold text-[#1A1A2E] mb-2">{end.title}</h4>
                  <p className="font-body text-sm text-[#6B7280] leading-relaxed">{end.desc}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {end.tags.map((tag) => (
                  <span key={tag} className="bg-[#FFEDE4] text-[#FF6B35] text-xs font-medium px-3 py-1 rounded-radius-sm">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="rounded-radius-md overflow-hidden shadow-sm">
                <img src={end.image} alt={end.title} className="w-full h-auto object-cover" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ========== CORE FEATURES ========== */
function CoreFeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const rows = [
    {
      eyebrow: '核心功能',
      title: '扫码点餐，30秒完成下单',
      desc: '桌台二维码自动绑定桌号，顾客扫码即点，无需等待服务员。分类菜品清晰展示，规格、口味、辣度一键选择，购物车随时增减。',
      bullets: ['桌台二维码自动生成与打印', '菜品分类展示，支持多规格多口味', '购物车实时汇总，一键结算', '下单后厨实时接单，状态同步'],
      image: '/demo-menu.jpg',
      imageLeft: true,
    },
    {
      eyebrow: '营销增长',
      title: '会员体系 + 营销活动，复购率翻倍',
      desc: '手机号授权登录即会员，等级积分自动累计。满减券、新人券、折扣券灵活配置，拼团秒杀拉新裂变，充值赠送锁定资金。',
      bullets: ['三级会员等级，积分抵现', '储值卡充值，余额实时查询', '满减券/新人券/折扣券三种类型', '拼团、秒杀、限时特价、第二份半价'],
      image: '/demo-member.jpg',
      imageLeft: false,
    },
    {
      eyebrow: '数据驱动',
      title: '经营数据一目了然',
      desc: '营业额实时统计，每日/每周/每月报表自动生成。菜品销量排行、会员消费分析、营收趋势曲线，导出Excel轻松做账。',
      bullets: ['实时营业额与订单量统计', '菜品销量 TOP 排行分析', '会员消费频次与金额画像', '多维度数据导出 Excel'],
      image: '/demo-admin-data.jpg',
      imageLeft: true,
    },
  ]

  return (
    <section ref={ref} className="py-space-24 bg-[#FFF9F5]">
      <div className="container-main space-y-20 lg:space-y-28">
        {rows.map((row, i) => {
          const ImageComp = (
            <motion.div
              variants={row.imageLeft ? slideRight : slideLeft}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={i * 0.2}
              className="relative"
            >
              <div className={`rounded-radius-xl overflow-hidden shadow-elevated ${row.imageLeft ? 'rotate-[-2deg]' : 'rotate-[2deg]'}`}>
                <img src={row.image} alt={row.title} className="w-full h-auto object-cover" />
              </div>
            </motion.div>
          )

          const TextComp = (
            <motion.div
              variants={row.imageLeft ? slideLeft : slideRight}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={i * 0.2 + 0.1}
              className="flex flex-col justify-center"
            >
              <p className="text-[#FF6B35] text-sm font-semibold font-body mb-2">{row.eyebrow}</p>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-[#1A1A2E] mb-4">{row.title}</h3>
              <p className="font-body text-base text-[#6B7280] leading-relaxed mb-6">{row.desc}</p>
              <ul className="space-y-3 mb-6">
                {row.bullets.map((b, bi) => (
                  <motion.li
                    key={b}
                    variants={fadeUp}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    custom={i * 0.2 + 0.2 + bi * 0.08}
                    className="flex items-start gap-2 text-sm font-body text-[#6B7280]"
                  >
                    <Check className="w-4 h-4 text-[#FF6B35] mt-0.5 shrink-0" />
                    {b}
                  </motion.li>
                ))}
              </ul>
              <Link to="/features" className="inline-flex items-center gap-1 text-[#FF6B35] font-body text-sm font-semibold hover:gap-2 transition-all duration-200">
                查看完整用户端功能 <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )

          return (
            <div key={row.title} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {row.imageLeft ? (
                <>{ImageComp}{TextComp}</>
              ) : (
                <>{TextComp}{ImageComp}</>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ========== STATS BANNER ========== */
function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const stats = [
    { value: '2,000+', label: '服务商家', sub: '覆盖城市' },
    { value: '50,000+', label: '日处理订单', sub: '峰值并发' },
    { value: '98.5%', label: '客户满意度', sub: '好评率' },
    { value: '3-7天', label: '上线周期', sub: '快速部署' },
  ]

  return (
    <section ref={ref} className="py-space-16 gradient-hero">
      <div className="container-main">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={i * 0.15}
              className={`text-center ${i < stats.length - 1 ? 'lg:border-r lg:border-white/20' : ''}`}
            >
              <p className="font-mono text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
              <p className="font-body text-sm text-white/80">{stat.label}</p>
              <p className="font-body text-xs text-white/60">{stat.sub}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ========== UI SHOWCASE ========== */
function ShowcaseSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const scrollRef = useRef<HTMLDivElement>(null)

  const phones = [
    { src: '/demo-menu.jpg', label: '首页/菜单' },
    { src: '/demo-dish.jpg', label: '菜品详情' },
    { src: '/demo-cart.jpg', label: '购物车' },
    { src: '/demo-order.jpg', label: '订单中心' },
    { src: '/demo-member.jpg', label: '会员中心' },
    { src: '/demo-admin-orders.jpg', label: '商家后台' },
  ]

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = 260
      scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
    }
  }

  return (
    <section ref={ref} className="py-space-24 bg-[#1A1A2E] overflow-hidden">
      <div className="container-main">
        <SectionHeader
          eyebrow="UI 设计"
          title="精心设计，只为更好的用餐体验"
          subtitle="扁平化风格、圆角卡片、大图展示、舒适配色，兼容所有微信机型"
          light
        />
      </div>

      <div className="relative mt-12">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto px-4 sm:px-8 lg:px-[calc((100vw-1200px)/2+32px)] pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {phones.map((phone, i) => (
            <motion.div
              key={phone.label}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={i * 0.1}
              className="snap-start shrink-0"
            >
              <div className="group relative w-[220px] h-[440px] rounded-[32px] bg-[#2D2D44] p-2 border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,107,53,0.2)]">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full z-10" />
                <div className="w-full h-full rounded-[24px] overflow-hidden">
                  <img src={phone.src} alt={phone.label} className="w-full h-full object-cover" />
                </div>
              </div>
              <p className="text-center text-white/60 text-sm font-body mt-3">{phone.label}</p>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FF6B35] text-white flex items-center justify-center shadow-lg hover:bg-[#E55A2B] transition-colors z-10"
          aria-label="Scroll left"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#FF6B35] text-white flex items-center justify-center shadow-lg hover:bg-[#E55A2B] transition-colors z-10"
          aria-label="Scroll right"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  )
}

/* ========== TESTIMONIALS ========== */
function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const testimonials = [
    {
      name: '王老板',
      role: '重庆老火锅 · 3家门店',
      quote: '以前高峰期总是忙不过来，顾客等得着急。用了畅点餐之后，顾客自己扫码点，后厨直接出单，翻台率提升了30%。',
    },
    {
      name: '李店长',
      role: '茶语时光 · 奶茶连锁',
      quote: '会员积分和优惠券功能太好用了，顾客为了凑满减会多点一杯，客单价从18块涨到26块。',
    },
    {
      name: '张总',
      role: '美食广场 · 12家档口',
      quote: '多门店统一管理，每个档口的营业额实时能看到，月底对账省了一半时间。高级版的钱花得值。',
    },
  ]

  return (
    <section ref={ref} className="py-space-24 bg-[#FFF9F5]">
      <div className="container-main">
        <SectionHeader
          eyebrow="客户证言"
          title="他们都在用畅点餐"
          subtitle="来自真实商家的使用反馈"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-12">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={i * 0.12}
              className="bg-white rounded-radius-lg p-6 lg:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF8C61] flex items-center justify-center text-white text-sm font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <h4 className="font-display text-base font-semibold text-[#1A1A2E]">{t.name}</h4>
                  <p className="text-[#9CA3AF] text-xs font-body">{t.role}</p>
                </div>
              </div>
              <p className="font-body text-sm text-[#6B7280] leading-relaxed italic mb-4">"{t.quote}"</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ========== CTA BANNER ========== */
function CtaSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="py-space-24 gradient-hero relative overflow-hidden">
      {/* Decorative icons */}
      <Utensils className="absolute top-12 left-[10%] w-12 h-12 text-white/10 animate-float-slow" />
      <Coffee className="absolute bottom-12 right-[15%] w-10 h-10 text-white/10 animate-float-slow" style={{ animationDelay: '3s' }} />
      <CakeSlice className="absolute top-20 right-[20%] w-8 h-8 text-white/10 animate-float-slow" style={{ animationDelay: '6s' }} />

      <div className="container-main relative text-center">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0}
          className="font-display text-3xl md:text-4xl font-bold text-white mb-4"
        >
          准备好升级您的餐厅了吗？
        </motion.h2>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.1}
          className="font-body text-base md:text-lg text-white/90 max-w-[520px] mx-auto mb-8"
        >
          立即咨询，获取专属方案和报价
          <br />
          3-7天快速上线，1年售后无忧
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.3}
          className="flex flex-wrap items-center justify-center gap-4 mb-6"
        >
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-white text-[#FF6B35] font-body text-base font-semibold px-8 py-4 rounded-full transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
          >
            免费咨询获取报价
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 bg-transparent text-white font-body text-base font-medium px-8 py-4 rounded-full border-2 border-white/60 hover:bg-white/10 transition-all duration-200"
          >
            预约产品演示
          </Link>
        </motion.div>

        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          custom={0.5}
          className="text-white/80 text-sm font-body"
        >
          或拨打 400-888-6688
        </motion.p>
      </div>
    </section>
  )
}

/* ========== FAQ PREVIEW ========== */
function FaqSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: '小程序多久能上线？',
      a: '基础版3-5天即可上线，标准版5-7天，高级定制版根据需求复杂度约2-4周。我们提供全程技术配置，您只需提供门店信息和菜品资料。',
    },
    {
      q: '需要准备什么资料？',
      a: '营业执照、食品经营许可证、法人身份证、银行卡（用于微信支付商户号申请）。菜品图片、名称、价格、规格信息。我们会提供资料清单和模板。',
    },
    {
      q: '支持哪些支付方式？',
      a: '微信支付（默认标配）、余额支付（会员储值卡）、优惠券抵扣。高级版可额外对接支付宝、POS收银机。',
    },
    {
      q: '后期可以升级版本吗？',
      a: '完全可以。基础版可随时补差价升级至标准版或高级版，数据和配置完整保留，不影响正常营业。',
    },
    {
      q: '售后包含哪些服务？',
      a: '1年免费售后包含：BUG修复、小程序审核协助、系统功能咨询、数据备份。超出1年后可按年续费维护，或选择一次性买断源码自行维护。',
    },
  ]

  return (
    <section ref={ref} className="py-space-24 bg-[#FFF9F5]">
      <div className="container-main">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Left header */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={0}
            className="lg:col-span-2"
          >
            <p className="text-[#FF6B35] text-sm font-semibold font-body mb-2">常见问题</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-4">您可能想知道的</h2>
            <p className="font-body text-base text-[#6B7280] mb-6">如果以下没有解答您的疑问，欢迎随时联系我们</p>
            <Link to="/contact" className="inline-flex items-center gap-1 text-[#FF6B35] font-body text-sm font-semibold hover:gap-2 transition-all duration-200">
              查看全部 FAQ <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Right accordion */}
          <div className="lg:col-span-3 space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                custom={i * 0.08}
                className="bg-white rounded-radius-md shadow-sm border border-black/5 overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-body text-base font-semibold text-[#1A1A2E]">{faq.q}</span>
                  <span className="shrink-0 ml-4 transition-transform duration-300">
                    {openIndex === i ? (
                      <Minus className="w-5 h-5 text-[#FF6B35]" />
                    ) : (
                      <Plus className="w-5 h-5 text-[#FF6B35]" />
                    )}
                  </span>
                </button>
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5">
                        <p className="font-body text-sm text-[#6B7280] leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ========== HOME PAGE ========== */
export default function Home() {
  return (
    <div className="pt-[72px]">
      <HeroSection />
      <VersionSection />
      <FourEndsSection />
      <CoreFeaturesSection />
      <StatsSection />
      <ShowcaseSection />
      <TestimonialsSection />
      <CtaSection />
      <FaqSection />
    </div>
  )
}
