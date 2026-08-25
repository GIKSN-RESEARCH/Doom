import type { Metadata } from "next";
import localFont from "next/font/local";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

/* Clash Display — body + headings across the whole site (200–700) */
const clashDisplay = localFont({
  src: [
    {
      path: "../../public/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Extralight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-clash-display",
  display: "swap",
});

/* Boxing — logo wordmark only */
const boxing = localFont({
  src: "../../public/Boxing_Complete/Fonts/WEB/fonts/Boxing-Regular.woff2",
  weight: "400",
  variable: "--font-boxing",
  display: "swap",
});

/* Gambarino — service card body copy */
const gambarino = localFont({
  src: "../../public/Gambarino_Complete/Fonts/WEB/fonts/Gambarino-Regular.woff2",
  weight: "400",
  variable: "--font-gambarino",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Doom Studio",
  description: "We DOOM the bottlenecks.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${clashDisplay.variable} ${boxing.variable} ${gambarino.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
