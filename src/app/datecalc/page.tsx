'use client';

import { useState, useMemo } from 'react';
import ToolLayout from '@/components/ToolLayout';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface DateDiff {
  totalDays: number;
  weeks: number;
  weekDays: number;
  years: number;
  months: number;
  monthDays: number;
  onlyMonths: number;
  onlyMonthDays: number;
  hours: number;
  minutes: number;
  seconds: number;
  isNegative: boolean;
}

function calcDiff(startStr: string, endStr: string): DateDiff | null {
  if (!startStr || !endStr) return null;
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  const isNegative = end < start;
  const [a, b] = isNegative ? [end, start] : [start, end];

  const totalMs = b.getTime() - a.getTime();
  const totalDays = Math.round(totalMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const weekDays = totalDays % 7;

  // Calculate years, months, days
  let years = b.getFullYear() - a.getFullYear();
  let months = b.getMonth() - a.getMonth();
  let days = b.getDate() - a.getDate();

  if (days < 0) {
    months -= 1;
    // Days in previous month of b
    const prevMonth = new Date(b.getFullYear(), b.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // Only months + days (no year)
  const onlyMonths = years * 12 + months;
  const onlyMonthDays = days;

  const hours = totalDays * 24;
  const minutes = hours * 60;
  const seconds = minutes * 60;

  return {
    totalDays,
    weeks,
    weekDays,
    years,
    months,
    monthDays: days,
    onlyMonths,
    onlyMonthDays,
    hours,
    minutes,
    seconds,
    isNegative,
  };
}

export default function DateCalcPage() {
  const todayStr = formatDate(new Date());
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState('');

  const diff = useMemo(() => calcDiff(startDate, endDate), [startDate, endDate]);

  const sign = diff?.isNegative ? '-' : '';

  return (
    <ToolLayout title="日期计算器" description="计算两个日期之间的差值，支持多种格式展示">
      {/* Input section */}
      <div className="p-6 bg-dark-900 border border-dark-700 rounded-xl space-y-4">
        <h2 className="text-white font-semibold">选择日期</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-dark-400 text-sm">开始日期</label>
            <input
              type="date"
              className="tool-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-dark-400 text-sm">结束日期</label>
            <input
              type="date"
              className="tool-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEndDate(todayStr)}
            className="tool-btn-secondary text-xs"
          >
            结束日期设为今天
          </button>
          <button
            onClick={() => {
              const t = startDate;
              setStartDate(endDate);
              setEndDate(t);
            }}
            className="tool-btn-secondary text-xs"
          >
            交换日期
          </button>
        </div>
      </div>

      {/* Results section */}
      {!endDate ? (
        <div className="p-8 bg-dark-900 border border-dark-700 rounded-xl text-center text-dark-500">
          请选择结束日期以查看计算结果
        </div>
      ) : !diff ? (
        <div className="p-8 bg-dark-900 border border-dark-700 rounded-xl text-center text-red-400">
          日期格式无效，请重新选择
        </div>
      ) : (
        <div className="space-y-4">
          {diff.isNegative && (
            <div className="px-4 py-2 bg-yellow-900/30 border border-yellow-700/50 rounded-lg text-yellow-400 text-sm">
              ⚠️ 结束日期早于开始日期，结果为负值
            </div>
          )}

          {/* Main result */}
          <div className="p-6 bg-dark-900 border border-dark-700 rounded-xl text-center">
            <div className="text-dark-400 text-sm mb-2">总天数</div>
            <div className="text-4xl sm:text-5xl font-bold text-accent font-mono">
              {sign}{diff.totalDays.toLocaleString()}
            </div>
            <div className="text-dark-400 text-sm mt-2">天</div>
          </div>

          {/* Detailed results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard
              label="周 + 天"
              value={`${sign}${diff.weeks} 周 ${diff.weekDays} 天`}
              icon="📅"
            />
            <ResultCard
              label="月 + 天"
              value={`${sign}${diff.onlyMonths} 个月 ${diff.onlyMonthDays} 天`}
              icon="📆"
            />
            <ResultCard
              label="年 + 月 + 天"
              value={`${sign}${diff.years} 年 ${diff.months} 个月 ${diff.monthDays} 天`}
              icon="🗓️"
            />
            <ResultCard
              label="小时"
              value={`${sign}${diff.hours.toLocaleString()} 小时`}
              icon="⏰"
            />
            <ResultCard
              label="分钟"
              value={`${sign}${diff.minutes.toLocaleString()} 分钟`}
              icon="⏱️"
            />
            <ResultCard
              label="秒"
              value={`${sign}${diff.seconds.toLocaleString()} 秒`}
              icon="⏲️"
            />
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

function ResultCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="p-4 bg-dark-900 border border-dark-700 rounded-xl flex items-center gap-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-dark-500 text-xs">{label}</div>
        <div className="text-white font-semibold font-mono text-lg">{value}</div>
      </div>
    </div>
  );
}
