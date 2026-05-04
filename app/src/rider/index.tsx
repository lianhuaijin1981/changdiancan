import { useEffect } from "react";
import { HashRouter } from "react-router-dom";
import RiderApp from "./App";
import { RiderProvider } from "./context/RiderContext";

export default function RiderShell() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) meta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no");
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="mx-auto h-screen w-full max-w-[430px] overflow-hidden bg-[#1E1E1E]">
      <HashRouter>
        <RiderProvider>
          <RiderApp />
        </RiderProvider>
      </HashRouter>
    </div>
  );
}
