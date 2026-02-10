"use client";

import { useState, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface ColorScheme {
  name: string;
  colors: string[];
}

// 颜色转换函数
function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

// 生成调色板
function generateSchemes(hex: string): ColorScheme[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const schemes: ColorScheme[] = [];

  // 互补色
  const complementHue = (hsl.h + 180) % 360;
  const complement = hslToRgb(complementHue, hsl.s, hsl.l);
  schemes.push({
    name: "互补色",
    colors: [hex, rgbToHex(complement.r, complement.g, complement.b)],
  });

  // 类似色
  const analogous1 = hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l);
  const analogous2 = hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l);
  schemes.push({
    name: "类似色",
    colors: [
      rgbToHex(analogous2.r, analogous2.g, analogous2.b),
      hex,
      rgbToHex(analogous1.r, analogous1.g, analogous1.b),
    ],
  });

  // 三角色
  const triadic1 = hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l);
  const triadic2 = hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l);
  schemes.push({
    name: "三角色",
    colors: [
      hex,
      rgbToHex(triadic1.r, triadic1.g, triadic1.b),
      rgbToHex(triadic2.r, triadic2.g, triadic2.b),
    ],
  });

  // 分裂互补色
  const split1 = hslToRgb((complementHue + 30) % 360, hsl.s, hsl.l);
  const split2 = hslToRgb((complementHue - 30 + 360) % 360, hsl.s, hsl.l);
  schemes.push({
    name: "分裂互补色",
    colors: [
      hex,
      rgbToHex(split1.r, split1.g, split1.b),
      rgbToHex(split2.r, split2.g, split2.b),
    ],
  });

  return schemes;
}

// Tailwind 色板
const tailwindColors = [
  { name: "Slate", colors: ["#f8fafc", "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155", "#1e293b", "#0f172a"] },
  { name: "Gray", colors: ["#f9fafb", "#e5e7eb", "#d1d5db", "#9ca3af", "#6b7280", "#4b5563", "#374151", "#1f2937", "#111827"] },
  { name: "Red", colors: ["#fef2f2", "#fee2e2", "#fecaca", "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b"] },
  { name: "Orange", colors: ["#fff7ed", "#ffedd5", "#fed7aa", "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412"] },
  { name: "Yellow", colors: ["#fefce8", "#fef9c3", "#fef08a", "#fde047", "#facc15", "#eab308", "#ca8a04", "#a16207", "#854d0e"] },
  { name: "Green", colors: ["#f0fdf4", "#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534"] },
  { name: "Blue", colors: ["#eff6ff", "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af"] },
  { name: "Purple", colors: ["#faf5ff", "#f3e8ff", "#e9d5ff", "#d8b4fe", "#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#6b21a8"] },
  { name: "Pink", colors: ["#fdf2f8", "#fce7f3", "#fbcfe8", "#f9a8d4", "#f472b6", "#ec4899", "#db2777", "#be185d", "#9f1239"] },
];

