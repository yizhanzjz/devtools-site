"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const FONTS = [
  { id: "Standard", name: "标准" },
  { id: "Banner", name: "横幅" },
  { id: "Big", name: "大字" },
  { id: "Block", name: "方块" },
  { id: "Doom", name: "毁灭" },
  { id: "Lean", name: "倾斜" },
  { id: "Mini", name: "迷你" },
  { id: "Small", name: "小字" },
  { id: "Slant", name: "斜体" },
  { id: "Speed", name: "速度" },
  { id: "Star Wars", name: "星球大战" },
  { id: "3D-ASCII", name: "3D" },
  { id: "ANSI Shadow", name: "ANSI 阴影" },
  { id: "Calvin S", name: "Calvin" },
  { id: "Cyberlarge", name: "赛博" },
  { id: "DOS Rebel", name: "DOS" },
  { id: "Epic", name: "史诗" },
  { id: "Graffiti", name: "涂鸦" },
  { id: "Isometric1", name: "等距" },
  { id: "Larry 3D", name: "Larry 3D" },
];

const exampleTexts = ["Hello", "ASCII", "DevTools", "2026", "Code", "Hack"];

export default function AsciiPage() {
  const [input, setInput] = useState("Hello");
  const [selectedFont, setSelectedFont] = useState("Standard");
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateAscii = useCallback(async (text: string, font: string) => {
    if (!text.trim()) {
      setOutput("");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/ascii?text=${encodeURIComponent(text)}&font=${encodeURIComponent(font)}`
      );
      const data = await res.json();
      if (data.result) {
        setOutput(data.result);
      } else if (data.error) {
        setOutput(`Error: ${data.error}`);
      }
    } catch {
      setOutput("请求失败，请重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      generateAscii(input, selectedFont);
    }, 200);
    return () => clearTimeout(timer);
  }, [input, selectedFont, generateAscii]);

  return (
    <ToolLayout
      title="ASCII 艺术字"
      description="使用 Figlet 将文本转换为 ASCII 艺术字，支持 20+ 种字体风格"
    >
      <div>
        <label className="block text-sm text-dark-300 mb-2">输入文字</label>
        <input
          type="text"
          className="w-full px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-400 focus:outline-none focus:border-accent"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入英文、数字或符号..."
          spellCheck={false}
          maxLength={50}
        />
      </div>

      <div>
        <label className="block text-sm text-dark-300 mb-2">字体风格</label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => setSelectedFont(font.id)}
              className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                selectedFont === font.id
                  ? "bg-accent border-accent text-dark-950 font-medium"
                  : "bg-dark-800 border-dark-600 text-dark-200 hover:border-dark-500"
              }`}
            >
              {font.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-dark-300 mb-2">快速示例</label>
        <div className="flex flex-wrap gap-2">
          {exampleTexts.map((text) => (
            <button
              key={text}
              onClick={() => setInput(text)}
              className="px-3 py-1 bg-dark-800 border border-dark-600 rounded text-sm text-dark-200 hover:border-dark-500 transition-colors"
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm text-dark-300">
            生成结果
            {loading && (
              <span className="ml-2 text-dark-500 text-xs">生成中...</span>
            )}
          </label>
          {output && <CopyButton text={output} />}
        </div>
        <div className="p-4 bg-dark-900 border border-dark-700 rounded-lg overflow-x-auto min-h-[160px]">
          {output ? (
            <pre className="text-accent font-mono text-sm leading-tight whitespace-pre">
              {output}
            </pre>
          ) : (
            <p className="text-dark-600 text-sm">输入文字后自动生成...</p>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
