"use client";

import { useState, useCallback } from "react";
import { md5 } from "js-md5";
import { sha256 } from "js-sha256";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

interface HashResult {
  algorithm: string;
  value: string;
}

export default function HashPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<HashResult[]>([]);
  const [uppercase, setUppercase] = useState(false);

  const computeHash = useCallback(() => {
    if (!input) {
      setResults([]);
      return;
    }

    const md5Hash = md5(input);
    const sha256Hash = sha256(input);

    const transform = (s: string) => (uppercase ? s.toUpperCase() : s);

    setResults([
      { algorithm: "MD5", value: transform(md5Hash) },
      { algorithm: "SHA-256", value: transform(sha256Hash) },
    ]);
  }, [input, uppercase]);

  return (
    <ToolLayout
      title="Hash 生成"
      description="计算文本的 MD5、SHA-256 哈希值"
    >
      <div>
        <label className="block text-sm text-dark-300 mb-2">输入内容</label>
        <textarea
          className="tool-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要计算哈希的文本..."
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={computeHash} className="tool-btn-primary">
          计算 Hash
        </button>
        <label className="flex items-center gap-2 text-sm text-dark-200 cursor-pointer">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="accent-accent"
          />
          大写输出
        </label>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((r) => (
            <div
              key={r.algorithm}
              className="p-4 bg-dark-900 border border-dark-700 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-dark-300">
                  {r.algorithm}
                </span>
                <CopyButton text={r.value} />
              </div>
              <code className="block text-accent font-mono text-sm break-all">
                {r.value}
              </code>
            </div>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
