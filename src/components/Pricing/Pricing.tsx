"use client";

import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Check, Minus, ChevronDown } from "lucide-react";
import Image from "next/image";
import ScanGridButton from "@/components/originkit/ui/scan-grid-button";
import "./Pricing.css";

interface PricingTier {
  id: string;
  name: string;
  pricePrefix?: string;
  price: string;
  cadence: string;
  priceNote: string;
  desc: string;
  ctaText: string;
  ctaHref: string;
  featured?: boolean;
  included: string[];
  excluded: string[];
}

const TIERS: PricingTier[] = [
  {
    id: "standalone",
    name: "Standalone",
    pricePrefix: "from",
    price: "$799",
    cadence: "project",
    priceNote: "Starting base. Scales with brief scope & depth.",
    desc: "Design or engineering. One focused discipline built to eliminate a specific bottleneck.",
    ctaText: "Start Standalone",
    ctaHref: "#get-started",
    included: [
      "Dedicated design OR engineering",
      "Tailored strictly around your brief",
      "Production-ready Figma or GitHub repository",
      "14-day post-handoff support & adjustments",
      "Direct async communication channel",
    ],
    excluded: [
      "Dual discipline cross-collaboration",
      "Marketing campaigns",
      "Monthly capacity retainers",
    ],
  },
  {
    id: "combined",
    featured: true,
    name: "Design + Engineering",
    pricePrefix: "from",
    price: "$1,599",
    cadence: "project",
    priceNote: "Starting base. Scales with product requirements.",
    desc: "Design and engineering as one complete team. From UI to shipped code.",
    ctaText: "Build Full Product",
    ctaHref: "#get-started",
    included: [
      "Complete UI/UX design & interactive prototypes",
      "Full-stack production-grade engineering",
      "Optimized performance, SEO & responsive layout",
      "Priority execution & iterative review cycles",
      "Complete source code and asset ownership",
      "14-day post-handoff support & adjustments",
    ],
    excluded: [
      "Dedicated marketing ad management",
      "Rolling monthly capacity retainers",
    ],
  },
  {
    id: "suite",
    name: "Product Suite",
    pricePrefix: "from",
    price: "$2,999",
    cadence: "month",
    priceNote: "Starting base. Dedicated monthly capacity.",
    desc: "Full design and engineering team operating as your dedicated internal product squad.",
    ctaText: "Subscribe to Capacity",
    ctaHref: "#get-started",
    included: [
      "Continuous full-stack design & engineering",
      "Dedicated sprint capacity for multiple tools",
      "Architectural planning & system scalability",
      "Direct Slack / real-time async communication",
      "Continuous deployment & feature updates",
      "Pause or cancel with no lock-in contracts",
    ],
    excluded: [
      "Third-party infrastructure & hosting costs",
      "Paid advertising media spend",
    ],
  },
  {
    id: "custom",
    name: "Custom",
    price: "Custom",
    cadence: "flexible",
    priceNote: "Tell us about your project brief. We will evaluate and tailor the exact fit.",
    desc: "Bespoke roadmaps, specialized AI tool harnesses, and dedicated multi-disciplinary squads.",
    ctaText: "Talk about your project",
    ctaHref: "#get-started",
    included: [
      "Tailored multi-disciplinary design & engineering",
      "Specialized AI tooling, harnesses & model APIs",
      "Scalable infrastructure, security & performance",
      "Milestone-based delivery or dedicated retainer",
      "Direct Slack / priority async communication",
      "Custom SLAs, roadmaps & handover contracts",
    ],
    excluded: [
      "Cookie-cutter templates or generic workflows",
    ],
  },
];

