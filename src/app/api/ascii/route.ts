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

function generateAscii(
  text: string,
  font: figlet.Fonts
): Promise<string> {
  return new Promise((resolve, reject) => {
    figlet.text(text, { font, horizontalLayout: "default", verticalLayout: "default" }, (err, result) => {
      if (err || !result) reject(err || new Error("empty result"));
      else resolve(result);
    });
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const text = searchParams.get("text") || "Hello";
  const font = (searchParams.get("font") || "Standard") as figlet.Fonts;

  try {
    const result = await generateAscii(text, font);
    return NextResponse.json({ result, font });
  } catch {
    // 回退到 Standard
    try {
      const result = await generateAscii(text, "Standard");
      return NextResponse.json({ result, font: "Standard", fallback: true });
    } catch (e) {
      return NextResponse.json(
        { error: `生成失败: ${e instanceof Error ? e.message : String(e)}` },
        { status: 500 }
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text = "Hello", font = "Standard" } = body;

    const result = await generateAscii(text, font as figlet.Fonts);
    return NextResponse.json({ result, font });
  } catch (e) {
    return NextResponse.json(
      { error: `生成失败: ${e instanceof Error ? e.message : String(e)}` },
      { status: 500 }
    );
  }
}

// 返回可用字体列表
export async function OPTIONS() {
  return NextResponse.json({ fonts: FONTS });
}
