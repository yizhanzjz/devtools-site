'use client';

import { useMemo } from 'react';
import ToolLayout from '@/components/ToolLayout';
// @ts-expect-error lunar-javascript has no type declarations
import { Lunar, Solar } from 'lunar-javascript';

interface CountdownEvent {
  icon: string;
  name: string;
  date: Date;
  dateLabel: string;
  isFuture: boolean;
  daysAway: number;
}

/** Get the Nth weekday of a given month/year. weekday: 0=Sun, 4=Thu, etc. n: 1-based */
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month - 1, 1);
  let firstWeekday = first.getDay();
  let day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7;
  return new Date(year, month - 1, day);
}

/** Convert a lunar date to solar Date. Finds the nearest upcoming occurrence (this year or next). */
function getNextLunarDate(lunarMonth: number, lunarDay: number, today: Date): { date: Date; label: string } {
  const thisYear = today.getFullYear();

  for (let y = thisYear; y <= thisYear + 1; y++) {
    try {
      const lunar = Lunar.fromYmd(y, lunarMonth, lunarDay);
      const solar: { getYear: () => number; getMonth: () => number; getDay: () => number } = lunar.getSolar();
      const d = new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
      if (d >= new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        const label = `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`;
        return { date: d, label };
      }
    } catch {
      // If the lunar day doesn't exist (e.g. 12-30 in some years), try 12-29
      if (lunarMonth === 12 && lunarDay === 30) {
        return getNextLunarDate(12, 29, today);
      }
    }
  }
  // Fallback
  return { date: today, label: '' };
}

/** Get the next occurrence of a fixed solar date */
function getNextSolarDate(month: number, day: number, today: Date): { date: Date; label: string } {
  const thisYear = today.getFullYear();
  let d = new Date(thisYear, month - 1, day);
  if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    d = new Date(thisYear + 1, month - 1, day);
  }
  const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { date: d, label };
}

/** Get next Thanksgiving (4th Thursday of November) */
function getNextThanksgiving(today: Date): { date: Date; label: string } {
  const thisYear = today.getFullYear();
  let d = getNthWeekdayOfMonth(thisYear, 11, 4, 4);
  if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    d = getNthWeekdayOfMonth(thisYear + 1, 11, 4, 4);
  }
  const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { date: d, label };
}

/** Get next Mother's Day (2nd Sunday of May) */
function getNextMothersDay(today: Date): { date: Date; label: string } {
  const thisYear = today.getFullYear();
  let d = getNthWeekdayOfMonth(thisYear, 5, 0, 2);
  if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    d = getNthWeekdayOfMonth(thisYear + 1, 5, 0, 2);
  }
  const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { date: d, label };
}

/** Get next Father's Day (3rd Sunday of June) */
function getNextFathersDay(today: Date): { date: Date; label: string } {
  const thisYear = today.getFullYear();
  let d = getNthWeekdayOfMonth(thisYear, 6, 0, 3);
  if (d < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    d = getNthWeekdayOfMonth(thisYear + 1, 6, 0, 3);
  }
  const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { date: d, label };
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const aStart = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bStart = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bStart.getTime() - aStart.getTime()) / msPerDay);
}

function buildFestivalEvents(today: Date): CountdownEvent[] {
  const events: CountdownEvent[] = [];

  // Fixed solar festivals
  const solarFestivals: [string, string, number, number][] = [
    ['🎄', '圣诞节', 12, 25],
    ['🎆', '元旦 / 阳历新年', 1, 1],
    ['🪦', '清明节', 4, 5],
    ['🇨🇳', '国庆节', 10, 1],
    ['💕', '情人节', 2, 14],
    ['🎃', '万圣节', 10, 31],
    ['👷', '劳动节', 5, 1],
    ['🎒', '儿童节', 6, 1],
    ['🌍', '地球日', 4, 22],
    ['🎵', '世界音乐日', 6, 21],
  ];

  for (const [icon, name, month, day] of solarFestivals) {
    const { date, label } = getNextSolarDate(month, day, today);
    const days = daysBetween(today, date);
    events.push({ icon, name, date, dateLabel: label, isFuture: true, daysAway: days });
  }

  // Lunar festivals
  const lunarFestivals: [string, string, number, number][] = [
    ['🧧', '春节 / 农历新年', 1, 1],
    ['🏮', '元宵节', 1, 15],
    ['🐲', '端午节', 5, 5],
    ['🌕', '中秋节', 8, 15],
    ['💑', '七夕', 7, 7],
    ['🎋', '重阳节', 9, 9],
    ['🥮', '腊八节', 12, 8],
    ['🧹', '小年', 12, 23],
    ['🎊', '除夕', 12, 30], // Will fallback to 29 if 30 doesn't exist
  ];

  for (const [icon, name, month, day] of lunarFestivals) {
    const { date, label } = getNextLunarDate(month, day, today);
    const days = daysBetween(today, date);
    events.push({ icon, name, date, dateLabel: label, isFuture: true, daysAway: days });
  }

  // Variable-date festivals
  const thanksgiving = getNextThanksgiving(today);
  events.push({
    icon: '🦃', name: '感恩节', date: thanksgiving.date,
    dateLabel: thanksgiving.label, isFuture: true,
    daysAway: daysBetween(today, thanksgiving.date),
  });

  const mothersDay = getNextMothersDay(today);
  events.push({
    icon: '👩', name: '母亲节', date: mothersDay.date,
    dateLabel: mothersDay.label, isFuture: true,
    daysAway: daysBetween(today, mothersDay.date),
  });

  const fathersDay = getNextFathersDay(today);
  events.push({
    icon: '👨', name: '父亲节', date: fathersDay.date,
    dateLabel: fathersDay.label, isFuture: true,
    daysAway: daysBetween(today, fathersDay.date),
  });

  // Sort by days away
  events.sort((a, b) => a.daysAway - b.daysAway);
  return events;
}

