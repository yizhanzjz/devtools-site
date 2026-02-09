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

// ---------- Index definitions ----------
// A-share indices use Sina codes; overseas use Yahoo symbols
const INDICES: { symbol: string; sina?: string; name: string; flag: string }[] = [
  { symbol: '000001.SS', sina: 'sh000001', name: '上证指数', flag: '🇨🇳' },
  { symbol: '399001.SZ', sina: 'sz399001', name: '深证成指', flag: '🇨🇳' },
  { symbol: '399006.SZ', sina: 'sz399006', name: '创业板指', flag: '🇨🇳' },
  { symbol: '^HSI',  sina: 'rt_hkHSI', name: '恒生指数', flag: '🇭🇰' },
  { symbol: '^DJI',  sina: 'int_dji', name: '道琼斯', flag: '🇺🇸' },
  { symbol: '^IXIC', sina: 'int_nasdaq', name: '纳斯达克', flag: '🇺🇸' },
  { symbol: '^GSPC', sina: 'int_sp500', name: '标普500', flag: '🇺🇸' },
  { symbol: '^N225', sina: 'int_nikkei', name: '日经225', flag: '🇯🇵' },
  { symbol: '^FTSE', sina: 'int_ftse', name: '富时100', flag: '🇬🇧' },
  { symbol: '^GDAXI', sina: 'int_dax', name: 'DAX', flag: '🇩🇪' },
];

// ---------- Sina Finance API (no CORS issue with JSONP) ----------
function fetchViaSinaJsonp(sinaCode: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const varName = `hq_str_${sinaCode}`;
    const script = document.createElement('script');
    script.charset = 'gb2312';
    script.src = `https://hq.sinajs.cn/list=${sinaCode}&_=${Date.now()}`;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('超时'));
    }, 8000);

    function cleanup() {
      clearTimeout(timeout);
      script.remove();
    }

    script.onload = () => {
      cleanup();
      // Sina sets global vars like: var hq_str_sh000001="...";
      // Access via eval workaround since the var is in global scope
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = (window as any)[varName];
        if (val !== undefined) {
          resolve(String(val));
        } else {
          reject(new Error('无数据'));
        }
      } catch {
        reject(new Error('解析失败'));
      }
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('网络错误'));
    };

    document.head.appendChild(script);
  });
}

function parseSinaCN(raw: string): { price: number; change: number; changePercent: number; open: number; high: number; low: number } {
  const parts = raw.split(',');
  if (parts.length < 6) throw new Error('数据格式错误');
  const open = parseFloat(parts[1]);
  const prevClose = parseFloat(parts[2]);
  const price = parseFloat(parts[3]);
  const high = parseFloat(parts[4]);
  const low = parseFloat(parts[5]);
  const change = price - prevClose;
  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
  return { price, change, changePercent, open, high, low };
}

function parseSinaHK(raw: string): { price: number; change: number; changePercent: number; open: number; high: number; low: number } {
  // HSI format: EN_name,CN_name,open,prevClose,high,low,price,...
  const parts = raw.split(',');
  if (parts.length < 7) throw new Error('数据格式错误');
  const open = parseFloat(parts[2]);
  const prevClose = parseFloat(parts[3]);
  const high = parseFloat(parts[4]);
  const low = parseFloat(parts[5]);
  const price = parseFloat(parts[6]);
  const change = price - prevClose;
  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
  return { price, change, changePercent, open, high, low };
}

function parseSinaIntl(raw: string): { price: number; change: number; changePercent: number; open: number; high: number; low: number } {
  // International format: name,price,date,change,changePercent,...
  const parts = raw.split(',');
  if (parts.length < 5) throw new Error('数据格式错误');
  const price = parseFloat(parts[1]);
  const change = parseFloat(parts[3]);
  const changePercent = parseFloat(parts[4]);
  return { price, change, changePercent, open: 0, high: 0, low: 0 };
}

// ---------- Yahoo Finance (fallback via multiple proxies) ----------
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

async function fetchViaYahoo(symbol: string): Promise<{ price: number; change: number; changePercent: number; open: number; high: number; low: number }> {
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

  let lastError: Error = new Error('所有代理均失败');

  for (const makeProxy of CORS_PROXIES) {
    try {
      const proxyUrl = makeProxy(yahooUrl);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const result = data?.chart?.result?.[0];
      if (!result) throw new Error('无数据');

      const meta = result.meta;
      const price = meta.regularMarketPrice ?? 0;
      const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
      const change = price - previousClose;
      const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

      const quote = result.indicators?.quote?.[0];
      const lastIdx = quote?.close?.length ? quote.close.length - 1 : 0;
      const open = quote?.open?.[lastIdx] ?? 0;
      const high = quote?.high?.[lastIdx] ?? 0;
      const low = quote?.low?.[lastIdx] ?? 0;

      return { price, change, changePercent, open, high, low };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error('未知错误');
      continue;
    }
  }

  throw lastError;
}

// ---------- Unified fetch ----------
async function fetchStockData(idx: typeof INDICES[number]): Promise<{
  price: number; change: number; changePercent: number; open: number; high: number; low: number;
}> {
  // Try Sina first (faster, no CORS proxy needed)
  if (idx.sina) {
    try {
      const raw = await fetchViaSinaJsonp(idx.sina);
      if (idx.sina.startsWith('sh') || idx.sina.startsWith('sz')) {
        return parseSinaCN(raw);
      } else if (idx.sina.startsWith('rt_hk')) {
        return parseSinaHK(raw);
      } else if (idx.sina.startsWith('int_')) {
        return parseSinaIntl(raw);
      }
    } catch {
      // Fall through to Yahoo
    }
  }

  // Fallback: Yahoo Finance with proxy rotation
  return fetchViaYahoo(idx.symbol);
}

function formatNum(n: number | null, decimals = 2): string {
  if (n === null || n === undefined) return '-';
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
        const data = await fetchStockData(idx);
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
    <ToolLayout title="股市信息" description="全球主要股市指数实时行情 · 新浪财经 + Yahoo Finance 双数据源">
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
        数据来源：A股/恒生 → 新浪财经 · 海外指数 → 新浪国际/Yahoo Finance · 仅供参考，不构成投资建议
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
        <div className="text-red-400/70 text-sm">⚠️ {stock.error}</div>
      </div>
    );
  }

  const isUp = (stock.change ?? 0) >= 0;
  const colorClass = isUp ? 'text-red-400' : 'text-green-400';
  const bgGlow = isUp ? 'border-red-900/30' : 'border-green-900/30';
  const arrow = isUp ? '▲' : '▼';

  const showOHL = stock.open !== 0 || stock.high !== 0 || stock.low !== 0;

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

      {/* OHLC - only show if data available */}
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
