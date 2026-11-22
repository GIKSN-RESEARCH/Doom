import type { Metadata } from "next";
import { PREVIEW_ROBOTS } from "@/lib/seo";
import "../legacy.css";

export const metadata: Metadata = { robots: PREVIEW_ROBOTS };

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
