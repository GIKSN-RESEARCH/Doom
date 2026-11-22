import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";
import { PUBLIC_PAGES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.map(({ path, lastModified }) => ({
    url: new URL(path, SITE_ORIGIN).href,
    lastModified,
  }));
}
