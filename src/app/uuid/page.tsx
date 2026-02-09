"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

export default function UuidPage() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);

  const generate = useCallback(() => {
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = uuidv4();
      if (noDashes) id = id.replace(/-/g, "");
      if (uppercase) id = id.toUpperCase();
      results.push(id);
    }
    setUuids(results);
  }, [count, uppercase, noDashes]);

  const allText = uuids.join("\n");

  return (
    <ToolLayout
      title="UUID 生成器"
      description="生成 UUID v4，支持批量生成和格式选项"
    >
      <div className="p-6 bg-dark-900 border border-dark-700 rounded-xl space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-dark-300">数量:</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) =>
                setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))
              }
              className="tool-input w-20"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-dark-200 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="accent-accent"
            />
            大写
          </label>

          <label className="flex items-center gap-2 text-sm text-dark-200 cursor-pointer">
            <input
              type="checkbox"
              checked={noDashes}
              onChange={(e) => setNoDashes(e.target.checked)}
              className="accent-accent"
            />
            无连字符
          </label>

          <button onClick={generate} className="tool-btn-primary">
            🎲 生成
          </button>
        </div>
      </div>

      {uuids.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-dark-300">
              生成结果 ({uuids.length} 个)
            </label>
            <CopyButton text={allText} />
          </div>
          <div className="space-y-2">
            {uuids.map((id, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 bg-dark-900 border border-dark-700 rounded-lg group"
              >
                <code className="flex-1 text-accent font-mono text-sm break-all">
                  {id}
                </code>
                <CopyButton
                  text={id}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
