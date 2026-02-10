import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SOURCES = [
  'https://api.exchangerate-api.com/v4/latest/CNY',
  'https://open.er-api.com/v6/latest/CNY',
];

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  let lastError = '';

  for (const url of SOURCES) {
    try {
      const res = await fetchWithTimeout(url, 8000);
      if (!res.ok) {
        lastError = `HTTP ${res.status} from ${url}`;
        continue;
      }
      const data = await res.json();

      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, max-age=600, s-maxage=600',
        },
      });
    } catch (e: unknown) {
      lastError = e instanceof Error ? e.message : String(e);
      continue;
    }
  }

  return NextResponse.json(
    { error: `汇率数据获取失败: ${lastError}` },
    { status: 502 }
  );
}
