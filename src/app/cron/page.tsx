"use client";

import { useState, useCallback, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

interface Preset {
  name: string;
  expression: string;
  description: string;
}

const presets: Preset[] = [
  { name: "每天 9:00", expression: "0 9 * * *", description: "每天上午 9 点整" },
  { name: "每天 18:30", expression: "30 18 * * *", description: "每天下午 6 点 30 分" },
  { name: "每周一 9:00", expression: "0 9 * * 1", description: "每周一上午 9 点" },
  { name: "每月 1 号", expression: "0 0 1 * *", description: "每月 1 号零点" },
  { name: "每 5 分钟", expression: "*/5 * * * *", description: "每 5 分钟执行一次" },
  { name: "每小时整点", expression: "0 * * * *", description: "每小时的 0 分执行" },
  { name: "工作日 9:00", expression: "0 9 * * 1-5", description: "周一到周五上午 9 点" },
  { name: "每天零点", expression: "0 0 * * *", description: "每天凌晨 0 点整" },
];

interface CronParts {
  second?: string;
  minute: string;
  hour: string;
  day: string;
  month: string;
  weekday: string;
}

function parseCron(expression: string): CronParts | null {
  const parts = expression.trim().split(/\s+/);
  
  if (parts.length === 5) {
    return {
      minute: parts[0],
      hour: parts[1],
      day: parts[2],
      month: parts[3],
      weekday: parts[4],
    };
  } else if (parts.length === 6) {
    return {
      second: parts[0],
      minute: parts[1],
      hour: parts[2],
      day: parts[3],
      month: parts[4],
      weekday: parts[5],
    };
  }
  
  return null;
}

function describeCronPart(value: string, type: string): string {
  if (value === "*") {
    return `每${type}`;
  }
  
  if (value.includes("/")) {
    const [range, step] = value.split("/");
    if (range === "*") {
      return `每 ${step} ${type}`;
    }
    return `从 ${range} 开始，每 ${step} ${type}`;
  }
  
  if (value.includes("-")) {
    const [start, end] = value.split("-");
    return `${start} 到 ${end} ${type}`;
  }
  
  if (value.includes(",")) {
    const values = value.split(",");
    return `${values.join("、")} ${type}`;
  }
  
  return `${value} ${type}`;
}

function describeCron(parts: CronParts): string {
  const descriptions: string[] = [];
  
  // 秒
  if (parts.second && parts.second !== "0" && parts.second !== "*") {
    descriptions.push(describeCronPart(parts.second, "秒"));
  }
  
  // 分
  if (parts.minute !== "*") {
    descriptions.push(describeCronPart(parts.minute, "分"));
  }
  
  // 时
  if (parts.hour !== "*") {
    descriptions.push(describeCronPart(parts.hour, "时"));
  }
  
  // 日
  if (parts.day !== "*" && parts.day !== "?") {
    descriptions.push(describeCronPart(parts.day, "日"));
  }
  
  // 月
  if (parts.month !== "*") {
    const monthMap: Record<string, string> = {
      "1": "1月", "2": "2月", "3": "3月", "4": "4月",
      "5": "5月", "6": "6月", "7": "7月", "8": "8月",
      "9": "9月", "10": "10月", "11": "11月", "12": "12月",
    };
    const monthDesc = parts.month.split(",").map(m => monthMap[m] || m).join("、");
    descriptions.push(monthDesc);
  }
  
  // 星期
  if (parts.weekday !== "*" && parts.weekday !== "?") {
    const weekMap: Record<string, string> = {
      "0": "周日", "1": "周一", "2": "周二", "3": "周三",
      "4": "周四", "5": "周五", "6": "周六", "7": "周日",
    };
    
    if (parts.weekday.includes("-")) {
      const [start, end] = parts.weekday.split("-");
      descriptions.push(`${weekMap[start]} 到 ${weekMap[end]}`);
    } else if (parts.weekday.includes(",")) {
      const days = parts.weekday.split(",").map(d => weekMap[d] || d).join("、");
      descriptions.push(days);
    } else {
      descriptions.push(weekMap[parts.weekday] || parts.weekday);
    }
  }
  
  if (descriptions.length === 0) {
    return "每秒执行";
  }
  
  return descriptions.join("，");
}

function getNextExecutions(expression: string, count: number = 10): Date[] {
  const parts = parseCron(expression);
  if (!parts) return [];
  
  const results: Date[] = [];
  const now = new Date();
  let current = new Date(now);
  
  // 简化版实现：仅支持基础 cron 表达式
  for (let i = 0; i < 1000 && results.length < count; i++) {
    current = new Date(current.getTime() + 60000); // 每次增加 1 分钟
    
    const minute = current.getMinutes();
    const hour = current.getHours();
    const day = current.getDate();
    const month = current.getMonth() + 1;
    const weekday = current.getDay();
    
    // 检查分钟
    if (!matchesCronPart(parts.minute, minute)) continue;
    
    // 检查小时
    if (!matchesCronPart(parts.hour, hour)) continue;
    
    // 检查日期
    if (parts.day !== "*" && !matchesCronPart(parts.day, day)) continue;
    
    // 检查月份
    if (parts.month !== "*" && !matchesCronPart(parts.month, month)) continue;
    
    // 检查星期
    if (parts.weekday !== "*" && !matchesCronPart(parts.weekday, weekday)) continue;
    
    results.push(new Date(current));
  }
  
  return results;
}

function matchesCronPart(cronPart: string, value: number): boolean {
  if (cronPart === "*" || cronPart === "?") return true;
  
  if (cronPart.includes("/")) {
    const [range, step] = cronPart.split("/");
    const stepNum = parseInt(step);
    if (range === "*") {
      return value % stepNum === 0;
    }
  }
  
  if (cronPart.includes("-")) {
    const [start, end] = cronPart.split("-").map(Number);
    return value >= start && value <= end;
  }
  
  if (cronPart.includes(",")) {
    const values = cronPart.split(",").map(Number);
    return values.includes(value);
  }
  
  return parseInt(cronPart) === value;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const weekday = weekdays[date.getDay()];
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second} ${weekday}`;
}

export default function CronPage() {
  const [expression, setExpression] = useState("");
  const [error, setError] = useState("");
  
  const description = useMemo(() => {
    if (!expression.trim()) return "";
    
    const parts = parseCron(expression);
    if (!parts) {
      setError("Cron 表达式格式错误（需要 5 位或 6 位）");
      return "";
    }
    
    setError("");
    return describeCron(parts);
  }, [expression]);
  
  const nextExecutions = useMemo(() => {
    if (!expression.trim() || error) return [];
    return getNextExecutions(expression, 10);
  }, [expression, error]);
  
  const loadPreset = useCallback((preset: Preset) => {
    setExpression(preset.expression);
  }, []);
  
  return (
    <ToolLayout
      title="Cron 表达式解析器"
      description="解析和验证 Cron 表达式，显示执行时间"
    >
      <div>
        <label className="block text-sm text-dark-300 mb-2">
          Cron 表达式
        </label>
        <input
          type="text"
          className="tool-input font-mono"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="例如：0 9 * * *"
          spellCheck={false}
        />
        <p className="text-xs text-dark-500 mt-1">
          格式: 分 时 日 月 星期 (5位) 或 秒 分 时 日 月 星期 (6位)
        </p>
      </div>
      
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {description && !error && (
        <div className="p-4 bg-dark-900 border border-dark-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-dark-300">执行规则</span>
            <CopyButton text={description} />
          </div>
          <p className="text-accent text-base">{description}</p>
        </div>
      )}
      
      {nextExecutions.length > 0 && (
        <div>
          <label className="block text-sm text-dark-300 mb-2">
            接下来 10 次执行时间
          </label>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {nextExecutions.map((date, idx) => (
              <div
                key={idx}
                className="p-3 bg-dark-900 border border-dark-700 rounded-lg flex items-center justify-between group hover:border-accent/50 transition-colors"
              >
                <span className="text-sm text-dark-200 font-mono">
                  {formatDate(date)}
                </span>
                <CopyButton text={formatDate(date)} />
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-sm text-dark-300 mb-2">常用 Cron</label>
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
              <div className="text-xs text-dark-500 mt-1 font-mono">
                {preset.expression}
              </div>
              <div className="text-xs text-dark-600 mt-1">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
