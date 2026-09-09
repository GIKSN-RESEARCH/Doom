"use client";

import React, { useState, useMemo, useEffect, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ExternalLink,
  Search,
  PenTool,
  Type,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Zap,
  Tag,
} from "lucide-react";
import type { CaseStudyItem, ArticleItem, UpdateItem } from "@/lib/readings";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * GridSnap wrapper ensures any non-line-height content (images, badges, cards)
 * occupies a total height + bottom margin that is an exact multiple of 32px (32k).
 * This guarantees the baseline grid never drifts.
 */
function GridSnap({
  children,
  className = "",
  blankLinesAfter = 1,
}: {
  children: React.ReactNode;
  className?: string;
  blankLinesAfter?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [padBottom, setPadBottom] = useState<number>(0);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const updatePadding = () => {
      const height = el.getBoundingClientRect().height;
      if (height === 0) return;
      const remainder = Math.round(height) % 32;
      const pad = remainder === 0 ? 0 : 32 - remainder;
      setPadBottom(pad);
    };

    updatePadding();

    const observer = new ResizeObserver(() => {
      updatePadding();
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{ marginBottom: `${padBottom + blankLinesAfter * 32}px` }}
      className={className}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
}

interface SpiralDiaryProps {
  caseStudies: CaseStudyItem[];
  articles: ArticleItem[];
  updates: UpdateItem[];
}

type TabType = "all" | "case-studies" | "articles" | "updates";

export type DiaryEntry =
  | { kind: "case-study"; item: CaseStudyItem; date: Date; pageNum: string }
  | { kind: "article"; item: ArticleItem; date: Date; pageNum: string }
  | { kind: "update"; item: UpdateItem; date: Date; pageNum: string };

export function SpiralDiary({
  caseStudies,
  articles,
  updates,
}: SpiralDiaryProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [useHandwriting, setUseHandwriting] = useState<boolean>(true);

  // Selected entry for the complete diary page view (null = Table of Contents)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Combined and sorted entries with page numbers
  const allEntries: DiaryEntry[] = useMemo(() => {
    const list: DiaryEntry[] = [];
    let p = 1;

    caseStudies.forEach((cs) => {
      list.push({
        kind: "case-study",
        item: cs,
        date: cs.publishedAt ? new Date(cs.publishedAt) : new Date("2026-03-12"),
        pageNum: String(p).padStart(2, "0"),
      });
      p += 2;
    });

    articles.forEach((a) => {
      list.push({
        kind: "article",
        item: a,
        date: a.publishedAt ? new Date(a.publishedAt) : new Date("2026-04-02"),
        pageNum: String(p).padStart(2, "0"),
      });
      p += 3;
    });

    updates.forEach((u) => {
      list.push({
        kind: "update",
        item: u,
        date: u.publishedAt ? new Date(u.publishedAt) : new Date("2026-08-20"),
        pageNum: String(p).padStart(2, "0"),
      });
      p += 1;
    });

    // Sort chronologically descending
    return list.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [caseStudies, articles, updates]);

  // Unique tags across all entries
  const allTags = useMemo(() => {
    const set = new Set<string>();
    caseStudies.forEach((cs) => cs.tags.forEach((t) => set.add(t)));
    articles.forEach((a) => a.tags.forEach((t) => set.add(t)));
    updates.forEach((u) => u.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [caseStudies, articles, updates]);

  // Flagship spotlight article
  const spotlightArticle = useMemo(() => {
    return articles.find((a) => a.featured) || articles[0] || null;
  }, [articles]);

  // Filtered entries for Table of Contents
  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      // Tab filter
      if (activeTab === "case-studies" && entry.kind !== "case-study") return false;
      if (activeTab === "articles" && entry.kind !== "article") return false;
      if (activeTab === "updates" && entry.kind !== "update") return false;

      // Tag filter
      if (selectedTag) {
        const hasTag = entry.item.tags.some(
          (t) => t.toLowerCase() === selectedTag.toLowerCase()
        );
        if (!hasTag) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = entry.item.title.toLowerCase().includes(q);
        const tagMatch = entry.item.tags.some((t) => t.toLowerCase().includes(q));
        const bodyMatch =
          entry.kind === "case-study"
            ? (entry.item.outcomeLine + " " + entry.item.bottleneck).toLowerCase().includes(q)
            : entry.kind === "article"
            ? (entry.item.excerpt + " " + entry.item.body).toLowerCase().includes(q)
            : (entry.item.summary + " " + entry.item.body).toLowerCase().includes(q);
        return titleMatch || tagMatch || bodyMatch;
      }

      return true;
    });
  }, [allEntries, activeTab, selectedTag, searchQuery]);

  // Active full entry
  const currentEntry = useMemo(() => {
    if (!selectedEntryId) return null;
    return allEntries.find((e) => `${e.kind}-${e.item.id}` === selectedEntryId) || null;
  }, [allEntries, selectedEntryId]);

  // Scroll to top when switching view
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedEntryId]);

  // Navigate to prev/next entry
  const currentIndex = currentEntry
    ? allEntries.findIndex((e) => `${e.kind}-${e.item.id}` === selectedEntryId)
    : -1;
  const prevEntry = currentIndex > 0 ? allEntries[currentIndex - 1] : null;
  const nextEntry = currentIndex < allEntries.length - 1 ? allEntries[currentIndex + 1] : null;

  return (
    <div className="relative mx-auto w-full max-w-[1520px] my-auto">
      {/* ── Outer Hardcover Backing Board of the Diary (Deep Wine / Leatherette) ── */}
      <div className="relative rounded-[28px] sm:rounded-[36px] bg-[#23060f] p-2 sm:p-3 md:p-3.5 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_12px_36px_rgba(0,0,0,0.6)] border border-white/10">
        {/* ── Top Stacked Pages Layer (Showing paper edges along the top) ── */}
        <div className="pointer-events-none absolute -top-2 left-10 sm:left-16 right-3 h-4 rounded-t-xl bg-[#ede4d4] border-t border-x border-[#dcd0bd] shadow-2xs -z-10" />
        <div className="pointer-events-none absolute -top-1 left-9 sm:left-14 right-2.5 h-3 rounded-t-xl bg-[#f5efe4] border-t border-x border-[#e4d9c8] shadow-2xs -z-10" />

        {/* ── The White Ruled Diary Page with Stacked Paper Thickness on Right & Bottom ── */}
        <div
          className="relative w-full rounded-[22px] sm:rounded-[30px] border border-black/10 bg-white notebook-paper-lined-white text-[#1c0810] selection:bg-[#4b1426] selection:text-[#fff2f2] overflow-hidden"
          style={{
            boxShadow:
              "3px 3px 0px #f5efe6, 6px 6px 0px #ebe2d2, 9px 9px 0px #ded3bf, 12px 12px 0px #24060f",
          }}
        >
          {/* ── Left-Side Vertical Spiral Binding (Always present on left spine) ── */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-30 w-12 sm:w-16 md:w-20 overflow-hidden">
            {/* Back Cover / Spine strip border on the extreme left */}
            <div className="absolute left-0 top-0 bottom-0 w-3 sm:w-4 bg-[#1f050d] border-r border-[#0d0205] shadow-inner" />

            {/* Seamless Repeating SVG Spiral Rings and Punched Holes */}
            <svg
              className="absolute left-0 top-0 h-full w-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Metallic chrome/brass gradient for the wire coils */}
                <linearGradient id="spiralMetal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4a443e" />
                  <stop offset="25%" stopColor="#b5aea2" />
                  <stop offset="48%" stopColor="#ffffff" />
                  <stop offset="72%" stopColor="#968e81" />
                  <stop offset="100%" stopColor="#3d3732" />
                </linearGradient>

                {/* Repeating spiral unit (44px height) */}
                <pattern
                  id="vertical-spiral-pattern"
                  width="80"
                  height="44"
                  patternUnits="userSpaceOnUse"
                >
                  {/* Paper Hole (dark shadow inside punched hole) */}
                  <ellipse cx="44" cy="22" rx="4.5" ry="7" fill="#140409" />
                  <ellipse cx="44" cy="22" rx="3.5" ry="6" fill="#000000" />

                  {/* Cast shadow of wire ring on the white paper */}
                  <path
                    d="M 2 15 C 16 16, 30 19, 44 23"
                    stroke="rgba(0,0,0,0.22)"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Front Metallic Wire Coil entering hole */}
                  <path
                    d="M 0 13 C 14 14, 28 18, 44 22"
                    stroke="url(#spiralMetal)"
                    strokeWidth="3.6"
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Specular White Highlight line on wire */}
                  <path
                    d="M 6 14 C 18 15, 28 18, 38 21"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                </pattern>
              </defs>

              <rect width="100%" height="100%" fill="url(#vertical-spiral-pattern)" />
            </svg>
          </div>

          {/* ── Main Diary Content Area: Padded past left vertical spiral spine ── */}
          <div className="relative pl-14 pr-4 pt-[64px] pb-[96px] sm:pl-20 sm:pr-8 md:pl-28 md:pr-10 lg:pr-12">
        {/* ── Top Ribbon Controls: Font Switcher & Navigation (Locked to 32px rhythm) ── */}
        <div className="relative h-[32px] mb-[64px] flex items-center justify-between gap-4">
          {selectedEntryId ? (
            <button
              onClick={() => setSelectedEntryId(null)}
              className="group inline-flex items-center gap-2 rounded-md border border-[#4b1426]/30 bg-[#4b1426] h-[32px] px-3 py-1 font-mono text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#7e1c36]"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
              <span>← Return to Table of Contents</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 h-[32px]">
              <span className="rounded bg-[#4b1426]/10 px-2.5 py-0.5 font-mono text-xs font-bold uppercase tracking-widest text-[#4b1426]">
                DOOM ARCHIVE
              </span>
              <span className="font-mono text-xs text-black/50">
                {`// ${filteredEntries.length} Recorded Entries`}
              </span>
            </div>
          )}

          {/* Font Mode Switcher */}
          <div className="flex items-center gap-1 rounded-full border border-black/15 bg-white/90 p-0.5 shadow-xs h-[32px]">
            <button
              onClick={() => setUseHandwriting(true)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                useHandwriting
                  ? "bg-[#4b1426] text-white shadow-xs"
                  : "text-black/60 hover:text-black"
              }`}
              title="Handwritten Fountain Pen Ink font"
            >
              <PenTool className="size-3.5" />
              <span>Fountain Pen</span>
            </button>
            <button
              onClick={() => setUseHandwriting(false)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                !useHandwriting
                  ? "bg-[#4b1426] text-white shadow-xs"
                  : "text-black/60 hover:text-black"
              }`}
              title="Clean Editorial Print font"
            >
              <Type className="size-3.5" />
              <span>Clean Print</span>
            </button>
          </div>
        </div>

        {/* ── Multi-Column Grid Utilizing Gutter Space (Inspired by giksn.com) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-10 xl:gap-14 items-start">
          {/* ══════════════════════════════════════════════════════════
              LEFT / CENTER MAIN COLUMN: The Journal Pages
             ══════════════════════════════════════════════════════════ */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              {/* ── VIEW 1: TABLE OF CONTENTS (Index View) ── */}
              {!currentEntry && (
                <motion.div
                  key="table-of-contents"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Page Title & Description written directly on the white diary paper */}
                  <div className="mb-[64px]">
                    <div className="h-[32px] mb-[32px] flex items-center gap-2">
                      <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#b32448] font-bold leading-[32px]">
                        Doom Studio Field Journal // Vol. 2026
                      </span>
                    </div>

                    <div className="mb-[32px]">
                      <h1
                        className={`font-bold text-[#1c0810] leading-[64px] translate-y-[9px] break-words [text-wrap:balance] ${
                          useHandwriting
                            ? "font-handwriting text-5xl sm:text-7xl lg:text-8xl"
                            : "font-heading text-4xl sm:text-6xl lg:text-7xl"
                        }`}
                      >
                        Table of Contents.
                      </h1>
                    </div>

                    <p
                      className={`max-w-3xl text-xl sm:text-2xl leading-[32px] text-[#360d19] mb-[64px] ${
                        useHandwriting ? "font-handwriting" : "font-sans text-base sm:text-lg text-black/75"
                      }`}
                    >
                      A chronological index of studio essays, client case studies, and bottleneck dispatches.
                      Click any entry below to flip to its complete diary page.
                    </p>

                    {/* Search slot on the white paper (snapped with 2 blank lines after) */}
                    <GridSnap blankLinesAfter={2}>
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="relative flex-1 min-w-[240px] max-w-md h-[36px]">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#7e1c36]" />
                          <input
                            type="text"
                            placeholder="Search index by keyword, client, or bottleneck..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-[36px] rounded-full border border-black/20 bg-white pl-9 pr-8 text-xs text-[#1c0810] placeholder-black/40 shadow-xs outline-none transition-all focus:border-[#7e1c36]"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-black/40 hover:text-black"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Section tabs styled like sticky page index divider flags */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {[
                            { id: "all", label: "All Dispatches", count: allEntries.length },
                            { id: "case-studies", label: "Case Studies", count: caseStudies.length },
                            { id: "articles", label: "Studio Essays", count: articles.length },
                            { id: "updates", label: "Changelog", count: updates.length },
                          ].map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                              <button
                                key={tab.id}
                                onClick={() => {
                                  setActiveTab(tab.id as TabType);
                                  setSelectedTag(null);
                                }}
                                className={`flex h-[32px] items-center gap-1.5 rounded-full px-3 text-xs font-mono font-semibold transition-all ${
                                  isActive
                                    ? "bg-[#4b1426] text-white shadow-xs"
                                    : "border border-black/15 bg-white text-black/70 hover:bg-black/5 hover:text-black"
                                }`}
                              >
                                <span>{tab.label}</span>
                                <span
                                  className={`rounded-full px-1.5 text-[10px] ${
                                    isActive ? "bg-white/20 text-white" : "bg-black/10 text-black/60"
                                  }`}
                                >
                                  {tab.count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </GridSnap>
                  </div>

                  {/* ── Table of Contents Index Entries List (Zero-padding, mathematically locked) ── */}
                  <div className="mb-[64px]">
                    {/* Table Header Row (Exact 32px height + 32px margin) */}
                    <div className="hidden sm:flex h-[32px] mb-[32px] items-baseline justify-between text-xs font-mono font-bold uppercase tracking-widest text-black/50">
                      <div className="leading-[32px]">Date // Category // Title</div>
                      <div className="text-right leading-[32px]">Dispatch Ref</div>
                    </div>

                    {filteredEntries.map((entry) => {
                      const entryKey = `${entry.kind}-${entry.item.id}`;
                      const monthStr = entry.date.toLocaleDateString("en-US", {
                        month: "short",
                      });
                      const dayStr = entry.date.toLocaleDateString("en-US", {
                        day: "numeric",
                      });
                      const yearStr = entry.date.getFullYear();

                      const kindLabel =
                        entry.kind === "case-study"
                          ? "CASE STUDY"
                          : entry.kind === "article"
                          ? entry.item.articleType || "ESSAY"
                          : "CHANGELOG";

                      const summaryText =
                        entry.kind === "case-study"
                          ? entry.item.outcomeLine
                          : entry.kind === "article"
                          ? entry.item.excerpt
                          : entry.item.summary;

                      return (
                        <div
                          key={entryKey}
                          onClick={() => setSelectedEntryId(entryKey)}
                          className="group cursor-pointer mb-[64px]"
                        >
                          {/* Line 1: Date + Category Badge + Page Reference */}
                          <div className="flex h-[32px] items-baseline justify-between gap-4">
                            <div className="flex items-baseline gap-2.5">
                              <span className="font-mono text-xs text-black/50 leading-[32px] shrink-0">
                                {monthStr} {dayStr}, {yearStr}
                              </span>
                              <span className="rounded bg-[#4b1426]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#4b1426] leading-none shrink-0">
                                {kindLabel}
                              </span>
                            </div>

                            <span className="shrink-0 font-mono text-xs font-bold text-[#7e1c36] leading-[32px]">
                              p. {entry.pageNum} →
                            </span>
                          </div>

                          {/* Line 2: Full Title without truncation, with ample right padding for italic flourishes */}
                          <div className="min-h-[32px]">
                            <h3
                              className={`font-bold tracking-normal text-[#1c0810] group-hover:text-[#7e1c36] transition-colors leading-[32px] pr-8 break-words ${
                                useHandwriting
                                  ? "font-handwriting text-2xl sm:text-[28px]"
                                  : "font-heading text-lg sm:text-xl"
                              }`}
                            >
                              {entry.item.title}
                            </h3>
                          </div>

                          {/* Line 3: Summary handwritten note */}
                          <div className="min-h-[32px]">
                            <p
                              className={`leading-[32px] text-black/70 pr-8 break-words ${
                                useHandwriting ? "font-handwriting text-xl sm:text-2xl" : "font-sans text-sm text-black/60"
                              }`}
                            >
                              {summaryText}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {filteredEntries.length === 0 && (
                      <div className="py-16 text-center">
                        <p className="font-handwriting text-3xl text-black/50">
                          No journal entries found matching this search or topic.
                        </p>
                        <button
                          onClick={() => {
                            setActiveTab("all");
                            setSelectedTag(null);
                            setSearchQuery("");
                          }}
                          className="mt-3 font-marker text-xs text-[#7e1c36] underline"
                        >
                          Reset filters & return to full index
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── VIEW 2: COMPLETE DIARY PAGE (Full Article / Case Study) ── */}
              {currentEntry && (
                <motion.article
                  key={`entry-${currentEntry.kind}-${currentEntry.item.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Hanging Date Tab on Top Margin (snapped with 2 blank lines after) */}
                  <GridSnap blankLinesAfter={2}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center rounded-md border border-[#4b1426]/30 bg-[#4b1426] px-3 py-1 text-center shadow-md">
                          <span className="font-mono text-[10px] uppercase font-bold text-[#fcf9f2]">
                            {currentEntry.date.toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="font-marker text-lg leading-none text-[#fff2f2]">
                            {currentEntry.date.toLocaleDateString("en-US", { day: "numeric" })}
                          </span>
                          <span className="font-mono text-[9px] text-[#e07a93]">
                            {currentEntry.date.getFullYear()}
                          </span>
                        </div>

                        <div>
                          <span className="rounded bg-[#4b1426]/10 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#4b1426]">
                            {currentEntry.kind === "case-study"
                              ? "CASE STUDY DISPATCH"
                              : currentEntry.kind === "article"
                              ? currentEntry.item.articleType || "STUDIO ESSAY"
                              : "CHANGELOG RECORD"}
                          </span>
                          <div className="mt-1 font-mono text-xs text-black/50">
                            {`Page ${currentEntry.pageNum} // Written by Doom Studio ✍`}
                          </div>
                        </div>
                      </div>

                      {currentEntry.kind === "case-study" && currentEntry.item.liveUrl && (
                        <a
                          href={currentEntry.item.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full border border-black/20 bg-white px-3.5 py-1.5 text-xs font-mono font-semibold text-black shadow-xs hover:bg-black/5"
                        >
                          <span>Visit Live {currentEntry.item.title}</span>
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>
                  </GridSnap>

                  {/* Complete Title written on white paper (Fully responsive, balanced, never clipped) */}
                  <div className="mb-[64px] max-w-4xl">
                    <h1
                      className={`font-bold text-[#1c0810] leading-[64px] translate-y-[9px] break-words pr-8 [overflow-wrap:anywhere] [text-wrap:balance] ${
                        useHandwriting
                          ? "font-handwriting text-3xl sm:text-4xl md:text-5xl lg:text-[50px]"
                          : "font-heading text-2xl sm:text-3xl md:text-4xl lg:text-[42px]"
                      }`}
                    >
                      {currentEntry.item.title}
                    </h1>
                  </div>

                  {/* Case study specific content */}
                  {currentEntry.kind === "case-study" && (
                    <div>
                      <p
                        className={`text-2xl sm:text-3xl leading-[32px] text-[#4b1426] font-semibold mb-[64px] ${
                          useHandwriting ? "font-handwriting" : "font-heading"
                        }`}
                      >
                        {currentEntry.item.outcomeLine}
                      </p>

                      {/* Polaroid Screenshot Taped to the ruled page with frosted washi tape */}
                      <GridSnap blankLinesAfter={2} className="max-w-2xl">
                        <div className="relative rounded-2xl border border-black/15 bg-white p-3 sm:p-4 shadow-xl -rotate-0.5 transition-transform hover:rotate-0">
                          {/* Top frosted washi tape */}
                          <div
                            className="absolute -top-3.5 left-1/2 -translate-x-1/2 h-7 w-32 rounded-xs bg-[#f0d5ce]/85 shadow-sm backdrop-blur-sm -rotate-2"
                            style={{
                              backgroundImage:
                                "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(75, 20, 38, 0.08) 4px, rgba(75, 20, 38, 0.08) 8px)",
                            }}
                          />

                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={currentEntry.item.coverImageUrl}
                            alt={currentEntry.item.title}
                            className="h-auto w-full rounded-xl object-cover shadow-xs"
                          />

                          <div className="mt-3 flex items-center justify-between px-2">
                            <span className="font-handwriting text-lg text-black/70">
                              Fig. 1.0 — {currentEntry.item.title} shipped interface
                            </span>
                            <span className="font-mono text-xs text-[#4b1426] font-bold">
                              DOOM STUDIO VERIFIED ✓
                            </span>
                          </div>
                        </div>
                      </GridSnap>

                      {/* Notes Grid: Bottleneck & Context */}
                      <GridSnap blankLinesAfter={2}>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          {currentEntry.item.bottleneck && (
                            <div className="relative rounded-2xl border-2 border-dashed border-red-400/70 bg-[#fff5f6] p-5 shadow-sm">
                              <span className="font-marker text-xs uppercase tracking-wider text-red-800">
                                ⚠ The Critical Bottleneck:
                              </span>
                              <p
                                className={`mt-2 text-xl sm:text-2xl leading-[32px] text-red-950 ${
                                  useHandwriting ? "font-handwriting" : "font-sans text-base leading-relaxed"
                                }`}
                              >
                                &quot;{currentEntry.item.bottleneck}&quot;
                              </p>
                            </div>
                          )}

                          {currentEntry.item.context && (
                            <div className="rounded-2xl border border-black/15 bg-white p-5 shadow-sm">
                              <span className="font-marker text-xs uppercase tracking-wider text-black/60">
                                The Context:
                              </span>
                              <p
                                className={`mt-2 text-xl sm:text-2xl leading-[32px] text-black/90 ${
                                  useHandwriting ? "font-handwriting" : "font-sans text-base leading-relaxed"
                                }`}
                              >
                                {currentEntry.item.context}
                              </p>
                            </div>
                          )}
                        </div>
                      </GridSnap>

                      {/* What We Did & What Changed */}
                      {currentEntry.item.whatWeDid && (
                        <GridSnap blankLinesAfter={2}>
                          <div className="rounded-2xl border border-black/15 bg-white p-6 sm:p-7 shadow-sm">
                            <span className="font-marker text-xs uppercase tracking-wider text-[#7e1c36]">
                              What We Built & Shipped:
                            </span>
                            <p
                              className={`mt-3 text-xl sm:text-2xl leading-[32px] text-black/95 ${
                                useHandwriting ? "font-handwriting" : "font-sans text-base sm:text-lg leading-relaxed"
                              }`}
                            >
                              {currentEntry.item.whatWeDid}
                            </p>
                          </div>
                        </GridSnap>
                      )}

                      {currentEntry.item.whatChanged && (
                        <GridSnap blankLinesAfter={2}>
                          <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50 p-6 sm:p-7 shadow-sm">
                            <span className="font-marker text-xs uppercase tracking-wider text-emerald-800">
                              The Measured Outcome & Impact:
                            </span>
                            <p
                              className={`mt-3 text-xl sm:text-2xl leading-[32px] text-emerald-950 ${
                                useHandwriting ? "font-handwriting" : "font-sans text-base sm:text-lg leading-relaxed"
                              }`}
                            >
                              {currentEntry.item.whatChanged}
                            </p>
                          </div>
                        </GridSnap>
                      )}

                      {/* Gallery Artifacts */}
                      {currentEntry.item.galleryUrls.length > 0 && (
                        <GridSnap blankLinesAfter={2}>
                          <div className="pt-2">
                            <span className="font-marker text-sm uppercase tracking-wider text-black/60 block mb-3">
                              Field Artifacts & Snapshots:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {currentEntry.item.galleryUrls.map((img, i) => (
                                <div
                                  key={i}
                                  className="relative rounded-xl border border-black/15 bg-white p-2.5 shadow-md"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={img}
                                    alt=""
                                    className="h-48 w-full rounded-lg object-cover"
                                  />
                                  <div className="mt-2 text-right">
                                    <span className="font-mono text-[10px] text-black/50">
                                      Artifact #{i + 1}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </GridSnap>
                      )}
                    </div>
                  )}

                  {/* Article specific content */}
                  {currentEntry.kind === "article" && (
                    <div className="max-w-3xl">
                      <p
                        className={`text-xl sm:text-2xl text-[#4b1426] font-semibold leading-[32px] mb-[64px] break-words ${
                          useHandwriting ? "font-handwriting" : "font-heading text-lg"
                        }`}
                      >
                        {currentEntry.item.excerpt}
                      </p>

                      <div>
                        {currentEntry.item.body.split("\n\n").map((para, i) => {
                          if (para.startsWith("### ")) {
                            return (
                              <h3
                                key={i}
                                className={`font-bold text-[#7e1c36] leading-[64px] translate-y-[9px] mt-[64px] mb-[32px] break-words ${
                                  useHandwriting
                                    ? "font-handwriting text-3xl sm:text-4xl"
                                    : "font-heading text-2xl sm:text-3xl"
                                }`}
                              >
                                {para.replace("### ", "")}
                              </h3>
                            );
                          }
                          return (
                            <p
                              key={i}
                              className={`text-xl sm:text-2xl text-[#1c0810] leading-[32px] mb-[32px] break-words ${
                                useHandwriting
                                  ? "font-handwriting"
                                  : "font-sans text-base sm:text-lg leading-[32px] text-black/85"
                              }`}
                            >
                              {para}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Update specific content */}
                  {currentEntry.kind === "update" && (
                    <div className="max-w-3xl">
                      <p
                        className={`text-xl sm:text-2xl text-[#4b1426] font-semibold leading-[32px] mb-[64px] break-words ${
                          useHandwriting ? "font-handwriting" : "font-sans text-base"
                        }`}
                      >
                        {currentEntry.item.summary}
                      </p>

                      {currentEntry.item.body && (
                        <p
                          className={`text-xl sm:text-2xl text-[#1c0810] leading-[32px] mb-[32px] break-words ${
                            useHandwriting
                              ? "font-handwriting"
                              : "font-sans text-base sm:text-lg leading-[32px] text-black/85"
                          }`}
                        >
                          {currentEntry.item.body}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Entry Footer with Prev/Next Navigation */}
                  <GridSnap blankLinesAfter={1} className="mt-[64px]">
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {currentEntry.item.tags.map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-black/15 bg-white px-3 py-0.5 font-mono text-xs text-black/70"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>

                        <span className="font-handwriting text-2xl text-black/60">
                          Handwritten by Doom Studio ✍
                        </span>
                      </div>

                      {/* Bottom Paging */}
                      <div className="flex items-center justify-between pt-6">
                        {prevEntry ? (
                          <button
                            onClick={() => setSelectedEntryId(`${prevEntry.kind}-${prevEntry.item.id}`)}
                            className="group flex items-center gap-2 font-mono text-xs text-black/70 hover:text-[#4b1426]"
                          >
                            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                            <span>Prev: {prevEntry.item.title.slice(0, 24)}...</span>
                          </button>
                        ) : (
                          <div />
                        )}

                        <button
                          onClick={() => setSelectedEntryId(null)}
                          className="font-marker text-xs text-[#7e1c36] underline hover:text-black"
                        >
                          Return to Table of Contents
                        </button>

                        {nextEntry ? (
                          <button
                            onClick={() => setSelectedEntryId(`${nextEntry.kind}-${nextEntry.item.id}`)}
                            className="group flex items-center gap-2 font-mono text-xs text-black/70 hover:text-[#4b1426]"
                          >
                            <span>Next: {nextEntry.item.title.slice(0, 24)}...</span>
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                          </button>
                        ) : (
                          <div />
                        )}
                      </div>
                    </div>
                  </GridSnap>
                </motion.article>
              )}
            </AnimatePresence>
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT GUTTER COLUMN: Utilized Gutter Space (Like giksn.com)
             ══════════════════════════════════════════════════════════ */}
          <aside className="space-y-6 lg:sticky lg:top-24">
            {/* 1. Spotlight Featured Dispatch Card (Inspired by GIKSN's Rinne Sidebar) */}
            {spotlightArticle && !selectedEntryId && (
              <div
                onClick={() => setSelectedEntryId(`article-${spotlightArticle.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#4b1426]/30 bg-[#300c17] p-5 text-[#fff2f2] shadow-md transition-all duration-200 hover:border-[#e07a93]/50 hover:bg-[#3d0f1e]"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#e07a93]">
                    <Sparkles className="size-3" />
                    Spotlight Essay
                  </span>
                  <span className="font-mono text-[10px] text-white/50">
                    Read ↗
                  </span>
                </div>

                <h4 className="mt-2.5 font-heading text-lg font-bold tracking-tight text-white group-hover:text-[#fff2f2]">
                  {spotlightArticle.title}
                </h4>

                <p className="mt-2 text-xs leading-relaxed text-white/70 line-clamp-3">
                  {spotlightArticle.excerpt}
                </p>

                <div className="mt-3 flex items-center justify-between pt-2 text-[11px] font-mono text-white/50">
                  <span>Written by Doom Studio</span>
                  <span className="text-[#e07a93]">Open Spread →</span>
                </div>
              </div>
            )}

            {/* 2. Studio Principle / Post-it Memo */}
            <div className="relative rounded-2xl border-2 border-[#e6d080] bg-[#fffbe6] p-5 shadow-sm -rotate-0.5 transition-transform hover:rotate-0">
              {/* Tape sticker */}
              <div className="absolute -top-2.5 left-8 h-5 w-16 bg-[#fae8a8]/80 shadow-2xs backdrop-blur-xs -rotate-2" />

              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#856404]">
                <Zap className="size-3" />
                Studio Field Note #01
              </div>

              <p className="mt-2 font-handwriting text-xl leading-[26px] text-[#4a3b00]">
                &quot;We DOOM the bottlenecks. Before scaling headcount or rewriting architecture, isolate the single constraint choking your growth velocity.&quot;
              </p>

              <div className="mt-3 text-right font-mono text-[10px] text-[#856404]">
                — Doom Studio Operating Principle
              </div>
            </div>

            {/* 3. Taxonomy & Bottleneck Filter Index (Like GIKSN's Topics) */}
            <div className="rounded-2xl border border-black/15 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between pb-2.5">
                <span className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#4b1426]">
                  <Tag className="size-3.5" />
                  Bottleneck Index
                </span>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="font-mono text-[10px] text-[#7e1c36] underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {allTags.map((tag) => {
                  const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTag(isSelected ? null : tag);
                        if (selectedEntryId) setSelectedEntryId(null);
                      }}
                      className={`rounded-full border px-2.5 py-1 font-mono text-[10px] transition-all ${
                        isSelected
                          ? "border-[#4b1426] bg-[#4b1426] text-white"
                          : "border-black/15 bg-black/[0.02] text-black/70 hover:border-black/30 hover:bg-black/5"
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Journal Statistics Ledger (Like GIKSN's papers counter) */}
            <div className="rounded-2xl border border-black/15 bg-white p-5 shadow-xs">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-black/60 block pb-2">
                Field Ledger Activity
              </span>

              <div className="mt-3 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-black/70">
                  <span>Total Dispatches:</span>
                  <span className="font-bold text-[#4b1426]">{allEntries.length}</span>
                </div>
                <div className="flex items-center justify-between text-black/70">
                  <span>Client Case Studies:</span>
                  <span className="font-bold text-black">{caseStudies.length}</span>
                </div>
                <div className="flex items-center justify-between text-black/70">
                  <span>Studio Essays:</span>
                  <span className="font-bold text-black">{articles.length}</span>
                </div>
                <div className="flex items-center justify-between text-black/70">
                  <span>Changelogs & Builds:</span>
                  <span className="font-bold text-black">{updates.length}</span>
                </div>
                <div className="flex items-center justify-between text-black/70 pt-2">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-700">Verified & Active ✍</span>
                </div>
              </div>
            </div>

            {/* 5. Direct Action Box */}
            <div className="rounded-2xl border border-black/15 bg-[#f5efe4] p-5 shadow-xs text-center">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#4b1426]">
                Have a Bottleneck?
              </span>
              <p className="mt-1 font-sans text-xs text-black/70 leading-relaxed">
                We identify and eliminate the highest-leverage constraint across engineering, brand, or performance.
              </p>
              <Link
                href="/#pricing"
                className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-none border border-[#4b1426] bg-[#4b1426] px-4 py-2 text-xs font-mono font-semibold text-white shadow-xs transition-transform hover:bg-[#7e1c36] active:scale-95"
              >
                <span>Initiate Sprint →</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}

export default SpiralDiary;
