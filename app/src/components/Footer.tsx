import { Link } from 'react-router-dom'
import { Sparkles, Phone, Mail, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1A1A2E] text-white">
      <div className="container-main pt-space-24 pb-space-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#FF6B35]" />
              <span className="font-display text-xl font-bold text-white">畅点餐</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              专业餐饮数字化解决方案
            </p>
            <p className="text-white/50 text-sm leading-relaxed">
              扫码点餐、会员营销、外卖配送、数据报表，一套系统，四端互通，从夫妻店到连锁品牌全覆盖。
            </p>
          </div>

          <div>
            <h4 className="font-body font-semibold text-white mb-4">产品</h4>
            <ul className="space-y-3">
              {[
                { label: '基础版', path: '/pricing' },
                { label: '标准版', path: '/pricing' },
                { label: '高级定制版', path: '/pricing' },
                { label: '功能介绍', path: '/features' },
                { label: '定价方案', path: '/pricing' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-white/70 text-sm hover:text-[#FF6B35] transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body font-semibold text-white mb-4">支持</h4>
            <ul className="space-y-3">
              {[
                { label: '帮助中心', path: '/contact' },
                { label: '常见问题', path: '/contact' },
                { label: '更新日志', path: '/features' },
                { label: 'API文档（高级版）', path: '/features' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    className="text-white/70 text-sm hover:text-[#FF6B35] transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body font-semibold text-white mb-4">联系我们</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="w-4 h-4 text-[#FF6B35]" />
                400-888-6688
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="w-4 h-4 text-[#FF6B35]" />
                support@changdiancan.com
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Clock className="w-4 h-4 text-[#FF6B35]" />
                工作时间 9:00-21:00
              </li>
            </ul>
            <div className="mt-4 w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center">
              <img src="/qr-demo.png" alt="微信二维码" className="w-20 h-20 rounded" />
            </div>
          </div>
        </div>

        <div className="mt-space-12 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white/50 text-xs">
            <p>© 2024 畅点餐 版权所有 | 粤ICP备XXXXXXXX号</p>
            <div className="flex items-center gap-6">
              <Link to="/" className="hover:text-white transition-colors">隐私政策</Link>
              <Link to="/" className="hover:text-white transition-colors">服务条款</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
