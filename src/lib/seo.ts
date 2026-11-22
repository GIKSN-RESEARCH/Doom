import type { Metadata } from "next";
import { site } from "@/lib/content";
import { SITE_NAME, SITE_ORIGIN } from "@/lib/site";

// Advance these dates when the public content changes, not on every build.
// Omit dates for database-backed archives until their real update time is known.
export const PUBLIC_PAGES: readonly {
  path: string;
  lastModified?: string;
}[] = [
  { path: "/", lastModified: "2026-11-23T04:53:22+05:30" },
  { path: "/brand-kit", lastModified: "2026-11-23T04:50:28+05:30" },
  { path: "/reading" },
  { path: "/updates" },
];

export const PREVIEW_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

export function studioStructuredData() {
  const organizationId = `${SITE_ORIGIN}/#organization`;
  const founderId = `${SITE_ORIGIN}/#founder`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_NAME,
        url: `${SITE_ORIGIN}/`,
        description: site.meta.description,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_ORIGIN}/brand/icon-512.png`,
          width: 512,
          height: 512,
        },
        founder: { "@id": founderId },
        sameAs: [site.links.studioX],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Doom Studio services",
          itemListElement: site.services.items.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.title,
              description: service.body,
              url: `${SITE_ORIGIN}/#services`,
              provider: { "@id": organizationId },
            },
          })),
        },
      },
      {
        "@type": "Person",
        "@id": founderId,
        name: site.founder.name,
        url: `${SITE_ORIGIN}/#founder`,
        image: new URL(site.founder.photo.src, SITE_ORIGIN).href,
        jobTitle: "Founder",
        worksFor: { "@id": organizationId },
        sameAs: site.founder.links.map((link) => link.href),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        name: SITE_NAME,
        url: `${SITE_ORIGIN}/`,
        inLanguage: "en",
        publisher: { "@id": organizationId },
      },
    ],
  };
}
