import { useState, useCallback, useRef, useEffect } from 'react'
import type { FC } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  LayoutGrid,
  Download,
  ArrowRight,
  Plus,
  ShoppingCart,
  CheckCircle,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Category = '全部' | '用户端' | '商家后台' | '店员端' | '骑手端'
type DeviceType = 'iphone' | 'macbook' | 'ipad'

interface GalleryItem {
  id: number
  image: string
  title: string
  device: DeviceType
  category: Category
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const categories: Category[] = ['全部', '用户端', '商家后台', '店员端', '骑手端']

const galleryItems: GalleryItem[] = [
  { id: 1, image: '/demo-menu.jpg', title: '首页菜单', device: 'iphone', category: '用户端' },
  { id: 2, image: '/demo-dish.jpg', title: '菜品详情', device: 'iphone', category: '用户端' },
  { id: 3, image: '/demo-cart.jpg', title: '购物车', device: 'iphone', category: '用户端' },
  { id: 4, image: '/demo-order.jpg', title: '订单中心', device: 'iphone', category: '用户端' },
  { id: 5, image: '/demo-member.jpg', title: '会员中心', device: 'iphone', category: '用户端' },
  { id: 6, image: '/demo-admin-orders.jpg', title: '订单管理', device: 'macbook', category: '商家后台' },
  { id: 7, image: '/demo-admin-data.jpg', title: '数据报表', device: 'macbook', category: '商家后台' },
  { id: 8, image: '/feature-staff.jpg', title: '后厨接单', device: 'ipad', category: '店员端' },
  { id: 9, image: '/feature-rider.jpg', title: '骑手配送', device: 'iphone', category: '骑手端' },
  { id: 10, image: '/demo-menu.jpg', title: '分类浏览', device: 'iphone', category: '用户端' },
  { id: 11, image: '/demo-dish.jpg', title: '规格选择', device: 'iphone', category: '用户端' },
  { id: 12, image: '/demo-admin-orders.jpg', title: '订单详情', device: 'macbook', category: '商家后台' },
]

const easing: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ------------------------------------------------------------------ */
/*  Device Frame Component                                             */
/* ------------------------------------------------------------------ */

const DeviceFrame: FC<{ device: DeviceType; children: React.ReactNode }> = ({ device, children }) => {
  if (device === 'iphone') {
    return (
      <div className="relative mx-auto" style={{ width: '100%', maxWidth: 280, aspectRatio: '375/812' }}>
        {/* Outer frame */}
        <div className="absolute inset-0 rounded-[36px] bg-[#1A1A2E] p-[8px] shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          {/* Inner screen */}
          <div className="w-full h-full rounded-[28px] bg-white overflow-hidden relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[#1A1A2E] rounded-b-[14px] z-10" />
            {children}
          </div>
        </div>
      </div>
    )
  }

  if (device === 'macbook') {
    return (
      <div className="relative mx-auto" style={{ width: '100%', maxWidth: 320, aspectRatio: '16/10.5' }}>
        {/* Screen bezel */}
        <div className="absolute inset-x-0 top-0 h-[92%] rounded-t-[12px] bg-[#1A1A2E] p-[6px] shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          <div className="w-full h-full rounded-t-[8px] bg-white overflow-hidden relative">
            {/* Camera dot */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full bg-[#333] z-10" />
            {children}
          </div>
        </div>
        {/* Stand suggestion */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[8%] bg-[#2D2D44] rounded-b-[4px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40%] h-[2%] bg-[#1A1A2E] rounded-[2px]" />
      </div>
    )
  }

  // iPad
  return (
    <div className="relative mx-auto" style={{ width: '100%', maxWidth: 300, aspectRatio: '4/3.2' }}>
      <div className="absolute inset-0 rounded-[20px] bg-[#1A1A2E] p-[10px] shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
        <div className="w-full h-full rounded-[12px] bg-white overflow-hidden relative">
          {/* Camera dot */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[5px] h-[5px] rounded-full bg-[#333] z-10" />
          {children}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Gallery Section                                                    */
/* ------------------------------------------------------------------ */

const GallerySection: FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('全部')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filteredItems = activeCategory === '全部'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeCategory)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? filteredItems.length - 1 : lightboxIndex - 1)
    }
  }
  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === filteredItems.length - 1 ? 0 : lightboxIndex + 1)
    }
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') prevImage()
    if (e.key === 'ArrowRight') nextImage()
  }, [lightboxIndex, filteredItems.length])

