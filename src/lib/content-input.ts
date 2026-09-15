import type { ArticleType, Prisma } from "@prisma/client";
import { slugifyTitle } from "@/lib/slug";
import {
  applyPublishedAt,
  assertCanPublishArticle,
  assertCanPublishCaseStudy,
  assertCanPublishUpdate,
  optionalArticleType,
  optionalBoolean,
  optionalBottleneckTag,
  optionalNullableString,
  optionalSlug,
  optionalString,
  optionalStringArray,
  optionalYear,
  requireTitle,
} from "@/lib/validation";

function resolveCreateSlug(
  body: Record<string, unknown>,
  title: string,
): string {
  return optionalSlug(body) || slugifyTitle(title);
}

export function parseCaseStudyCreateInput(
  body: Record<string, unknown>,
): Prisma.CaseStudyCreateInput {
  const title = requireTitle(body, true)!;
  const slug = resolveCreateSlug(body, title);

  const data: Prisma.CaseStudyCreateInput = {
    title,
    slug,
    outcomeLine: optionalString(body, "outcomeLine") ?? "",
    bottleneck: optionalString(body, "bottleneck") ?? "",
    context: optionalString(body, "context") ?? "",
    whatWeDid: optionalString(body, "whatWeDid") ?? "",
    whatChanged: optionalString(body, "whatChanged") ?? "",
    tags: optionalStringArray(body, "tags") ?? [],
    coverImageUrl: optionalString(body, "coverImageUrl") ?? "",
    galleryUrls: optionalStringArray(body, "galleryUrls") ?? [],
    liveUrl: optionalNullableString(body, "liveUrl") ?? null,
    year: optionalYear(body, "year") ?? null,
    published: optionalBoolean(body, "published") ?? false,
    featured: optionalBoolean(body, "featured") ?? false,
  };

  applyPublishedAt(data);
  assertCanPublishCaseStudy({
    title: data.title,
    slug: data.slug,
    outcomeLine: data.outcomeLine ?? "",
    bottleneck: data.bottleneck ?? "",
    published: Boolean(data.published),
  });

  return data;
}

export function parseCaseStudyPatchInput(
  body: Record<string, unknown>,
  existing: {
    title: string;
    slug: string;
    outcomeLine: string;
    bottleneck: string;
    published: boolean;
    publishedAt: Date | null;
  },
): Prisma.CaseStudyUpdateInput {
  const data: Prisma.CaseStudyUpdateInput = {};

  const title = requireTitle(body, false);
  if (title !== undefined) data.title = title;

  const slug = optionalSlug(body);
  if (slug !== undefined) data.slug = slug;

  const outcomeLine = optionalString(body, "outcomeLine");
  if (outcomeLine !== undefined) data.outcomeLine = outcomeLine;

  const bottleneck = optionalString(body, "bottleneck");
  if (bottleneck !== undefined) data.bottleneck = bottleneck;

  const context = optionalString(body, "context");
  if (context !== undefined) data.context = context;

  const whatWeDid = optionalString(body, "whatWeDid");
  if (whatWeDid !== undefined) data.whatWeDid = whatWeDid;

  const whatChanged = optionalString(body, "whatChanged");
  if (whatChanged !== undefined) data.whatChanged = whatChanged;

  const tags = optionalStringArray(body, "tags");
  if (tags !== undefined) data.tags = tags;

  const coverImageUrl = optionalString(body, "coverImageUrl");
  if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl;

  const galleryUrls = optionalStringArray(body, "galleryUrls");
  if (galleryUrls !== undefined) data.galleryUrls = galleryUrls;

  const liveUrl = optionalNullableString(body, "liveUrl");
  if (liveUrl !== undefined) data.liveUrl = liveUrl;

  const year = optionalYear(body, "year");
  if (year !== undefined) data.year = year;

  const published = optionalBoolean(body, "published");
  if (published !== undefined) data.published = published;

  const featured = optionalBoolean(body, "featured");
  if (featured !== undefined) data.featured = featured;

  applyPublishedAt(data, existing.publishedAt);

  assertCanPublishCaseStudy({
    title: (data.title as string | undefined) ?? existing.title,
    slug: (data.slug as string | undefined) ?? existing.slug,
    outcomeLine: (data.outcomeLine as string | undefined) ?? existing.outcomeLine,
    bottleneck: (data.bottleneck as string | undefined) ?? existing.bottleneck,
    published: (data.published as boolean | undefined) ?? existing.published,
  });

  return data;
}