export default function Pricing() {
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({});
  const pricingRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: pricingRef,
    offset: ["start end", "end start"],
  });

  const shaderY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const shaderScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.0]);

  const toggleTier = (id: string) => {
    setExpandedTiers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div ref={pricingRef} className="pricing">
      <div className="pricing__panel">
        <div className="pricing__shader">
          <motion.div style={{ y: shaderY, scale: shaderScale }} className="pricing__shader-media">
            <Image
              src="/dreamor-Image 37.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority={false}
            />
          </motion.div>
        </div>

        {/* Ambient Vignette & Diffusion Material */}
        <div className="pricing__vignette" aria-hidden="true" />

        <div className="pricing__inner">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="pricing__intro mb-12 w-full max-w-3xl text-center sm:mb-16"
          >
            <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.35em] text-[#e07a93]">
              How we charge
            </p>
            <h2 className="font-heading text-5xl font-semibold tracking-tight text-[#fff2f2] sm:text-6xl lg:text-7xl">
              Pricing
            </h2>
            <p className="mt-6 w-full text-base leading-relaxed text-[#fff2f2]/70 sm:text-lg">
              A complete technical team shipping end-to-end technical products
            </p>
          </motion.header>

          {/* Pricing Grid */}
          <div className="pricing__grid">
            {TIERS.map((tier, idx) => {
              const isExpanded = !!expandedTiers[tier.id];

              return (
                <motion.article
                  key={tier.id}
                  onClick={() => toggleTier(tier.id)}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{
                    delay: idx * 0.1,
                    duration: 0.65,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  whileHover={{ y: -5 }}
                  className={`pricing-card ${tier.featured ? "pricing-card--featured" : ""} ${
                    isExpanded ? "pricing-card--expanded" : ""
                  }`}
                >
                  {/* Header: Name & Description */}
                  <div className="pricing-card__header">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="pricing-card__name">{tier.name}</h3>
                      {/* Minimal Mobile Arrow Indicator in header */}
                      <div className="pricing-card__mobile-arrow sm:hidden" aria-hidden="true">
                        <span
                          className={`pricing-card__arrow-pill ${
                            isExpanded ? "pricing-card__arrow-pill--expanded" : ""
                          }`}
                        >
                          <ChevronDown className="size-3.5 text-[#fff2f2]" />
                        </span>
                      </div>
                    </div>
                    <p className="pricing-card__desc">{tier.desc}</p>
                  </div>

                  {/* Price Display (Clean, natural, no dark box or generic hover) */}
                  <div className="pricing-card__price-wrap">
                    <div className="pricing-card__price-row">
                      {tier.pricePrefix && (
                        <span className="pricing-card__price-prefix">{tier.pricePrefix}</span>
                      )}
                      <span className="pricing-card__price-value">{tier.price}</span>
                      <span className="pricing-card__price-cadence">/ {tier.cadence}</span>
                    </div>
                    <p className="pricing-card__price-note">{tier.priceNote}</p>
                  </div>

                  {/* CTA Action */}
                  <div className="w-full" onClick={(e) => e.stopPropagation()}>
                    <ScanGridButton
                      link={tier.ctaHref}
                      label={tier.ctaText}
                      className="pricing-card__cta"
                      borderRadius={0}
                      addIcon={false}
                      padding="14px 24px"
                      font={{
                        fontFamily: "var(--font-clash-display)",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        letterSpacing: "0.01em",
                      }}
                      colors={{
                        fill: "#fff2f2",
                        textColor: "#120408",
                        hoverFill: "#ffffff",
                        hoverTextColor: "#4b1426",
                        boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 242, 242, 0.25)",
                        hoverBoxShadow: "0 12px 32px -4px rgba(0, 0, 0, 0.5), 0 0 28px rgba(255, 242, 242, 0.4)",
                      }}
                      border={{
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: "#ffffff",
                      }}
                      scan={{
                        color: "#4b1426",
                        speed: 50,
                      }}
                      glitchIntensity={0}
                      style={{
                        width: "100%",
                      }}
                    />
                  </div>

                  {/* Features Checklist (Collapsible on mobile, always open on desktop) */}
                  <div
                    id={`pricing-features-${tier.id}`}
                    className={`pricing-card__features ${
                      isExpanded ? "pricing-card__features--expanded" : ""
                    }`}
                  >
                    <div className="pricing-card__features-inner">
                      <div className="pricing-card__feature-group">
                        <p className="pricing-card__feature-title">Included</p>
                        <ul className="pricing-card__list">
                          {tier.included.map((item) => (
                            <li key={item} className="pricing-card__item">
                              <Check
                                className="size-4 shrink-0 text-[#fff2f2]/90 mt-0.5"
                                strokeWidth={2.5}
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {tier.excluded.length > 0 && (
                        <div className="pricing-card__feature-group pricing-card__feature-group--out">
                          <p className="pricing-card__feature-title pricing-card__feature-title--out">
                            Not included
                          </p>
                          <ul className="pricing-card__list pricing-card__list--out">
                            {tier.excluded.map((item) => (
                              <li
                                key={item}
                                className="pricing-card__item pricing-card__item--out"
                              >
                                <Minus
                                  className="size-4 shrink-0 text-[#fff2f2]/30 mt-0.5"
                                  strokeWidth={2}
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
