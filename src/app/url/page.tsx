"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

export default function UrlPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"component" | "full">("component");

  const encode = useCallback(() => {
    if (!input) {
      setError("请输入内容");
      setOutput("");
      return;
    }
    try {
      const result =
        mode === "component"
          ? encodeURIComponent(input)
          : encodeURI(input);
      setOutput(result);
      setError("");
    } catch {
      setError("编码失败");
      setOutput("");
    }
  }, [input, mode]);

  const decode = useCallback(() => {
    if (!input) {
      setError("请输入 URL 编码字符串");
      setOutput("");
      return;
    }
    try {
      const result =
        mode === "component"
          ? decodeURIComponent(input)
          : decodeURI(input);
      setOutput(result);
      setError("");
    } catch {
      setError("解码失败: 输入不是有效的 URL 编码字符串");
      setOutput("");
    }
  }, [input, mode]);

  return (
    <ToolLayout
      title="URL 编解码"
      description="URL 编码和解码转换，支持完整 URL 和组件模式"
    >
      <div className="flex gap-4 items-center">
        <label className="text-sm text-dark-300">编码模式:</label>
        <label className="flex items-center gap-2 text-sm text-dark-200 cursor-pointer">
          <input
            type="radio"
            checked={mode === "component"}
            onChange={() => setMode("component")}
            className="accent-accent"
          />
          encodeURIComponent (推荐)
        </label>
        <label className="flex items-center gap-2 text-sm text-dark-200 cursor-pointer">
          <input
            type="radio"
            checked={mode === "full"}
            onChange={() => setMode("full")}
            className="accent-accent"
          />
          encodeURI (完整 URL)
        </label>
      </div>

      <div>
        <label className="block text-sm text-dark-300 mb-2">输入内容</label>
        <textarea
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com/path?q=你好&lang=中文"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={encode} className="tool-btn-primary">
          编码 →
        </button>
        <button onClick={decode} className="tool-btn-primary">
          ← 解码
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {output && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-dark-300">输出结果</label>
            <CopyButton text={output} />
          </div>
          <textarea
            className="tool-textarea"
            value={output}
            readOnly
            spellCheck={false}
          />
        </div>
      )}
    </ToolLayout>
  );
}