export function parseUpdateCreateInput(
  body: Record<string, unknown>,
): Prisma.UpdatePostCreateInput {
  const title = requireTitle(body, true)!;
  const slug = resolveCreateSlug(body, title);

  const data: Prisma.UpdatePostCreateInput = {
    title,
    slug,
    summary: optionalString(body, "summary") ?? "",
    body: optionalString(body, "body") ?? "",
    coverImageUrl: optionalNullableString(body, "coverImageUrl") ?? null,
    tags: optionalStringArray(body, "tags") ?? [],
    published: optionalBoolean(body, "published") ?? false,
  };

  applyPublishedAt(data);
  assertCanPublishUpdate({
    title: data.title,
    slug: data.slug,
    summary: data.summary ?? "",
    body: data.body ?? "",
    published: Boolean(data.published),
  });

  return data;
}

export function parseUpdatePatchInput(
  body: Record<string, unknown>,
  existing: {
    title: string;
    slug: string;
    summary: string;
    body: string;
    published: boolean;
    publishedAt: Date | null;
  },
): Prisma.UpdatePostUpdateInput {
  const data: Prisma.UpdatePostUpdateInput = {};

  const title = requireTitle(body, false);
  if (title !== undefined) data.title = title;

  const slug = optionalSlug(body);
  if (slug !== undefined) data.slug = slug;

  const summary = optionalString(body, "summary");
  if (summary !== undefined) data.summary = summary;

  const updateBody = optionalString(body, "body");
  if (updateBody !== undefined) data.body = updateBody;

  const coverImageUrl = optionalNullableString(body, "coverImageUrl");
  if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl;

  const tags = optionalStringArray(body, "tags");
  if (tags !== undefined) data.tags = tags;

  const published = optionalBoolean(body, "published");
  if (published !== undefined) data.published = published;

  applyPublishedAt(data, existing.publishedAt);

  assertCanPublishUpdate({
    title: (data.title as string | undefined) ?? existing.title,
    slug: (data.slug as string | undefined) ?? existing.slug,
    summary: (data.summary as string | undefined) ?? existing.summary,
    body: (data.body as string | undefined) ?? existing.body,
    published: (data.published as boolean | undefined) ?? existing.published,
  });

  return data;
}

export function parseArticleCreateInput(
  body: Record<string, unknown>,
): Prisma.ArticleCreateInput {
  const title = requireTitle(body, true)!;
  const slug = resolveCreateSlug(body, title);
  const articleType = optionalArticleType(body);
  const bottleneckTag = optionalBottleneckTag(body);

  const data: Prisma.ArticleCreateInput = {
    title,
    slug,
    excerpt: optionalString(body, "excerpt") ?? "",
    body: optionalString(body, "body") ?? "",
    articleType: articleType === undefined ? null : articleType,
    bottleneckTag: bottleneckTag === undefined ? null : bottleneckTag,
    coverImageUrl: optionalNullableString(body, "coverImageUrl") ?? null,
    tags: optionalStringArray(body, "tags") ?? [],
    published: optionalBoolean(body, "published") ?? false,
    featured: optionalBoolean(body, "featured") ?? false,
  };

  applyPublishedAt(data);
  assertCanPublishArticle({
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt ?? "",
    body: data.body ?? "",
    articleType: (data.articleType as ArticleType | null) ?? null,
    published: Boolean(data.published),
  });

  return data;
}

export function parseArticlePatchInput(
  body: Record<string, unknown>,
  existing: {
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    articleType: ArticleType | null;
    published: boolean;
    publishedAt: Date | null;
  },
): Prisma.ArticleUpdateInput {
  const data: Prisma.ArticleUpdateInput = {};

  const title = requireTitle(body, false);
  if (title !== undefined) data.title = title;

  const slug = optionalSlug(body);
  if (slug !== undefined) data.slug = slug;

  const excerpt = optionalString(body, "excerpt");
  if (excerpt !== undefined) data.excerpt = excerpt;

  const articleBody = optionalString(body, "body");
  if (articleBody !== undefined) data.body = articleBody;

  const articleType = optionalArticleType(body);
  if (articleType !== undefined) data.articleType = articleType;

  const bottleneckTag = optionalBottleneckTag(body);
  if (bottleneckTag !== undefined) data.bottleneckTag = bottleneckTag;

  const coverImageUrl = optionalNullableString(body, "coverImageUrl");
  if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl;

  const tags = optionalStringArray(body, "tags");
  if (tags !== undefined) data.tags = tags;

  const published = optionalBoolean(body, "published");
  if (published !== undefined) data.published = published;

  const featured = optionalBoolean(body, "featured");
  if (featured !== undefined) data.featured = featured;

  applyPublishedAt(data, existing.publishedAt);

  assertCanPublishArticle({
    title: (data.title as string | undefined) ?? existing.title,
    slug: (data.slug as string | undefined) ?? existing.slug,
    excerpt: (data.excerpt as string | undefined) ?? existing.excerpt,
    body: (data.body as string | undefined) ?? existing.body,
    articleType:
      data.articleType === undefined
        ? existing.articleType
        : (data.articleType as ArticleType | null),
    published: (data.published as boolean | undefined) ?? existing.published,
  });

  return data;
}
