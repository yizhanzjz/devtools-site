"use client";

import { useState, useCallback, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

interface MatchResult {
  fullMatch: string;
  index: number;
  groups: string[];
}

interface Preset {
  name: string;
  pattern: string;
  flags: string;
  description: string;
}

const presets: Preset[] = [
  {
    name: "电子邮箱",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: "g",
    description: "匹配常见的电子邮箱地址",
  },
  {
    name: "手机号（中国）",
    pattern: "1[3-9]\\d{9}",
    flags: "g",
    description: "匹配中国大陆手机号码",
  },
  {
    name: "URL",
    pattern: "https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*",
    flags: "gi",
    description: "匹配 HTTP/HTTPS URL",
  },
  {
    name: "IPv4 地址",
    pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    flags: "g",
    description: "匹配 IPv4 地址",
  },
  {
    name: "日期 (YYYY-MM-DD)",
    pattern: "\\d{4}-\\d{2}-\\d{2}",
    flags: "g",
    description: "匹配日期格式 YYYY-MM-DD",
  },
  {
    name: "十六进制颜色",
    pattern: "#[0-9a-fA-F]{6}\\b|#[0-9a-fA-F]{3}\\b",
    flags: "g",
    description: "匹配十六进制颜色代码",
  },
  {
    name: "中文字符",
    pattern: "[\\u4e00-\\u9fa5]+",
    flags: "g",
    description: "匹配中文字符",
  },
  {
    name: "数字（整数/小数）",
    pattern: "-?\\d+(\\.\\d+)?",
    flags: "g",
    description: "匹配整数和小数",
  },
];

export default function RegexPage() {
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [error, setError] = useState("");

  const flagString = useMemo(() => {
    return Object.entries(flags)
      .filter(([_, v]) => v)
      .map(([k]) => k)
      .join("");
  }, [flags]);

  const matches = useMemo<MatchResult[]>(() => {
    if (!pattern || !testString) {
      setError("");
      return [];
    }

    try {
      const regex = new RegExp(pattern, flagString);
      const results: MatchResult[] = [];
      let match;

      if (flags.g) {
        while ((match = regex.exec(testString)) !== null) {
          results.push({
            fullMatch: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          // Prevent infinite loop on zero-width matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          results.push({
            fullMatch: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        }
      }

      setError("");
      return results;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "正则表达式无效";
      setError(msg);
      return [];
    }
  }, [pattern, testString, flagString, flags.g]);

  const highlightedText = useMemo(() => {
    if (!testString || matches.length === 0) {
      return [];
    }

    const parts: { text: string; isMatch: boolean; index?: number }[] = [];
    let lastIndex = 0;

    matches.forEach((match, idx) => {
      if (match.index > lastIndex) {
        parts.push({
          text: testString.slice(lastIndex, match.index),
          isMatch: false,
        });
      }
      parts.push({
        text: match.fullMatch,
        isMatch: true,
        index: idx,
      });
      lastIndex = match.index + match.fullMatch.length;
    });

    if (lastIndex < testString.length) {
      parts.push({
        text: testString.slice(lastIndex),
        isMatch: false,
      });
    }

    return parts;
  }, [testString, matches]);

  const loadPreset = useCallback((preset: Preset) => {
    setPattern(preset.pattern);
    setFlags({
      g: preset.flags.includes("g"),
      i: preset.flags.includes("i"),
      m: preset.flags.includes("m"),
      s: preset.flags.includes("s"),
    });
  }, []);

  return (
    <ToolLayout
      title="正则表达式测试器"
      description="测试和调试正则表达式，实时高亮匹配结果"
    >
      <div>
        <label className="block text-sm text-dark-300 mb-2">
          正则表达式 (不含分隔符)
        </label>
        <input
          type="text"
          className="tool-input"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="例如：[a-z]+@[a-z]+\.[a-z]+"
          spellCheck={false}
        />
      </div>

      <div>
        <label className="block text-sm text-dark-300 mb-2">Flags</label>
        <div className="flex flex-wrap gap-4">
          {[
            { key: "g", label: "g (全局匹配)" },
            { key: "i", label: "i (忽略大小写)" },
            { key: "m", label: "m (多行模式)" },
            { key: "s", label: "s (dotAll 模式)" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 text-sm text-dark-200 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={flags[key as keyof typeof flags]}
                onChange={(e) =>
                  setFlags((prev) => ({ ...prev, [key]: e.target.checked }))
                }
                className="accent-accent"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-dark-300 mb-2">测试字符串</label>
        <textarea
          className="tool-textarea"
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="输入要测试的文本..."
          spellCheck={false}
          rows={6}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          错误: {error}
        </div>
      )}

      {!error && pattern && testString && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-dark-300">
              匹配结果 ({matches.length} 个匹配)
            </label>
          </div>
          <div className="p-4 bg-dark-900 border border-dark-700 rounded-lg font-mono text-sm whitespace-pre-wrap break-words">
            {highlightedText.length > 0 ? (
              highlightedText.map((part, idx) =>
                part.isMatch ? (
                  <mark
                    key={idx}
                    className="bg-accent/30 text-accent px-0.5 rounded"
                    title={`匹配 #${(part.index ?? 0) + 1}`}
                  >
                    {part.text}
                  </mark>
                ) : (
                  <span key={idx} className="text-dark-200">
                    {part.text}
                  </span>
                )
              )
            ) : (
              <span className="text-dark-500">无匹配</span>
            )}
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div>
          <label className="block text-sm text-dark-300 mb-2">
            详细匹配信息
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {matches.map((match, idx) => (
              <div
                key={idx}
                className="p-3 bg-dark-900 border border-dark-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-dark-400">
                    匹配 #{idx + 1} (位置: {match.index})
                  </span>
                  <CopyButton text={match.fullMatch} />
                </div>
                <div className="text-sm text-accent font-mono break-all mb-2">
                  {match.fullMatch}
                </div>
                {match.groups.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-dark-700">
                    <div className="text-xs text-dark-500 mb-1">捕获组:</div>
                    {match.groups.map((group, gIdx) => (
                      <div
                        key={gIdx}
                        className="text-xs text-dark-300 font-mono ml-2"
                      >
                        ${gIdx + 1}: {group || "(empty)"}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm text-dark-300 mb-2">常用正则</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => loadPreset(preset)}
              className="p-3 bg-dark-900 border border-dark-700 rounded-lg text-left hover:border-accent/50 transition-colors group"
            >
              <div className="font-medium text-sm text-dark-200 group-hover:text-accent">
                {preset.name}
              </div>
              <div className="text-xs text-dark-500 mt-1 font-mono truncate">
                /{preset.pattern}/{preset.flags}
              </div>
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
