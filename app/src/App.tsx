/**
 * 畅点餐 - App.tsx
 * 使用 React.lazy + Suspense 实现路由级代码分割
 */
import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'

// 营销页面组件 - 懒加载
const Home = lazy(() => import('./pages/Home'))
const Features = lazy(() => import('./pages/Features'))
const Pricing = lazy(() => import('./pages/Pricing'))
const Demo = lazy(() => import('./pages/Demo'))
const Contact = lazy(() => import('./pages/Contact'))

// 各端Shell组件 - 懒加载
const MiniAppShell = lazy(() => import('./miniapp'))
const AdminShell = lazy(() => import('./admin'))
const MerchantShell = lazy(() => import('./merchant'))
const SuperAdminShell = lazy(() => import('./superadmin'))
const RiderShell = lazy(() => import('./rider'))

// 加载动画组件
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafafa'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e5e5',
          borderTopColor: '#1890ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ color: '#666', fontSize: '14px' }}>加载中...</span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

// 错误降级组件
function PageErrorFallback({ route }: { route: string }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafafa',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          ⚠️
        </div>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#1a1a1a',
          marginBottom: '12px'
        }}>
          页面加载失败
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '20px'
        }}>
          路由 "{route}" 加载失败，请检查页面是否存在
        </p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            background: '#1890ff',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          返回首页
        </button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* 营销网站路由 */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="features" element={<Features />} />
            <Route path="pricing" element={<Pricing />} />
            <Route path="demo" element={<Demo />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* 用户端小程序 H5 */}
          <Route
            path="/app/*"
            element={
              <ErrorBoundary fallback={<PageErrorFallback route="/app" />}>
                <MiniAppShell />
              </ErrorBoundary>
            }
          />

          {/* PC 管理后台 */}
          <Route
            path="/admin/*"
            element={
              <ErrorBoundary fallback={<PageErrorFallback route="/admin" />}>
                <AdminShell />
              </ErrorBoundary>
            }
          />

          {/* 商家手机端管理 */}
          <Route
            path="/merchant/*"
            element={
              <ErrorBoundary fallback={<PageErrorFallback route="/merchant" />}>
                <MerchantShell />
              </ErrorBoundary>
            }
          />

          {/* 超级管理员后台 */}
          <Route
            path="/superadmin/*"
            element={
              <ErrorBoundary fallback={<PageErrorFallback route="/superadmin" />}>
                <SuperAdminShell />
              </ErrorBoundary>
            }
          />

          {/* 骑手配送端 */}
          <Route
            path="/rider/*"
            element={
              <ErrorBoundary fallback={<PageErrorFallback route="/rider" />}>
                <RiderShell />
              </ErrorBoundary>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
