import { site } from "@/lib/content";
import { SITE_NAME, SITE_ORIGIN } from "@/lib/site";

const absolute = (path: string) => new URL(path, SITE_ORIGIN).href;
const link = (label: string, path: string) => `[${label}](${absolute(path)})`;

export function studioMarkdown() {
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${site.meta.description}`,
    "",
    `Official website: ${absolute("/")}`,
    "",
    "## The studio",
    "",
    `${site.about.lead} ${site.about.leadMuted}`,
    "",
    site.footer.tagline,
    "",
    "## Services",
  ];

  for (const service of site.services.items) {
    lines.push("", `### ${service.title}`, "", service.body);
    if ("includes" in service && service.includes) {
      lines.push("", `Includes: ${service.includes.join(", ")}.`);
    }
  }

  lines.push(
    "",
    "## Technology stack",
    "",
    site.services.stack.items.map((item) => item.name).join(", ") + ".",
    "",
    "## Process",
    "",
    site.process.intro,
  );
  for (const step of site.process.steps) {
    lines.push(
      "",
      `### ${step.num}. ${step.title}`,
      "",
      step.desc,
      "",
      ...step.details.map((detail) => `- ${detail}`),
      "",
      `You get: ${step.outcome}`,
    );
  }

  lines.push("", "## Starting prices", "", site.pricing.intro);
  for (const plan of site.pricing.plans) {
    lines.push(
      "",
      `### ${plan.name}`,
      "",
      `From ${plan.price} ${plan.unit}.`,
      "",
      plan.desc,
      "",
      ...plan.items.map((item) => `- ${item}`),
    );
  }

  lines.push(
    "",
    "## Founder",
    "",
    site.founder.name,
    "",
    site.founder.body,
    "",
    ...site.founder.links.map((item) => `- ${link(item.label, item.href)}`),
    "",
    "## Live in-house products",
    "",
    ...site.hero.strip.map((name) => `- ${name}`),
    "",
    "## Frequently asked questions",
  );
  for (const item of site.faq.items) {
    lines.push("", `### ${item.q}`, "", item.a);
  }
  lines.push(
    "",
    "## Contact",
    "",
    `- ${link(site.cta.button, site.links.booking)}`,
    `- ${link("Studio on X", site.links.studioX)}`,
    `- ${link("Brand and media kit", "/brand-kit")}`,
  );

  return lines.join("\n") + "\n";
}

export function brandKitMarkdown() {
  return [
    `# ${SITE_NAME} brand and media kit`,
    "",
    "> Official logos, colour, typography, original artwork, and media assets.",
    "",
    `Source: ${absolute("/brand-kit")}`,
    "",
    "## Studio",
    "",
    site.meta.description,
    "",
    `Founder: ${site.founder.name}.`,
    "",
    "## Official assets",
    "",
    `- ${link("Brand guidelines (PDF)", "/brand-kit/doom-studio-brand-guidelines.pdf")}`,
    `- ${link("Complete brand kit (ZIP)", "/brand-kit/doom-studio-brand-kit.zip")}`,
    `- ${link("Colour palette (JSON)", "/brand-kit/02-colour/doom-studio-palette.json")}`,
    `- ${link("Primary horizontal logo (SVG)", "/brand-kit/01-logo/horizontal/doom-studio-horizontal-primary.svg")}`,
    `- ${link("Orange Doom glyph (SVG)", "/brand-kit/01-logo/glyph/doom-glyph-orange.svg")}`,
    "",
    "## More information",
    "",
    `- ${link("Studio, services, pricing, and FAQ", "/index.md")}`,
    `- ${link("Book a call", site.links.booking)}`,
    "",
  ].join("\n");
}

export function llmsIndex() {
  return [
    `# ${SITE_NAME}`,
    "",
    `> ${site.meta.description}`,
    "",
    `${SITE_NAME} works remotely with teams worldwide. ${site.founder.name} is the founder. Prices are starting prices; project scope and timelines are agreed in writing.`,
    "",
    "## Studio information",
    "",
    `- ${link("Studio overview", "/index.md")}: Services, technology stack, process, starting prices, founder, and FAQ.`,
    `- ${link("Brand and media kit", "/brand-kit/index.md")}: Official identity and downloadable assets.`,
    "",
    "## Contact",
    "",
    `- ${link("Book an introductory call", site.links.booking)}: The studio's official Cal.com booking page.`,
    `- ${link("Studio on X", site.links.studioX)}: Official studio account.`,
    "",
    "## Optional",
    "",
    `- ${link("Full public context", "/llms-full.txt")}: The two Markdown documents combined.`,
    `- ${link("Website", "/")}: The human-readable studio website.`,
    `- ${link("Sitemap", "/sitemap.xml")}: Canonical public pages.`,
    `- ${link("Robots policy", "/robots.txt")}: Crawler access rules.`,
    "",
  ].join("\n");
}

export function agentDocumentResponse(
  body: string,
  {
    markdown = false,
    canonicalPath,
  }: { markdown?: boolean; canonicalPath?: string } = {},
) {
  const links = [`<${absolute("/llms.txt")}>; rel="describedby"`];
  if (canonicalPath) {
    links.push(`<${absolute(canonicalPath)}>; rel="canonical"`);
  }
  return new Response(body, {
    headers: {
      "Content-Type": `${markdown ? "text/markdown" : "text/plain"}; charset=utf-8`,
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "X-Robots-Tag": "noindex, follow",
      Link: links.join(", "),
    },
  });
}
