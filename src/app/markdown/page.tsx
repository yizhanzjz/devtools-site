"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";
import { marked } from "marked";

const EXAMPLE_MARKDOWN = `# Markdown 实时预览器

## 欢迎使用 Markdown 编辑器

这是一个功能完整的 Markdown 实时预览工具，支持所有标准语法。

### 文本格式

**粗体文本** 和 *斜体文本* 以及 ***粗斜体***

~~删除线文本~~

\`行内代码\`

### 列表

#### 无序列表
- 项目一
- 项目二
  - 子项目 2.1
  - 子项目 2.2
- 项目三

#### 有序列表
1. 第一项
2. 第二项
3. 第三项

### 链接和图片

[访问 OpenAI](https://openai.com)

![示例图片](https://via.placeholder.com/150)

### 引用

> 这是一段引用文本
> 可以跨越多行
> 
> 也可以包含其他 Markdown 元素

### 代码块

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}

hello('World');
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

### 表格

| 功能 | 支持 | 备注 |
|------|------|------|
| 标题 | ✅ | H1-H6 |
| 列表 | ✅ | 有序/无序 |
| 代码 | ✅ | 语法高亮 |
| 表格 | ✅ | 对齐支持 |

### 分割线

---

### 任务列表

- [x] 已完成任务
- [ ] 待办任务
- [ ] 另一个待办

### 特殊字符

HTML 实体: &copy; &reg; &trade;

数学符号: × ÷ ± ≠ ≈ ∞

箭头: → ← ↑ ↓ ⇒ ⇐

Emoji: 😀 🎉 ✨ 🚀 💡
`;

export default function MarkdownPage() {
  const [input, setInput] = useState(EXAMPLE_MARKDOWN);
  const [html, setHtml] = useState("");

  useEffect(() => {
    const renderMarkdown = async () => {
      try {
        const rendered = await marked(input);
        setHtml(rendered);
      } catch (e) {
        console.error("Markdown rendering error:", e);
        setHtml("<p style='color: red;'>渲染错误</p>");
      }
    };
    renderMarkdown();
  }, [input]);

  return (
    <ToolLayout
      title="Markdown 编辑预览"
      description="实时预览 Markdown 文档，支持标准语法和代码高亮"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm text-dark-300">
              Markdown 源码
            </label>
            <CopyButton text={input} />
          </div>
          <textarea
            className="tool-textarea font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此输入 Markdown..."
            spellCheck={false}
            style={{ minHeight: "600px" }}
          />
        </div>

        {/* Preview Panel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm text-dark-300">实时预览</label>
            <CopyButton text={html} />
          </div>
          <div
            className="markdown-preview bg-dark-800 border border-dark-700 rounded-lg p-6 overflow-auto"
            style={{ minHeight: "600px" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <style jsx global>{`
        .markdown-preview {
          color: #e5e7eb;
          line-height: 1.7;
        }

        .markdown-preview h1 {
          font-size: 2em;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 0.75em;
          padding-bottom: 0.3em;
          border-bottom: 2px solid #374151;
          color: #fff;
        }

        .markdown-preview h2 {
          font-size: 1.5em;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
          padding-bottom: 0.3em;
          border-bottom: 1px solid #374151;
          color: #fff;
        }

        .markdown-preview h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1.25em;
          margin-bottom: 0.5em;
          color: #f3f4f6;
        }

        .markdown-preview h4 {
          font-size: 1.1em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: #f3f4f6;
        }

        .markdown-preview h5,
        .markdown-preview h6 {
          font-size: 1em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
          color: #f3f4f6;
        }

        .markdown-preview p {
          margin: 1em 0;
        }

        .markdown-preview strong {
          font-weight: 700;
          color: #fff;
        }

        .markdown-preview em {
          font-style: italic;
        }

        .markdown-preview del {
          text-decoration: line-through;
          opacity: 0.7;
        }

        .markdown-preview a {
          color: #60a5fa;
          text-decoration: underline;
        }

        .markdown-preview a:hover {
          color: #93c5fd;
        }

        .markdown-preview code {
          background: #1f2937;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono",
            Consolas, "Courier New", monospace;
          font-size: 0.9em;
          color: #fbbf24;
        }

        .markdown-preview pre {
          background: #1f2937;
          padding: 1em;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1.5em 0;
          border: 1px solid #374151;
        }

        .markdown-preview pre code {
          background: transparent;
          padding: 0;
          color: #e5e7eb;
          font-size: 0.875em;
          line-height: 1.6;
        }

        /* Simple syntax highlighting */
        .markdown-preview pre code {
          display: block;
        }

        .markdown-preview blockquote {
          border-left: 4px solid #4b5563;
          padding-left: 1em;
          margin: 1.5em 0;
          color: #9ca3af;
          font-style: italic;
        }

        .markdown-preview ul,
        .markdown-preview ol {
          margin: 1em 0;
          padding-left: 2em;
        }

        .markdown-preview li {
          margin: 0.5em 0;
        }

        .markdown-preview li > ul,
        .markdown-preview li > ol {
          margin: 0.5em 0;
        }

        .markdown-preview hr {
          border: none;
          border-top: 2px solid #374151;
          margin: 2em 0;
        }

        .markdown-preview table {
          border-collapse: collapse;
          width: 100%;
          margin: 1.5em 0;
        }

        .markdown-preview th,
        .markdown-preview td {
          border: 1px solid #374151;
          padding: 0.6em 1em;
          text-align: left;
        }

        .markdown-preview th {
          background: #1f2937;
          font-weight: 700;
          color: #fff;
        }

        .markdown-preview tr:nth-child(even) {
          background: #1f29374d;
        }

        .markdown-preview img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          margin: 1em 0;
        }

        .markdown-preview input[type="checkbox"] {
          margin-right: 0.5em;
        }

        @media (max-width: 1024px) {
          .markdown-preview {
            font-size: 0.95em;
          }
        }
      `}</style>
    </ToolLayout>
  );
}
