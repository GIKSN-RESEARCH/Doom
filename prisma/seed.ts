import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.caseStudy.upsert({
    where: { slug: "giksn" },
    update: {},
    create: {
      slug: "giksn",
      title: "GIKSN",
      outcomeLine: "A studio site that finally matches the work it sells.",
      bottleneck: "The product looked cheaper than the people building it.",
      context:
        "GIKSN had the craft. The public surface did not. The site read like a template, so serious buyers bounced before they saw the work.",
      whatWeDid:
        "We rebuilt the site around proof: tighter story, stronger type, and a work system that opens into real case detail instead of a grid of thumbnails.",
      whatChanged:
        "The studio now leads with finished work, not a generic pitch. Enquiries come in already knowing what Doom actually ships.",
      tags: ["brand", "web", "studio"],
      coverImageUrl: "/work/giksn/screenshot.png",
      galleryUrls: [
        "/work/giksn/GIKSN_profile.jpg",
        "/work/giksn/logo.jpg",
      ],
      liveUrl: null,
      year: 2026,
      published: true,
      featured: true,
      publishedAt: new Date("2026-03-12T10:00:00.000Z"),
    },
  });

  await prisma.caseStudy.upsert({
    where: { slug: "rinne-rebrand" },
    update: {},
    create: {
      slug: "rinne-rebrand",
      title: "Rinne rebrand",
      outcomeLine: "",
      bottleneck: "",
      context: "Draft. Brand system still in review.",
      whatWeDid: "",
      whatChanged: "",
      tags: ["brand", "identity"],
      coverImageUrl: "/work/rinne/screenshot.png",
      galleryUrls: [],
      liveUrl: null,
      year: 2026,
      published: false,
      featured: false,
      publishedAt: null,
    },
  });

  await prisma.updatePost.upsert({
    where: { slug: "shipped-doom-studio-site" },
    update: {},
    create: {
      slug: "shipped-doom-studio-site",
      title: "Shipped the Doom Studio site",
      summary:
        "Hero, services, work, approach, and pricing are live. No CMS yet. Content is still in the codebase.",
      body: "The public site is up. Design, engineering, and the combined offer now sit on one page with the wine/blush kit. Next: this content API, then the actual case study and writing surfaces.",
      coverImageUrl: null,
      tags: ["shipping", "site"],
      published: true,
      publishedAt: new Date("2026-08-20T09:00:00.000Z"),
    },
  });

  await prisma.updatePost.upsert({
    where: { slug: "content-api-wip" },
    update: {},
    create: {
      slug: "content-api-wip",
      title: "Content API in progress",
      summary: "Draft note. Not ready to publish.",
      body: "",
      coverImageUrl: null,
      tags: ["backend"],
      published: false,
      publishedAt: null,
    },
  });

  await prisma.article.upsert({
    where: { slug: "kill-the-bottleneck" },
    update: {},
    create: {
      slug: "kill-the-bottleneck",
      title: "Kill the bottleneck",
      excerpt:
        "Most studios start with tools. We start with the thing that is actually blocking the product from shipping.",
      body: "A founder does not need another moodboard. They need the one constraint that is stopping the product from existing in the world. Sometimes that is the interface. Sometimes it is the handoff. Sometimes it is a story that cannot be explained in one sentence. Doom exists to find that constraint and kill it.",
      articleType: "EXPLAINER",
      bottleneckTag: "CLARITY",
      coverImageUrl: null,
      tags: ["studio", "process"],
      published: true,
      featured: true,
      publishedAt: new Date("2026-04-02T12:00:00.000Z"),
    },
  });

  await prisma.article.upsert({
    where: { slug: "giksn-build-log" },
    update: {},
    create: {
      slug: "giksn-build-log",
      title: "GIKSN build log",
      excerpt: "",
      body: "",
      articleType: "BUILD_LOG",
      bottleneckTag: "SHIPPING",
      coverImageUrl: null,
      tags: ["build-log"],
      published: false,
      featured: false,
      publishedAt: null,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
