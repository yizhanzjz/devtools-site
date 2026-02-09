"use client";

import { useState, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function TimestampPage() {
  const [currentTs, setCurrentTs] = useState<number>(0);
  const [tsInput, setTsInput] = useState("");
  const [tsResult, setTsResult] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [dateResult, setDateResult] = useState("");
  const [tsUnit, setTsUnit] = useState<"s" | "ms">("s");
  const [error1, setError1] = useState("");
  const [error2, setError2] = useState("");

  useEffect(() => {
    setCurrentTs(Math.floor(Date.now() / 1000));
    const timer = setInterval(() => {
      setCurrentTs(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const tsToDate = useCallback(() => {
    if (!tsInput.trim()) {
      setError1("请输入时间戳");
      setTsResult("");
      return;
    }
    try {
      let ts = parseInt(tsInput, 10);
      if (isNaN(ts)) throw new Error("无效数字");
      // Auto-detect: if > 10 digits, treat as ms
      if (tsUnit === "s") ts = ts * 1000;
      const date = new Date(ts);
      if (isNaN(date.getTime())) throw new Error("无效时间戳");
      setTsResult(
        `本地时间: ${formatDate(date)}\nUTC 时间: ${date.toUTCString()}\nISO 格式: ${date.toISOString()}`
      );
      setError1("");
    } catch {
      setError1("无效的时间戳");
      setTsResult("");
    }
  }, [tsInput, tsUnit]);

  const dateToTs = useCallback(() => {
    if (!dateInput.trim()) {
      setError2("请输入日期时间");
      setDateResult("");
      return;
    }
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) throw new Error("无效日期");
      const seconds = Math.floor(date.getTime() / 1000);
      const ms = date.getTime();
      setDateResult(`秒级时间戳: ${seconds}\n毫秒级时间戳: ${ms}`);
      setError2("");
    } catch {
      setError2("无效的日期时间格式");
      setDateResult("");
    }
  }, [dateInput]);

  const fillNow = useCallback(() => {
    setTsInput(currentTs.toString());
  }, [currentTs]);

  const fillNowDate = useCallback(() => {
    setDateInput(formatDate(new Date()));
  }, []);

  return (
    <ToolLayout
      title="时间戳转换"
      description="Unix 时间戳与日期时间互相转换"
    >
      {/* Current timestamp */}
      <div className="p-4 bg-dark-900 border border-dark-700 rounded-lg flex flex-wrap items-center gap-4">
        <span className="text-dark-400 text-sm">当前时间戳:</span>
        <span className="text-accent font-mono text-lg font-bold">
          {currentTs}
        </span>
        <CopyButton text={currentTs.toString()} />
      </div>

      {/* Timestamp to date */}
      <div className="p-6 bg-dark-900 border border-dark-700 rounded-xl space-y-4">
        <h2 className="text-white font-semibold">时间戳 → 日期</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            className="tool-input flex-1 min-w-[200px]"
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            placeholder="输入时间戳，如 1700000000"
          />
          <select
            value={tsUnit}
            onChange={(e) => setTsUnit(e.target.value as "s" | "ms")}
            className="bg-dark-800 border border-dark-700 rounded-lg px-3 text-sm text-dark-200"
          >
            <option value="s">秒 (s)</option>
            <option value="ms">毫秒 (ms)</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={tsToDate} className="tool-btn-primary">
            转换
          </button>
          <button onClick={fillNow} className="tool-btn-secondary">
            填入当前时间
          </button>
        </div>
        {error1 && (
          <div className="text-red-400 text-sm">{error1}</div>
        )}
        {tsResult && (
          <div className="flex items-start gap-2">
            <pre className="flex-1 p-3 bg-dark-800 rounded-lg text-dark-200 text-sm font-mono whitespace-pre-wrap">
              {tsResult}
            </pre>
            <CopyButton text={tsResult} />
          </div>
        )}
      </div>

      {/* Date to timestamp */}
      <div className="p-6 bg-dark-900 border border-dark-700 rounded-xl space-y-4">
        <h2 className="text-white font-semibold">日期 → 时间戳</h2>
        <input
          type="text"
          className="tool-input"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          placeholder="如 2024-01-01 12:00:00 或 2024-01-01T12:00:00Z"
        />
        <div className="flex gap-3">
          <button onClick={dateToTs} className="tool-btn-primary">
            转换
          </button>
          <button onClick={fillNowDate} className="tool-btn-secondary">
            填入当前时间
          </button>
        </div>
        {error2 && (
          <div className="text-red-400 text-sm">{error2}</div>
        )}
        {dateResult && (
          <div className="flex items-start gap-2">
            <pre className="flex-1 p-3 bg-dark-800 rounded-lg text-dark-200 text-sm font-mono whitespace-pre-wrap">
              {dateResult}
            </pre>
            <CopyButton text={dateResult} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
