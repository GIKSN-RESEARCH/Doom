import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { handleRouteError, json, jsonError } from "@/lib/http";
import { saveUploadedImage } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function collectFiles(form: FormData): File[] {
  const files: File[] = [];
  for (const key of ["file", "files"]) {
    for (const value of form.getAll(key)) {
      if (value instanceof File && value.size > 0) files.push(value);
    }
  }
  return files;
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const form = await request.formData();
    const files = collectFiles(form);
    if (files.length === 0) {
      return jsonError("Choose an image to upload", 400);
    }

    const urls: string[] = [];
    for (const file of files) {
      const saved = await saveUploadedImage(file);
      urls.push(saved.url);
    }

    return json({ url: urls[0], urls });
  } catch (error) {
    return handleRouteError(error);
  }
}
