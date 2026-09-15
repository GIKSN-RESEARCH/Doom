"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

import { cn } from "@/lib/utils";
import HeroShader from "./HeroShader";
import ScanGridButton from "@/components/originkit/ui/scan-grid-button";
import { SpinningText } from "@/components/magicui/spinning-text";

/**
 * Hero3 — rounded WebGL gradient hero with a squircle-notched panel and multi-layered parallax scrolling.
 */

/* ------------------------------------------------------------------ */
/* Notch clip-path — one continuous path: convex squircle outer        */
/* corners + a concave squircle joint where the panel steps in.        */
/* ------------------------------------------------------------------ */

const NOTCH_X = 0.62; // panel steps in at 62% of its width
const NOTCH_Y = 0.7; // panel steps down at 70% of its height
const SQUIRCLE_K = 0.6; // cubic handle factor (> 0.5523 circle => squircle)
const MOBILE_MENU_CLOSED_CLIP =
  "circle(0% at calc(100% - env(safe-area-inset-right) - 46px) calc(env(safe-area-inset-top) + 46px))";
const MOBILE_MENU_OPEN_CLIP =
  "circle(150% at calc(100% - env(safe-area-inset-right) - 46px) calc(env(safe-area-inset-top) + 46px))";
const MOBILE_MENU_EASE = [0.16, 1, 0.3, 1] as const;

export function getHero3ClipPath(width: number, height: number): string {
  const w = Math.round(width);
  const h = Math.round(height);
  const r = Math.min(28, w * 0.08, h * 0.08);
  const k = SQUIRCLE_K * r;

  // Small screens: plain rounded rect, no notch.
  if (w < 640) {
    return [
      `M ${r} 0`,
      `H ${w - r}`,
      `C ${w - r + k} 0 ${w} ${r - k} ${w} ${r}`,
      `V ${h - r}`,
      `C ${w} ${h - r + k} ${w - r + k} ${h} ${w - r} ${h}`,
      `H ${r}`,
      `C ${r - k} ${h} 0 ${h - r + k} 0 ${h - r}`,
      `V ${r}`,
      `C 0 ${r - k} ${r - k} 0 ${r} 0`,
      "Z",
    ].join(" ");
  }

  const nx = Math.round(w * NOTCH_X); // step x
  const ny = Math.round(h * NOTCH_Y); // step y
  const stepW = w - nx;
  const stepH = h - ny;
  const rs = Math.min(r, stepW * 0.5, ny - r); // convex radius at step corners
  const ri = Math.min(r * 2, stepW - rs, stepH - rs); // concave joint radius
  const ks = SQUIRCLE_K * rs;
  const ki = SQUIRCLE_K * ri;

  return [
    `M ${r} 0`,
    `H ${w - r}`,
    // top-right (convex)
    `C ${w - r + k} 0 ${w} ${r - k} ${w} ${r}`,
    `V ${ny - rs}`,
    // step outer corner (convex): south -> west
    `C ${w} ${ny - rs + ks} ${w - rs + ks} ${ny} ${w - rs} ${ny}`,
    `H ${nx + ri}`,
    // concave squircle joint: west -> south, curving into the panel
    `C ${nx + ri - ki} ${ny} ${nx} ${ny + ri - ki} ${nx} ${ny + ri}`,
    `V ${h - rs}`,
    // step outer corner (convex): south -> west
    `C ${nx} ${h - rs + ks} ${nx - rs + ks} ${h} ${nx - rs} ${h}`,
    `H ${r}`,
    // bottom-left (convex)
    `C ${r - k} ${h} 0 ${h - r + k} 0 ${h - r}`,
    `V ${r}`,
    // top-left (convex)
    `C 0 ${r - k} ${r - k} 0 ${r} 0`,
    "Z",
  ].join(" ");
}

/* ------------------------------------------------------------------ */

export interface Hero3Link {
  label: string;
  href: string;
}

export interface Hero3Props {
  logoText?: string;
  logoSubtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Description text displayed above the tagline. */
  description?: string;
  /** First headline line. */
  headline?: string;
  /** Second headline line. */
  headlineLine2?: string;
  links?: Hero3Link[];
  className?: string;
  panelClassName?: string;
  descriptionClassName?: string;
  taglineClassName?: string;
  descriptionTextClassName?: string;
  hideLinks?: boolean;
  isStatic?: boolean;
}

