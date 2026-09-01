import type { Metadata } from "next";
import {
  getAllCaseStudies,
  getAllArticles,
  getAllUpdates,
} from "@/lib/readings";
import { ReadingsView } from "@/components/Readings/ReadingsView";

export const metadata: Metadata = {
  title: "Readings & Case Studies — Doom Studio",
  description:
    "Deep breakdowns on eliminating bottlenecks for high-leverage products, along with studio essays on computing, design systems, and rapid shipping.",
};

export const dynamic = "force-dynamic";

export default async function ReadingPage() {
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
    />
  );
}
