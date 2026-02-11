"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import figlet from "figlet";

// 导入字体
import Standard from "figlet/importable-fonts/Standard";
import Banner from "figlet/importable-fonts/Banner";
import Big from "figlet/importable-fonts/Big";
import Block from "figlet/importable-fonts/Block";
import Doom from "figlet/importable-fonts/Doom";
import Lean from "figlet/importable-fonts/Lean";
import Mini from "figlet/importable-fonts/Mini";
import Small from "figlet/importable-fonts/Small";
import Slant from "figlet/importable-fonts/Slant";
import Speed from "figlet/importable-fonts/Speed";
import StarWars from "figlet/importable-fonts/Star Wars";
import ANSI_Shadow from "figlet/importable-fonts/ANSI Shadow";
import Calvin_S from "figlet/importable-fonts/Calvin S";
import Cyberlarge from "figlet/importable-fonts/Cyberlarge";
import DOS_Rebel from "figlet/importable-fonts/DOS Rebel";
import Epic from "figlet/importable-fonts/Epic";
import Graffiti from "figlet/importable-fonts/Graffiti";
import Isometric1 from "figlet/importable-fonts/Isometric1";
import Larry_3D from "figlet/importable-fonts/Larry 3D";

// 注册字体
figlet.parseFont("Standard", Standard);
figlet.parseFont("Banner", Banner);
figlet.parseFont("Big", Big);
figlet.parseFont("Block", Block);
figlet.parseFont("Doom", Doom);
figlet.parseFont("Lean", Lean);
figlet.parseFont("Mini", Mini);
figlet.parseFont("Small", Small);
figlet.parseFont("Slant", Slant);
figlet.parseFont("Speed", Speed);
figlet.parseFont("Star Wars", StarWars);
figlet.parseFont("ANSI Shadow", ANSI_Shadow);
figlet.parseFont("Calvin S", Calvin_S);
figlet.parseFont("Cyberlarge", Cyberlarge);
figlet.parseFont("DOS Rebel", DOS_Rebel);
figlet.parseFont("Epic", Epic);
figlet.parseFont("Graffiti", Graffiti);
figlet.parseFont("Isometric1", Isometric1);
figlet.parseFont("Larry 3D", Larry_3D);

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

  const generateAscii = useCallback((text: string, font: string) => {
    if (!text.trim()) {
      setOutput("");
      return;
    }

    try {
      const result = figlet.textSync(text, {
        font: font as figlet.Fonts,
        horizontalLayout: "default",
        verticalLayout: "default",
      });
      setOutput(result);
    } catch {
      setOutput("生成失败，请尝试其他字体或输入");
    }
  }, []);

  useEffect(() => {
    generateAscii(input, selectedFont);
  }, [input, selectedFont, generateAscii]);

  return (
    <ToolLayout
      title="ASCII 艺术字"
      description="使用 Figlet 将文本转换为 ASCII 艺术字，支持 19 种字体风格"
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
          <label className="text-sm text-dark-300">生成结果</label>
          {output && <CopyButton text={output} />}
        </div>
        <div className="p-4 bg-dark-900 border border-dark-700 rounded-lg overflow-x-auto min-h-[160px]">
          {output ? (
            <pre
              className="text-accent leading-none whitespace-pre"
              style={{
                fontFamily: "'Courier New', Courier, 'Liberation Mono', Consolas, monospace",
                fontSize: "14px",
                lineHeight: "1.15",
                letterSpacing: "0px",
              }}
            >
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
