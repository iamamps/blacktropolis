import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Missing code." }, { status: 400 });

  const dataUrl = await QRCode.toDataURL(code, {
    margin: 1,
    width: 320,
    color: { dark: "#050403", light: "#ffffffff" },
  });
  return NextResponse.json({ dataUrl });
}
