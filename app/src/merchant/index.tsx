// 商家端 - 入口壳
import { useEffect } from "react";
import MerchantApp from "./App";
import { MerchantProvider } from "./context/MerchantContext";

export default function MerchantShell() {
  useEffect(() => {
    // 移动端 viewport
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
      meta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="mx-auto h-screen w-full max-w-[430px] overflow-hidden bg-[#F5F5F5]">
      <MerchantProvider>
        <MerchantApp />
      </MerchantProvider>
    </div>
  );
}
