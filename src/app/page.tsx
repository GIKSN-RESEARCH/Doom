import { Hero3 } from "@/components/ui/hero-3";
import AccordionGallery from "@/components/AccordionGallery";
import { ModalCards } from "@/components/ModalCards";
import ApproachFlow from "@/components/ApproachFlow";

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
      <section id="services" className="flex w-full flex-col items-center px-5 pb-5 pt-16 sm:px-6 sm:pb-6 sm:pt-24">
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
          height={520}
          accentColor="#fff2f2"
          overlayColor="#4b1426"
          textColor="#fff2f2"
        />
      </section>

      {/* Work — modal cards grid */}
      <section id="work" className="flex w-full flex-col items-center px-5 pb-5 pt-16 sm:px-6 sm:pb-6 sm:pt-24">
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

      {/* Approach — flowchart. Design only for now. */}
      <section
        id="approach"
        className="flex w-full flex-col items-center px-5 py-16 sm:px-6 sm:py-24"
      >
        <div className="mb-12 max-w-3xl text-center sm:mb-16">
          <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.35em] text-[#4b1426]">
            How we work
          </p>
          <h2 className="font-heading text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Approach
          </h2>
          <p className="mt-6 w-full text-base leading-relaxed text-foreground/70 sm:text-lg">
            Design, engineering and marketing. Three basics. This is the Design
            path.
          </p>
        </div>
        <ApproachFlow />
      </section>
    </main>
  );
}
