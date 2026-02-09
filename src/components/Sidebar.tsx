"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { tools } from "@/lib/tools";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-dark-800 rounded-lg border border-dark-700"
        aria-label="切换菜单"
      >
        <svg
          className="w-5 h-5 text-dark-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {collapsed ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-dark-900 border-r border-dark-700
          flex flex-col transition-transform duration-300 ease-in-out
          ${collapsed ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:z-auto
        `}
      >
        <div className="p-6 border-b border-dark-700">
          <Link href="/" onClick={() => setCollapsed(false)}>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-accent">⚡</span>
              开发者工具箱
            </h1>
          </Link>
          <p className="text-xs text-dark-500 mt-1">前端在线工具集</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {tools.map((tool) => {
            const isActive = pathname === tool.href;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                onClick={() => setCollapsed(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                  transition-colors duration-200
                  ${
                    isActive
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "text-dark-300 hover:bg-dark-800 hover:text-dark-100 border border-transparent"
                  }
                `}
              >
                <span
                  className={`
                    w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold
                    ${isActive ? "bg-accent/20 text-accent" : "bg-dark-800 text-dark-400"}
                  `}
                >
                  {tool.icon}
                </span>
                <span>{tool.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-dark-700">
          <p className="text-xs text-dark-600 text-center">
            所有计算均在浏览器中完成
          </p>
        </div>
      </aside>
    </>
  );
}
