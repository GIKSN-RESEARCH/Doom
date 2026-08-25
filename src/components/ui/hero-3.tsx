"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";

import { cn } from "@/lib/utils";
import HeroShader from "./HeroShader";

/**
 * Hero3 — rounded WebGL gradient hero with a squircle-notched panel and multi-layered parallax scrolling.
 *
 * Usage:
 *   import { Hero3 } from "@/components/ui/hero-3";
 *
 *   <Hero3
 *     logoText="Doom"
 *     logoSubtext="Studio"
 *     ctaLabel="Get Started"
 *     headline="We DOOM"
 *     headlineLine2="the bottlenecks."
 *     links={[
 *       { label: "Services", href: "#services" },
 *       { label: "Approach", href: "#approach" },
 *       { label: "Work", href: "#work" },
 *       { label: "Pricing", href: "#pricing" },
 *     ]}
 *   />
 */

/* ------------------------------------------------------------------ */
/* Notch clip-path — one continuous path: convex squircle outer        */
/* corners + a concave squircle joint where the panel steps in.        */
/* ------------------------------------------------------------------ */

const NOTCH_X = 0.62; // panel steps in at 62% of its width
const NOTCH_Y = 0.7; // panel steps down at 70% of its height
const SQUIRCLE_K = 0.6; // cubic handle factor (> 0.5523 circle => squircle)

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
  /** First headline line. */
  headline?: string;
  /** Second headline line. */
  headlineLine2?: string;
  links?: Hero3Link[];
  className?: string;
}

