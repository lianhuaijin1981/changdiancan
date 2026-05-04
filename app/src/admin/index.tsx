// 畅点餐管理后台入口
import { useEffect } from "react"
import AdminApp from "./App"
import { AuthProvider } from "./context/AuthContext"

export default function AdminShell() {
  useEffect(() => {
    document.body.style.overflow = "auto"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AuthProvider>
        <AdminApp />
      </AuthProvider>
    </div>
  )
}
