import { useState, useRef, useEffect } from 'react'
import type { FC } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import {
  Send,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Rocket,
  Code2,
  Smartphone,
  Gift,
  BarChart3,
  ShieldCheck,
  CheckCircle,
  FileText,
  PenTool,
  Settings,
  Wrench,
  ArrowRight,
  Copy,
  ChevronDown,
  X,
  Check,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Constants & Types                                                  */
/* ------------------------------------------------------------------ */

const easing: [number, number, number, number] = [0.16, 1, 0.3, 1]
const easeBounce: [number, number, number, number] = [0.34, 1.56, 0.64, 1]

interface FormData {
  name: string
  phone: string
  wechat: string
  storeType: string
  storeCount: string
  version: string
  description: string
}

interface FormErrors {
  name?: string
  phone?: string
  storeType?: string
  storeCount?: string
  version?: string
}

/* ------------------------------------------------------------------ */
/*  Form Section                                                       */
/* ------------------------------------------------------------------ */

const storeTypes = [
  '请选择门店类型',
  '夫妻店/小餐馆',
  '奶茶店/小吃店',
  '中餐店/火锅店',
  '茶饮连锁店',
  '大型连锁/美食广场',
  '其他',
]

const storeCounts = ['1家', '2-3家', '4-10家', '10家以上']

const versions = [
  '基础版（¥3,999）',
  '标准版（¥9,999）',
  '高级定制版（¥29,999起）',
  '不确定，需要推荐',
]

const ContactFormSection: FC = () => {
  const [form, setForm] = useState<FormData>({
    name: '',
    phone: '',
    wechat: '',
    storeType: '',
    storeCount: '',
    version: '',
    description: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [showQREnlarged, setShowQREnlarged] = useState(false)
  const [phoneCopied, setPhoneCopied] = useState(false)

  const updateField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!form.name.trim()) newErrors.name = '请输入您的称呼'
    if (!form.phone.trim()) newErrors.phone = '请输入手机号码'
    else if (!/^1[3-9]\d{9}$/.test(form.phone.trim())) newErrors.phone = '请输入有效的手机号码'
    if (!form.storeType || form.storeType === '请选择门店类型') newErrors.storeType = '请选择门店类型'
    if (!form.storeCount) newErrors.storeCount = '请选择门店数量'
    if (!form.version) newErrors.version = '请选择感兴趣版本'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      setSubmitted(true)
    }
  }

  const copyPhone = () => {
    navigator.clipboard.writeText('400-888-6688')
    setPhoneCopied(true)
    setTimeout(() => setPhoneCopied(false), 2000)
  }

  return (
    <section className="bg-[#FFF9F5] py-16 sm:py-20 lg:py-24">
      <div className="container-main">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
          {/* Left Column — Form */}
          <motion.div
            className="flex-[3]"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: easing }}
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  className="bg-white rounded-2xl p-8 sm:p-12 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.06)] text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: easing }}
                >
                  <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-[#10B981]" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#1A1A2E] mb-3">
                    提交成功
                  </h3>
                  <p className="text-[#6B7280] font-body mb-2">
                    我们会尽快联系您
                  </p>
                  <p className="text-[#6B7280] font-body text-sm">
                    顾问将在30分钟内与您联系，请保持电话畅通
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1A1A2E] mb-1">
                    免费咨询获取方案
                  </h3>
                  <p className="text-[#9CA3AF] font-body text-sm mb-6">
                    请填写您的信息，带 * 为必填项
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1, ease: easing }}
                    >
                      <label className="block font-body text-sm font-medium text-[#1A1A2E] mb-1.5">
                        姓名 <span className="text-[#C41E3A]">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="您的称呼"
                        className={`w-full px-4 py-3.5 rounded-xl border font-body text-sm outline-none transition-all duration-200 ${
                          errors.name
                            ? 'border-[#C41E3A] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.1)]'
                            : 'border-black/10 focus:border-[#FF6B35] focus:shadow-[0_0_0_3px_rgba(255,107,53,0.1)]'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-[#C41E3A] text-xs font-body mt-1">{errors.name}</p>
                      )}
                    </motion.div>

                    {/* Phone */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.16, ease: easing }}
                    >
                      <label className="block font-body text-sm font-medium text-[#1A1A2E] mb-1.5">
                        联系电话 <span className="text-[#C41E3A]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="手机号码"
                        className={`w-full px-4 py-3.5 rounded-xl border font-body text-sm outline-none transition-all duration-200 ${
                          errors.phone
                            ? 'border-[#C41E3A] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.1)]'
                            : 'border-black/10 focus:border-[#FF6B35] focus:shadow-[0_0_0_3px_rgba(255,107,53,0.1)]'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-[#C41E3A] text-xs font-body mt-1">{errors.phone}</p>
                      )}
                    </motion.div>

                    {/* WeChat */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.22, ease: easing }}
                    >
                      <label className="block font-body text-sm font-medium text-[#1A1A2E] mb-1.5">
                        微信（选填）
                      </label>
                      <input
                        type="text"
                        value={form.wechat}
                        onChange={(e) => updateField('wechat', e.target.value)}
                        placeholder="微信号（方便发送资料）"
                        className="w-full px-4 py-3.5 rounded-xl border border-black/10 font-body text-sm outline-none transition-all duration-200 focus:border-[#FF6B35] focus:shadow-[0_0_0_3px_rgba(255,107,53,0.1)]"
                      />
                    </motion.div>

                    {/* Store Type */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.28, ease: easing }}
                    >
                      <label className="block font-body text-sm font-medium text-[#1A1A2E] mb-1.5">
                        门店类型 <span className="text-[#C41E3A]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={form.storeType}
                          onChange={(e) => updateField('storeType', e.target.value)}
                          className={`w-full px-4 py-3.5 rounded-xl border font-body text-sm outline-none transition-all duration-200 appearance-none bg-white ${
                            errors.storeType
                              ? 'border-[#C41E3A] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.1)]'
                              : 'border-black/10 focus:border-[#FF6B35] focus:shadow-[0_0_0_3px_rgba(255,107,53,0.1)]'
                          }`}
                        >
                          {storeTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                      </div>
                      {errors.storeType && (
                        <p className="text-[#C41E3A] text-xs font-body mt-1">{errors.storeType}</p>
                      )}
                    </motion.div>

                    {/* Store Count */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.34, ease: easing }}
                    >
                      <label className="block font-body text-sm font-medium text-[#1A1A2E] mb-1.5">
                        门店数量 <span className="text-[#C41E3A]">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={form.storeCount}
                          onChange={(e) => updateField('storeCount', e.target.value)}
                          className={`w-full px-4 py-3.5 rounded-xl border font-body text-sm outline-none transition-all duration-200 appearance-none bg-white ${
                            errors.storeCount
                              ? 'border-[#C41E3A] focus:shadow-[0_0_0_3px_rgba(196,30,58,0.1)]'
                              : 'border-black/10 focus:border-[#FF6B35] focus:shadow-[0_0_0_3px_rgba(255,107,53,0.1)]'
                          }`}
                        >
                          <option value="">请选择门店数量</option>
                          {storeCounts.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                      </div>
                      {errors.storeCount && (
                        <p className="text-[#C41E3A] text-xs font-body mt-1">{errors.storeCount}</p>
                      )}
                    </motion.div>

                    {/* Version - Radio */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.4, ease: easing }}
                    >
                      <label className="block font-body text-sm font-medium text-[#1A1A2E] mb-2">
                        感兴趣版本 <span className="text-[#C41E3A]">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                        {versions.map((v) => (
                          <label
                            key={v}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                              form.version === v
                                ? 'border-[#FF6B35] bg-[#FF6B35]/5'
                                : 'border-black/10 hover:border-[#FF6B35]/50'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                form.version === v
                                  ? 'border-[#FF6B35]'
                                  : 'border-[#D1D5DB]'
                              }`}
                            >
                              {form.version === v && (
                                <motion.div
                                  className="w-2 h-2 rounded-full bg-[#FF6B35]"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.2, ease: easeBounce }}
                                />
                              )}
                            </div>
                            <input
                              type="radio"
                              name="version"
                              value={v}
                              checked={form.version === v}
                              onChange={() => updateField('version', v)}
                              className="sr-only"
                            />
                            <span className="font-body text-sm text-[#1A1A2E]">{v}</span>
                          </label>
                        ))}
                      </div>
                      {errors.version && (
                        <p className="text-[#C41E3A] text-xs font-body mt-1">{errors.version}</p>
                      )}
                    </motion.div>

                    {/* Description */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.46, ease: easing }}
                    >
                      <label className="block font-body text-sm font-medium text-[#1A1A2E] mb-1.5">
                        需求描述（选填）
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        placeholder="请简述您的需求，如：需要外卖功能、多门店管理、对接收银机等"
                        rows={4}
                        className="w-full px-4 py-3.5 rounded-xl border border-black/10 font-body text-sm outline-none transition-all duration-200 focus:border-[#FF6B35] focus:shadow-[0_0_0_3px_rgba(255,107,53,0.1)] resize-none"
                      />
                    </motion.div>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      className="w-full gradient-hero text-white font-body text-base font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.01]"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Send className="w-4 h-4" />
                      提交咨询
                    </motion.button>

                    <p className="text-center text-[#9CA3AF] text-xs font-body">
                      提交即表示您同意我们的隐私政策，我们将保护您的信息安全
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column — Contact Info */}
          <motion.div
            className="flex-[2]"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.2, ease: easing }}
          >
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              {/* Phone */}
              <div className="flex gap-4 pb-6 border-b border-black/[0.06]">
                <div className="w-12 h-12 rounded-full bg-[#FF6B35]/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-[#FF6B35]" />
                </div>
                <div>
                  <button
                    onClick={copyPhone}
                    className="font-display text-xl font-bold text-[#1A1A2E] flex items-center gap-2 hover:text-[#FF6B35] transition-colors"
                  >
                    400-888-6688
                    {phoneCopied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4 text-[#9CA3AF]" />}
                  </button>
                  <p className="text-[#9CA3AF] font-body text-sm mt-0.5">工作日 9:00-21:00</p>
                </div>
              </div>

              {/* WeChat */}
              <div className="flex gap-4 py-6 border-b border-black/[0.06]">
                <div className="w-12 h-12 rounded-full bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-[#10B981]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-display text-base font-semibold text-[#1A1A2E]">
                    扫码添加顾问微信
                  </h4>
                  <div
                    className="mt-3 w-40 h-40 rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => setShowQREnlarged(true)}
                  >
                    <img src="/qr-demo.png" alt="微信二维码" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[#10B981] text-xs font-body font-medium mt-2">回复最快，推荐首选</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 py-6 border-b border-black/[0.06]">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div>
                  <a
                    href="mailto:support@changdiancan.com"
                    className="font-body text-base text-[#1A1A2E] hover:text-[#FF6B35] transition-colors"
                  >
                    support@changdiancan.com
                  </a>
                  <p className="text-[#9CA3AF] font-body text-sm mt-0.5">24小时内回复</p>
                </div>
              </div>

              {/* Response Time */}
              <div className="flex gap-4 pt-6">
                <div className="w-12 h-12 rounded-full bg-[#F59E0B]/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <h4 className="font-display text-base font-semibold text-[#1A1A2E]">
                    平均响应时间：30分钟
                  </h4>
                  <p className="text-[#6B7280] font-body text-sm mt-0.5">专业顾问一对一服务</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* QR Enlarged Modal */}
      <AnimatePresence>
        {showQREnlarged && (
          <motion.div
            className="fixed inset-0 z-[100] bg-[#1A1A2E]/80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQREnlarged(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: easing }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQREnlarged(false)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-[#1A1A2E] text-white rounded-full flex items-center justify-center hover:bg-[#2D2D44] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <img src="/qr-demo.png" alt="微信二维码" className="w-56 h-56 rounded-xl" />
              <p className="text-center font-body text-sm text-[#6B7280] mt-4">
                微信扫码添加顾问
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Why Choose Us                                                      */
/* ------------------------------------------------------------------ */

const reasons = [
  { icon: Rocket, color: '#FF6B35', title: '3-7天快速上线', description: '标准化流程，资料齐全后最快3天即可上线使用，不耽误营业' },
  { icon: Code2, color: '#C41E3A', title: '标准版起源码交付', description: '源码完全属于您，可自主维护或委托第三方，不被任何服务商绑定' },
  { icon: Smartphone, color: '#10B981', title: '用户+商家+店员+骑手', description: '一套系统四端互通，数据实时同步，告别信息孤岛' },
  { icon: Gift, color: '#F59E0B', title: '会员营销全配齐', description: '优惠券、秒杀、拼团、积分、储值，帮您提升客单价和复购率' },
  { icon: BarChart3, color: '#3B82F6', title: '经营数据可视化', description: '营业额、订单量、菜品排行、会员画像，让决策有数据支撑' },
  { icon: ShieldCheck, color: '#FF6B35', title: '1年售后 + 可续费维护', description: '首年免费售后，系统问题及时响应，也可按年续费长期维护' },
]

const WhyChooseUs: FC = () => {
  return (
    <section className="bg-[#FFEDE4] py-16 sm:py-20 lg:py-24">
      <div className="container-main">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">
            选择畅点餐的 6 大理由
          </h2>
          <p className="text-[#6B7280] font-body text-lg">
            我们用专业和服务赢得信赖
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r, i) => {
            const Icon = r.icon
            return (
              <motion.div
                key={r.title}
                className="bg-white rounded-2xl p-6 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: easing }}
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 + 0.2, ease: easeBounce }}
                >
                  <Icon className="w-10 h-10 mb-4" style={{ color: r.color }} />
                </motion.div>
                <h3 className="font-display text-lg font-semibold text-[#1A1A2E] mb-2">
                  {r.title}
                </h3>
                <p className="text-[#6B7280] font-body text-sm leading-relaxed">
                  {r.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Service Process Timeline                                           */
/* ------------------------------------------------------------------ */

const steps = [
  { number: '01', title: '需求咨询', description: '提交表单或电话咨询，顾问了解您的门店规模和需求', icon: MessageCircle },
  { number: '02', title: '方案定制', description: '根据需求推荐版本和功能配置，提供详细报价单', icon: FileText },
  { number: '03', title: '签订合同', description: '确认方案和报价后签订合同，支付首款', icon: PenTool },
  { number: '04', title: '系统配置', description: '技术团队配置系统，导入菜品数据，设置支付方式', icon: Settings },
  { number: '05', title: '测试上线', description: '内部测试通过后提交微信审核，审核通过即正式上线', icon: CheckCircle },
  { number: '06', title: '售后维护', description: '上线后持续提供技术支持，问题及时响应处理', icon: Wrench },
]

const ServiceProcess: FC = () => {
  return (
    <section className="bg-[#FFF9F5] py-16 sm:py-20 lg:py-24 overflow-hidden">
      <div className="container-main">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">
            服务流程
          </h2>
          <p className="text-[#6B7280] font-body text-lg">
            从咨询到上线，全程专人对接
          </p>
        </motion.div>

        {/* Desktop: Horizontal Timeline */}
        <div className="hidden lg:block">
          <div className="flex items-start justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-8 left-[8%] right-[8%] h-0.5 bg-[#FF6B35]/20" />
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  className="relative flex flex-col items-center text-center"
                  style={{ width: `${100 / steps.length}%` }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.12, ease: easing }}
                >
                  {/* Number */}
                  <span className="font-mono text-3xl font-bold text-[#FF6B35] mb-3">
                    {step.number}
                  </span>
                  {/* Icon circle */}
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-[#FF6B35]/20 flex items-center justify-center mb-4 shadow-sm z-10">
                    <Icon className="w-7 h-7 text-[#FF6B35]" />
                  </div>
                  <h4 className="font-display text-base font-semibold text-[#1A1A2E] mb-1.5">
                    {step.title}
                  </h4>
                  <p className="text-[#6B7280] font-body text-sm leading-relaxed max-w-[180px]">
                    {step.description}
                  </p>
                  {/* Arrow connector (except last) */}
                  {i < steps.length - 1 && (
                    <div className="absolute top-[88px] right-0 translate-x-1/2 z-0">
                      <ArrowRight className="w-4 h-4 text-[#FF6B35]/30" />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Mobile/Tablet: Vertical Timeline */}
        <div className="lg:hidden">
          <div className="relative space-y-8">
            {/* Vertical line */}
            <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-[#FF6B35]/20" />
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  className="flex items-start gap-4 relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: easing }}
                >
                  {/* Icon circle on line */}
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-[#FF6B35]/20 flex items-center justify-center shadow-sm z-10 flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#FF6B35]" />
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-lg font-bold text-[#FF6B35]">
                        {step.number}
                      </span>
                      <h4 className="font-display text-base font-semibold text-[#1A1A2E]">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-[#6B7280] font-body text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Trust Indicators                                                   */
/* ------------------------------------------------------------------ */

const trustStats = [
  { value: '2000+', label: '合作商家', suffix: '+' },
  { value: '50+', label: '覆盖城市', suffix: '+' },
  { value: '99.8%', label: '系统稳定性', suffix: '%' },
]

const partnerLogos = [
  '/case-logo-1.svg',
  '/case-logo-2.svg',
  '/case-logo-3.svg',
]

function AnimatedCounter({ target, suffix }: { target: string; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  // Extract numeric part
  const numericMatch = target.match(/[\d.]+/)
  const numericValue = numericMatch ? parseFloat(numericMatch[0]) : 0

  useEffect(() => {
    if (!ref.current || hasAnimated) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasAnimated])

  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => {
    if (target.includes('.')) {
      return latest.toFixed(1)
    }
    return Math.round(latest).toString()
  })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!hasAnimated) return
    const unsubscribe = rounded.on('change', (v) => setDisplay(v))
    // Animate count
    let start = 0
    const duration = 2000
    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      start = eased * numericValue
      count.set(start)
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)

    return () => unsubscribe()
  }, [hasAnimated, numericValue, count, rounded, target])

  return (
    <span ref={ref} className="font-mono">
      {display}{suffix}
    </span>
  )
}

const TrustIndicators: FC = () => {
  return (
    <section className="bg-[#1A1A2E] py-16 sm:py-20 lg:py-24">
      <div className="container-main">
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-white text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: easing }}
        >
          我们值得信赖
        </motion.h2>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          {trustStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: easing }}
            >
              <div className="font-mono text-4xl sm:text-5xl font-bold text-white mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-white/70 font-body text-base">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Partner Logos */}
        <motion.div
          className="flex items-center justify-center gap-8 sm:gap-12 mb-10 overflow-x-auto pb-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: easing }}
        >
          {partnerLogos.map((logo, i) => (
            <motion.div
              key={logo}
              className="flex-shrink-0 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 0.5, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 + 0.4, ease: easing }}
              whileHover={{ opacity: 1, scale: 1.05 }}
            >
              <img src={logo} alt="合作品牌" className="h-10 sm:h-12 w-auto" />
            </motion.div>
          ))}
        </motion.div>

        {/* Certifications */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5, ease: easing }}
        >
          <span className="px-4 py-2 rounded-full border border-white/30 text-white/80 font-body text-sm">
            微信支付服务商
          </span>
          <span className="px-4 py-2 rounded-full border border-white/30 text-white/80 font-body text-sm">
            微信小程序认证
          </span>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Final CTA                                                          */
/* ------------------------------------------------------------------ */

const FinalCTA: FC = () => {
  return (
    <section className="gradient-hero py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      {/* Pulse ring */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#FF6B35]/20 pointer-events-none"
        animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container-main text-center relative z-10">
        <motion.h2
          className="font-display text-4xl sm:text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: easing }}
        >
          现在就行动
        </motion.h2>
        <motion.p
          className="text-white/85 font-body text-lg sm:text-xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: easing }}
        >
          每延迟一天，就可能错过更多订单
        </motion.p>

        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: easing }}
        >
          <motion.a
            href="/#/contact"
            className="inline-flex items-center gap-2 bg-white text-[#FF6B35] font-body text-lg font-semibold px-10 py-4 rounded-full transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            立即免费咨询
            <ArrowRight className="w-5 h-5" />
          </motion.a>
          <p className="text-white font-display text-xl sm:text-2xl font-bold mt-2">
            或拨打 400-888-6688
          </p>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Contact Page                                                  */
/* ------------------------------------------------------------------ */

export default function Contact() {
  return (
    <div className="min-h-[100dvh]">
      {/* Section 1: Page Header */}
      <section className="gradient-hero pt-32 pb-20 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28">
        <div className="container-main text-center">
          <motion.span
            className="inline-block font-body text-lg sm:text-xl font-semibold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easing }}
          >
            畅点餐团队 · 随时为您服务
          </motion.span>

          <motion.h1
            className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: easing }}
          >
            开始您的数字化升级
          </motion.h1>

          <motion.p
            className="text-white/85 font-body text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easing }}
          >
            填写下方表单，我们的顾问将在 30 分钟内与您联系<br className="hidden sm:block" />
            为您推荐最适合的解决方案
          </motion.p>
        </div>
      </section>

      {/* Section 2: Contact Form + Info */}
      <ContactFormSection />

      {/* Section 3: Why Choose Us */}
      <WhyChooseUs />

      {/* Section 4: Service Process */}
      <ServiceProcess />

      {/* Section 5: Trust Indicators */}
      <TrustIndicators />

      {/* Section 6: Final CTA */}
      <FinalCTA />
    </div>
  )
}
