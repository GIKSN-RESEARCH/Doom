"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import ScanGridButton from "@/components/originkit/ui/scan-grid-button";

export interface NavLinkItem {
  label: string;
  href: string;
}

interface NavbarProps {
  links?: NavLinkItem[];
  ctaLabel?: string;
  ctaHref?: string;
}

const DEFAULT_LINKS: NavLinkItem[] = [
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/#work" },
  { label: "Readings", href: "/reading" },
  { label: "Approach", href: "/#approach" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Updates", href: "/#updates" },
];

export function Navbar({
  links = DEFAULT_LINKS,
  ctaLabel = "Get Started",
  ctaHref = "/#pricing",
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.dispatchEvent(new CustomEvent("lenis:stop"));
    } else {
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("lenis:start"));
    }
    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("lenis:start"));
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-white/15 backdrop-blur-xl shadow-md text-[#fff2f2]"
      style={{
        background: "radial-gradient(circle at 50% 0%, #4b1426 0%, #300c17 100%)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5 outline-none"
            aria-label="Doom Studio Home"
          >
            <span className="font-logo text-2xl tracking-[0.16em] uppercase text-[#fff2f2] transition-colors group-hover:text-[#e07a93]">
              DOOM
            </span>
            <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest uppercase text-white/40">
              Studio
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (Visible on md+) */}
        <nav
          className="hidden md:flex items-center gap-8 lg:gap-10"
          aria-label="Main Navigation"
        >
          {links.map((link) => {
            const isReadingLink = link.href === "/reading" || link.href === "/readings";
            const isReadingActive = isReadingLink && (pathname === "/reading" || pathname?.startsWith("/reading"));
            const isActive = isReadingActive;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`group relative text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#e07a93]"
                    : "text-white/75 hover:text-white"
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[#e07a93]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: CTA Button (Desktop) & Hamburger Toggle (Mobile) */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <ScanGridButton
              link={ctaHref}
              label={ctaLabel}
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

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-none border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/10"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Full-Screen Mobile Navigation Overlay ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav-overlay"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24, ease: "easeInOut" }}
            className="fixed inset-0 top-[61px] z-50 flex flex-col justify-between px-6 pb-8 pt-6 backdrop-blur-2xl md:hidden overflow-y-auto text-[#fff2f2]"
            style={{
              background:
                "radial-gradient(circle at 50% 15%, #4b1426 0%, #300c17 100%)",
            }}
          >
            {/* Nav list */}
            <div className="flex flex-col gap-1 my-auto">
              <span className="mb-3 px-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#e07a93]">
                Navigation // Archives
              </span>

              {links.map((link, idx) => {
                const isReadingLink = link.href === "/reading" || link.href === "/readings";
                const isActive = isReadingLink && pathname?.startsWith("/reading");

                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center justify-between border-b border-white/10 px-2 py-4 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-semibold text-white/40">
                        0{idx + 1}
                      </span>
                      <span
                        className={`font-heading text-2xl font-bold tracking-tight transition-colors ${
                          isActive
                            ? "text-[#e07a93]"
                            : "text-white group-hover:text-[#e07a93]"
                        }`}
                      >
                        {link.label}
                      </span>
                    </div>
                    <ArrowUpRight className="size-5 text-white/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </Link>
                );
              })}
            </div>

            {/* Bottom CTA in Mobile Overlay */}
            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6">
              <a
                href={ctaHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-none border border-white/25 bg-gradient-to-r from-[#4b1426] to-[#781836] px-6 py-3.5 text-base font-semibold text-white shadow-xl transition-transform active:scale-[0.98]"
              >
                <span>{ctaLabel}</span>
                <ArrowUpRight className="size-4" />
              </a>
              <p className="text-center font-mono text-[11px] uppercase tracking-widest text-white/40">
                Doom Studio — We DOOM the bottlenecks.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
