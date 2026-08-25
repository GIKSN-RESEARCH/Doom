"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import HeroShader from "./HeroShader";

/**
 * Hero3 — rounded WebGL gradient hero with a squircle-notched panel.
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
  const panelRef = React.useRef<HTMLDivElement>(null);
  const [clip, setClip] = React.useState<{ d: string; supported: boolean } | null>(null);

  // Recompute the notch clip-path whenever the panel resizes.
  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const supported =
      typeof CSS !== "undefined" && CSS.supports("clip-path", 'path("M0 0H1V1Z")');
    const update = () => {
      const rect = panel.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setClip({ d: getHero3ClipPath(rect.width, rect.height), supported });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(panel);
    return () => ro.disconnect();
  }, []);

  return (
    <section
      className={cn("relative flex min-h-svh flex-col bg-background p-5 sm:p-6", className)}
    >
      {/* Panel */}
      <div ref={panelRef} className="relative w-full flex-1 min-h-[70svh]">
        {/* Clipped shader layer */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden",
            !clip?.supported && "rounded-[28px]"
          )}
          style={clip?.supported ? { clipPath: `path("${clip.d}")` } : undefined}
        >
          {/* Shader layer — self-contained WebGL component with CSS fallback */}
          <HeroShader />
          {/* Extra vignette for legibility */}
          <div
            className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_50%,transparent_55%,rgba(0,0,0,0.5)_100%)]"
            aria-hidden
          />
        </div>

        {/* Content */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-7 sm:p-10 lg:p-12">
          <div className="flex items-start justify-between gap-4">
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
            <a
              href={ctaHref}
              className={cn(
                "pointer-events-auto rounded-xl border border-white/30 bg-white/10",
                "px-5 py-2.5 text-sm font-semibold text-white",
                "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.28),0_8px_32px_rgba(0,0,0,0.35)]",
                "backdrop-blur-md backdrop-saturate-150",
                "transition-colors duration-200 hover:border-white/45 hover:bg-white/20 sm:px-6"
              )}
            >
              {ctaLabel}
            </a>
          </div>

          <h1 className="text-[clamp(2.75rem,7.5vw,6rem)] font-bold leading-[0.95] tracking-tight text-white">
            {headline}
            <br />
            {headlineLine2}
          </h1>
        </div>
      </div>

      {/* Links — 2×3 grid inside the notch on sm+, in flow below the panel on mobile */}
      <nav
        className={cn(
          "mt-5 flex flex-wrap items-center gap-x-7 gap-y-3",
          "sm:absolute sm:bottom-6 sm:right-6 sm:mt-0 sm:grid sm:grid-cols-3 sm:grid-rows-2 sm:gap-x-8",
          "sm:w-[calc((100%-3rem)*0.38)] sm:h-[calc((100%-3rem)*0.3)]",
          "sm:p-10 lg:p-12"
        )}
      >
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="group flex items-center gap-1.5 whitespace-nowrap font-medium text-black transition-colors hover:text-[#4b1426] sm:h-full sm:w-full sm:justify-center"
          >
            <span className="text-base transition-[font-size] duration-200 group-hover:text-lg sm:text-xl sm:group-hover:text-2xl">
              {link.label}
            </span>
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:size-5" />
          </a>
        ))}
      </nav>
    </section>
  );
}
