import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMemberById } from "@/lib/db";
import { isAdminAuthed } from "@/lib/admin-auth";
import {
  IMAGE_TYPES,
  VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  createSignedUpload,
  newObjectPath,
  publicObjectUrl,
} from "@/lib/storage";

/**
 * Issues a one-time signed upload URL so the browser can send photos/videos straight to storage
 * (videos are far larger than a serverless request body allows).
 * Who may upload: paid organizer accounts (for their events) and the site admin.
 */
export async function POST(request: Request) {
  const admin = await isAdminAuthed();
  if (!admin) {
    const session = await getSession();
    const member = session ? await getMemberById(session.id) : undefined;
    if (!member || member.role !== "business" || member.membershipTier !== "paid") {
      return NextResponse.json({ error: "Sign in with a paid organizer account to upload." }, { status: 403 });
    }
  }

  let body: { contentType?: string; size?: number; purpose?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const contentType = String(body.contentType || "");
  const size = Number(body.size || 0);
  const isImage = IMAGE_TYPES.includes(contentType);
  const isVideo = VIDEO_TYPES.includes(contentType);
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Unsupported file type. Use JPG/PNG/WebP/GIF images or MP4/WebM/MOV videos." },
      { status: 400 }
    );
  }
  if (isImage && size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 12 MB)." }, { status: 400 });
  }
  if (isVideo && size > MAX_VIDEO_BYTES) {
    return NextResponse.json({ error: "Video is too large (max 100 MB)." }, { status: 400 });
  }
  if (body.purpose === "org-logo" && (!admin || !isImage)) {
    return NextResponse.json({ error: "Only the admin can upload logos." }, { status: 403 });
  }

  try {
    const folder = body.purpose === "org-logo" ? "orgs" : isVideo ? "videos" : "images";
    const path = newObjectPath(contentType, folder);
    const { uploadUrl } = await createSignedUpload(path);
    return NextResponse.json({
      uploadUrl,
      publicUrl: publicObjectUrl(path),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed." }, { status: 500 });
  }
}
