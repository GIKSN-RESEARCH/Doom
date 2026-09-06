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
}

export function ReadingsView({
  caseStudies,
  articles,
  updates,
}: ReadingsViewProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#120408] selection:bg-[#4b1426] selection:text-[#fff2f2]">
      {/* ── Top Site-Wide Navigation Bar (Unchanged) ── */}
      <Navbar />

      {/* ── Complete Diary with framing gap on all 4 sides (matching hero section) ── */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
        <SpiralDiary
          caseStudies={caseStudies}
          articles={articles}
          updates={updates}
        />
      </main>

      {/* ── Footer (Unchanged) ── */}
      <Footer wordmark="DOOM" />
    </div>
  );
}

export default ReadingsView;
