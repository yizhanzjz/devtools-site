"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

function utf8ToBase64(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64ToUtf8(base64: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

export default function Base64Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encode = useCallback(() => {
    if (!input) {
      setError("请输入内容");
      setOutput("");
      return;
    }
    try {
      setOutput(utf8ToBase64(input));
      setError("");
    } catch {
      setError("编码失败");
      setOutput("");
    }
  }, [input]);

  const decode = useCallback(() => {
    if (!input) {
      setError("请输入 Base64 字符串");
      setOutput("");
      return;
    }
    try {
      setOutput(base64ToUtf8(input));
      setError("");
    } catch {
      setError("解码失败: 输入不是有效的 Base64 字符串");
      setOutput("");
    }
  }, [input]);

  return (
    <ToolLayout
      title="Base64 编解码"
      description="Base64 编码和解码转换，支持 UTF-8 中文"
    >
      <div>
        <label className="block text-sm text-dark-300 mb-2">输入内容</label>
        <textarea
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要编码/解码的内容..."
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
        <button
          onClick={() => {
            setInput(output);
            setOutput("");
          }}
          className="tool-btn-secondary"
          disabled={!output}
        >
          结果填入输入框
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
