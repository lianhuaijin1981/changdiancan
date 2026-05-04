// 超级管理后台入口
import { useEffect } from "react"
import SuperAdminApp from "./App"
import { AdminProvider } from "./context/AdminContext"

export default function SuperAdminShell() {
  useEffect(() => {
    document.body.style.overflow = "auto"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AdminProvider>
        <SuperAdminApp />
      </AdminProvider>
    </div>
  )
}
