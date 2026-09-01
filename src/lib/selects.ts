import type { Prisma } from "@prisma/client";

export const caseStudyListSelect = {
  id: true,
  slug: true,
  title: true,
  outcomeLine: true,
  bottleneck: true,
  tags: true,
  coverImageUrl: true,
  liveUrl: true,
  year: true,
  published: true,
  featured: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CaseStudySelect;

export const caseStudyDetailSelect = {
  ...caseStudyListSelect,
  context: true,
  whatWeDid: true,
  whatChanged: true,
  galleryUrls: true,
} satisfies Prisma.CaseStudySelect;

export const updateListSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  coverImageUrl: true,
  tags: true,
  published: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UpdatePostSelect;

export const updateDetailSelect = {
  ...updateListSelect,
  body: true,
} satisfies Prisma.UpdatePostSelect;

export const articleListSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  articleType: true,
  bottleneckTag: true,
  coverImageUrl: true,
  tags: true,
  published: true,
  featured: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ArticleSelect;

export const articleDetailSelect = {
  ...articleListSelect,
  body: true,
} satisfies Prisma.ArticleSelect;
