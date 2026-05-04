import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Smartphone,
  LayoutDashboard,
  Tablet,
  Bike,
  Check,
  X,
  ArrowRight,
  ChevronRight,
  Zap,
  Clock,
  CreditCard,
  Bell,
  BarChart3,
  MapPin,
  Star,
  Gift,
  Timer,
  Package,
  Receipt,
  TrendingUp,
  Navigation,
  RotateCcw,
  Ban,
  FileSpreadsheet,
  Search,
  QrCode,
  Power,
  Volume2,
  AlertTriangle,
  Image,
  Type,
  Grid3X3,
  ListFilter,
  ShoppingBag,
  Crown,
  Truck,
  Wallet,
  Percent,
  Users,
  Settings,
  Award,
  StickyNote,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Animation constants                                                */
/* ------------------------------------------------------------------ */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]
const easeOutQuart = [0.25, 1, 0.5, 1] as [number, number, number, number]
const easeBounce = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Feature {
  icon: React.ElementType
  title: string
  desc: string
}

interface ModuleData {
  title: string
  features: Feature[]
}

interface TabData {
  id: string
  icon: React.ElementType
  label: string
  accent: string
  modules: ModuleData[]
}

/* ------------------------------------------------------------------ */
/*  Tab data                                                           */
/* ------------------------------------------------------------------ */
const tabs: TabData[] = [
  {
    id: 'user',
    icon: Smartphone,
    label: '用户端小程序',
    accent: '#FF6B35',
    modules: [
      {
        title: '首页模块',
        features: [
          { icon: Image, title: '门店招牌展示', desc: '顶部大图展示门店招牌与品牌信息' },
          { icon: Clock, title: '营业信息', desc: '营业时间、门店地址、联系电话一键展示' },
          { icon: RotateCcw, title: '轮播海报', desc: '支持多张活动海报轮播，自动播放' },
          { icon: Bell, title: '活动弹窗', desc: '首页加载弹出优惠提醒，支持自定义内容' },
          { icon: Star, title: '新品/热门推荐', desc: '算法推荐热门菜品与新品上架' },
          { icon: Navigation, title: '一键导航/拨号', desc: '地图导航到店，直接拨打电话' },
        ],
      },
      {
        title: '扫码点餐',
        features: [
          { icon: QrCode, title: '桌台二维码绑定', desc: '扫码自动识别桌号，无需手动输入' },
          { icon: Grid3X3, title: '分类菜品展示', desc: '热菜/凉菜/饮品/主食/套餐分类浏览' },
          { icon: Image, title: '菜品大图展示', desc: '高清菜品图片，放大查看细节' },
          { icon: ListFilter, title: '规格选择', desc: '大份/小份、加料/不加料等规格配置' },
          { icon: Type, title: '口味备注', desc: '辣度、甜度、忌口等口味选项' },
          { icon: ShoppingBag, title: '购物车管理', desc: '增减数量、已选菜品汇总、实时价格计算' },
          { icon: Zap, title: '临时加菜', desc: '订单过程中随时追加菜品' },
        ],
      },
      {
        title: '下单结算',
        features: [
          { icon: CreditCard, title: '微信支付', desc: '原生微信支付，安全快捷' },
          { icon: Wallet, title: '余额支付', desc: '会员储值余额直接抵扣' },
          { icon: Percent, title: '优惠券抵扣', desc: '自动匹配可用优惠券，手动选择' },
          { icon: StickyNote, title: '订单备注', desc: '特殊要求备注，直达后厨' },
          { icon: Ban, title: '撤单申请', desc: '提交后前可一键撤单' },
          { icon: Clock, title: '后厨状态同步', desc: '实时显示接单/制作中/已完成状态' },
        ],
      },
      {
        title: '订单中心',
        features: [
          { icon: ListFilter, title: '订单分类筛选', desc: '全部/待上菜/已完成/已取消' },
          { icon: Receipt, title: '订单详情查看', desc: '菜品清单、价格明细、支付记录' },
          { icon: RotateCcw, title: '退款申请', desc: '在线提交退款，商家审核' },
          { icon: ShoppingBag, title: '再来一单', desc: '历史订单一键复购' },
        ],
      },
      {
        title: '会员体系',
        features: [
          { icon: Users, title: '手机号登录', desc: '微信授权+手机号一键注册' },
          { icon: Crown, title: '会员等级', desc: '消费累计升级，享受等级权益' },
          { icon: Star, title: '积分系统', desc: '消费返积分，积分可抵现' },
          { icon: CreditCard, title: '储值卡', desc: '充值余额，消费快捷支付' },
          { icon: Wallet, title: '余额查询', desc: '实时查看账户余额与积分' },
          { icon: Gift, title: '充值赠送', desc: '充值满额自动赠送余额' },
        ],
      },
      {
        title: '营销活动',
        features: [
          { icon: Percent, title: '满减券', desc: '满XX元减XX元，刺激客单价' },
          { icon: Gift, title: '新人券', desc: '首次注册自动发放，拉新利器' },
          { icon: Percent, title: '折扣券', desc: '全场折扣或指定菜品折扣' },
          { icon: Users, title: '拼团活动', desc: '邀请好友拼团，享受更低价格' },
          { icon: Timer, title: '秒杀/限时特价', desc: '倒计时秒杀，制造紧迫感' },
          { icon: Percent, title: '第二份半价', desc: '饮品/甜品经典促销' },
        ],
      },
    ],
  },
  {
    id: 'admin',
    icon: LayoutDashboard,
    label: '商家管理后台',
    accent: '#C41E3A',
    modules: [
      {
        title: '门店管理',
        features: [
          { icon: MapPin, title: '单/多门店管理', desc: '新增、编辑、开关门店状态' },
          { icon: Grid3X3, title: '桌台管理', desc: '新增桌号、设置人数、锁定/空闲状态' },
          { icon: QrCode, title: '桌码生成', desc: '自动生成二维码，支持批量导出打印' },
          { icon: Power, title: '门店状态', desc: '一键暂停营业/恢复营业' },
          { icon: Settings, title: '门店信息配置', desc: '招牌、电话、地址、营业时间' },
        ],
      },
      {
        title: '菜品管理',
        features: [
          { icon: ListFilter, title: '分类管理', desc: '新增/编辑/删除/排序菜品分类' },
          { icon: Power, title: '菜品上下架', desc: '一键上架/下架，批量操作' },
          { icon: Type, title: '菜品信息', desc: '名称、图片、价格、描述、标签' },
          { icon: Settings, title: '规格配置', desc: '多规格多价格，如大/中/小份' },
          { icon: Package, title: '库存管控', desc: '设置每日库存，售罄自动下架' },
          { icon: Gift, title: '套餐组合', desc: '组合多个菜品，设置套餐优惠价' },
        ],
      },
      {
        title: '订单管理',
        features: [
          { icon: Bell, title: '实时订单列表', desc: '新订单实时推送，声音提醒' },
          { icon: Clock, title: '订单状态管理', desc: '待接单/制作中/已完成/已退款' },
          { icon: Check, title: '后台接单', desc: '手动确认接单，自动通知后厨' },
          { icon: CreditCard, title: '订单改价', desc: '特殊情况下手动调整订单金额' },
          { icon: Ban, title: '作废订单', desc: '异常订单后台作废处理' },
          { icon: FileSpreadsheet, title: '订单导出', desc: '按日期/状态筛选导出Excel' },
          { icon: Search, title: '历史查询', desc: '任意时间段订单检索' },
        ],
      },
      {
        title: '会员与营销',
        features: [
          { icon: Users, title: '会员列表', desc: '查看所有会员信息与消费记录' },
          { icon: Wallet, title: '余额/积分管理', desc: '手动调整会员余额与积分' },
          { icon: Percent, title: '优惠券创建', desc: '创建满减/折扣/新人券，设置规则' },
          { icon: Gift, title: '活动配置', desc: '秒杀、拼团、限时特价活动创建' },
          { icon: CreditCard, title: '充值赠送设置', desc: '配置充值档位与赠送金额' },
          { icon: Star, title: '消费返积分规则', desc: '设置积分获取比例' },
        ],
      },
      {
        title: '数据统计',
        features: [
          { icon: BarChart3, title: '营业额统计', desc: '日/周/月/年营业额汇总' },
          { icon: TrendingUp, title: '订单量分析', desc: '订单量趋势图，高峰时段分析' },
          { icon: Award, title: '菜品销量排行', desc: 'TOP热销菜品，滞销菜品提醒' },
          { icon: Users, title: '会员消费分析', desc: '会员活跃度、消费频次、客单价' },
          { icon: FileSpreadsheet, title: '数据导出', desc: '所有报表支持Excel导出' },
        ],
      },
      {
        title: '系统设置',
        features: [
          { icon: Settings, title: '小程序配置', desc: '名称、Logo、主题色、分享设置' },
          { icon: CreditCard, title: '支付接口', desc: '微信支付商户号配置' },
          { icon: Clock, title: '营业时间', desc: '设置每日营业时间段' },
          { icon: Power, title: '营业状态', desc: '全局一键暂停/恢复' },
          { icon: Image, title: '公告/海报', desc: '轮播图上传、公告文案编辑' },
        ],
      },
    ],
  },
  {
    id: 'staff',
    icon: Tablet,
    label: '店员后厨端',
    accent: '#3B82F6',
    modules: [
      {
        title: '订单接收',
        features: [
          { icon: Volume2, title: '实时新订单推送', desc: '语音+震动提醒，锁屏通知' },
          { icon: Receipt, title: '订单详情查看', desc: '桌号、菜品、规格、备注一目了然' },
          { icon: Check, title: '接单确认', desc: '一键确认接单，同步用户端状态' },
          { icon: Ban, title: '拒单处理', desc: '缺货等特殊情况可拒单并填写原因' },
        ],
      },
      {
        title: '菜品制作',
        features: [
          { icon: Grid3X3, title: '按分类展示订单', desc: '热菜/凉菜/饮品分栏显示' },
          { icon: Clock, title: '制作状态标记', desc: '未制作/制作中/已完成' },
          { icon: Check, title: '菜品完成确认', desc: '单个菜品标记完成或整单完成' },
          { icon: AlertTriangle, title: '催单提醒', desc: '用户催单实时显示，优先处理' },
        ],
      },
      {
        title: '桌台管理',
        features: [
          { icon: MapPin, title: '桌台订单绑定', desc: '按桌号查看当前订单' },
          { icon: Check, title: '上菜完成确认', desc: '服务员确认已上菜，更新状态' },
          { icon: RotateCcw, title: '桌台清空', desc: '结账后一键清空桌台，恢复空闲' },
        ],
      },
      {
        title: '防漏单机制',
        features: [
          { icon: Timer, title: '订单超时提醒', desc: '长时间未处理订单红色高亮' },
          { icon: ListFilter, title: '已接/未接筛选', desc: '快速查看待处理订单' },
          { icon: BarChart3, title: '完成率统计', desc: '当班完成订单数与平均耗时' },
        ],
      },
    ],
  },
  {
    id: 'rider',
    icon: Bike,
    label: '骑手配送端',
    accent: '#F59E0B',
    modules: [
      {
        title: '订单配送',
        features: [
          { icon: ListFilter, title: '待接订单列表', desc: '附近可接外卖订单，显示距离与金额' },
          { icon: Check, title: '一键接单', desc: '确认接单，同步商家与用户端' },
          { icon: Navigation, title: '配送路线', desc: '内置地图导航，最优路线规划' },
          { icon: MapPin, title: '送达确认', desc: '送达后拍照/签名确认' },
        ],
      },
      {
        title: '订单管理',
        features: [
          { icon: Truck, title: '配送中订单', desc: '当前配送订单详情与导航' },
          { icon: FileSpreadsheet, title: '历史配送记录', desc: '已完成订单列表与收入统计' },
          { icon: AlertTriangle, title: '异常上报', desc: '拒收、地址错误等情况上报' },
        ],
      },
      {
        title: '个人中心',
        features: [
          { icon: Wallet, title: '今日收入', desc: '实时统计当日配送收入' },
          { icon: BarChart3, title: '工作统计', desc: '接单数、完成率、平均配送时长' },
          { icon: Settings, title: '账户设置', desc: '资料修改、休息状态切换' },
        ],
      },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Comparison matrix data                                             */
/* ------------------------------------------------------------------ */
const comparisonRows: { feature: string; basic: boolean | string; standard: boolean | string; advanced: boolean | string }[] = [
  { feature: '微信小程序用户端', basic: true, standard: true, advanced: true },
  { feature: '扫码点餐 · 桌台管理', basic: true, standard: true, advanced: true },
  { feature: '微信支付 · 在线结算', basic: true, standard: true, advanced: true },
  { feature: '菜品管理 · 分类上下架', basic: true, standard: true, advanced: true },
  { feature: '订单管理 · 实时处理', basic: true, standard: true, advanced: true },
  { feature: '管理后台（电脑端）', basic: true, standard: true, advanced: true },
  { feature: '会员注册 · 手机号登录', basic: false, standard: true, advanced: true },
  { feature: '会员等级 · 积分体系', basic: false, standard: true, advanced: true },
  { feature: '储值卡 · 余额充值', basic: false, standard: true, advanced: true },
  { feature: '优惠券 · 满减/折扣', basic: false, standard: true, advanced: true },
  { feature: '秒杀 · 拼团 · 限时特价', basic: false, standard: true, advanced: true },
  { feature: '外卖配送 · 运费规则', basic: false, standard: true, advanced: true },
  { feature: '商家端 APP', basic: false, standard: true, advanced: true },
  { feature: '骑手端 APP', basic: false, standard: '可选', advanced: true },
  { feature: '数据统计报表', basic: '基础', standard: '完整', advanced: '高级可视化' },
  { feature: '多门店管理', basic: false, standard: '1-3家', advanced: '无限制' },
  { feature: '加盟分权体系', basic: false, standard: false, advanced: true },
  { feature: '收银机硬件对接', basic: false, standard: false, advanced: true },
  { feature: '美团/饿了么对接', basic: false, standard: false, advanced: true },
  { feature: '大数据可视化大屏', basic: false, standard: false, advanced: true },
  { feature: '源码交付', basic: false, standard: true, advanced: true },
  { feature: '二次开发权限', basic: false, standard: false, advanced: true },
  { feature: '专属运维支持', basic: '基础', standard: '基础', advanced: '专属' },
]

/* ------------------------------------------------------------------ */
/*  Feature Module component                                           */
/* ------------------------------------------------------------------ */
function FeatureModule({
  data,
  accent,
  index,
}: {
  data: ModuleData
  accent: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: easeOutExpo }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: accent }} />
        <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#1A1A2E]">{data.title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.06, ease: easeOutExpo }}
            whileHover={{ x: 4 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-white border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-shadow duration-300"
          >
            <div
              className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${accent}15` }}
            >
              <f.icon className="w-5 h-5" style={{ color: accent }} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-body text-sm font-semibold text-[#1A1A2E] mb-0.5">{f.title}</h4>
              <p className="font-body text-xs text-[#6B7280] leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Phone mockup component                                             */
/* ------------------------------------------------------------------ */
function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[280px] lg:w-[300px]">
      <div className="relative bg-[#1A1A2E] rounded-[36px] p-2 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#1A1A2E] rounded-b-xl z-10" />
        <div className="relative bg-white rounded-[28px] overflow-hidden aspect-[9/19]">
          {children}
        </div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Laptop mockup component                                            */
/* ------------------------------------------------------------------ */
function LaptopMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      <div className="relative bg-[#1A1A2E] rounded-t-xl p-2 pb-0 shadow-xl">
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#333] rounded-full" />
        <div className="bg-white rounded-t-lg overflow-hidden aspect-[16/10]">
          {children}
        </div>
      </div>
      <div className="relative bg-[#E5E5E5] rounded-b-lg h-3 shadow-lg">
        <div className="absolute left-1/2 -translate-x-1/2 -top-0.5 w-20 h-1 bg-[#D4D4D4] rounded-b-sm" />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tablet mockup component                                            */
/* ------------------------------------------------------------------ */
function TabletMockup({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[320px] lg:w-[360px]">
      <div className="relative bg-[#1A1A2E] rounded-[24px] p-3 shadow-2xl">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#333] rounded-full z-10" />
        <div className="bg-white rounded-[18px] overflow-hidden aspect-[3/4]">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab content with mockups                                           */
/* ------------------------------------------------------------------ */
function UserTabContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-12">
      <div>
        {tabs[0].modules.map((m, i) => (
          <FeatureModule key={m.title} data={m} accent={tabs[0].accent} index={i} />
        ))}
      </div>
      <div className="order-first lg:order-last">
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.4, ease: easeOutExpo }}
          className="lg:sticky lg:top-28 flex flex-col items-center gap-6"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PhoneMockup>
              <img src="/demo-menu.jpg" alt="用户端菜单页" className="w-full h-full object-cover" />
            </PhoneMockup>
          </motion.div>
          <div className="flex gap-3">
            <div className="w-20 h-28 rounded-xl overflow-hidden shadow-lg border border-black/[0.04]">
              <img src="/demo-dish.jpg" alt="菜品详情" className="w-full h-full object-cover" />
            </div>
            <div className="w-20 h-28 rounded-xl overflow-hidden shadow-lg border border-black/[0.04]">
              <img src="/demo-cart.jpg" alt="购物车" className="w-full h-full object-cover" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function AdminTabContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-10 lg:gap-12">
      <div>
        {tabs[1].modules.map((m, i) => (
          <FeatureModule key={m.title} data={m} accent={tabs[1].accent} index={i} />
        ))}
      </div>
      <div className="order-first lg:order-last">
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.4, ease: easeOutExpo }}
          className="lg:sticky lg:top-28 flex flex-col items-center gap-6"
        >
          <LaptopMockup>
            <img src="/demo-admin-orders.jpg" alt="商家后台订单管理" className="w-full h-full object-cover" />
          </LaptopMockup>
          <div className="w-48 h-28 rounded-xl overflow-hidden shadow-lg border border-black/[0.04]">
            <img src="/demo-admin-data.jpg" alt="数据报表" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function StaffTabContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-12">
      <div>
        {tabs[2].modules.map((m, i) => (
          <FeatureModule key={m.title} data={m} accent={tabs[2].accent} index={i} />
        ))}
      </div>
      <div className="order-first lg:order-last">
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.4, ease: easeOutExpo }}
          className="lg:sticky lg:top-28 flex flex-col items-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <TabletMockup>
              <img src="/feature-staff.jpg" alt="店员后厨端" className="w-full h-full object-cover" />
            </TabletMockup>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

function RiderTabContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-12">
      <div>
        {tabs[3].modules.map((m, i) => (
          <FeatureModule key={m.title} data={m} accent={tabs[3].accent} index={i} />
        ))}
      </div>
      <div className="order-first lg:order-last">
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.4, ease: easeOutExpo }}
          className="lg:sticky lg:top-28 flex flex-col items-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <PhoneMockup>
              <img src="/feature-rider.jpg" alt="骑手配送端" className="w-full h-full object-cover" />
            </PhoneMockup>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Comparison cell renderer                                           */
/* ------------------------------------------------------------------ */
function ComparisonCell({
  value,
}: {
  value: boolean | string
}) {
  if (typeof value === 'boolean') {
    return value ? (
      <div className="flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: easeBounce }}
          className="w-7 h-7 rounded-full bg-[#10B981]/10 flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-[#10B981]" />
        </motion.div>
      </div>
    ) : (
      <div className="flex items-center justify-center">
        <X className="w-4 h-4 text-[#9CA3AF]" />
      </div>
    )
  }
  return (
    <span className="text-sm font-medium text-center block text-[#1A1A2E]">
      {value}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Features page                                                 */
/* ------------------------------------------------------------------ */
export default function Features() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="bg-[#FFF9F5]">
      {/* ========== Section 1: Page Header ========== */}
      <section className="gradient-hero pt-32 pb-20 sm:pt-36 sm:pb-24">
        <div className="container-main text-center">
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="font-body text-xl font-medium text-white/90 mb-4"
          >
            完整功能清单
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
            className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white mb-6 tracking-tight"
          >
            四端系统 · 全面覆盖
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
            className="font-body text-lg sm:text-xl text-white/85 max-w-[640px] mx-auto mb-10 leading-relaxed"
          >
            用户端、商家后台、店员端、骑手端，64+ 项核心功能
            <br className="hidden sm:block" />
            满足不同规模餐饮商家的数字化需求
          </motion.p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-3"
          >
            {tabs.map((tab, i) => (
              <motion.div
                key={tab.id}
                variants={fadeUp}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 text-white font-body text-sm font-medium backdrop-blur-sm"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== Section 2: Sticky Tab Navigation ========== */}
      <div className="sticky top-[72px] z-40 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-b border-black/[0.04]">
        <div className="container-main">
          <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-2 py-3">
            {tabs.map((tab, i) => {
              const isActive = activeTab === i
              const TabIcon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(i)}
                  className={`
                    flex-shrink-0 snap-start flex items-center gap-2 px-5 py-3 rounded-full
                    font-body text-sm font-medium transition-all duration-300 relative
                    ${
                      isActive
                        ? 'text-white shadow-md'
                        : 'bg-[#FFEDE4] text-[#6B7280] hover:text-[#1A1A2E]'
                    }
                  `}
                  style={isActive ? { backgroundColor: tab.accent } : undefined}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========== Section 3-6: Tab Content ========== */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: easeOutQuart }}
            >
              {activeTab === 0 && <UserTabContent />}
              {activeTab === 1 && <AdminTabContent />}
              {activeTab === 2 && <StaffTabContent />}
              {activeTab === 3 && <RiderTabContent />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ========== Section 7: Feature Comparison Matrix ========== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-[#FFEDE4]">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">
              三版本功能对比
            </h2>
            <p className="font-body text-lg text-[#6B7280]">
              根据您的经营规模，选择最适合的方案
            </p>
          </motion.div>

          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className="sticky top-0 text-left px-4 py-4 bg-[#FFEDE4] font-display text-sm font-semibold text-[#1A1A2E] border-b-2 border-[#FF6B35] z-10">
                    功能模块
                  </th>
                  <th className="sticky top-0 text-center px-4 py-4 bg-[#FFEDE4] font-display text-sm font-semibold text-[#1A1A2E] border-b-2 border-[#FF6B35] z-10">
                    基础版
                  </th>
                  <th className="sticky top-0 text-center px-4 py-4 bg-[#FFEDE4] font-display text-sm font-semibold text-[#1A1A2E] border-b-2 border-[#FF6B35] z-10">
                    标准版
                  </th>
                  <th className="sticky top-0 text-center px-4 py-4 bg-[#FFEDE4] font-display text-sm font-semibold text-[#1A1A2E] border-b-2 border-[#FF6B35] z-10">
                    高级定制版
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <motion.tr
                    key={row.feature}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: i * 0.04, ease: easeOutExpo }}
                    className="border-b border-black/[0.04] hover:bg-white/60 transition-colors duration-200"
                  >
                    <td className="px-4 py-3.5 font-body text-sm text-[#1A1A2E]">{row.feature}</td>
                    <td className="px-4 py-3.5">
                      <ComparisonCell value={row.basic} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ComparisonCell value={row.standard} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ComparisonCell value={row.advanced} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========== Section 8: CTA Banner ========== */}
      <section className="gradient-hero py-16 sm:py-20">
        <div className="container-main text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            className="font-display text-3xl sm:text-4xl font-bold text-white mb-4"
          >
            找到适合您的方案了吗？
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
            className="font-body text-lg text-white/85 mb-8"
          >
            联系我们的顾问，为您定制最佳方案
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-[#FF6B35] font-body text-base font-semibold px-8 py-3.5 rounded-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              立即咨询
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 bg-transparent text-white font-body text-base font-semibold px-8 py-3.5 rounded-full border-2 border-white/40 transition-all duration-200 hover:bg-white/10 hover:border-white/60"
            >
              返回定价对比
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
