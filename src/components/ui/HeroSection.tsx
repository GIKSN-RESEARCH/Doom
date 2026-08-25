"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import HeroShader from "./HeroShader";

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Services", href: "#services" },
  { label: "Approach", href: "#approach" },
  { label: "Work", href: "#work" },
  { label: "Pricing", href: "#pricing" },
];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Compute the exact continuous SVG clip-path for the stepped gradient surface
  const getClipPathSvg = () => {
    const W = dimensions.width;
    const H = dimensions.height;
    if (W === 0 || H === 0) return "";

    const rOuter = Math.min(32, W * 0.045, H * 0.045);
    const rInner = Math.min(28, W * 0.04, H * 0.04);

    // Stepped Cutout coordinates
    // Cutout begins at ~54-55% width and ~68-70% height
    const xCut = Math.round(W * 0.54);
    const yCut = Math.round(H * 0.69);

    // Continuous SVG path with perfectly rounded convex & concave corners
    return `
      M ${rOuter},0
      H ${W - rOuter}
      A ${rOuter},${rOuter} 0 0 1 ${W},${rOuter}
      V ${yCut - rOuter}
      A ${rOuter},${rOuter} 0 0 1 ${W - rOuter},${yCut}
      H ${xCut + rInner}
      A ${rInner},${rInner} 0 0 0 ${xCut},${yCut + rInner}
      V ${H - rOuter}
      A ${rOuter},${rOuter} 0 0 1 ${xCut - rOuter},${H}
      H ${rOuter}
      A ${rOuter},${rOuter} 0 0 1 0,${H - rOuter}
      V ${rOuter}
      A ${rOuter},${rOuter} 0 0 1 ${rOuter},0
      Z
    `.replace(/\s+/g, " ").trim();
  };

  return (
    <section
      className="relative w-full min-h-svh h-svh bg-[#050505] text-[#F5F3EE] p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 flex flex-col justify-between select-none overflow-hidden"
      aria-label="Doom Studio Hero"
    >
      {/* Outer Rounded Frame */}
      <div className="relative w-full h-full border border-[#242424] rounded-[24px] sm:rounded-[32px] md:rounded-[36px] lg:rounded-[40px] p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between overflow-hidden">
        
        {/* ============================================================ */}
        {/* DESKTOP / TABLET STEPPED LAYOUT (>= 768px)                   */}
        {/* ============================================================ */}
        <div
          ref={containerRef}
          className="hidden md:block relative w-full h-full"
        >
          {/* SVG ClipPath Definition */}
          {dimensions.width > 0 && dimensions.height > 0 && (
            <svg
              className="absolute w-0 h-0 pointer-events-none"
              aria-hidden="true"
            >
              <defs>
                <clipPath id="hero-stepped-clip" clipPathUnits="userSpaceOnUse">
                  <path d={getClipPathSvg()} />
                </clipPath>
              </defs>
            </svg>
          )}

          {/* Masked WebGL Gradient Canvas */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              clipPath:
                dimensions.width > 0 ? "url(#hero-stepped-clip)" : undefined,
              WebkitClipPath:
                dimensions.width > 0 ? "url(#hero-stepped-clip)" : undefined,
            }}
          >
            <HeroShader className="w-full h-full" />
            {/* Subtle atmospheric vignette over gradient */}
            <div
              className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/25 via-transparent to-black/10"
              aria-hidden="true"
            />
          </div>

          {/* Overlay Content Layer (Desktop) */}
          <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none">
            {/* Top Bar: Wordmark & CTA */}
            <div className="flex items-start justify-between w-full p-6 lg:p-8 pointer-events-auto">
              {/* Wordmark: Doom Studio */}
              <div
                className="text-left font-sans text-xl lg:text-2xl font-medium tracking-tight leading-[1.12] text-[#F5F3EE]"
                tabIndex={0}
                aria-label="Doom Studio"
              >
                <div>Doom</div>
                <div>Studio</div>
              </div>

              {/* Top-Right Button: Get Started */}
              <Link
                href="#contact"
                className="group relative inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 active:bg-white/20 text-[#F5F3EE] text-sm lg:text-base font-medium tracking-normal backdrop-blur-md border border-white/10 hover:border-white/25 transition-all duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A12] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
              >
                <span>Get Started</span>
              </Link>
            </div>

            {/* Bottom Row: Headline (Lower-Left) & Navigation (Lower-Right Cutout) */}
            <div className="grid grid-cols-12 w-full items-end p-6 lg:p-8">
              {/* Main Headline anchored inside lower-left extension */}
              <div className="col-span-6 lg:col-span-6 pointer-events-auto pb-2">
                <h1 className="font-sans text-[clamp(2.75rem,4.4vw,5.2rem)] font-normal leading-[0.96] tracking-[-0.04em] text-[#F5F3EE] max-w-xl">
                  We DOOM the<br />
                  bottlenecks.
                </h1>
              </div>

              {/* Bottom-Right Navigation Links anchored inside the cutout area */}
              <div className="col-span-6 lg:col-span-6 flex justify-end pointer-events-auto pb-1">
                <nav
                  aria-label="Primary Hero Navigation"
                  className="flex flex-col items-end gap-3.5 lg:gap-4 pr-1"
                >
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="group flex items-center gap-2.5 text-base lg:text-lg font-normal text-[#8E8A85] hover:text-[#F5F3EE] transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:text-[#FF6A12] focus-visible:ring-1 focus-visible:ring-[#FF6A12]/50 rounded px-1.5 py-0.5"
                    >
                      <span className="tracking-tight">{item.label}</span>
                      <span
                        className="inline-block text-sm lg:text-base transform transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-focus-visible:translate-x-1 group-focus-visible:-translate-y-1"
                        aria-hidden="true"
                      >
                        ↗
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MOBILE COMPOSITION (< 768px)                                 */}
        {/* ============================================================ */}
        <div className="md:hidden flex flex-col justify-between h-full w-full gap-4">
          {/* Top Gradient Card */}
          <div className="relative flex-1 min-h-95 rounded-[24px] sm:rounded-[28px] overflow-hidden flex flex-col justify-between p-5 sm:p-6">
            {/* Shader Background */}
            <div className="absolute inset-0 w-full h-full">
              <HeroShader className="w-full h-full" />
              <div
                className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/35 via-transparent to-black/10"
                aria-hidden="true"
              />
            </div>

            {/* Mobile Header Row */}
            <div className="relative z-10 flex items-start justify-between w-full">
              <div
                className="text-left font-sans text-lg sm:text-xl font-medium tracking-tight leading-[1.12] text-[#F5F3EE]"
                tabIndex={0}
                aria-label="Doom Studio"
              >
                <div>Doom</div>
                <div>Studio</div>
              </div>

              <Link
                href="#contact"
                className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 active:bg-white/20 text-[#F5F3EE] text-xs sm:text-sm font-medium tracking-normal backdrop-blur-md border border-white/10 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A12]"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Headline */}
            <div className="relative z-10 mt-auto pt-8">
              <h1 className="font-sans text-[clamp(2.2rem,8.5vw,3.2rem)] font-normal leading-[0.98] tracking-[-0.035em] text-[#F5F3EE]">
                We DOOM the<br />
                bottlenecks.
              </h1>
            </div>
          </div>

          {/* Bottom Navigation List in Frame */}
          <div className="relative w-full py-2 px-2 flex justify-end">
            <nav
              aria-label="Mobile Hero Navigation"
              className="flex flex-col items-end gap-2.5 sm:gap-3 w-full"
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex items-center justify-end gap-2 text-base sm:text-lg font-normal text-[#8E8A85] hover:text-[#F5F3EE] transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:text-[#FF6A12] py-1 px-2 w-full text-right"
                >
                  <span className="tracking-tight">{item.label}</span>
                  <span
                    className="inline-block text-sm transform transition-transform duration-200 ease-out group-hover:translate-x-1 group-hover:-translate-y-1"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

      </div>
    </section>
  );
}