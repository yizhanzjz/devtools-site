'use client';

import { useState, useEffect, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';

interface Rates {
  [key: string]: number;
}

const CURRENCIES: { code: string; name: string; symbol: string }[] = [
  { code: 'USD', name: '美元', symbol: '$' },
  { code: 'EUR', name: '欧元', symbol: '€' },
  { code: 'GBP', name: '英镑', symbol: '£' },
  { code: 'JPY', name: '日元', symbol: '¥' },
  { code: 'HKD', name: '港币', symbol: 'HK$' },
  { code: 'KRW', name: '韩元', symbol: '₩' },
  { code: 'SGD', name: '新加坡元', symbol: 'S$' },
  { code: 'AUD', name: '澳元', symbol: 'A$' },
  { code: 'CAD', name: '加元', symbol: 'C$' },
  { code: 'THB', name: '泰铢', symbol: '฿' },
  { code: 'MYR', name: '马来西亚林吉特', symbol: 'RM' },
  { code: 'TWD', name: '新台币', symbol: 'NT$' },
  { code: 'INR', name: '印度卢比', symbol: '₹' },
  { code: 'RUB', name: '俄罗斯卢布', symbol: '₽' },
];

export default function CurrencyPage() {
  const [rates, setRates] = useState<Rates>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateTime, setUpdateTime] = useState('');
  const [amount, setAmount] = useState('100');
  const [direction, setDirection] = useState<'fromCNY' | 'toCNY'>('fromCNY');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/currency');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setRates(data.rates || {});
      setUpdateTime(data.date || new Date().toISOString().slice(0, 10));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '未知错误';
      setError('获取汇率失败：' + msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const numAmount = parseFloat(amount) || 0;

  const convertFromCNY = (code: string): string => {
    if (!rates[code]) return '-';
    return (numAmount * rates[code]).toFixed(code === 'JPY' || code === 'KRW' ? 0 : 2);
  };

  const convertToCNY = (): string => {
    if (!rates[selectedCurrency]) return '-';
    return (numAmount / rates[selectedCurrency]).toFixed(2);
  };

  return (
    <ToolLayout title="汇率换算" description="人民币与主要货币实时汇率换算，支持双向转换">
      {/* Direction toggle + update info */}
      <div className="p-4 bg-dark-900 border border-dark-700 rounded-lg flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setDirection('fromCNY')}
            className={direction === 'fromCNY' ? 'tool-btn-primary' : 'tool-btn-secondary'}
          >
            人民币 → 外币
          </button>
          <button
            onClick={() => setDirection('toCNY')}
            className={direction === 'toCNY' ? 'tool-btn-primary' : 'tool-btn-secondary'}
          >
            外币 → 人民币
          </button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {updateTime && (
            <span className="text-dark-400 text-xs">汇率更新：{updateTime}</span>
          )}
          <button
            onClick={fetchRates}
            disabled={loading}
            className="tool-btn-secondary text-xs !px-2 !py-1"
          >
            {loading ? '刷新中…' : '刷新'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {direction === 'fromCNY' ? (
        <div className="p-6 bg-dark-900 border border-dark-700 rounded-xl space-y-4">
          <h2 className="text-white font-semibold">人民币 → 各币种</h2>
          <div className="flex items-center gap-3">
            <span className="text-dark-400 text-sm shrink-0">¥ CNY</span>
            <input
              type="number"
              className="tool-input flex-1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="输入人民币金额"
              min="0"
              step="any"
            />
          </div>
          {loading ? (
            <div className="text-dark-400 text-sm py-8 text-center">加载汇率中…</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CURRENCIES.map((c) => (
                <div
                  key={c.code}
                  className="flex items-center justify-between p-3 bg-dark-800 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-accent font-mono text-sm w-6 text-center">{c.symbol}</span>
                    <span className="text-dark-300 text-sm">
                      {c.code} <span className="text-dark-500">({c.name})</span>
                    </span>
                  </div>
                  <span className="text-white font-mono font-semibold">
                    {convertFromCNY(c.code)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 bg-dark-900 border border-dark-700 rounded-xl space-y-4">
          <h2 className="text-white font-semibold">外币 → 人民币</h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-3 text-sm text-dark-200"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} ({c.name})
                </option>
              ))}
            </select>
            <input
              type="number"
              className="tool-input flex-1 min-w-[160px]"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="输入外币金额"
              min="0"
              step="any"
            />
          </div>
          {loading ? (
            <div className="text-dark-400 text-sm py-8 text-center">加载汇率中…</div>
          ) : (
            <div className="p-4 bg-dark-800 rounded-lg flex items-center justify-between">
              <span className="text-dark-300 text-sm">等值人民币</span>
              <span className="text-accent text-2xl font-mono font-bold">
                ¥ {convertToCNY()}
              </span>
            </div>
          )}
          {!loading && rates[selectedCurrency] && (
            <div className="text-dark-500 text-xs">
              汇率：1 CNY = {rates[selectedCurrency]} {selectedCurrency}（即 1 {selectedCurrency} = {(1 / rates[selectedCurrency]).toFixed(4)} CNY）
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
