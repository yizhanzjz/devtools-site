import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "开发者工具箱 - 在线开发工具集",
  description: "前端在线开发者工具集，JSON 格式化、Base64 编解码、时间戳转换等常用工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 md:p-8 pt-16 md:pt-8 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
