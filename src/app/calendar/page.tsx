'use client';

import { useState, useMemo } from 'react';
import ToolLayout from '@/components/ToolLayout';
// @ts-expect-error lunar-javascript has no type declarations
import { Solar, Lunar, HolidayUtil } from 'lunar-javascript';

// Public holidays
const SOLAR_FESTIVALS: Record<string, string> = {
  '1-1': '元旦',
  '2-14': '情人节',
  '3-8': '妇女节',
  '3-12': '植树节',
  '4-1': '愚人节',
  '5-1': '劳动节',
  '5-4': '青年节',
  '6-1': '儿童节',
  '7-1': '建党节',
  '8-1': '建军节',
  '9-10': '教师节',
  '10-1': '国庆节',
  '12-24': '平安夜',
  '12-25': '圣诞节',
};

const LUNAR_FESTIVALS: Record<string, string> = {
  '1-1': '春节',
  '1-15': '元宵节',
  '5-5': '端午节',
  '7-7': '七夕',
  '7-15': '中元节',
  '8-15': '中秋节',
  '9-9': '重阳节',
  '12-8': '腊八节',
  '12-30': '除夕',
};

interface DayInfo {
  day: number;
  month: number;
  year: number;
  lunarDay: string;
  lunarMonth: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  solarFestival: string;
  lunarFestival: string;
  isHoliday: boolean;
  isWorkday: boolean;
  term: string;
}

function getDayInfo(
  year: number,
  month: number,
  day: number,
  currentMonth: number,
  today: { y: number; m: number; d: number }
): DayInfo {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const lunarDay = lunar.getDayInChinese();
  const lunarMonth = lunar.getMonthInChinese() + '月';
  const sKey = `${month}-${day}`;
  const lKey = `${lunar.getMonth()}-${lunar.getDay()}`;

  // Check for official holiday/workday adjustments
  let isHoliday = false;
  let isWorkday = false;
  try {
    const h = HolidayUtil.getHoliday(year, month, day);
    if (h) {
      isHoliday = !h.isWork();
      isWorkday = h.isWork();
    }
  } catch {
    // HolidayUtil may not have data for this year
  }

  const term = lunar.getJieQi() || '';

  return {
    day,
    month,
    year,
    lunarDay,
    lunarMonth,
    isCurrentMonth: month === currentMonth,
    isToday: year === today.y && month === today.m && day === today.d,
    solarFestival: SOLAR_FESTIVALS[sKey] || '',
    lunarFestival: LUNAR_FESTIVALS[lKey] || '',
    isHoliday,
    isWorkday,
    term,
  };
}

function getCalendarDays(year: number, month: number): DayInfo[][] {
  const now = new Date();
  const today = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };

  // First day of month
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();

  const days: DayInfo[] = [];

  // Previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    days.push(getDayInfo(prevYear, prevMonth, d, month, today));
  }

  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(getDayInfo(year, month, d, month, today));
  }

  // Next month
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const remaining = 42 - days.length; // 6 rows
  for (let d = 1; d <= remaining; d++) {
    days.push(getDayInfo(nextYear, nextMonth, d, month, today));
  }

  // Chunk into weeks
  const weeks: DayInfo[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const weeks = useMemo(() => getCalendarDays(year, month), [year, month]);

  // Lunar month/year for header
  const lunarInfo = useMemo(() => {
    const solar = Solar.fromYmd(year, month, 1);
    const lunar = solar.getLunar();
    return `${lunar.getYearInGanZhi()}年（${lunar.getYearShengXiao()}年）`;
  }, [year, month]);

  const goToPrevMonth = () => {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  };

  const goToNextMonth = () => {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  };

  const goToToday = () => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth() + 1);
  };

  const getLunarLabel = (d: DayInfo): string => {
    if (d.lunarFestival) return d.lunarFestival;
    if (d.solarFestival) return d.solarFestival;
    if (d.term) return d.term;
    if (d.lunarDay === '初一') return d.lunarMonth;
    return d.lunarDay;
  };

  const getLabelColor = (d: DayInfo): string => {
    if (d.lunarFestival || d.solarFestival) return 'text-red-400';
    if (d.term) return 'text-green-400';
    return 'text-dark-500';
  };

  return (
    <ToolLayout title="日历" description="公历农历对照日历，显示农历节日和公历节日">
      {/* Header with navigation */}
      <div className="p-4 bg-dark-900 border border-dark-700 rounded-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={goToPrevMonth} className="tool-btn-secondary !px-3 !py-1">◀</button>
          <span className="text-white font-bold text-lg">
            {year}年{month}月
          </span>
          <button onClick={goToNextMonth} className="tool-btn-secondary !px-3 !py-1">▶</button>
          <button onClick={goToToday} className="tool-btn-secondary text-xs !px-2 !py-1">
            今天
          </button>
        </div>
        <span className="text-dark-400 text-sm">{lunarInfo}</span>
      </div>

      {/* Calendar grid */}
      <div className="bg-dark-900 border border-dark-700 rounded-xl overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={`py-2 text-center text-sm font-medium border-b border-dark-700 ${
                i === 0 || i === 6 ? 'text-red-400/70' : 'text-dark-400'
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7">
            {week.map((d, di) => {
              const dayOfWeek = di; // 0=Sun, 6=Sat
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              return (
                <div
                  key={`${d.year}-${d.month}-${d.day}`}
                  className={`relative p-1.5 sm:p-2 min-h-[60px] sm:min-h-[72px] border-b border-r border-dark-700/50 transition-colors ${
                    d.isCurrentMonth ? '' : 'opacity-30'
                  } ${d.isToday ? 'bg-accent/10' : 'hover:bg-dark-800/50'}`}
                >
                  {/* Holiday/Workday badge */}
                  {d.isHoliday && (
                    <span className="absolute top-0.5 right-0.5 text-[9px] text-green-400 font-bold">休</span>
                  )}
                  {d.isWorkday && (
                    <span className="absolute top-0.5 right-0.5 text-[9px] text-red-400 font-bold">班</span>
                  )}
                  {/* Solar date */}
                  <div
                    className={`text-center font-semibold text-sm sm:text-base ${
                      d.isToday
                        ? 'text-accent'
                        : isWeekend
                          ? 'text-red-400/80'
                          : 'text-dark-200'
                    }`}
                  >
                    {d.isToday ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-accent text-white text-xs sm:text-sm">
                        {d.day}
                      </span>
                    ) : (
                      d.day
                    )}
                  </div>
                  {/* Lunar date */}
                  <div className={`text-center text-[10px] sm:text-xs mt-0.5 leading-tight ${getLabelColor(d)}`}>
                    {getLunarLabel(d)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 px-2 text-xs text-dark-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-accent/30"></span> 今天
        </span>
        <span className="flex items-center gap-1">
          <span className="text-red-400 font-bold">休</span> 法定假日
        </span>
        <span className="flex items-center gap-1">
          <span className="text-red-400 font-bold">班</span> 调休上班
        </span>
        <span className="flex items-center gap-1">
          <span className="text-red-400">红色</span> 节日
        </span>
        <span className="flex items-center gap-1">
          <span className="text-green-400">绿色</span> 节气
        </span>
      </div>
    </ToolLayout>
  );
}
