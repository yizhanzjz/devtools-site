"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

export default function JsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);

  const formatJson = useCallback(() => {
    if (!input.trim()) {
      setError("请输入 JSON 数据");
      setOutput("");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "未知错误";
      setError(`JSON 格式错误: ${msg}`);
      setOutput("");
    }
  }, [input, indent]);

  const minifyJson = useCallback(() => {
    if (!input.trim()) {
      setError("请输入 JSON 数据");
      setOutput("");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "未知错误";
      setError(`JSON 格式错误: ${msg}`);
      setOutput("");
    }
  }, [input]);

  const validateJson = useCallback(() => {
    if (!input.trim()) {
      setError("请输入 JSON 数据");
      setOutput("");
      return;
    }
    try {
      JSON.parse(input);
      setError("");
      setOutput("✅ JSON 格式正确");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "未知错误";
      setError(`❌ JSON 格式错误: ${msg}`);
      setOutput("");
    }
  }, [input]);

  return (
    <ToolLayout
      title="JSON 格式化/校验"
      description="格式化、压缩和校验 JSON 数据"
    >
      <div>
        <label className="block text-sm text-dark-300 mb-2">输入 JSON</label>
        <textarea
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='{"name": "hello", "value": 123}'
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={formatJson} className="tool-btn-primary">
          格式化
        </button>
        <button onClick={minifyJson} className="tool-btn-secondary">
          压缩
        </button>
        <button onClick={validateJson} className="tool-btn-secondary">
          校验
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="text-sm text-dark-400">缩进:</label>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className="bg-dark-800 border border-dark-700 rounded px-2 py-1 text-sm text-dark-200"
          >
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
            <option value={1}>Tab</option>
          </select>
        </div>
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
