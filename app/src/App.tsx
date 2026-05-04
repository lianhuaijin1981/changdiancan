import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import Demo from './pages/Demo'
import Contact from './pages/Contact'
import MiniAppShell from './miniapp'
import AdminShell from './admin'

export default function App() {
  return (
    <Routes>
      {/* Marketing website routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="features" element={<Features />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="demo" element={<Demo />} />
        <Route path="contact" element={<Contact />} />
      </Route>
      {/* Mini-program H5 app */}
      <Route path="/app/*" element={<MiniAppShell />} />
      {/* Admin dashboard */}
      <Route path="/admin/*" element={<AdminShell />} />
    </Routes>
  )
}
