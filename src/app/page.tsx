import Link from "next/link";
import { tools } from "@/lib/tools";

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          ⚡ 开发者工具箱
        </h1>
        <p className="text-dark-400 text-lg">
          常用在线开发工具集，所有计算均在浏览器本地完成，数据不会上传到服务器。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link key={tool.id} href={tool.href}>
            <div className="tool-card group h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm shrink-0 group-hover:bg-accent/20 transition-colors">
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-white mb-1 group-hover:text-accent transition-colors">
                    {tool.name}
                  </h2>
                  <p className="text-dark-500 text-sm leading-relaxed">
                    {tool.description}
                  </p>
                  <span className="inline-block mt-3 text-xs text-dark-600 bg-dark-800 px-2 py-0.5 rounded">
                    {tool.category}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
