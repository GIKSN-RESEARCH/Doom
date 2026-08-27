import { doomLogoIcon } from "@/lib/doom-logo-icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
  return doomLogoIcon(512);
}
