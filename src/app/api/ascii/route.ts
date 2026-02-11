import { NextRequest, NextResponse } from "next/server";
import figlet from "figlet";

// 常用字体列表
const FONTS: figlet.Fonts[] = [
  "Standard",
  "Banner",
  "Big",
  "Block",
  "Doom",
  "Lean",
  "Mini",
  "Small",
  "Slant",
  "Speed",
  "Star Wars",
  "3D-ASCII",
  "ANSI Shadow",
  "Calvin S",
  "Cyberlarge",
  "DOS Rebel",
  "Epic",
  "Graffiti",
  "Isometric1",
  "Larry 3D",
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const text = searchParams.get("text") || "Hello";
  const font = (searchParams.get("font") || "Standard") as figlet.Fonts;

  try {
    const result = figlet.textSync(text, {
      font: font,
      horizontalLayout: "default",
      verticalLayout: "default",
    });

    return NextResponse.json({ result, font });
  } catch {
    // 如果字体不存在，回退到 Standard
    try {
      const result = figlet.textSync(text, { font: "Standard" });
      return NextResponse.json({ result, font: "Standard", fallback: true });
    } catch {
      return NextResponse.json({ error: "生成失败" }, { status: 500 });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text = "Hello", font = "Standard" } = body;

    const result = figlet.textSync(text, {
      font: font as figlet.Fonts,
      horizontalLayout: "default",
      verticalLayout: "default",
    });

    return NextResponse.json({ result, font });
  } catch {
    return NextResponse.json({ error: "生成失败" }, { status: 500 });
  }
}

// 返回可用字体列表
export async function OPTIONS() {
  return NextResponse.json({ fonts: FONTS });
}
