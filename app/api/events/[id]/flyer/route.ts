import { getLegacyFlyer } from "@/lib/db";

// Serves the inline flyer of events created before photo storage existed, as a normal cacheable image.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dataUrl = await getLegacyFlyer(id);
  const m = dataUrl?.match(/^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i);
  if (!m) return new Response("Not found", { status: 404 });
  const bytes = Buffer.from(m[2], "base64");
  return new Response(bytes, {
    headers: {
      "Content-Type": m[1],
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