  useEffect(() => {
    if (lightboxIndex !== null) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, handleKeyDown])

  return (
    <section className="bg-[#FFF9F5] py-16 sm:py-20 lg:py-24">
      <div className="container-main">
        {/* Filter Tabs */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: easing }}
        >
          {categories.map((cat, i) => (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-body text-sm font-medium transition-all duration-200 border ${
                activeCategory === cat
                  ? 'bg-white text-[#FF6B35] border-white shadow-md'
                  : 'bg-transparent text-[#1A1A2E] border-[rgba(0,0,0,0.12)] hover:border-[#FF6B35] hover:text-[#FF6B35]'
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 + 0.3, ease: easing }}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: easing,
                }}
                className="group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="relative">
                  <DeviceFrame device={item.device}>
                    <div className="w-full h-full relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-[#1A1A2E]/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2">
                        <Eye className="w-8 h-8 text-white" />
                        <span className="text-white font-body text-sm font-medium">查看详情</span>
                      </div>
                    </div>
                  </DeviceFrame>

                  {/* Category Label */}
                  <div className="absolute bottom-4 left-4 z-10">
                    <span className="inline-block px-3 py-1 rounded-md bg-[#FF6B35] text-white text-xs font-medium font-body">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Title below frame */}
                <p className="text-center mt-4 font-body text-sm font-medium text-[#1A1A2E]">
                  {item.title}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredItems[lightboxIndex] && (
          <motion.div
            className="fixed inset-0 z-[100] bg-[#1A1A2E]/95 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Prev/Next buttons */}
            <button
              onClick={(e) => { e.stopPropagation(); prevImage() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10 p-2"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors z-10 p-2"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            <motion.div
              className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: easing }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredItems[lightboxIndex].image}
                alt={filteredItems[lightboxIndex].title}
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
              />
              <p className="text-white font-body text-lg font-medium mt-4">
                {filteredItems[lightboxIndex].title}
                <span className="ml-3 px-2 py-0.5 rounded bg-[#FF6B35] text-white text-xs">
                  {filteredItems[lightboxIndex].category}
                </span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Interactive Phone Demo                                              */
/* ------------------------------------------------------------------ */

const demoCategories = ['热菜', '凉菜', '饮品', '主食']

const demoDishes: Record<string, { id: number; name: string; price: number; img: string }[]> = {
  '热菜': [
    { id: 1, name: '宫保鸡丁', price: 38, img: '/demo-dish.jpg' },
    { id: 2, name: '麻婆豆腐', price: 22, img: '/demo-dish.jpg' },
    { id: 3, name: '水煮牛肉', price: 48, img: '/demo-dish.jpg' },
  ],
  '凉菜': [
    { id: 4, name: '凉拌黄瓜', price: 16, img: '/demo-dish.jpg' },
    { id: 5, name: '口水鸡', price: 32, img: '/demo-dish.jpg' },
  ],
  '饮品': [
    { id: 6, name: '酸梅汤', price: 12, img: '/demo-dish.jpg' },
    { id: 7, name: '鲜榨橙汁', price: 18, img: '/demo-dish.jpg' },
  ],
  '主食': [
    { id: 8, name: '扬州炒饭', price: 24, img: '/demo-dish.jpg' },
    { id: 9, name: '牛肉拉面', price: 28, img: '/demo-dish.jpg' },
  ],
}

const InteractivePhoneDemo: FC = () => {
  const [activeTab, setActiveTab] = useState('热菜')
  const [cartCount, setCartCount] = useState(2)
  const [cartTotal, setCartTotal] = useState(60)
  const [addedId, setAddedId] = useState<number | null>(null)

  const addToCart = (price: number, id: number) => {
    setCartCount((c) => c + 1)
    setCartTotal((t) => t + price)
    setAddedId(id)
    setTimeout(() => setAddedId(null), 300)
  }

  return (
    <section className="bg-[#1A1A2E] py-16 sm:py-20 lg:py-24 overflow-hidden">
      <div className="container-main">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Column - Text */}
          <motion.div
            className="flex-1 max-w-xl"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: easing }}
          >
            <span className="inline-block text-[#FF6B35] font-body text-sm font-semibold mb-3 tracking-wide">
              交互体验
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
              流畅的点餐体验
            </h2>
            <p className="text-white/70 font-body text-lg leading-relaxed mb-8">
              从扫码到下单，只需30秒<br />
              购物车实时计算，优惠券自动匹配，支付一气呵成
            </p>
            <ul className="space-y-4 mb-8">
              {['扫码即点，无需等待', '规格口味，一键选择', '支付成功，后厨秒接'].map((item, i) => (
                <motion.li
                  key={item}
                  className="flex items-center gap-3 text-white font-body"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 + 0.3, ease: easing }}
                >
                  <CheckCircle className="w-5 h-5 text-[#FF6B35] flex-shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white font-body text-sm font-semibold hover:bg-white/10 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              预约完整演示
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {/* Right Column - Interactive Phone */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3, ease: easing }}
          >
            <div
              className="relative mx-auto"
              style={{
                width: 320,
                transform: 'rotate(-3deg)',
                filter: 'drop-shadow(0 24px 60px rgba(0,0,0,0.4))',
              }}
            >
              {/* iPhone Frame */}
              <div className="rounded-[40px] bg-[#2D2D44] p-[10px] shadow-2xl">
                <div className="rounded-[32px] bg-white overflow-hidden relative" style={{ height: 640 }}>
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[130px] h-[30px] bg-[#2D2D44] rounded-b-[16px] z-20" />

                  {/* Phone Header */}
                  <div className="bg-[#FF6B35] pt-10 pb-3 px-4 z-10 relative">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <p className="font-body text-xs opacity-80">Table 08</p>
                        <p className="font-display text-base font-bold">畅味餐厅</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-white text-xs font-body">张</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Tabs */}
                  <div className="flex gap-2 px-4 py-3 bg-white border-b border-black/5 overflow-x-auto z-10 relative">
                    {demoCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-body font-medium whitespace-nowrap transition-all duration-200 ${
                          activeTab === cat
                            ? 'bg-[#FF6B35] text-white'
                            : 'bg-[#FFF9F5] text-[#6B7280] hover:text-[#FF6B35]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Dish List */}
                  <div className="px-4 py-3 space-y-3 overflow-y-auto" style={{ maxHeight: 380 }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        {demoDishes[activeTab]?.map((dish) => (
                          <div
                            key={dish.id}
                            className="flex items-center gap-3 p-2 rounded-xl bg-[#FFF9F5]"
                          >
                            <img
                              src={dish.img}
                              alt={dish.name}
                              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-body text-sm font-medium text-[#1A1A2E] truncate">
                                {dish.name}
                              </p>
                              <p className="font-mono text-sm font-bold text-[#FF6B35]">
                                ¥{dish.price}
                              </p>
                            </div>
                            <motion.button
                              onClick={() => addToCart(dish.price, dish.id)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                                addedId === dish.id
                                  ? 'bg-[#10B981] text-white'
                                  : 'bg-[#FF6B35] text-white'
                              }`}
                              whileTap={{ scale: 0.85 }}
                              animate={addedId === dish.id ? { scale: [1, 1.2, 1] } : {}}
                              transition={{ duration: 0.3 }}
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Floating Cart Bar */}
                  <motion.div
                    className="absolute bottom-4 left-4 right-4 bg-[#1A1A2E] rounded-2xl p-3 flex items-center justify-between z-20"
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ShoppingCart className="w-5 h-5 text-white" />
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#FF6B35] rounded-full text-white text-[10px] flex items-center justify-center font-mono">
                          {cartCount}
                        </span>
                      </div>
                      <span className="font-mono text-white text-sm font-bold">
                        ¥{cartTotal}
                      </span>
                    </div>
                    <button className="px-4 py-1.5 bg-[#FF6B35] text-white text-xs font-body font-semibold rounded-full">
                      去结算
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Design Spec Cards                                                  */
/* ------------------------------------------------------------------ */

const specCards = [
  {
    id: 1,
    type: 'colors' as const,
    title: '暖橙主色调',
    description: '以暖橙/餐饮红为主色，搭配舒适米白背景，提升食欲感',
  },
  {
    id: 2,
    type: 'layout' as const,
    title: '标准导航布局',
    description: '顶部导航栏 + 中间内容区 + 底部Tab栏，符合微信小程序用户习惯',
  },
  {
    id: 3,
    type: 'card' as const,
    title: '圆角卡片 + 大图',
    description: '统一圆角16px，菜品大图清晰展示，价格醒目突出',
  },
  {
    id: 4,
    type: 'font' as const,
    title: '清晰可读字体',
    description: 'Noto Sans SC 为主字体，标题使用 Noto Serif SC，价格使用等宽字体',
  },
]

const colorSwatches = [
  { color: '#FF6B35', name: 'Primary' },
  { color: '#C41E3A', name: 'Accent' },
  { color: '#10B981', name: 'Success' },
  { color: '#FFF9F5', name: 'Base' },
  { color: '#1A1A2E', name: 'Text' },
]

const DesignSpecs: FC = () => {
  return (
    <section className="bg-[#FFF9F5] py-16 sm:py-20 lg:py-24">
      <div className="container-main">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: easing }}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1A1A2E] mb-4">
            设计规范一览
          </h2>
          <p className="text-[#6B7280] font-body text-lg">
            标准化设计，兼容所有机型
          </p>
        </motion.div>

        {/* Spec Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specCards.map((card, i) => (
            <motion.div
              key={card.id}
              className="bg-white rounded-2xl p-6 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: easing }}
            >
              {/* Visual */}
              {card.type === 'colors' && (
                <div className="flex items-center gap-2 mb-5">
                  {colorSwatches.map((sw) => (
                    <div
                      key={sw.name}
                      className="w-8 h-8 rounded-full border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: sw.color }}
                      title={sw.name}
                    />
                  ))}
                </div>
              )}
              {card.type === 'layout' && (
                <div className="mb-5">
                  <LayoutGrid className="w-10 h-10 text-[#FF6B35]" />
                </div>
              )}
              {card.type === 'card' && (
                <div className="mb-5">
                  <div className="w-full h-16 bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-black/[0.04] flex items-center px-4 gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#FFF9F5] flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2.5 w-20 bg-[#1A1A2E]/10 rounded" />
                      <div className="h-2 w-12 bg-[#FF6B35]/30 rounded" />
                    </div>
                  </div>
                </div>
              )}
              {card.type === 'font' && (
                <div className="mb-5">
                  <p className="font-display text-lg font-bold text-[#1A1A2E]">
                    菜品名称
                  </p>
                  <p className="font-mono text-base font-bold text-[#FF6B35]">
                    ¥28
                  </p>
                </div>
              )}

              <h3 className="font-display text-lg font-semibold text-[#1A1A2E] mb-2">
                {card.title}
              </h3>
              <p className="text-[#6B7280] font-body text-sm leading-relaxed">
                {card.description}
              </p>
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

const CTABanner: FC = () => {
  return (
    <section className="gradient-hero py-16 sm:py-20 lg:py-24">
      <div className="container-main text-center">
        <motion.h2
          className="font-display text-3xl sm:text-4xl font-bold text-white mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: easing }}
        >
          看对眼了？马上开启您的数字化升级
        </motion.h2>
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: easing }}
        >
          <motion.a
            href="/#/contact"
            className="inline-flex items-center gap-2 bg-white text-[#FF6B35] font-body text-base font-semibold px-8 py-3.5 rounded-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            免费咨询
            <ArrowRight className="w-4 h-4" />
          </motion.a>
          <motion.button
            className="inline-flex items-center gap-2 bg-transparent text-white font-body text-base font-semibold px-8 py-3.5 rounded-full border-2 border-white/40 hover:bg-white/10 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-4 h-4" />
            下载功能清单PDF
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Demo Page                                                     */
/* ------------------------------------------------------------------ */

export default function Demo() {
  const headerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-[100dvh]">
      {/* Section 1: Page Header */}
      <section ref={headerRef} className="gradient-hero pt-32 pb-20 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28">
        <div className="container-main text-center">
          <motion.span
            className="inline-block font-body text-lg sm:text-xl font-semibold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easing }}
          >
            真实界面 · 所见即所得
          </motion.span>

          <motion.h1
            className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: easing }}
          >
            小程序 UI 演示
          </motion.h1>

          <motion.p
            className="text-white/85 font-body text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easing }}
          >
            用户端、商家后台、店员端、骑手端完整界面预览<br className="hidden sm:block" />
            扁平化设计，圆角卡片，大图展示，舒适配色
          </motion.p>

          {/* Filter Tabs */}
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: easing }}
          >
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-5 py-2 rounded-full border border-white/40 text-white font-body text-sm font-medium"
              >
                {cat}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 2: Gallery Grid */}
      <GallerySection />

      {/* Section 3: Interactive Phone Demo */}
      <InteractivePhoneDemo />

      {/* Section 4: Design Specifications */}
      <DesignSpecs />

      {/* Section 5: CTA Banner */}
      <CTABanner />
    </div>
  )
}
