import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Inter_Tight } from "next/font/google";
import { ScrollProgress } from "@/components/studio/ScrollProgress";
import { site } from "@/lib/content";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.meta.url),
  title: { default: site.meta.title, template: "%s | Doom Studio" },
  description: site.meta.description,
  applicationName: "Doom Studio",
  authors: [{ name: "Doom Studio", url: site.meta.url }],
  creator: "Doom Studio",
  publisher: "Doom Studio",
  alternates: {
    canonical: "/",
    types: { "text/markdown": "/index.md" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Doom Studio",
    title: site.meta.title,
    description: site.meta.description,
    images: [
      {
        url: site.meta.ogImage,
        width: 1200,
        height: 630,
        alt: "Doom Studio: we doom the bottlenecks here",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.meta.title,
    description: site.meta.description,
    images: [site.meta.ogImage],
  },
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/brand/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: site.meta.themeColor,
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${inter.variable} ${geistMono.variable}`}
    >
      <body>
        {children}
        <ScrollProgress />
      </body>
    </html>
  );
}
