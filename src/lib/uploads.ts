import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { ValidationError } from "@/lib/validation";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function sniffExtension(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png";
  }
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46
  ) {
    return "gif";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12);
    if (brand.startsWith("avif") || brand.startsWith("avis") || brand.startsWith("mif1")) {
      return "avif";
    }
  }
  return null;
}

export async function saveUploadedImage(file: File): Promise<{ url: string }> {
  if (file.size <= 0) {
    throw new ValidationError("The image file is empty");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ValidationError("Image must be 8MB or smaller");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = sniffExtension(buffer);
  if (!ext) {
    throw new ValidationError("Upload a JPEG, PNG, WebP, GIF, or AVIF image");
  }

  const id = randomBytes(8).toString("hex");
  const year = String(new Date().getFullYear());
  const publicPath = `/uploads/${year}/${id}.${ext}`;
  const absolute = path.join(process.cwd(), "public", publicPath);

  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, buffer);

  return { url: publicPath };
}
