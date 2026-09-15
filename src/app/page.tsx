"use client";

import { useState } from "react";
import { Hero3 } from "@/components/ui/hero-3";
import AccordionGallery from "@/components/AccordionGallery";
import { ModalCards } from "@/components/ModalCards";
import ApproachFlow from "@/components/ApproachFlow";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import IntroReveal from "@/components/ui/IntroReveal";

export default function Home() {
  const [introStarted, setIntroStarted] = useState(false);
  const [introMounted, setIntroMounted] = useState(true);

  return (
    <>
      {introMounted && (
        <IntroReveal
          onStartExit={() => setIntroStarted(true)}
          onComplete={() => setIntroMounted(false)}
        />
      )}

      {/* Main Page: connected directly to bottom of intro section */}
      <main
        className="w-full relative"
        style={
          introMounted
            ? {
                transform: introStarted
                  ? "translateY(0svh)"
                  : "translateY(100svh)",
                transition: introStarted
                  ? "transform 1.35s cubic-bezier(0.76, 0, 0.24, 1)"
                  : "none",
                willChange: "transform",
              }
            : undefined
        }
      >
        <Hero3
          logoText="Doom"
          logoSubtext="Studio"
          ctaLabel="Get Started"
          ctaHref="#pricing"
          description="Doom Studio is a design and engineering team for founders who need the work shipped, not another deck. We take the unclear page, the half-built product or the messy workflow and turn it into something people can actually use."
          headline="We DOOM"
          headlineLine2="the bottlenecks."
        links={[
          { label: "Services", href: "#services" },
          { label: "Work", href: "#work" },
          { label: "Readings", href: "/reading" },
          { label: "Approach", href: "#approach" },
          { label: "Pricing", href: "#pricing" },
          { label: "Updates", href: "/updates" },
        ]}
      />

      {/* Services — accordion gallery */}
      <section
        id="services"
        className="flex w-full flex-col items-center px-5 pb-5 pt-16 sm:px-6 sm:pb-6 sm:pt-24"
      >
        <div className="mb-12 text-center sm:mb-16 max-w-3xl">
          <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.35em] text-[#4b1426]">
            What we do
          </p>
          <h2 className="font-heading text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Services
          </h2>
          <p className="mt-6 w-full text-base leading-relaxed text-foreground/70 sm:text-lg">
            Design, engineering and marketing under one roof. Micro products
            and full product suites when you need the whole system. Every part
            is built to kill a bottleneck.
          </p>
        </div>
        <AccordionGallery
          defaultIndex={0}
          height={520}
          accentColor="#fff2f2"
          overlayColor="#4b1426"
          textColor="#fff2f2"
        />
      </section>

      {/* Work — modal cards grid */}
      <section
        id="work"
        className="flex w-full flex-col items-center px-5 pb-5 pt-16 sm:px-6 sm:pb-6 sm:pt-24"
      >
        <div className="mb-12 text-center sm:mb-16 max-w-3xl">
          <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.35em] text-[#4b1426]">
            Selected Works
          </p>
          <h2 className="font-heading text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Work
          </h2>
          <p className="mt-6 w-full text-base leading-relaxed text-foreground/70 sm:text-lg">
            A curated showcase of systems, platforms, and standalone products built to eliminate bottlenecks.
          </p>
        </div>
        <div className="w-full">
          <ModalCards />
        </div>
      </section>

      {/* Approach — flowchart layout */}
      <section
        id="approach"
        className="flex w-full flex-col items-center px-5 pb-8 pt-16 sm:px-6 sm:pb-12 sm:pt-24"
      >
        <div className="w-full">
          <ApproachFlow />
        </div>
      </section>

      {/* Pricing — glassmorphic cards with living shader parallax */}
      <section
        id="pricing"
        className="flex w-full flex-col items-center px-5 py-16 sm:px-6 sm:py-24"
      >
        <Pricing />
      </section>

      {/* Footer — maximal dark sitemap footer */}
      <Footer wordmark="DOOM" />
      </main>
    </>
  );
}
