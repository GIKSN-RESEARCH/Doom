import type { Metadata } from "next";
import {
  getAllCaseStudies,
  getAllArticles,
  getAllUpdates,
} from "@/lib/readings";
import {
  SITE_NAME,
  SITE_OG_IMAGE,
} from "@/lib/site";
import { ReadingsView } from "@/components/Readings/ReadingsView";

type DiaryTab = "all" | "case-studies" | "articles" | "updates";

function parseTab(value: string | undefined): DiaryTab {
  if (
    value === "case-studies" ||
    value === "articles" ||
    value === "updates" ||
    value === "all"
  ) {
    return value;
  }
  return "all";
}

const READING_TITLE = "Readings & Case Studies";
const READING_DESCRIPTION =
  "Deep product breakdowns, engineering notes, design systems, and studio essays on eliminating bottlenecks and shipping better products.";

export const metadata: Metadata = {
  title: READING_TITLE,
  description: READING_DESCRIPTION,
  alternates: {
    canonical: "/reading",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/reading",
    siteName: SITE_NAME,
    title: `${READING_TITLE} — ${SITE_NAME}`,
    description: READING_DESCRIPTION,
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} readings and case studies`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${READING_TITLE} — ${SITE_NAME}`,
    description: READING_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
};

export const dynamic = "force-dynamic";

export default async function ReadingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const [caseStudies, articles, updates] = await Promise.all([
    getAllCaseStudies(),
    getAllArticles(),
    getAllUpdates(),
  ]);

  return (
    <ReadingsView
      caseStudies={caseStudies}
      articles={articles}
      updates={updates}
      initialTab={parseTab(params.tab)}
    />
  );
}
