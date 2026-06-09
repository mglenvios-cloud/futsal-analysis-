"use client";

import { ReactNode } from "react";
import { Sidebar } from "@/components/ui/Sidebar";
import { Header } from "@/components/ui/Header";
import { useStore } from "@/store";

export default function RootLayout({ children }: { children: ReactNode }) {
  const sidebarOpen = useStore((s) => s.sidebarOpen);

  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-premium-black">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
            <Header />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
