import type { Metadata } from "next";
import {
  getAllCaseStudies,
  getAllArticles,
  getAllUpdates,
} from "@/lib/readings";
import { SITE_NAME, SITE_OG_IMAGE } from "@/lib/site";
import { ReadingsView } from "@/components/Readings/ReadingsView";

const UPDATES_TITLE = "Updates";
const UPDATES_DESCRIPTION =
  "Studio changelog: shipping notes, product releases, and what Doom is building now.";

export const metadata: Metadata = {
  title: UPDATES_TITLE,
  description: UPDATES_DESCRIPTION,
  alternates: {
    canonical: "/updates",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/updates",
    siteName: SITE_NAME,
    title: `${UPDATES_TITLE} — ${SITE_NAME}`,
    description: UPDATES_DESCRIPTION,
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} updates`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${UPDATES_TITLE} — ${SITE_NAME}`,
    description: UPDATES_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
};

export const dynamic = "force-dynamic";

export default async function UpdatesPage() {
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
      initialTab="updates"
    />
  );
}