export function Hero3({
  logoText = "Doom",
  logoSubtext = "Studio",
  ctaLabel = "Get Started",
  ctaHref = "#get-started",
  headline = "We DOOM",
  headlineLine2 = "the bottlenecks.",
  links = [],
  className,
}: Hero3Props) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [clip, setClip] = React.useState<{ d: string; supported: boolean } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Parallax Scroll Tracking
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Layered Parallax Transformations (Calibrated for zero overflow on mobile & desktop)
  // 1. Background shader depth parallax
  const shaderY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const shaderScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  // 2. Headline & mobile CTA parallax (floats upward gracefully as user scrolls down, zero spillover)
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.65, 1], [1, 0.35, 0]);

  // 3. Top header parallax
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 0.5, 0]);

  // 4. Desktop notch navigation parallax
  const navY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const navOpacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 0.5, 0]);

  // Recompute the notch clip-path whenever the panel resizes.
  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const supported =
      typeof CSS !== "undefined" && CSS.supports("clip-path", 'path("M0 0H1V1Z")');
    const update = (entries?: ResizeObserverEntry[]) => {
      let width = 0;
      let height = 0;
      if (entries && entries[0]) {
        width = entries[0].contentRect.width;
        height = entries[0].contentRect.height;
      } else {
        width = panel.clientWidth;
        height = panel.clientHeight;
      }
      if (width > 0 && height > 0) {
        setClip({ d: getHero3ClipPath(width, height), supported });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(panel);
    return () => ro.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative flex min-h-svh flex-col bg-background p-5 sm:p-6 overflow-x-clip",
        className
      )}
    >
      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full flex-1 min-h-[82svh] sm:min-h-[70svh] rounded-[28px] sm:rounded-none overflow-hidden"
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
            style={{ y: headerY, opacity: headerOpacity }}
            className="flex items-center justify-between gap-4"
          >
            <Link
              href="/"
              className="pointer-events-auto font-logo leading-none text-[#fff2f2]"
            >
              <span className="block text-lg tracking-[0.18em] uppercase sm:text-xl">
                {logoText}
              </span>
              <span className="mt-1.5 block text-[0.625rem] tracking-[0.5em] uppercase text-[#fff2f2] sm:text-xs">
                {logoSubtext}
              </span>
            </Link>

            {/* Desktop "Get Started" CTA */}
            <a
              href={ctaHref}
              className={cn(
                "pointer-events-auto hidden sm:inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10",
                "px-5 py-2.5 text-sm font-semibold text-white",
                "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_8px_32px_rgba(0,0,0,0.35)]",
                "backdrop-blur-md backdrop-saturate-150",
                "transition-colors duration-200 hover:border-white/45 hover:bg-white/20 sm:px-6"
              )}
            >
              {ctaLabel}
            </a>

            {/* Mobile Animated Hamburger Button (Stationary in hero header when closed, fixed when open) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className={cn(
                "pointer-events-auto flex items-center justify-center p-2.5 text-white transition-all active:scale-90 sm:hidden",
                mobileMenuOpen ? "fixed top-8 right-8 z-50" : "relative z-30"
              )}
            >
              <div className="flex h-4 w-6 flex-col items-center justify-between">
                <span
                  className={cn(
                    "h-0.5 w-6 rounded-full bg-white transition-all duration-300 ease-out origin-center",
                    mobileMenuOpen && "translate-y-[7px] rotate-45"
                  )}
                />
                <span
                  className={cn(
                    "h-0.5 w-6 rounded-full bg-white transition-all duration-200 ease-out",
                    mobileMenuOpen && "opacity-0 scale-x-0"
                  )}
                />
                <span
                  className={cn(
                    "h-0.5 w-6 rounded-full bg-white transition-all duration-300 ease-out origin-center",
                    mobileMenuOpen && "-translate-y-[7px] -rotate-45"
                  )}
                />
              </div>
            </button>
          </motion.div>

          {/* Headline + Mobile in-panel CTA */}
          <motion.div
            style={{ y: headlineY, opacity: headlineOpacity }}
            className="flex flex-col items-start gap-6 sm:gap-0"
          >
            <h1 className="text-[clamp(2.75rem,7.5vw,6rem)] font-bold leading-[0.95] tracking-tight text-white">
              {headline}
              <br />
              {headlineLine2}
            </h1>

            {/* In-Panel "Get Started" CTA on Mobile */}
            <a
              href={ctaHref}
              className="pointer-events-auto inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/15 px-6 py-3.5 text-base font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-200 active:scale-95 hover:bg-white/25 hover:border-white/50 sm:hidden"
            >
              <span>{ctaLabel}</span>
              <ArrowUpRight className="size-4" />
            </a>
          </motion.div>
        </div>
      </div>

      {/* Desktop Links — 2×3 grid inside the notch on sm+ */}
      <motion.nav
        style={{ y: navY, opacity: navOpacity }}
        className={cn(
          "hidden sm:grid sm:absolute sm:bottom-6 sm:right-6 sm:mt-0 sm:grid-cols-3 sm:grid-rows-2 sm:gap-x-8",
          "sm:w-[calc((100%-3rem)*0.38)] sm:h-[calc((100%-3rem)*0.3)]",
          "sm:p-10 lg:p-12 sm:justify-items-stretch"
        )}
      >
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="group flex items-center justify-center gap-1.5 whitespace-nowrap font-medium text-black transition-colors hover:text-[#4b1426] sm:h-full sm:w-full"
          >
            <span className="text-xl transition-[font-size] duration-200 sm:group-hover:text-2xl">
              {link.label}
            </span>
            <ArrowUpRight className="size-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        ))}
      </motion.nav>

      {/* Full-Screen Animated Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col justify-between p-6 pt-24 backdrop-blur-2xl sm:hidden overflow-y-auto"
            style={{
              background:
                "radial-gradient(circle at 50% 25%, rgba(75, 20, 38, 0.55) 0%, rgba(16, 3, 7, 0.98) 75%)",
            }}
          >
            {/* Staggered Navigation Links */}
            <div className="my-auto flex flex-col gap-2">
              <p className="mb-2 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-[#e07a93]">
                Navigation
              </p>
              {links.map((link, idx) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.08 + idx * 0.05,
                    duration: 0.35,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-white/5 active:bg-white/10"
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

            {/* Mobile Menu Footer */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + links.length * 0.05, duration: 0.35 }}
              className="flex flex-col gap-3.5 border-t border-white/10 pt-4"
            >
              <a
                href={ctaHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 bg-gradient-to-r from-[#4b1426] to-[#781836] px-6 py-3.5 text-base font-semibold text-white shadow-xl transition-transform active:scale-98"
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
    </section>
  );
}
