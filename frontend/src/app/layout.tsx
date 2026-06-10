"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { Header } from "@/components/ui/Header";
import { useStore } from "@/store";

export default function RootLayout({ children }: { children: ReactNode }) {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const pathname = usePathname();
  const isLanding = pathname === "/";

  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-[#0a0a0a] text-white font-sans antialiased">
        {isLanding ? (
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
              <main className="flex-1 overflow-y-auto bg-gradient-to-b from-rose-500/[0.02] via-transparent to-transparent">
                {children}
              </main>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
