"use client";

import "@/styles/globals.css";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { Header } from "@/components/ui/Header";
import { useStore } from "@/store";

export default function RootLayout({ children }: { children: ReactNode }) {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLanding = mounted && pathname === "/";

  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-premium-black text-white font-sans antialiased">
        {!mounted ? (
          <div className="flex h-screen overflow-hidden">
            <div className="w-64" />
            <div className="flex-1 flex flex-col">
              <div className="h-16 border-b border-premium-gray/60" />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </div>
        ) : isLanding ? (
          children
        ) : (
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div
              className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
                sidebarOpen ? "ml-64" : "ml-16"
              }`}
            >
              <Header />
              <main className="flex-1 overflow-y-auto bg-gradient-to-b from-neon-red/[0.02] via-transparent to-transparent">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