function buildTechEvents(today: Date): CountdownEvent[] {
  const techDates: [string, string, string][] = [
    ['📱', 'iPhone 发布', '2007-01-09'],
    ['🤖', 'ChatGPT 发布', '2022-11-30'],
    ['🌐', '万维网诞生', '1991-08-06'],
    ['🍎', '苹果公司成立', '1976-04-01'],
    ['🪟', 'Windows 1.0 发布', '1985-11-20'],
    ['📘', 'Facebook 上线', '2004-02-04'],
    ['🐧', 'Linux 发布', '1991-09-17'],
    ['🚀', 'SpaceX 首次载人飞行', '2020-05-30'],
    ['🌙', '人类首次登月', '1969-07-20'],
    ['💡', '第一封电子邮件', '1971-10-29'],
    ['📺', 'YouTube 上线', '2005-02-14'],
    ['🐦', 'Twitter 上线', '2006-07-15'],
    ['📸', 'Instagram 上线', '2010-10-06'],
    ['🎮', '任天堂 Switch 发售', '2017-03-03'],
    ['🔍', 'Google 成立', '1998-09-04'],
  ];

  const events: CountdownEvent[] = [];
  for (const [icon, name, dateStr] of techDates) {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const days = daysBetween(date, today);
    events.push({ icon, name, date, dateLabel: dateStr, isFuture: false, daysAway: days });
  }

  // Sort by days (most recent first → smallest days away first)
  events.sort((a, b) => a.daysAway - b.daysAway);
  return events;
}

// Colors for festival cards (future events)
const FUTURE_COLORS = [
  'from-blue-900/40 to-blue-800/20 border-blue-700/50',
  'from-purple-900/40 to-purple-800/20 border-purple-700/50',
  'from-indigo-900/40 to-indigo-800/20 border-indigo-700/50',
  'from-violet-900/40 to-violet-800/20 border-violet-700/50',
  'from-cyan-900/40 to-cyan-800/20 border-cyan-700/50',
  'from-sky-900/40 to-sky-800/20 border-sky-700/50',
];

// Colors for tech history cards (past events)
const PAST_COLORS = [
  'from-green-900/40 to-green-800/20 border-green-700/50',
  'from-emerald-900/40 to-emerald-800/20 border-emerald-700/50',
  'from-teal-900/40 to-teal-800/20 border-teal-700/50',
  'from-gray-800/40 to-gray-700/20 border-gray-600/50',
  'from-slate-800/40 to-slate-700/20 border-slate-600/50',
  'from-zinc-800/40 to-zinc-700/20 border-zinc-600/50',
];

export default function CountdownPage() {
  const today = useMemo(() => new Date(), []);
  const festivals = useMemo(() => buildFestivalEvents(today), [today]);
  const techEvents = useMemo(() => buildTechEvents(today), [today]);

  return (
    <ToolLayout title="倒计时" description="距离各种重要日期的倒计时和已过天数">
      {/* Festival countdown */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🎉 节日倒计时
          <span className="text-dark-500 text-sm font-normal">（距离最近一次）</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {festivals.map((event, i) => (
            <div
              key={event.name}
              className={`p-4 rounded-xl border bg-gradient-to-br ${FUTURE_COLORS[i % FUTURE_COLORS.length]} transition-transform hover:scale-[1.02]`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{event.icon}</span>
                  <span className="text-white font-semibold text-sm">{event.name}</span>
                </div>
              </div>
              <div className="text-dark-400 text-xs mb-2">{event.dateLabel}</div>
              <div className="text-right">
                {event.daysAway === 0 ? (
                  <span className="text-yellow-400 font-bold text-lg">🎉 就是今天！</span>
                ) : (
                  <>
                    <span className="text-blue-300 text-xs">还有 </span>
                    <span className="text-white font-bold text-2xl font-mono">{event.daysAway}</span>
                    <span className="text-blue-300 text-xs"> 天</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech milestones */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          💻 科技纪念日
          <span className="text-dark-500 text-sm font-normal">（已过天数）</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {techEvents.map((event, i) => (
            <div
              key={event.name}
              className={`p-4 rounded-xl border bg-gradient-to-br ${PAST_COLORS[i % PAST_COLORS.length]} transition-transform hover:scale-[1.02]`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{event.icon}</span>
                  <span className="text-white font-semibold text-sm">{event.name}</span>
                </div>
              </div>
              <div className="text-dark-400 text-xs mb-2">{event.dateLabel}</div>
              <div className="text-right">
                <span className="text-green-300 text-xs">已过 </span>
                <span className="text-white font-bold text-2xl font-mono">{event.daysAway.toLocaleString()}</span>
                <span className="text-green-300 text-xs"> 天</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
