"use client";

import React, { useState, useRef } from "react";
import { motion, useInView, type Transition } from "motion/react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface FooterLink {
  text: string;
  href: string;
  badge?: string;
}

export interface FooterColumn {
  label: string;
  links: FooterLink[];
}

export interface FooterSocial {
  icon: React.ReactNode;
  href: string;
  label: string;
}

export interface FooterProps {
  columns?: FooterColumn[];
  newsletter?: {
    heading: string;
    body: string;
    onSubscribe?: (email: string) => void;
  };
  socials?: FooterSocial[];
  wordmark?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Default Data (Doom Studio theme)                                   */
/* ------------------------------------------------------------------ */

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    label: "Navigation",
    links: [
      { text: "Services", href: "#services" },
      { text: "Work", href: "#work" },
      { text: "Readings", href: "/reading" },
      { text: "Approach", href: "#approach" },
      { text: "Pricing", href: "#pricing" },
      { text: "Updates", href: "/reading" },
    ],
  },
  {
    label: "Company",
    links: [
      { text: "Privacy Policy", href: "#privacy" },
      { text: "Terms of Service", href: "#terms" },
      { text: "About", href: "#about" },
    ],
  },
];

const DEFAULT_NEWSLETTER = {
  heading: "Eliminate bottlenecks before they start.",
  body: "Engineering notes, product tear-downs, and high-velocity workflow frameworks delivered every Tuesday.",
};

