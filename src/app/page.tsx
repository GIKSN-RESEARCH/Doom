import { Hero3 } from "@/components/ui/hero-3";
import AccordionGallery from "@/components/AccordionGallery";

export default function Home() {
  return (
    <main>
      <Hero3
        logoText="Doom"
        logoSubtext="Studio"
        ctaLabel="Get Started"
        ctaHref="#get-started"
        headline="We DOOM"
        headlineLine2="the bottlenecks."
        links={[
          { label: "Services", href: "#services" },
          { label: "Work", href: "#work" },
          { label: "Case Studies", href: "#case-studies" },
          { label: "Approach", href: "#approach" },
          { label: "Pricing", href: "#pricing" },
          { label: "Updates", href: "#updates" },
        ]}
      />

      {/* Services — accordion gallery */}
      <section id="services" className="w-full px-5 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 text-center sm:mb-14">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#4b1426]">
            What we do
          </p>
          <h2 className="font-heading text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Services
          </h2>
          <p className="mt-6 w-full text-base leading-relaxed text-foreground/60 sm:text-lg">
            Design, engineering and marketing under one roof. Micro products
            and full product suites when you need the whole system. Every part
            is built to kill a bottleneck.
          </p>
        </div>
        <AccordionGallery
          accentColor="#fff2f2"
          overlayColor="#4b1426"
          textColor="#fff2f2"
        />
      </section>
    </main>
  );
}
