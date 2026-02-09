'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import ToolLayout from '@/components/ToolLayout';

interface BarcodeFormat {
  id: string;
  name: string;
  placeholder: string;
  description: string;
}

const BARCODE_FORMATS: BarcodeFormat[] = [
  { id: 'CODE128', name: 'CODE128', placeholder: 'Hello World', description: '通用条形码，支持所有 ASCII 字符' },
  { id: 'CODE39', name: 'CODE39', placeholder: 'HELLO', description: '支持大写字母、数字和少量特殊字符' },
  { id: 'EAN13', name: 'EAN-13', placeholder: '5901234123457', description: '13 位国际商品条码' },
  { id: 'EAN8', name: 'EAN-8', placeholder: '96385074', description: '8 位短国际商品条码' },
  { id: 'UPC', name: 'UPC-A', placeholder: '123456789012', description: '12 位美国通用商品条码' },
  { id: 'ITF14', name: 'ITF-14', placeholder: '12345678901231', description: '14 位物流条码' },
  { id: 'MSI', name: 'MSI', placeholder: '1234567', description: '仅支持数字' },
  { id: 'pharmacode', name: 'Pharmacode', placeholder: '1234', description: '药品条码，支持数字 3-131070' },
  { id: 'codabar', name: 'Codabar', placeholder: 'A12345B', description: '支持数字和少量特殊字符，以 A-D 开头结尾' },
];

export default function BarcodePage() {
  const [input, setInput] = useState('Hello World');
  const [format, setFormat] = useState('CODE128');
  const [barWidth, setBarWidth] = useState(2);
  const [barHeight, setBarHeight] = useState(100);
  const [showText, setShowText] = useState(true);
  const [error, setError] = useState('');

  const svgRef = useRef<SVGSVGElement>(null);

  const selectedFormat = BARCODE_FORMATS.find((f) => f.id === format);

  const generateBarcode = useCallback(() => {
    if (!svgRef.current) return;
    if (!input.trim()) {
      setError('请输入条形码内容');
      // Clear SVG
      svgRef.current.innerHTML = '';
      return;
    }

    try {
      JsBarcode(svgRef.current, input, {
        format,
        width: barWidth,
        height: barHeight,
        displayValue: showText,
        background: 'transparent',
        lineColor: '#e2e8f0',
        fontOptions: 'bold',
        font: 'monospace',
        fontSize: 16,
        textMargin: 8,
        margin: 16,
      });
      setError('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '生成失败';
      setError(`条形码生成错误: ${msg}`);
      if (svgRef.current) {
        svgRef.current.innerHTML = '';
      }
    }
  }, [input, format, barWidth, barHeight, showText]);

  useEffect(() => {
    generateBarcode();
  }, [generateBarcode]);

  const downloadPng = useCallback(() => {
    if (!svgRef.current || error) return;

    const svg = svgRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 2; // Retina quality
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(scale, scale);
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `barcode-${format}-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');

      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [error, format]);

  const handleFormatChange = (newFormat: string) => {
    setFormat(newFormat);
    const fmt = BARCODE_FORMATS.find((f) => f.id === newFormat);
    if (fmt) {
      setInput(fmt.placeholder);
    }
  };

  return (
    <ToolLayout
      title="条形码生成器"
      description="支持多种格式的条形码生成，实时预览并下载为 PNG 图片"
    >
      {/* Input Section */}
      <div>
        <label className="block text-sm text-dark-300 mb-2">条形码内容</label>
        <input
          type="text"
          className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 text-dark-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedFormat?.placeholder || '输入内容'}
          spellCheck={false}
        />
        {selectedFormat && (
          <p className="text-xs text-dark-500 mt-1.5">{selectedFormat.description}</p>
        )}
      </div>

      {/* Format Selection */}
      <div>
        <label className="block text-sm text-dark-300 mb-2">条形码格式</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {BARCODE_FORMATS.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => handleFormatChange(fmt.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                format === fmt.id
                  ? 'bg-accent-500 text-white'
                  : 'bg-dark-800 text-dark-300 border border-dark-700 hover:border-dark-500'
              }`}
            >
              {fmt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-dark-300 mb-2">
            线条宽度: {barWidth}px
          </label>
          <input
            type="range"
            min={1}
            max={5}
            step={0.5}
            value={barWidth}
            onChange={(e) => setBarWidth(Number(e.target.value))}
            className="w-full accent-accent-500"
          />
        </div>
        <div>
          <label className="block text-sm text-dark-300 mb-2">
            高度: {barHeight}px
          </label>
          <input
            type="range"
            min={30}
            max={200}
            step={10}
            value={barHeight}
            onChange={(e) => setBarHeight(Number(e.target.value))}
            className="w-full accent-accent-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showText}
              onChange={(e) => setShowText(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-dark-700 peer-focus:ring-2 peer-focus:ring-accent-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-dark-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500 peer-checked:after:bg-white" />
          </label>
          <span className="text-sm text-dark-300">显示文本</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-dark-300">预览</label>
          <button
            onClick={downloadPng}
            disabled={!!error || !input.trim()}
            className="tool-btn-primary text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ⬇ 下载 PNG
          </button>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-lg p-6 flex items-center justify-center min-h-[160px] overflow-auto">
          <svg ref={svgRef} />
        </div>
      </div>
    </ToolLayout>
  );
}