const DEFAULT_SOCIALS: FooterSocial[] = [
  {
    label: "X (Twitter)",
    href: "https://x.com",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
        <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "https://discord.com",
    icon: (
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6h0a14.5 14.5 0 0 0-4-1.5 9.8 9.8 0 0 0-.5 1.5 13.9 13.9 0 0 0-3 0 9.8 9.8 0 0 0-.5-1.5A14.5 14.5 0 0 0 6 6C3.5 10 3 13.8 3.5 17.5a14.8 14.8 0 0 0 4.5 2.3c.5-.7 1-1.4 1.4-2.2a9.6 9.6 0 0 1-2.2-.9c.2-.1.4-.3.6-.4 3.7 1.7 7.7 1.7 11.4 0 .2.1.4.3.6.4-.7.4-1.4.7-2.2.9.4.8.9 1.5 1.4 2.2a14.8 14.8 0 0 0 4.5-2.3c.6-4.2-.3-8-2-11.5zM8.5 15.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm7 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Decorative Radial Graphic                                           */
/* ------------------------------------------------------------------ */

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: (cx + Math.cos(rad) * r).toFixed(3),
    y: (cy + Math.sin(rad) * r).toFixed(3),
  };
}

const RADIAL_RINGS = [28, 48, 68, 88, 108];
const RADIAL_SPOKES = Array.from({ length: 12 }, (_, i) =>
  polar(120, 120, 114, (360 / 12) * i)
);
const RADIAL_TICKS = Array.from({ length: 24 }, (_, i) => {
  const deg = (360 / 24) * i;
  return { inner: polar(120, 120, 104, deg), outer: polar(120, 120, 112, deg) };
});

function RadialGraphic({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="relative aspect-square w-full max-w-[240px] rounded-2xl bg-[#20060e] border border-white/[0.1] overflow-hidden flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] shrink-0">
      {/* Subtle brand ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(120, 24, 54, 0.6) 0%, transparent 70%)",
        }}
      />

      <motion.svg
        viewBox="0 0 240 240"
        className="w-[84%] h-[84%] relative z-10"
        style={{ originX: "50%", originY: "50%" }}
        animate={reducedMotion ? {} : { rotate: 360 }}
        transition={{
          duration: 75,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {/* Concentric rings at low opacity white/rose */}
        {RADIAL_RINGS.map((r, i) => (
          <circle
            key={`ring-${i}`}
            cx="120"
            cy="120"
            r={r}
            fill="none"
            stroke="#fff2f2"
            strokeOpacity={(0.06 + i * 0.024).toFixed(3)}
            strokeWidth={0.85}
          />
        ))}

        {/* Straight radiating spokes */}
        {RADIAL_SPOKES.map((spoke, i) => (
          <line
            key={`spoke-${i}`}
            x1="120"
            y1="120"
            x2={spoke.x}
            y2={spoke.y}
            stroke="#fff2f2"
            strokeOpacity={0.07}
            strokeWidth={0.65}
          />
        ))}

        {/* Outer tick marks */}
        {RADIAL_TICKS.map((tick, i) => (
          <line
            key={`tick-${i}`}
            x1={tick.inner.x}
            y1={tick.inner.y}
            x2={tick.outer.x}
            y2={tick.outer.y}
            stroke="#fff2f2"
            strokeOpacity={0.1}
            strokeWidth={0.75}
          />
        ))}

        {/* Centered aperture glyph */}
        <circle cx="120" cy="120" r="16" fill="none" stroke="#fff2f2" strokeOpacity={0.16} strokeWidth={1} />
        <circle cx="120" cy="120" r="5" fill="#fff2f2" fillOpacity={0.25} />
        <path
          d="M120 106 L127 120 L120 134 L113 120 Z"
          fill="#fff2f2"
          fillOpacity={0.15}
          stroke="#fff2f2"
          strokeOpacity={0.25}
          strokeWidth={0.5}
        />
      </motion.svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reduced-motion helper                                               */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion() {
  return React.useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false),
    () => false
  );
}

/* ------------------------------------------------------------------ */
/* Footer Component                                                    */
/* ------------------------------------------------------------------ */

export default function Footer({
  columns = DEFAULT_COLUMNS,
  newsletter = DEFAULT_NEWSLETTER,
  socials = DEFAULT_SOCIALS,
  wordmark = "DOOM",
  className = "",
}: FooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.12 });
  const reducedMotion = usePrefersReducedMotion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      if (newsletter.onSubscribe) {
        newsletter.onSubscribe(email.trim());
      }
      setSubscribed(true);
      setEmail("");
    }
  };

  const easeOut = [0.16, 1, 0.3, 1] as const;

  const fadeUp = (delay: number) => ({
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 },
    animate: isInView
      ? reducedMotion
        ? { opacity: 1 }
        : { opacity: 1, y: 0 }
      : reducedMotion
        ? { opacity: 0 }
        : { opacity: 0, y: 12 },
    transition: (
      reducedMotion
        ? { duration: 0.35 }
        : { duration: 0.45, ease: easeOut, delay }
    ) as Transition,
  });

  const fadeScale = (delay: number) => ({
    initial: reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 },
    animate: isInView
      ? reducedMotion
        ? { opacity: 1 }
        : { opacity: 1, scale: 1 }
      : reducedMotion
        ? { opacity: 0 }
        : { opacity: 0, scale: 0.97 },
    transition: (
      reducedMotion
        ? { duration: 0.35 }
        : { duration: 0.55, ease: easeOut, delay }
    ) as Transition,
  });

  return (
    <footer
      ref={sectionRef}
      className={`relative w-full px-5 sm:px-6 pb-0 pt-6 sm:pt-10 bg-transparent overflow-hidden flex flex-col items-center ${className}`}
    >
      <div
        className="relative w-full text-[#fff2f2] rounded-t-[28px] sm:rounded-t-[36px] overflow-hidden border-t border-x border-white/15 shadow-[0_-12px_40px_rgba(75,20,38,0.12)]"
        style={{
          background: "radial-gradient(circle at 50% 15%, #4b1426 0%, #300c17 100%)",
        }}
      >
        {/* Subtle atmospheric vignette and highlight */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[800px] max-w-full rounded-full opacity-20 blur-[100px]"
          style={{ background: "radial-gradient(ellipse at center, rgba(255, 242, 242, 0.25) 0%, transparent 70%)" }}
          aria-hidden="true"
        />

      <div className="mx-auto max-w-[1400px] px-5 pt-16 pb-0 sm:px-8 md:px-12 lg:px-16 sm:pt-20">
        {/* ── Main Layout:
            Left Side: Double-column Newsletter Section + Social Strip
            Right Side (Third Column Area): Link Columns (Navigation & Company)
        ── */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.38fr_1fr] lg:gap-14 xl:grid-cols-[1.48fr_1fr] xl:gap-16 items-start">
          {/* ── Left Section: Double Column Newsletter Card + Social Strip ── */}
          <div className="flex flex-col gap-4">
            {/* Newsletter Card with 2-column internal layout */}
            <motion.div
              {...fadeScale(0.08)}
              className="rounded-3xl border border-white/15 bg-[#340b18]/80 p-6 md:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_16px_36px_rgba(0,0,0,0.35)] backdrop-blur-md"
            >
              <div className="grid grid-cols-1 sm:grid-cols-[210px_1fr] md:grid-cols-[230px_1fr] gap-6 md:gap-8 items-center">
                {/* 1st Column: Design (rotating radial graphic) */}
                <div className="flex justify-center sm:justify-start">
                  <RadialGraphic reducedMotion={reducedMotion} />
                </div>

                {/* 2nd Column: Text and Input/Button */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-heading text-xl font-bold tracking-tight text-[#fff2f2] md:text-2xl">
                      {newsletter.heading}
                    </h3>
                    <p className="text-sm leading-relaxed text-[#fff2f2]/70">
                      {newsletter.body}
                    </p>
                  </div>

                  {/* Inline pill-shaped input + subscribe button */}
                  <form
                    onSubmit={handleSubmit}
                    className="flex w-full items-center rounded-full border border-white/20 bg-[#20060e]/80 p-1 pl-4 transition-all duration-200 focus-within:border-white/40 focus-within:ring-1 focus-within:ring-white/20"
                  >
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#fff2f2] placeholder:text-[#fff2f2]/40 outline-none"
                      aria-label="Email address"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-full bg-[#fff2f2] px-5 py-2.5 text-sm font-semibold text-[#4b1426] transition-all duration-200 hover:bg-white hover:shadow-[0_0_24px_rgba(255,242,242,0.4)] active:scale-95 cursor-pointer"
                    >
                      {subscribed ? "Joined" : "Subscribe"}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>

            {/* Social Strip directly beneath the newsletter card */}
            {socials && socials.length > 0 && (
              <motion.div
                {...fadeScale(0.16)}
                className="flex items-center justify-between rounded-2xl border border-white/15 bg-[#340b18]/80 px-6 py-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-md"
              >
                <span className="text-sm font-semibold text-[#fff2f2] tracking-tight">
                  Follow us
                </span>
                <div className="flex items-center gap-5 md:gap-6">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#fff2f2]/60 transition-all duration-200 hover:scale-110 hover:text-white"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Right Section: Sitemap Link Columns (beside newsletter section) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-8 lg:gap-10 xl:gap-14 pt-2">
            {columns.map((col, colIdx) => (
              <div key={col.label} className="flex flex-col gap-5">
                {/* Capsule column label */}
                <motion.span
                  {...fadeUp(0.12 + colIdx * 0.08)}
                  className="inline-block self-start rounded-full border border-white/15 bg-[#340b18]/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#fff2f2]/75 select-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]"
                >
                  {col.label}
                </motion.span>

                {/* Link Stack */}
                <ul className="flex flex-col gap-[15px]">
                  {col.links.map((link, linkIdx) => (
                    <motion.li
                      key={link.text}
                      {...fadeUp(0.16 + colIdx * 0.08 + linkIdx * 0.045)}
                    >
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-2 text-[15px] font-normal text-[#fff2f2]/85 transition-all duration-200 hover:translate-x-1 hover:text-white"
                      >
                        <span>{link.text}</span>
                        {link.badge && (
                          <span className="rounded-full bg-[#fff2f2] px-2 py-0.5 text-[10px] font-bold tracking-normal leading-none text-[#4b1426] select-none shadow-sm">
                            {link.badge}
                          </span>
                        )}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Subtle Divider ── */}
        <div className="mt-16 border-t border-white/10" />

        {/* ── Sub-footer bottom bar ── */}
        <div className="flex flex-col items-center justify-between gap-4 py-6 text-xs text-[#fff2f2]/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Doom Studio. All rights reserved.</p>
          <p className="text-[#fff2f2]/60">
            Designed & built to kill bottlenecks.
          </p>
        </div>
      </div>

      {/* ── Edge-to-Edge Oversized Wordmark ──
          - "DOOM" in Boxing font
          - Top is 100% visible, exactly 30% cut from the bottom
      ── */}
      <motion.div
        {...(reducedMotion
          ? {
              initial: { opacity: 0 },
              animate: isInView ? { opacity: 1 } : {},
              transition: { duration: 0.4 },
            }
          : {
              initial: { opacity: 0, y: 16 },
              animate: isInView ? { opacity: 1, y: 0 } : {},
              transition: {
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.32,
              },
            })}
        className="relative w-full overflow-hidden flex justify-center items-start pt-[0.05em] pointer-events-none select-none px-2 sm:px-4"
        style={{
          fontSize: "clamp(4rem, 21.5vw, 22rem)",
          height: "0.58em",
        }}
      >
        <span
          className="block w-full text-center font-logo uppercase text-[#fff2f2] tracking-[0.02em] leading-[0.82] whitespace-nowrap"
          style={{
            fontFamily: "var(--font-boxing), sans-serif",
            fontSize: "1em",
          }}
          aria-hidden="true"
        >
          {wordmark}
        </span>
      </motion.div>
      </div>
    </footer>
  );
}
