"use client";

import React from "react";
import type { CaseStudyItem, ArticleItem, UpdateItem } from "@/lib/readings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SpiralDiary from "./SpiralDiary";

interface ReadingsViewProps {
  caseStudies: CaseStudyItem[];
  articles: ArticleItem[];
  updates: UpdateItem[];
  initialTab?: "all" | "case-studies" | "articles" | "updates";
}

export function ReadingsView({
  caseStudies,
  articles,
  updates,
  initialTab = "all",
}: ReadingsViewProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#120408] selection:bg-[#4b1426] selection:text-[#fff2f2]">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Kalam:wght@300;400;700&family=Patrick+Hand&family=Permanent+Marker&display=swap"
      />
      {/* ── Top Site-Wide Navigation Bar (Unchanged) ── */}
      <Navbar />

      {/* ── Complete Diary with framing gap on all 4 sides (matching hero section) ── */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
        <SpiralDiary
          caseStudies={caseStudies}
          articles={articles}
          updates={updates}
          initialTab={initialTab}
        />
      </main>

      {/* ── Footer (Unchanged) ── */}
      <Footer wordmark="DOOM" />
    </div>
  );
}

export default ReadingsView;
