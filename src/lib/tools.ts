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
  {
    id: "barcode",
    name: "条形码生成器",
    description: "支持 CODE128、EAN-13、UPC-A 等多种格式的条形码生成",
    icon: "|||",
    href: "/barcode",
    category: "生成器",
  },
  {
    id: "currency",
    name: "汇率换算",
    description: "人民币与主要货币实时汇率换算，支持双向转换",
    icon: "¥",
    href: "/currency",
    category: "工具",
  },
  {
    id: "calendar",
    name: "日历",
    description: "公历农历对照日历，显示农历节日和公历节日",
    icon: "📅",
    href: "/calendar",
    category: "工具",
  },
  {
    id: "weather",
    name: "天气预报",
    description: "多城市 7 天天气预报，显示温度、降水概率等详情",
    icon: "🌤",
    href: "/weather",
    category: "工具",
  },
  {
    id: "datecalc",
    name: "日期计算器",
    description: "计算两个日期之间的差值，支持天、周、月、年等多种格式",
    icon: "📐",
    href: "/datecalc",
    category: "工具",
  },
  {
    id: "countdown",
    name: "倒计时",
    description: "距离各种重要日期的倒计时和已过天数，支持农历节日",
    icon: "⏳",
    href: "/countdown",
    category: "工具",
  },
  {
    id: "stock",
    name: "股市信息",
    description: "全球主要股市指数实时行情，涵盖 A 股、港股、美股等",
    icon: "📈",
    href: "/stock",
    category: "工具",
  },
];
