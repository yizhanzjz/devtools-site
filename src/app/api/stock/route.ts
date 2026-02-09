import { NextRequest, NextResponse } from 'next/server';

// ---------- Index configs ----------
interface IndexDef {
  symbol: string;
  sina: string;
  name: string;
  flag: string;
  type: 'cn' | 'hk' | 'intl';
}

const INDICES: IndexDef[] = [
  { symbol: '000001.SS', sina: 'sh000001', name: '上证指数', flag: '🇨🇳', type: 'cn' },
  { symbol: '399001.SZ', sina: 'sz399001', name: '深证成指', flag: '🇨🇳', type: 'cn' },
  { symbol: '399006.SZ', sina: 'sz399006', name: '创业板指', flag: '🇨🇳', type: 'cn' },
  { symbol: '^HSI', sina: 'rt_hkHSI', name: '恒生指数', flag: '🇭🇰', type: 'hk' },
  { symbol: '^DJI', sina: 'int_dji', name: '道琼斯', flag: '🇺🇸', type: 'intl' },
  { symbol: '^IXIC', sina: 'int_nasdaq', name: '纳斯达克', flag: '🇺🇸', type: 'intl' },
  { symbol: '^GSPC', sina: 'int_sp500', name: '标普500', flag: '🇺🇸', type: 'intl' },
  { symbol: '^N225', sina: 'int_nikkei', name: '日经225', flag: '🇯🇵', type: 'intl' },
  { symbol: '^FTSE', sina: 'int_ftse', name: '富时100', flag: '🇬🇧', type: 'intl' },
  { symbol: '^GDAXI', sina: 'int_dax', name: 'DAX', flag: '🇩🇪', type: 'intl' },
];

interface StockResult {
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

// ---------- Sina API (server-side, no CORS) ----------
async function fetchSinaBatch(indices: IndexDef[]): Promise<Map<string, StockResult>> {
  const results = new Map<string, StockResult>();
  const codes = indices.map(i => i.sina).join(',');

  try {
    const resp = await fetch(`https://hq.sinajs.cn/list=${codes}`, {
      headers: {
        'Referer': 'https://finance.sina.com.cn',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });

    const buffer = await resp.arrayBuffer();
    // Sina responds in GBK encoding
    const decoder = new TextDecoder('gbk');
    const text = decoder.decode(buffer);
    const lines = text.trim().split('\n');

    for (let i = 0; i < lines.length && i < indices.length; i++) {
      const idx = indices[i];
      const match = lines[i].match(/"(.*)"/);
      if (!match || !match[1]) continue;

      const parts = match[1].split(',');
      try {
        let data: StockResult;

        if (idx.type === 'cn') {
          if (parts.length < 6) continue;
          const open = parseFloat(parts[1]);
          const prevClose = parseFloat(parts[2]);
          const price = parseFloat(parts[3]);
          const high = parseFloat(parts[4]);
          const low = parseFloat(parts[5]);
          const change = price - prevClose;
          const changePercent = prevClose ? (change / prevClose) * 100 : 0;
          data = { symbol: idx.symbol, name: idx.name, flag: idx.flag, price, change, changePercent, open, high, low };
        } else if (idx.type === 'hk') {
          if (parts.length < 7) continue;
          const open = parseFloat(parts[2]);
          const prevClose = parseFloat(parts[3]);
          const high = parseFloat(parts[4]);
          const low = parseFloat(parts[5]);
          const price = parseFloat(parts[6]);
          const change = price - prevClose;
          const changePercent = prevClose ? (change / prevClose) * 100 : 0;
          data = { symbol: idx.symbol, name: idx.name, flag: idx.flag, price, change, changePercent, open, high, low };
        } else {
          // intl
          if (parts.length < 5) continue;
          const price = parseFloat(parts[1]);
          const change = parseFloat(parts[3]);
          const changePercent = parseFloat(parts[4]);
          data = { symbol: idx.symbol, name: idx.name, flag: idx.flag, price, change, changePercent, open: 0, high: 0, low: 0 };
        }

        if (!isNaN(data.price) && data.price > 0) {
          results.set(idx.symbol, data);
        }
      } catch {
        // skip this index
      }
    }
  } catch (e) {
    console.error('Sina batch fetch failed:', e);
  }

  return results;
}

// ---------- Yahoo Finance fallback ----------
async function fetchYahoo(symbol: string, idx: IndexDef): Promise<StockResult | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) return null;
    const data = await resp.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice ?? 0;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    const quote = result.indicators?.quote?.[0];
    const lastIdx = quote?.close?.length ? quote.close.length - 1 : 0;
    const open = quote?.open?.[lastIdx] ?? 0;
    const high = quote?.high?.[lastIdx] ?? 0;
    const low = quote?.low?.[lastIdx] ?? 0;

    return { symbol: idx.symbol, name: idx.name, flag: idx.flag, price, change, changePercent, open, high, low };
  } catch {
    return null;
  }
}

// ---------- API Route ----------
export async function GET(request: NextRequest) {
  // Optional: filter by symbols
  const searchParams = request.nextUrl.searchParams;
  const _ = searchParams.get('_'); // cache buster, ignored
  void _;

  // Step 1: batch fetch from Sina
  const sinaResults = await fetchSinaBatch(INDICES);

  // Step 2: for any missing, try Yahoo
  const finalResults: StockResult[] = [];
  const yahooFallbacks: Promise<void>[] = [];

  for (const idx of INDICES) {
    const sinaData = sinaResults.get(idx.symbol);
    if (sinaData) {
      finalResults.push(sinaData);
    } else {
      // Queue Yahoo fallback
      const i = finalResults.length;
      finalResults.push({
        symbol: idx.symbol, name: idx.name, flag: idx.flag,
        price: 0, change: 0, changePercent: 0, open: 0, high: 0, low: 0,
        error: '获取中...',
      });
      yahooFallbacks.push(
        fetchYahoo(idx.symbol, idx).then(result => {
          if (result) {
            finalResults[i] = result;
          } else {
            finalResults[i] = {
              ...finalResults[i],
              error: '数据获取失败',
            };
          }
        })
      );
    }
  }

  await Promise.all(yahooFallbacks);

  return NextResponse.json({
    data: finalResults,
    time: new Date().toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    source: 'sina+yahoo',
  }, {
    headers: {
      'Cache-Control': 'public, max-age=30, s-maxage=30',
    },
  });
}
