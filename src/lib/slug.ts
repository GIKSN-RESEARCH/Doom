import { prisma } from "@/lib/prisma";
import { isValidSlug } from "@/lib/validation";

export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return slug || "entry";
}

type SlugModel = "article" | "caseStudy" | "updatePost";

async function slugTaken(
  model: SlugModel,
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const where = excludeId ? { slug, NOT: { id: excludeId } } : { slug };

  if (model === "article") {
    return Boolean(await prisma.article.findFirst({ where, select: { id: true } }));
  }
  if (model === "caseStudy") {
    return Boolean(
      await prisma.caseStudy.findFirst({ where, select: { id: true } }),
    );
  }
  return Boolean(
    await prisma.updatePost.findFirst({ where, select: { id: true } }),
  );
}

export async function uniqueSlug(
  model: SlugModel,
  desired: string,
  excludeId?: string,
): Promise<string> {
  const base = isValidSlug(desired) ? desired : slugifyTitle(desired);

  for (let i = 0; i < 50; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    if (!(await slugTaken(model, candidate, excludeId))) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}
