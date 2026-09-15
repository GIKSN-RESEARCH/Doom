import { prisma } from "@/lib/prisma";
import {
  articleDetailSelect,
  caseStudyDetailSelect,
  updateDetailSelect,
} from "@/lib/selects";

export interface CaseStudyItem {
  id: string;
  slug: string;
  title: string;
  outcomeLine: string;
  bottleneck: string;
  context: string;
  whatWeDid: string;
  whatChanged: string;
  tags: string[];
  coverImageUrl: string;
  galleryUrls: string[];
  liveUrl: string | null;
  year: number | null;
  published: boolean;
  featured: boolean;
  publishedAt: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  articleType: "BREAKDOWN" | "EXPLAINER" | "BUILD_LOG" | null;
  bottleneckTag:
    | "PRODUCT"
    | "SHIPPING"
    | "DISTRIBUTION"
    | "FUNDING"
    | "CLARITY"
    | "OTHER"
    | null;
  coverImageUrl: string | null;
  tags: string[];
  published: boolean;
  featured: boolean;
  publishedAt: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface UpdateItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  coverImageUrl: string | null;
  tags: string[];
  published: boolean;
  publishedAt: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export const FALLBACK_CASE_STUDIES: CaseStudyItem[] = [
  {
    id: "giksn",
    slug: "giksn",
    title: "GIKSN Research",
    outcomeLine: "A studio site that finally matches the high-leverage craft it sells.",
    bottleneck: "The public surface looked like a generic template, so serious buyers bounced before seeing the work.",
    context:
      "GIKSN possessed world-class intelligence and engineering craft. The public surface did not. The original site read like a generic landing page, so prospective enterprise partners and researchers bounced before they ever discovered what GIKSN was actually capable of building.",
    whatWeDid:
      "We completely rebuilt the digital surface around proof: tighter narrative architecture, custom display typography (Boxing + Clash Display), living GLSL shader canvases, and an interactive work gallery that expands into full technical breakdowns rather than static thumbnail grids.",
    whatChanged:
      "The studio now leads with live proof and finished systems. Inbound inquiries now arrive pre-sold on Doom's high-velocity execution capabilities.",
    tags: ["Brand Identity", "Design Engineering", "WebGL Shaders", "Systems"],
    coverImageUrl: "/work/giksn/screenshot.png",
    galleryUrls: ["/work/giksn/GIKSN_profile.jpg", "/work/giksn/logo.jpg"],
    liveUrl: "https://giksn.com",
    year: 2026,
    published: true,
    featured: true,
    publishedAt: new Date("2026-03-12T10:00:00.000Z"),
  },
  {
    id: "rinne",
    slug: "rinne",
    title: "Rinne Agentic CLI",
    outcomeLine: "Transforming raw CLI tools into an intuitive agentic execution cockpit.",
    bottleneck: "A brilliant AI orchestrator trapped behind complex command flags that non-hardcore devs couldn't adopt.",
    context:
      "Rinne is an autonomous harness you talk to directly. It plans a graph, runs AI tools, and verifies execution until the goal is met. But the initial interface was cumbersome and lacked clear real-time feedback loops.",
    whatWeDid:
      "Designed and engineered an obsidian-and-cyan telemetry interface with real-time execution graphs, instant interactive terminal modal cards, and zero-friction onboarding documentation.",
    whatChanged:
      "Developer adoption grew 4x within 3 weeks of the new launch, and enterprise teams integrated Rinne directly into their CI/CD verification pipelines.",
    tags: ["Developer Tools", "AI Harness", "Interface Design"],
    coverImageUrl: "/work/rinne/screenshot.png",
    galleryUrls: ["/work/rinne/logo.png"],
    liveUrl: "https://rinne.giksn.com",
    year: 2026,
    published: true,
    featured: true,
    publishedAt: new Date("2026-05-18T10:00:00.000Z"),
  },
];

export const FALLBACK_ARTICLES: ArticleItem[] = [
  {
    id: "kill-the-bottleneck",
    slug: "kill-the-bottleneck",
    title: "Kill the Bottleneck: Why Studios Start With the Wrong Thing",
    excerpt:
      "Most agencies start with tools and 80-page moodboards. We start with the single constraint that is actually blocking the product from shipping.",
    body: `A founder does not need another 80-page moodboard or a 6-month discovery phase. They need the single critical constraint that is preventing their product from reaching escape velocity identified and eliminated.

### The Myth of Incremental Polish
When a product stalls, teams almost always diagnose the symptom rather than the root bottleneck. They ask for a new color palette when the information hierarchy is broken. They ask for more features when the core onboarding story cannot be understood in four seconds.

### The Doom Diagnostic
At Doom Studio, we treat product design as an engineering pipeline. Every project begins by mapping the entire conversion, cognitive, and shipping chain:

1. **Where does user attention stall?** (Cognitive friction)
2. **Where does development velocity grind to a halt?** (Architectural debt)
3. **Where does the product fail to communicate its unfair advantage?** (Narrative fog)

Once that bottleneck is isolated, we don't write a memo about it. We design, engineer, and deploy the fix in tight 2-week sprints.`,
    articleType: "EXPLAINER",
    bottleneckTag: "CLARITY",
    coverImageUrl: null,
    tags: ["Studio Philosophy", "Strategy", "Execution"],
    published: true,
    featured: true,
    publishedAt: new Date("2026-04-02T12:00:00.000Z"),
  },
  {
    id: "design-engineering-singularity",
    slug: "design-engineering-singularity",
    title: "The Design-Engineering Singularity: Why Silos Kill Speed",
    excerpt:
      "When designers write production code and engineers have taste, the feedback loop collapses to zero. Here is how we build at Doom.",
    body: `The greatest tax on modern product development is the handoff layer. 

A designer crafts an intricate prototype in Figma with micro-interactions and nuanced spring physics. They export a spec sheet. A frontend engineer receives the Figma file two weeks later, attempts to recreate the springs using standard CSS keyframes, misses the cubic bezier curve, and compromises on the WebGL rendering because the build tooling wasn't shared.

### Merging the Disciplines
At Doom Studio, our designers engineer in React, Next.js, and GLSL. When we design an interface, we are simultaneously architecting the DOM layout, hardware acceleration constraints, and state machine transitions.

This eliminates 100% of translation loss. What you see in the design review is already running at 60fps in the browser with type safety, responsive clamp typography, and zero layout shift.`,
    articleType: "BREAKDOWN",
    bottleneckTag: "SHIPPING",
    coverImageUrl: null,
    tags: ["Engineering", "Design Systems", "Velocity"],
    published: true,
    featured: false,
    publishedAt: new Date("2026-06-15T14:30:00.000Z"),
  },
  {
    id: "building-living-surfaces-webgl-shaders",
    slug: "building-living-surfaces-webgl-shaders",
    title: "Building Living Surfaces: WebGL Shaders in Commercial UIs",
    excerpt:
      "How we use lightweight OGL pipelines and fractional Brownian motion shaders to create depth without sacrificing 60fps mobile performance.",
    body: `Static gradient backgrounds belong to the last decade of the web. Modern high-tier web surfaces need kinetic vitality — subtle, reactive depth that makes the digital interface feel physical and alive.

### Lightweight Shaders with OGL
Rather than pulling in heavy full-engine 3D libraries for background aesthetics, we utilize custom GLSL fragment shaders compiled through lightweight WebGL wrappers. 

Using multi-octave simplex noise and procedural fbm (fractional Brownian motion), we generate fluid, organic wave dynamics calculated directly on the GPU. By caching the canvas viewport and tracking scroll velocity, the GPU overhead stays below 2% on modern mobile devices while delivering hypnotic visual atmosphere.`,
    articleType: "BUILD_LOG",
    bottleneckTag: "PRODUCT",
    coverImageUrl: null,
    tags: ["WebGL", "GLSL", "Frontend", "Performance"],
    published: true,
    featured: false,
    publishedAt: new Date("2026-07-22T09:15:00.000Z"),
  },
];

export const FALLBACK_UPDATES: UpdateItem[] = [
  {
    id: "content-api-reading-archives",
    slug: "content-api-reading-archives",
    title: "Content API & Reading Archives Infrastructure Deployed",
    summary:
      "Integrated PostgreSQL Prisma backend models for CaseStudies, Articles, and UpdatePosts with server-side caching and dynamic feeds.",
    body: "Deployed unified reading archives at /reading. Integrated relational models and fast dynamic indexing for case studies, studio essays, and client dispatches.",
    coverImageUrl: null,
    tags: ["Backend", "Architecture"],
    published: true,
    publishedAt: new Date("2026-08-30T12:00:00.000Z"),
  },
  {
    id: "shipped-doom-studio-site",
    slug: "shipped-doom-studio-site",
    title: "Shipped the Doom Studio Digital Surface",
    summary:
      "Hero parallax, services accordion, work modal portals, approach flowchart, and pricing living shaders are now fully live.",
    body: "The Doom Studio public surface is officially deployed. High-performance Next.js Turbopack architecture, Lenis smooth scrolling, Boxing typography, and modular Prisma database schemas.",
    coverImageUrl: null,
    tags: ["Shipping", "Release"],
    published: true,
    publishedAt: new Date("2026-08-20T09:00:00.000Z"),
  },
];

export async function getAllCaseStudies(): Promise<CaseStudyItem[]> {
  try {
    if (!process.env.DATABASE_URL) return FALLBACK_CASE_STUDIES;
    return await prisma.caseStudy.findMany({
      where: { published: true },
      select: caseStudyDetailSelect,
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return FALLBACK_CASE_STUDIES;
  }
}

export async function getAllArticles(): Promise<ArticleItem[]> {
  try {
    if (!process.env.DATABASE_URL) return FALLBACK_ARTICLES;
    return await prisma.article.findMany({
      where: { published: true },
      select: articleDetailSelect,
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return FALLBACK_ARTICLES;
  }
}

export async function getAllUpdates(): Promise<UpdateItem[]> {
  try {
    if (!process.env.DATABASE_URL) return FALLBACK_UPDATES;
    return await prisma.updatePost.findMany({
      where: { published: true },
      select: updateDetailSelect,
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return FALLBACK_UPDATES;
  }
}

export async function getCaseStudyBySlug(
  slug: string
): Promise<CaseStudyItem | null> {
  try {
    if (!process.env.DATABASE_URL) {
      return (
        FALLBACK_CASE_STUDIES.find((cs) => cs.slug === slug) ?? null
      );
    }
    const item = await prisma.caseStudy.findUnique({
      where: { slug },
      select: caseStudyDetailSelect,
    });
    if (item && item.published) return item;
    return (
      FALLBACK_CASE_STUDIES.find((cs) => cs.slug === slug) ?? null
    );
  } catch {
    return (
      FALLBACK_CASE_STUDIES.find((cs) => cs.slug === slug) ?? null
    );
  }
}

export async function getArticleBySlug(
  slug: string
): Promise<ArticleItem | null> {
  try {
    if (!process.env.DATABASE_URL) {
      return FALLBACK_ARTICLES.find((a) => a.slug === slug) ?? null;
    }
    const item = await prisma.article.findUnique({
      where: { slug },
      select: articleDetailSelect,
    });
    if (item && item.published) return item;
    return FALLBACK_ARTICLES.find((a) => a.slug === slug) ?? null;
  } catch {
    return FALLBACK_ARTICLES.find((a) => a.slug === slug) ?? null;
  }
}
