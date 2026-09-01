"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowUpRight,
  Plus,
  BookOpen,
  Sparkles,
  Layers,
  Calendar,
  ExternalLink,
} from "lucide-react";
import type { CaseStudyItem, ArticleItem, UpdateItem } from "@/lib/readings";
import ScanGridButton from "@/components/originkit/ui/scan-grid-button";
import Footer from "@/components/Footer";

interface ReadingsViewProps {
  caseStudies: CaseStudyItem[];
  articles: ArticleItem[];
  updates: UpdateItem[];
}

type TabType = "all" | "case-studies" | "articles" | "updates";

export function ReadingsView({
  caseStudies,
  articles,
  updates,
}: ReadingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudyItem | null>(null);
  const [activeArticle, setActiveArticle] = useState<ArticleItem | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    caseStudies.forEach((cs) => cs.tags.forEach((t) => tagSet.add(t)));
    articles.forEach((a) => a.tags.forEach((t) => tagSet.add(t)));
    updates.forEach((u) => u.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [caseStudies, articles, updates]);

  // Filtered items
  const filteredCaseStudies = useMemo(() => {
    if (activeTab !== "all" && activeTab !== "case-studies") return [];
    if (!selectedTag) return caseStudies;
    return caseStudies.filter((cs) =>
      cs.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
    );
  }, [caseStudies, activeTab, selectedTag]);

  const filteredArticles = useMemo(() => {
    if (activeTab !== "all" && activeTab !== "articles") return [];
    if (!selectedTag) return articles;
    return articles.filter((a) =>
      a.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
    );
  }, [articles, activeTab, selectedTag]);

  const filteredUpdates = useMemo(() => {
    if (activeTab !== "all" && activeTab !== "updates") return [];
    if (!selectedTag) return updates;
    return updates.filter((u) =>
      u.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
    );
  }, [updates, activeTab, selectedTag]);

  const totalCount =
    filteredCaseStudies.length +
    filteredArticles.length +
    filteredUpdates.length;

  const featuredArticle = articles.find((a) => a.featured) || articles[0];

  return (
    <div className="min-h-screen bg-[#120408] text-[#fff2f2] selection:bg-[#4b1426] selection:text-[#fff2f2]">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#120408]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              <span>Studio</span>
            </Link>
            <div className="h-4 w-px bg-white/20" />
            <Link href="/" className="font-logo text-xl tracking-[0.16em] uppercase text-[#fff2f2]">
              DOOM
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ScanGridButton
              link="/#pricing"
              label="Get Started"
              borderRadius={0}
              padding="8px 20px"
              font={{
                fontFamily: "var(--font-clash-display)",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
              colors={{
                fill: "rgba(255, 255, 255, 0.08)",
                textColor: "#FFFFFF",
                hoverFill: "rgba(255, 255, 255, 0.2)",
                hoverTextColor: "#FFFFFF",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.2)",
              }}
              border={{
                borderWidth: 1,
                borderStyle: "solid",
                borderColor: "rgba(255, 255, 255, 0.25)",
              }}
              scan={{
                color: "#FFFFFF",
                speed: 50,
              }}
            />
          </div>
        </div>
      </header>

      {/* ── Masthead ── */}
      <section className="relative overflow-hidden border-b border-white/10 px-5 pt-16 pb-12 sm:px-8 sm:pt-24 sm:pb-20">
        {/* Soundwave background graphic spanning complete width */}
        <div
          className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
          style={{
            backgroundImage: "url('/Soundwave-4096x4096.svg')",
            backgroundSize: "100% 100%",
            backgroundPosition: "center bottom",
            backgroundRepeat: "no-repeat",
            opacity: 0.95,
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 75%, rgba(0,0,0,0.3) 96%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 75%, rgba(0,0,0,0.3) 96%, transparent 100%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-none border border-[#e07a93]/40 bg-[#4b1426]/60 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.25em] text-[#fff2f2]">
              <Sparkles className="size-3 text-[#e07a93]" />
              Doom Studio Dispatches
            </span>
            <span className="text-xs font-mono tracking-wider text-white/40">
              {"// Vol. 2026"}
            </span>
          </div>

          <h1 className="mt-6 font-heading text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl text-white">
            Readings <span className="text-[#e07a93]">&</span> Case Studies.
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-white/70 font-medium">
            Deep breakdowns of how we identify and eliminate bottlenecks for high-leverage products, along with studio essays on computing, design systems, and rapid shipping.
          </p>

          {/* ── Segmented Control Filter Tabs ── */}
          <div className="mt-12 flex flex-wrap items-center gap-3">
            {[
              { id: "all", label: "All Readings", count: caseStudies.length + articles.length + updates.length },
              { id: "case-studies", label: "Case Studies", count: caseStudies.length },
              { id: "articles", label: "Articles & Essays", count: articles.length },
              { id: "updates", label: "Studio Updates", count: updates.length },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setSelectedTag(null);
                  }}
                  className={`group relative flex items-center gap-2 border px-4 py-2.5 text-xs sm:text-sm font-semibold tracking-wide transition-all ${
                    isActive
                      ? "border-[#e07a93] bg-[#4b1426] text-white shadow-[0_0_20px_rgba(224,122,147,0.3)]"
                      : "border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Tag filter pills ── */}
          {allTags.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-white/40 mr-1">
                Filter by topic:
              </span>
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="rounded border border-[#e07a93]/60 bg-[#e07a93]/20 px-2.5 py-1 text-[11px] font-mono text-[#fff2f2] hover:bg-[#e07a93]/30"
                >
                  Clear filter ×
                </button>
              )}
              {allTags.map((tag) => {
                const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    onClick={() =>
                      setSelectedTag(isSelected ? null : tag)
                    }
                    className={`rounded border px-2.5 py-1 text-[11px] font-mono transition-all ${
                      isSelected
                        ? "border-[#e07a93] bg-[#4b1426] text-white"
                        : "border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Main Content Feed ── */}
      <main className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        {/* Spotlight Featured Card (When on All or Articles tab without tag filter) */}
        {!selectedTag && activeTab === "all" && featuredArticle && (
          <div className="mb-16 sm:mb-20">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#e07a93]">
                ★ Spotlight Essay
              </span>
            </div>
            <div
              onClick={() => setActiveArticle(featuredArticle)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[#4b1426] bg-[#300c17] p-6 sm:p-10 shadow-2xl transition-all duration-300 hover:border-[#e07a93]/50 hover:bg-[#3a0f1c]"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded bg-[#4b1426] px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#e07a93]">
                      {featuredArticle.articleType || "EXPLAINER"}
                    </span>
                    {featuredArticle.bottleneckTag && (
                      <span className="rounded border border-white/20 bg-black/40 px-2.5 py-1 text-[11px] font-mono text-white/70">
                        Bottleneck: {featuredArticle.bottleneckTag}
                      </span>
                    )}
                    <span className="text-xs font-mono text-white/40">
                      Written by Doom Studio
                    </span>
                  </div>

                  <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl group-hover:text-[#fff2f2]">
                    {featuredArticle.title}
                  </h2>

                  <p className="mt-4 text-base sm:text-lg leading-relaxed text-white/80 font-medium">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="mt-6 flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#e07a93] group-hover:underline">
                      Read Complete Breakdown <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                  {featuredArticle.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-white/10 bg-black/30 px-3 py-1 text-xs font-mono text-white/60"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Case Studies Section ── */}
        {filteredCaseStudies.length > 0 && (
          <section className="mb-20 sm:mb-28">
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Layers className="size-5 text-[#e07a93]" />
                <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Case Studies & Proof
                </h2>
              </div>
              <span className="text-xs font-mono tracking-wider text-white/50">
                {filteredCaseStudies.length} {filteredCaseStudies.length === 1 ? "Study" : "Studies"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-10">
              {filteredCaseStudies.map((cs) => (
                <div
                  key={cs.id}
                  onClick={() => setActiveCaseStudy(cs)}
                  className="group relative flex flex-col cursor-pointer overflow-hidden rounded-3xl border border-[#4b1426] bg-[#22070f] p-4 sm:p-5 shadow-xl transition-all duration-300 hover:border-[#e07a93]/50 hover:bg-[#2c0a14]"
                >
                  {/* Screenshot Cover Frame */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cs.coverImageUrl}
                      alt={cs.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="rounded bg-black/70 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-white backdrop-blur-md">
                        {cs.year || "2026"}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-none bg-black/70 text-white backdrop-blur-md group-hover:bg-[#4b1426]">
                      <Plus className="size-4" />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col justify-between pt-5 px-1">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {cs.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-mono text-white/60"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-heading text-2xl font-bold tracking-tight text-white group-hover:text-[#fff2f2]">
                        {cs.title}
                      </h3>

                      <p className="mt-2 text-sm sm:text-base font-medium leading-relaxed text-[#e07a93]">
                        {cs.outcomeLine}
                      </p>

                      {cs.bottleneck && (
                        <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3">
                          <p className="text-xs font-mono uppercase tracking-wider text-white/50">
                            Bottleneck Killed:
                          </p>
                          <p className="mt-1 text-xs sm:text-sm text-white/80 font-medium">
                            {cs.bottleneck}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-xs font-mono text-white/50">
                        Written by Doom Studio
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#e07a93] group-hover:underline">
                        View Details <ArrowUpRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Articles & Studio Writing Section ── */}
        {filteredArticles.length > 0 && (
          <section className="mb-20 sm:mb-28">
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="size-5 text-[#e07a93]" />
                <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Articles & Technical Breakdowns
                </h2>
              </div>
              <span className="text-xs font-mono tracking-wider text-white/50">
                {filteredArticles.length} {filteredArticles.length === 1 ? "Article" : "Articles"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setActiveArticle(article)}
                  className="group relative flex flex-col justify-between cursor-pointer overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-[#e07a93]/50 hover:bg-[#300c17]/60"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="rounded bg-[#4b1426] px-2.5 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#e07a93]">
                        {article.articleType || "ARTICLE"}
                      </span>
                      {article.bottleneckTag && (
                        <span className="text-[10px] font-mono text-white/50">
                          [{article.bottleneckTag}]
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-xl font-bold tracking-tight text-white group-hover:text-[#fff2f2]">
                      {article.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-white/70 line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-white/40">
                        Doom Studio
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#e07a93] group-hover:underline">
                        Read <ArrowUpRight className="size-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Studio Updates & Changelog ── */}
        {filteredUpdates.length > 0 && (
          <section className="mb-20">
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-[#e07a93]" />
                <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Studio Updates & Changelog
                </h2>
              </div>
              <span className="text-xs font-mono tracking-wider text-white/50">
                {filteredUpdates.length} {filteredUpdates.length === 1 ? "Update" : "Updates"}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {filteredUpdates.map((update) => (
                <div
                  key={update.id}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-md"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-[#e07a93] animate-pulse" />
                      <h3 className="font-heading text-lg font-bold text-white">
                        {update.title}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-white/40">
                      {update.publishedAt
                        ? new Date(update.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "2026"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-white/80">
                    {update.summary}
                  </p>

                  {update.body && (
                    <p className="mt-2 text-xs sm:text-sm leading-relaxed text-white/60 font-mono">
                      {update.body}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {update.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-mono text-white/50"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {totalCount === 0 && (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-white/60">
              No dispatches found matching the current filter.
            </p>
            <button
              onClick={() => {
                setActiveTab("all");
                setSelectedTag(null);
              }}
              className="mt-4 text-sm font-semibold text-[#e07a93] underline underline-offset-4"
            >
              Reset all filters
            </button>
          </div>
        )}
      </main>

      {/* ── Case Study Full Reader Modal ── */}
      <AnimatePresence>
        {activeCaseStudy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCaseStudy(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#4b1426] bg-[#22070f] p-6 sm:p-10 shadow-2xl"
            >
              <button
                onClick={() => setActiveCaseStudy(null)}
                className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Close"
              >
                <Plus className="size-5 rotate-45" />
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="rounded bg-[#4b1426] px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-[#e07a93]">
                  Case Study // {activeCaseStudy.year || "2026"}
                </span>
                {activeCaseStudy.liveUrl && (
                  <a
                    href={activeCaseStudy.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded border border-white/20 bg-white/5 px-2.5 py-1 text-xs font-mono text-white/80 hover:bg-white/15"
                  >
                    <span>{activeCaseStudy.liveUrl.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>

              <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
                {activeCaseStudy.title}
              </h2>

              <p className="mt-3 text-lg sm:text-xl font-medium text-[#e07a93]">
                {activeCaseStudy.outcomeLine}
              </p>

              {/* Cover Image */}
              <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeCaseStudy.coverImageUrl}
                  alt=""
                  className="w-full object-cover"
                />
              </div>

              {/* Breakdown Grid */}
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {activeCaseStudy.bottleneck && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-5">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-red-400">
                      The Bottleneck
                    </h4>
                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/90">
                      {activeCaseStudy.bottleneck}
                    </p>
                  </div>
                )}

                {activeCaseStudy.context && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <h4 className="text-xs font-mono uppercase tracking-widest text-white/50">
                      The Context
                    </h4>
                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-white/90">
                      {activeCaseStudy.context}
                    </p>
                  </div>
                )}
              </div>

              {activeCaseStudy.whatWeDid && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#e07a93]">
                    What We Built & Shipped
                  </h4>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-white/90">
                    {activeCaseStudy.whatWeDid}
                  </p>
                </div>
              )}

              {activeCaseStudy.whatChanged && (
                <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 sm:p-6">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                    The Outcome & Impact
                  </h4>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-white/90">
                    {activeCaseStudy.whatChanged}
                  </p>
                </div>
              )}

              {/* Gallery */}
              {activeCaseStudy.galleryUrls.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-white/50 mb-4">
                    Artifacts & Brand Assets
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {activeCaseStudy.galleryUrls.map((img, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-xl border border-white/10 bg-black"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt=""
                          className="h-48 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Article Full Reader Modal ── */}
      <AnimatePresence>
        {activeArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveArticle(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#4b1426] bg-[#22070f] p-6 sm:p-12 shadow-2xl"
            >
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Close"
              >
                <Plus className="size-5 rotate-45" />
              </button>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="rounded bg-[#4b1426] px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider text-[#e07a93]">
                  {activeArticle.articleType || "ESSAY"}
                </span>
                {activeArticle.bottleneckTag && (
                  <span className="rounded border border-white/20 bg-black/40 px-2.5 py-1 text-xs font-mono text-white/70">
                    Bottleneck: {activeArticle.bottleneckTag}
                  </span>
                )}
              </div>

              <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-5xl">
                {activeArticle.title}
              </h2>

              <div className="mt-4 flex items-center gap-4 text-xs font-mono text-white/50 border-b border-white/10 pb-6">
                <span>By Doom Studio</span>
                <span>•</span>
                <span>
                  {activeArticle.publishedAt
                    ? new Date(activeArticle.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "2026"}
                </span>
              </div>

              <div className="mt-8 space-y-6 text-base sm:text-lg leading-relaxed text-white/85">
                {activeArticle.body.split("\n\n").map((para, i) => {
                  if (para.startsWith("### ")) {
                    return (
                      <h3
                        key={i}
                        className="font-heading text-2xl font-bold text-white pt-4"
                      >
                        {para.replace("### ", "")}
                      </h3>
                    );
                  }
                  return <p key={i}>{para}</p>;
                })}
              </div>

              <div className="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                {activeArticle.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-white/60"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <Footer wordmark="DOOM" />
    </div>
  );
}

export default ReadingsView;
