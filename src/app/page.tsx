import { About } from "@/components/studio/About";
import { Cta } from "@/components/studio/Cta";
import { Faq } from "@/components/studio/Faq";
import { Footer } from "@/components/studio/Footer";
import { Founder } from "@/components/studio/Founder";
import { Hero } from "@/components/studio/Hero";
import { Pricing } from "@/components/studio/Pricing";
import { Process } from "@/components/studio/Process";
import { Services } from "@/components/studio/Services";
import { Work } from "@/components/studio/Work";
import { showShippedWork } from "@/content/visibility";
import { site } from "@/lib/content";

export default function Home() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Doom Studio",
    url: site.meta.url,
    logo: `${site.meta.url}/brand/doo-glyph.svg`,
    description: site.meta.description,
    sameAs: [site.links.x, site.links.github],
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <main id="main-content">
        <Hero />
        <About />
        {showShippedWork && <Work />}
        <Services />
        <Process />
        <Pricing />
        <Founder />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organization).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
