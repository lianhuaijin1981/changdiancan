import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sparkles, ArrowRight } from 'lucide-react'

const navLinks = [
  { label: '首页', path: '/' },
  { label: '功能', path: '/features' },
  { label: '定价', path: '/pricing' },
  { label: '演示', path: '/demo' },
  { label: '联系我们', path: '/contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[72px] md:h-[72px] sm:h-16">
      <div className="absolute inset-0 bg-white/90 backdrop-blur-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.05)]" />
      <nav className="relative container-main h-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#FF6B35]" />
          <span className="font-display text-2xl font-bold text-[#FF6B35]">畅点餐</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-body text-base font-medium transition-colors duration-200 hover:text-[#FF6B35] ${
                location.pathname === link.path ? 'text-[#FF6B35]' : 'text-[#1A1A2E]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          to="/contact"
          className="hidden md:inline-flex items-center gap-2 gradient-hero text-white font-body text-base font-semibold px-7 py-3 rounded-full transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
        >
          立即咨询
          <ArrowRight className="w-4 h-4" />
        </Link>

        <button
          className="md:hidden p-2 text-[#1A1A2E]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-[12px] shadow-lg border-t border-black/5">
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link, i) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`font-body text-lg font-medium transition-colors duration-200 hover:text-[#FF6B35] ${
                  location.pathname === link.path ? 'text-[#FF6B35]' : 'text-[#1A1A2E]'
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-2 gradient-hero text-white font-body text-base font-semibold px-7 py-3 rounded-full mt-2"
            >
              立即咨询
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
