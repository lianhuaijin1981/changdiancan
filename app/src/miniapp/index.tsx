// 畅点餐小程序 H5 入口
import { useEffect } from "react"
import MiniApp from "./App"
import { AppProvider } from "./context/AppContext"

export default function MiniAppShell() {
  useEffect(() => {
    // 添加移动端 viewport 样式
    const meta = document.querySelector('meta[name="viewport"]')
    if (meta) {
      meta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
    }
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <div className="mx-auto h-screen w-full max-w-[430px] overflow-hidden bg-[#F5F5F5]">
      <AppProvider>
        <MiniApp />
      </AppProvider>
    </div>
  )
}
