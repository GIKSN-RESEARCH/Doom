import content from "@/content/site.json";

export const SITE_NAME = "Doom Studio";
export const SITE_ORIGIN = new URL(content.meta.url).origin;
export const SITE_URL = new URL(SITE_ORIGIN);
export const SITE_TITLE = content.meta.title;
export const SITE_DESCRIPTION = content.meta.description;
export const SITE_OG_IMAGE = content.meta.ogImage;
