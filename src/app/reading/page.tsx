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

export default async function ReadingPage() {
  const [caseStudies, articles, updates] = await Promise.all([
    getAllCaseStudies(),
    getAllArticles(),
    getAllUpdates(),
  ]);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* Intentionally route-scoped: these display fonts are unused by the landing page. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Kalam:wght@300;400;700&family=Patrick+Hand&family=Permanent+Marker&display=swap"
      />
      <ReadingsView
        caseStudies={caseStudies}
        articles={articles}
        updates={updates}
      />
    </>
  );
}
