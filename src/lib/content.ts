import content from "@/content/site.json";
import { showShippedWork } from "@/content/visibility";

export const site = content;
export type ProcessStep = (typeof site.process.steps)[number];
export type GameCopy = typeof site.hero.game;
export type NavItem = (typeof site.nav.items)[number];
export const bookingHref = site.links.booking;
export const contactLinks = {
  bookingHref,
  emailHref: site.links.email,
  telegramHref: site.links.telegram,
};
export type ContactLinks = typeof contactLinks;

export const navItems = site.nav.items.filter(
  ({ href }) => showShippedWork || href !== "#work",
);

export const footerColumns = site.footer.columns
  .map((column) => ({
    ...column,
    links: column.links.filter(
      ([, href]) => showShippedWork || href !== "#work",
    ),
  }))
  .filter(({ links }) => links.length > 0);

export const secondaryCta = showShippedWork
  ? { href: "#work", label: site.hero.secondaryCta }
  : { href: "#services", label: "Explore services" };