export default function ColorPage() {
  const [color, setColor] = useState("#3b82f6");
  const [hexInput, setHexInput] = useState("#3b82f6");
  const [rgbInput, setRgbInput] = useState("59, 130, 246");
  const [hslInput, setHslInput] = useState("217, 92%, 60%");
  const [alpha, setAlpha] = useState(100);
  const [schemes, setSchemes] = useState<ColorScheme[]>([]);
  const [gradientColor1, setGradientColor1] = useState("#3b82f6");
  const [gradientColor2, setGradientColor2] = useState("#8b5cf6");
  const [gradientAngle, setGradientAngle] = useState(90);

  // 更新所有格式
  const updateAllFormats = useCallback((hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return;

    setColor(hex);
    setHexInput(hex);
    setRgbInput(`${rgb.r}, ${rgb.g}, ${rgb.b}`);

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setHslInput(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`);

    setSchemes(generateSchemes(hex));
  }, []);

  useEffect(() => {
    setSchemes(generateSchemes(color));
  }, [color]);

  // HEX 输入处理
  const handleHexChange = (value: string) => {
    setHexInput(value);
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      updateAllFormats(value);
    }
  };

  // RGB 输入处理
  const handleRgbChange = (value: string) => {
    setRgbInput(value);
    const match = value.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
        const hex = rgbToHex(r, g, b);
        updateAllFormats(hex);
      }
    }
  };

  // HSL 输入处理
  const handleHslChange = (value: string) => {
    setHslInput(value);
    const match = value.match(/(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/);
    if (match) {
      const h = parseInt(match[1]);
      const s = parseInt(match[2]);
      const l = parseInt(match[3]);
      if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
        const rgb = hslToRgb(h, s, l);
        const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
        updateAllFormats(hex);
      }
    }
  };

  // 渐变 CSS
  const gradientCss = `linear-gradient(${gradientAngle}deg, ${gradientColor1}, ${gradientColor2})`;

  return (
    <ToolLayout
      title="颜色工具"
      description="颜色选择器、格式转换、调色板生成和 CSS 渐变生成器"
    >
      {/* 颜色选择器和预览 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dark-300 mb-2">颜色选择器</label>
          <div className="flex gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => updateAllFormats(e.target.value)}
              className="w-20 h-20 rounded-lg cursor-pointer border-2 border-dark-700"
            />
            <div className="flex-1">
              <label className="block text-xs text-dark-400 mb-1">透明度</label>
              <input
                type="range"
                min="0"
                max="100"
                value={alpha}
                onChange={(e) => setAlpha(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="text-xs text-dark-300 text-center mt-1">
                {alpha}%
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-dark-300 mb-2">颜色预览</label>
          <div
            className="w-full h-20 rounded-lg border-2 border-dark-700"
            style={{
              backgroundColor: color,
              opacity: alpha / 100,
            }}
          />
        </div>
      </div>

      {/* 格式转换 */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-dark-100">格式转换</h3>

        {/* HEX */}
        <div>
          <label className="block text-sm text-dark-300 mb-2">HEX</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              className="tool-input flex-1"
              placeholder="#3b82f6"
            />
            <CopyButton text={hexInput} />
          </div>
        </div>

        {/* RGB */}
        <div>
          <label className="block text-sm text-dark-300 mb-2">RGB</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={rgbInput}
              onChange={(e) => handleRgbChange(e.target.value)}
              className="tool-input flex-1"
              placeholder="59, 130, 246"
            />
            <CopyButton text={`rgb(${rgbInput})`} />
          </div>
          {alpha < 100 && (
            <div className="text-xs text-dark-400 mt-1">
              RGBA: rgb({rgbInput}, {(alpha / 100).toFixed(2)})
            </div>
          )}
        </div>

        {/* HSL */}
        <div>
          <label className="block text-sm text-dark-300 mb-2">HSL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hslInput}
              onChange={(e) => handleHslChange(e.target.value)}
              className="tool-input flex-1"
              placeholder="217, 92%, 60%"
            />
            <CopyButton text={`hsl(${hslInput})`} />
          </div>
          {alpha < 100 && (
            <div className="text-xs text-dark-400 mt-1">
              HSLA: hsl({hslInput}, {(alpha / 100).toFixed(2)})
            </div>
          )}
        </div>
      </div>

      {/* 调色板 */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-dark-100">调色板方案</h3>
        {schemes.map((scheme) => (
          <div
            key={scheme.name}
            className="p-4 bg-dark-900 border border-dark-700 rounded-lg"
          >
            <div className="text-sm font-medium text-dark-300 mb-3">
              {scheme.name}
            </div>
            <div className="flex gap-2">
              {scheme.colors.map((c, i) => (
                <div key={i} className="flex-1">
                  <div
                    className="h-16 rounded-lg border border-dark-700 cursor-pointer hover:scale-105 transition-transform"
                    style={{ backgroundColor: c }}
                    onClick={() => updateAllFormats(c)}
                    title="点击使用此颜色"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <code className="text-xs text-dark-400">{c}</code>
                    <CopyButton text={c} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CSS 渐变生成器 */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-dark-100">CSS 渐变生成器</h3>
        <div
          className="h-24 rounded-lg border border-dark-700"
          style={{ background: gradientCss }}
        />

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-dark-300 mb-2">起始颜色</label>
            <input
              type="color"
              value={gradientColor1}
              onChange={(e) => setGradientColor1(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer border border-dark-700"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-2">结束颜色</label>
            <input
              type="color"
              value={gradientColor2}
              onChange={(e) => setGradientColor2(e.target.value)}
              className="w-full h-10 rounded-lg cursor-pointer border border-dark-700"
            />
          </div>
          <div>
            <label className="block text-sm text-dark-300 mb-2">
              角度: {gradientAngle}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={gradientAngle}
              onChange={(e) => setGradientAngle(parseInt(e.target.value))}
              className="w-full accent-accent mt-1"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <code className="flex-1 p-3 bg-dark-900 border border-dark-700 rounded-lg text-sm text-accent break-all">
            background: {gradientCss};
          </code>
          <CopyButton text={`background: ${gradientCss};`} />
        </div>
      </div>

      {/* Tailwind 色板 */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-dark-100">Tailwind 色板</h3>
        <div className="space-y-4">
          {tailwindColors.map((palette) => (
            <div key={palette.name}>
              <div className="text-sm text-dark-300 mb-2">{palette.name}</div>
              <div className="flex gap-1">
                {palette.colors.map((c, i) => (
                  <div
                    key={i}
                    className="flex-1 h-12 rounded cursor-pointer hover:scale-105 transition-transform relative group"
                    style={{ backgroundColor: c }}
                    onClick={() => updateAllFormats(c)}
                    title={c}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-mono bg-black/70 text-white px-1 rounded">
                        {c}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
