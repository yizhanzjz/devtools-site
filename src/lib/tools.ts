export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  category: string;
}

export const tools: Tool[] = [
  {
    id: "json",
    name: "JSON 格式化/校验",
    description: "格式化、压缩和校验 JSON 数据，支持语法高亮",
    icon: "{ }",
    href: "/json",
    category: "数据处理",
  },
  {
    id: "base64",
    name: "Base64 编解码",
    description: "Base64 编码和解码转换，支持文本和 UTF-8",
    icon: "B64",
    href: "/base64",
    category: "编解码",
  },
  {
    id: "url",
    name: "URL 编解码",
    description: "URL 编码和解码转换，处理特殊字符",
    icon: "%20",
    href: "/url",
    category: "编解码",
  },
  {
    id: "timestamp",
    name: "时间戳转换",
    description: "Unix 时间戳与日期时间互相转换",
    icon: "⏱",
    href: "/timestamp",
    category: "时间",
  },
  {
    id: "uuid",
    name: "UUID 生成器",
    description: "生成 UUID v4，支持批量生成和格式选项",
    icon: "ID",
    href: "/uuid",
    category: "生成器",
  },
  {
    id: "hash",
    name: "Hash 生成",
    description: "计算 MD5、SHA-256 等常用哈希值",
    icon: "#",
    href: "/hash",
    category: "加密",
  },
];
