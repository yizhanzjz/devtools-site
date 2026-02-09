'use client';

import { useState, useEffect, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';

interface StockData {
  symbol: string;
  name: string;
  flag: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  error?: string;
}

interface ApiResponse {
  data: StockData[];
  time: string;
  source: string;
}

function formatNum(n: number | null | undefined, decimals = 2): string {
  if (n === null || n === undefined || isNaN(n)) return '-';
  return n.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export default function StockPage() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    setFetchError('');

    try {
      const res = await fetch(`/api/stock?_=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();
      setStocks(json.data);
      setLastUpdate(json.time);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : '未知错误');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <ToolLayout title="股市信息" description="全球主要股市指数实时行情 · 服务端聚合数据，无跨域问题">
      {/* Header */}
      <div className="p-4 bg-dark-900 border border-dark-700 rounded-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-dark-400 text-sm">
            🔴 涨（红色）/ 🟢 跌（绿色）· 中国市场习惯
          </span>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <span className="text-dark-500 text-xs">更新于 {lastUpdate}</span>
          )}
          <button
            onClick={fetchAll}
            disabled={refreshing}
            className="tool-btn-primary text-xs !px-3 !py-1.5"
          >
            {refreshing ? '刷新中…' : '🔄 刷新'}
          </button>
        </div>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="p-4 bg-red-900/20 border border-red-800/30 rounded-lg text-red-400 text-sm text-center">
          ⚠️ 请求失败：{fetchError}
        </div>
      )}

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="p-5 bg-dark-900 border border-dark-700 rounded-xl animate-pulse">
              <div className="h-6 bg-dark-800 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-dark-800 rounded mb-2"></div>
              <div className="h-4 bg-dark-800 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        /* Stock grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stocks.map((stock) => (
            <StockCard key={stock.symbol} stock={stock} />
          ))}
        </div>
      )}

      {/* Note */}
      <div className="text-dark-600 text-xs text-center">
        数据来源：新浪财经 + Yahoo Finance（服务端代理）· 仅供参考，不构成投资建议
      </div>
    </ToolLayout>
  );
}

function StockCard({ stock }: { stock: StockData }) {
  if (stock.error) {
    return (
      <div className="p-5 bg-dark-900 border border-dark-700 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{stock.flag}</span>
          <span className="text-white font-semibold">{stock.name}</span>
          <span className="text-dark-600 text-xs">{stock.symbol}</span>
        </div>
        <div className="text-red-400/70 text-sm">⚠️ {stock.error}</div>
      </div>
    );
  }

  const isUp = stock.change >= 0;
  const colorClass = isUp ? 'text-red-400' : 'text-green-400';
  const bgGlow = isUp ? 'border-red-900/30' : 'border-green-900/30';
  const arrow = isUp ? '▲' : '▼';
  const showOHL = stock.open !== 0 || stock.high !== 0 || stock.low !== 0;

  return (
    <div className={`p-5 bg-dark-900 border rounded-xl transition-all hover:scale-[1.01] ${bgGlow}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{stock.flag}</span>
        <span className="text-white font-semibold">{stock.name}</span>
        <span className="text-dark-600 text-xs">{stock.symbol}</span>
      </div>

      <div className="flex items-end gap-3 mb-3">
        <span className={`text-2xl font-bold font-mono ${colorClass}`}>
          {formatNum(stock.price)}
        </span>
        <div className={`text-sm font-mono ${colorClass}`}>
          {arrow} {formatNum(stock.change)} ({formatNum(stock.changePercent)}%)
        </div>
      </div>

      {showOHL && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-dark-500">开盘</span>
            <div className="text-dark-300 font-mono">{formatNum(stock.open)}</div>
          </div>
          <div>
            <span className="text-dark-500">最高</span>
            <div className="text-dark-300 font-mono">{formatNum(stock.high)}</div>
          </div>
          <div>
            <span className="text-dark-500">最低</span>
            <div className="text-dark-300 font-mono">{formatNum(stock.low)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
