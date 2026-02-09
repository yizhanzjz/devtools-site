'use client';

import { useState, useEffect, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';

interface StockIndex {
  symbol: string;
  name: string;
  flag: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  loading: boolean;
  error: string;
}

const INDICES: { symbol: string; name: string; flag: string }[] = [
  { symbol: '000001.SS', name: '上证指数', flag: '🇨🇳' },
  { symbol: '399001.SZ', name: '深证成指', flag: '🇨🇳' },
  { symbol: '399006.SZ', name: '创业板指', flag: '🇨🇳' },
  { symbol: '^HSI', name: '恒生指数', flag: '🇭🇰' },
  { symbol: '^DJI', name: '道琼斯', flag: '🇺🇸' },
  { symbol: '^IXIC', name: '纳斯达克', flag: '🇺🇸' },
  { symbol: '^GSPC', name: '标普500', flag: '🇺🇸' },
  { symbol: '^N225', name: '日经225', flag: '🇯🇵' },
  { symbol: '^FTSE', name: '富时100', flag: '🇬🇧' },
  { symbol: '^GDAXI', name: 'DAX', flag: '🇩🇪' },
];

async function fetchStockData(symbol: string): Promise<{
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
}> {
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`;

  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error('无数据');

  const meta = result.meta;
  const price = meta.regularMarketPrice ?? 0;
  const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
  const change = price - previousClose;
  const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

  // Get OHLC from indicators if available
  const quote = result.indicators?.quote?.[0];
  const lastIdx = quote?.close?.length ? quote.close.length - 1 : 0;

  const open = quote?.open?.[lastIdx] ?? meta.regularMarketPrice ?? 0;
  const high = quote?.high?.[lastIdx] ?? meta.regularMarketPrice ?? 0;
  const low = quote?.low?.[lastIdx] ?? meta.regularMarketPrice ?? 0;

  return { price, change, changePercent, open, high, low };
}

function formatNum(n: number | null, decimals = 2): string {
  if (n === null) return '-';
  return n.toLocaleString('zh-CN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export default function StockPage() {
  const [stocks, setStocks] = useState<StockIndex[]>(
    INDICES.map((idx) => ({
      ...idx,
      price: null,
      change: null,
      changePercent: null,
      open: null,
      high: null,
      low: null,
      loading: true,
      error: '',
    }))
  );
  const [lastUpdate, setLastUpdate] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    setStocks((prev) =>
      prev.map((s) => ({ ...s, loading: true, error: '' }))
    );

    const promises = INDICES.map(async (idx) => {
      try {
        const data = await fetchStockData(idx.symbol);
        return {
          ...idx,
          ...data,
          loading: false,
          error: '',
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : '未知错误';
        return {
          ...idx,
          price: null,
          change: null,
          changePercent: null,
          open: null,
          high: null,
          low: null,
          loading: false,
          error: msg,
        };
      }
    });

    const results = await Promise.all(promises);
    setStocks(results);
    setLastUpdate(new Date().toLocaleTimeString('zh-CN'));
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <ToolLayout title="股市信息" description="全球主要股市指数实时行情，数据来源于 Yahoo Finance">
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

      {/* Stock grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stocks.map((stock) => (
          <StockCard key={stock.symbol} stock={stock} />
        ))}
      </div>

      {/* Note */}
      <div className="text-dark-600 text-xs text-center">
        数据通过 Yahoo Finance 公开接口获取，仅供参考，不构成投资建议。数据可能有 15-20 分钟延迟。
      </div>
    </ToolLayout>
  );
}

function StockCard({ stock }: { stock: StockIndex }) {
  if (stock.loading) {
    return (
      <div className="p-5 bg-dark-900 border border-dark-700 rounded-xl animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{stock.flag}</span>
          <span className="text-white font-semibold">{stock.name}</span>
          <span className="text-dark-600 text-xs">{stock.symbol}</span>
        </div>
        <div className="h-8 bg-dark-800 rounded mb-2"></div>
        <div className="h-4 bg-dark-800 rounded w-2/3"></div>
      </div>
    );
  }

  if (stock.error) {
    return (
      <div className="p-5 bg-dark-900 border border-dark-700 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{stock.flag}</span>
          <span className="text-white font-semibold">{stock.name}</span>
          <span className="text-dark-600 text-xs">{stock.symbol}</span>
        </div>
        <div className="text-red-400/70 text-sm">数据获取失败：{stock.error}</div>
      </div>
    );
  }

  const isUp = (stock.change ?? 0) >= 0;
  const colorClass = isUp ? 'text-red-400' : 'text-green-400';
  const bgGlow = isUp ? 'border-red-900/30' : 'border-green-900/30';
  const arrow = isUp ? '▲' : '▼';

  return (
    <div className={`p-5 bg-dark-900 border rounded-xl transition-all hover:scale-[1.01] ${bgGlow}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{stock.flag}</span>
        <span className="text-white font-semibold">{stock.name}</span>
        <span className="text-dark-600 text-xs">{stock.symbol}</span>
      </div>

      {/* Price + change */}
      <div className="flex items-end gap-3 mb-3">
        <span className={`text-2xl font-bold font-mono ${colorClass}`}>
          {formatNum(stock.price)}
        </span>
        <div className={`text-sm font-mono ${colorClass}`}>
          {arrow} {formatNum(stock.change)} ({formatNum(stock.changePercent)}%)
        </div>
      </div>

      {/* OHLC */}
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
    </div>
  );
}