export function Hero3({
  logoText = "Doom",
  logoSubtext = "Studio",
  ctaLabel = "Get Started",
  ctaHref = "#get-started",
  description = "Doom Studio is a design and engineering team for founders who need the work shipped, not another deck. We take the unclear page, the half-built product or the messy workflow and turn it into something people can actually use.",
  headline = "We DOOM",
  headlineLine2 = "the bottlenecks.",
  links = [],
  className,
  panelClassName,
  descriptionClassName,
  taglineClassName,
  descriptionTextClassName,
  hideLinks = false,
  isStatic = false,
}: Hero3Props) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const taglineRef = React.useRef<HTMLHeadingElement>(null);
  const [taglineWidth, setTaglineWidth] = React.useState<number | null>(null);
  const [clip, setClip] = React.useState<{ d: string; supported: boolean } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Measure the rendered width of the tagline so the description width matches it exactly.
  React.useEffect(() => {
    const el = taglineRef.current;
    if (!el) return;

    const updateWidth = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setTaglineWidth(Math.round(rect.width));
      }
    };

    updateWidth();

    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(updateWidth);
    }

    return () => ro.disconnect();
  }, [headline, headlineLine2]);

  // Parallax Scroll Tracking
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Layered Parallax Transformations (Zero overflow)
  // 1. Background shader depth parallax
  const shaderY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const shaderScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  // 2. Headline & mobile CTA parallax
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -35]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.65, 1], [1, 0.35, 0]);

  // 3. Top header parallax
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.5, 0]);

  // 4. Desktop notch navigation parallax
  const navY = useTransform(scrollYProgress, [0, 1], [0, -25]);
  const navOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.5, 0]);

  // Recompute the notch clip-path whenever the panel resizes.
  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const supported =
      typeof CSS !== "undefined" && CSS.supports("clip-path", 'path("M0 0H1V1Z")');
    let lastW = 0;
    let lastH = 0;
    const update = (entries?: ResizeObserverEntry[]) => {
      let width = 0;
      let height = 0;
      if (entries && entries[0]) {
        width = Math.round(entries[0].contentRect.width);
        height = Math.round(entries[0].contentRect.height);
      } else {
        width = Math.round(panel.clientWidth);
        height = Math.round(panel.clientHeight);
      }
      if (width > 0 && height > 0 && (Math.abs(width - lastW) > 2 || Math.abs(height - lastH) > 2)) {
        lastW = width;
        lastH = height;
        setClip({ d: getHero3ClipPath(width, height), supported });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(panel);
    return () => ro.disconnect();
  }, []);

  // Keep the page behind the full-screen drawer stationary. This also stops
  // any in-flight Lenis animation until the menu has closed.
  React.useEffect(() => {
    if (!mobileMenuOpen) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    window.dispatchEvent(new Event("lenis:stop"));

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.dispatchEvent(new Event("lenis:start"));
    };
  }, [mobileMenuOpen]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative flex min-h-svh flex-col bg-transparent p-5 sm:p-6 overflow-x-clip",
        className
      )}
    >
      {/* Panel */}
      <motion.div
        ref={panelRef}
        initial={isStatic ? false : { scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={isStatic ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        className={cn(
          "relative w-full flex-1 min-h-[82svh] sm:min-h-[70svh] sm:min-h-[660px] rounded-[28px] sm:rounded-none overflow-hidden",
          panelClassName
        )}
      >
        {/* Clipped shader layer */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden",
            !clip?.supported && "rounded-[28px]"
          )}
          style={clip?.supported ? { clipPath: `path("${clip.d}")` } : undefined}
        >
          {/* Animated parallax container for shader */}
          <motion.div
            style={{ y: shaderY, scale: shaderScale }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Shader layer — self-contained WebGL component with CSS fallback */}
            <HeroShader />
            {/* Extra vignette for legibility */}
            <div
              className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_50%,transparent_55%,rgba(0,0,0,0.5)_100%)]"
              aria-hidden
            />
          </motion.div>
        </div>

        {/* Content */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-hidden">
          {/* Header */}
          <motion.div
            initial={isStatic ? false : { y: -25, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={isStatic ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            style={{ y: headerY, opacity: headerOpacity }}
            className="flex items-start justify-between gap-4"
          >
            {hideLinks ? (
              <div
                className="pointer-events-none relative flex items-center justify-center font-logo leading-none text-[#fff2f2]"
                aria-label={`${logoText} ${logoSubtext}`}
              >
                <SpinningText
                  className="font-logo text-[10px] sm:text-xs tracking-[0.18em] uppercase text-[#fff2f2] select-none size-[76px] sm:size-[88px]"
                  duration={prefersReducedMotion || isStatic ? 0 : 12}
                  radius={4.5}
                >
                  {`${logoText} ${logoSubtext} • ${logoText} ${logoSubtext} •`}
                </SpinningText>
              </div>
            ) : (
              <Link
                href="/"
                className="pointer-events-auto group relative flex items-center justify-center font-logo leading-none text-[#fff2f2] outline-none transition-transform duration-300 hover:scale-105 active:scale-95"
                aria-label={`${logoText} ${logoSubtext} Home`}
              >
                <SpinningText
                  className="font-logo text-[10px] sm:text-xs tracking-[0.18em] uppercase text-[#fff2f2] transition-colors group-hover:text-[#e07a93] select-none size-[76px] sm:size-[88px]"
                  duration={prefersReducedMotion ? 0 : 12}
                  radius={4.5}
                >
                  {`${logoText} ${logoSubtext} • ${logoText} ${logoSubtext} •`}
                </SpinningText>
              </Link>
            )}

            {/* Spacer so the header layout stays balanced on mobile */}
            <div className="h-11 w-11 sm:hidden" aria-hidden />
          </motion.div>

          {/* Desktop Navigation & "Get Started" CTA (Vertically stacked with equal top and bottom gaps) */}
          {!hideLinks && (
            <motion.div
              initial={isStatic ? false : { y: -25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={isStatic ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
              style={{ y: headerY, opacity: headerOpacity }}
              className="pointer-events-auto hidden sm:flex sm:flex-col sm:items-end sm:justify-between sm:absolute sm:top-10 sm:right-10 sm:bottom-[calc(30%+2.5rem)] lg:top-12 lg:right-12 lg:bottom-[calc(30%+3rem)] sm:z-20"
            >
              <ScanGridButton
                link={ctaHref}
                label={ctaLabel}
                borderRadius={0}
                padding="11px 24px"
                font={{
                  fontFamily: "var(--font-clash-display)",
                  fontWeight: 600,
                  fontSize: "1.0625rem",
                  letterSpacing: "-0.01em",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
                colors={{
                  fill: "rgba(255, 255, 255, 0.1)",
                  textColor: "#FFFFFF",
                  hoverFill: "rgba(255, 255, 255, 0.2)",
                  hoverTextColor: "#FFFFFF",
                  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.28), 0 8px 32px rgba(0,0,0,0.35)",
                  hoverBoxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.45), 0 12px 36px rgba(0,0,0,0.45)",
                }}
                border={{
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                }}
                scan={{
                  color: "#FFFFFF",
                  speed: 50,
                }}
                glitchIntensity={0}
                style={{
                  width: "180px",
                  flexShrink: 0,
                  backdropFilter: "blur(12px) saturate(150%)",
                  WebkitBackdropFilter: "blur(12px) saturate(150%)",
                }}
              />

              {/* Vertically stacked links with identical size & UI as Get Started button */}
              {links.map((link) => (
                <ScanGridButton
                  key={link.label}
                  link={link.href}
                  label={link.label}
                  borderRadius={0}
                  padding="11px 24px"
                  font={{
                    fontFamily: "var(--font-clash-display)",
                    fontWeight: 600,
                    fontSize: "1.0625rem",
                    letterSpacing: "-0.01em",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                  colors={{
                    fill: "rgba(255, 255, 255, 0.1)",
                    textColor: "#FFFFFF",
                    hoverFill: "rgba(255, 255, 255, 0.2)",
                    hoverTextColor: "#FFFFFF",
                    boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.28), 0 8px 32px rgba(0,0,0,0.35)",
                    hoverBoxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.45), 0 12px 36px rgba(0,0,0,0.45)",
                  }}
                  border={{
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  }}
                  scan={{
                    color: "#FFFFFF",
                    speed: 50,
                  }}
                  glitchIntensity={0}
                  style={{
                    width: "180px",
                    flexShrink: 0,
                    backdropFilter: "blur(12px) saturate(150%)",
                    WebkitBackdropFilter: "blur(12px) saturate(150%)",
                  }}
                />
              ))}
            </motion.div>
          )}

          {/* Description + Headline + Mobile in-panel CTA */}
          <motion.div
            style={{ y: headlineY, opacity: headlineOpacity }}
            className="flex flex-col items-start"
          >
            {/* In-Panel Description for mobile view only (on desktop, description is in the notch) */}
            {description && (
              <div
                className="w-full max-w-2xl sm:hidden mb-4"
                style={
                  taglineWidth
                    ? { width: `${taglineWidth}px`, maxWidth: "100%" }
                    : undefined
                }
              >
                <motion.p
                  initial={isStatic || prefersReducedMotion ? false : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={isStatic ? { duration: 0 } : { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.45 }}
                  className="text-base font-normal leading-relaxed text-[#fff2f2]/85 tracking-normal [text-wrap:pretty]"
                >
                  {description}
                </motion.p>
              </div>
            )}

            <h1
              ref={taglineRef}
              className={cn(
                "w-fit text-[clamp(2.75rem,7.5vw,6rem)] font-bold leading-[0.95] tracking-tight text-white",
                taglineClassName
              )}
            >
              <span className="block overflow-hidden pb-1">
                <motion.span
                  initial={isStatic ? false : { y: "110%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={isStatic ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
                  className="block"
                >
                  {headline}
                </motion.span>
              </span>
              <span className="block overflow-hidden pb-1">
                <motion.span
                  initial={isStatic ? false : { y: "110%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={isStatic ? { duration: 0 } : { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.68 }}
                  className="block"
                >
                  {headlineLine2}
                </motion.span>
              </span>
            </h1>

            {/* In-Panel "Get Started" CTA on Mobile */}
            {!hideLinks && (
              <motion.a
                initial={isStatic ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={isStatic ? { duration: 0 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
                href={ctaHref}
                className="pointer-events-auto mt-6 inline-flex items-center gap-2 rounded-none border border-white/35 bg-white/15 px-6 py-3.5 text-base font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-200 active:scale-95 hover:bg-white/25 hover:border-white/50 sm:hidden"
              >
                <span>{ctaLabel}</span>
                <ArrowUpRight className="size-4" />
              </motion.a>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile hamburger / cross toggle, kept outside the parallax header. */}
      {!hideLinks && (
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          className={cn(
            "pointer-events-auto flex h-11 w-11 appearance-none items-center justify-center border-0 bg-transparent p-2.5 text-white shadow-none transition-transform duration-150 active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:hidden",
            mobileMenuOpen
              ? "fixed right-[calc(env(safe-area-inset-right)+1.5rem)] top-[calc(env(safe-area-inset-top)+1.5rem)] z-[70]"
              : "absolute right-[25px] top-[25px] z-30"
          )}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={mobileMenuOpen ? "close" : "menu"}
              initial={prefersReducedMotion ? false : { opacity: 0, rotate: -45, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, rotate: 45, scale: 0.7 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: MOBILE_MENU_EASE }}
              className="flex items-center justify-center"
            >
              {mobileMenuOpen ? (
                <X className="size-6" strokeWidth={2} aria-hidden />
              ) : (
                <Menu className="size-6" strokeWidth={2} aria-hidden />
              )}
            </motion.span>
          </AnimatePresence>
        </button>
      )}

      {/* Desktop Description — inside the notch on sm+ (in place of links) */}
      {description && (
        <motion.div
          initial={isStatic ? false : { y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={isStatic ? { duration: 0 } : { duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.75 }}
          style={{ y: navY, opacity: navOpacity }}
          className={cn(
            "hidden sm:flex sm:flex-col sm:justify-center sm:absolute sm:bottom-6 sm:right-6 sm:mt-0",
            "sm:w-[calc((100%-3rem)*0.38)] sm:h-[calc((100%-3rem)*0.3)]",
            "sm:p-8 md:p-10 lg:p-12",
            descriptionClassName
          )}
        >
          <p
            className={cn(
              "font-sans text-base sm:text-lg lg:text-xl font-normal leading-relaxed text-[#1c0810]/85 [text-wrap:pretty]",
              descriptionTextClassName
            )}
          >
            {description}
          </p>
        </motion.div>
      )}

      {/* Full-screen mobile menu expands from, and collapses into, the toggle. */}
      {!hideLinks && (
        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.div
            key="mobile-navigation"
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            data-lenis-prevent
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { clipPath: MOBILE_MENU_CLOSED_CLIP, opacity: 1 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { clipPath: MOBILE_MENU_OPEN_CLIP, opacity: 1 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : {
                    clipPath: MOBILE_MENU_CLOSED_CLIP,
                    opacity: 1,
                    transition: {
                      delay: 0.12,
                      duration: 0.52,
                      ease: MOBILE_MENU_EASE,
                    },
                  }
            }
            transition={{
              duration: prefersReducedMotion ? 0 : 0.58,
              ease: MOBILE_MENU_EASE,
            }}
            className="fixed inset-0 z-50 flex h-dvh flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+6rem)] sm:hidden"
            style={{
              background:
                "radial-gradient(circle at 50% 25%, rgba(75, 20, 38, 0.55) 0%, rgba(16, 3, 7, 0.98) 75%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              willChange: "clip-path",
            }}
          >
            {/* Navigation links scroll independently on short mobile screens. */}
            <nav className="flex min-h-0 flex-1 overscroll-contain overflow-y-auto py-4">
              <div className="my-auto flex w-full flex-col gap-2">
                <motion.p
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{
                    delay: prefersReducedMotion ? 0 : 0.14,
                    duration: prefersReducedMotion ? 0 : 0.28,
                    ease: MOBILE_MENU_EASE,
                  }}
                  className="mb-2 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-[#e07a93]"
                >
                  Navigation
                </motion.p>
                {links.map((link, idx) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    initial={prefersReducedMotion ? false : { opacity: 0, x: 18, y: 6 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            x: 12,
                            transition: {
                              delay: (links.length - idx - 1) * 0.018,
                              duration: 0.14,
                              ease: "easeIn",
                            },
                          }
                    }
                    transition={{
                      delay: prefersReducedMotion ? 0 : 0.16 + idx * 0.045,
                      duration: prefersReducedMotion ? 0 : 0.34,
                      ease: MOBILE_MENU_EASE,
                    }}
                    className="group flex items-center justify-between rounded-none px-3 py-3 transition-colors hover:bg-white/5 active:bg-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-heading text-xs font-semibold tracking-widest text-white/40">
                        0{idx + 1}
                      </span>
                      <span className="font-heading text-2xl font-semibold tracking-tight text-white transition-colors group-hover:text-[#e07a93]">
                        {link.label}
                      </span>
                    </div>
                    <ArrowUpRight className="size-5 text-white/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </motion.a>
                ))}
              </div>
            </nav>

            {/* Mobile menu CTA remains pinned and visible outside the nav scroller. */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10, transition: { duration: 0.14 } }}
              transition={{
                delay: prefersReducedMotion ? 0 : 0.2 + links.length * 0.045,
                duration: prefersReducedMotion ? 0 : 0.34,
                ease: MOBILE_MENU_EASE,
              }}
              className="flex shrink-0 flex-col gap-3.5 border-t border-white/10 pt-4"
            >
              <a
                href={ctaHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-none border border-white/25 bg-gradient-to-r from-[#4b1426] to-[#781836] px-6 py-3.5 text-base font-semibold text-white shadow-xl transition-transform active:scale-[0.98]"
              >
                <span>{ctaLabel}</span>
                <ArrowUpRight className="size-4" />
              </a>
              <p className="text-center text-xs uppercase tracking-widest text-white/40">
                {logoText} {logoSubtext} — {headline} {headlineLine2}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      )}
    </section>
  );
}
