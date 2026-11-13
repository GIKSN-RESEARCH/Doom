export const brand = {
  version: "Brand and media kit · Version 1.0 · November 2026",
  logoVariants: [
    {
      title: "Primary",
      description: "On Ink and dark imagery",
      variant: "primary",
      background: "#0B0B0C",
    },
    {
      title: "Primary on light",
      description: "Paper and white, 48 px glyph and up",
      variant: "primary-on-light",
      background: "#F5F4F2",
    },
    {
      title: "Mono white",
      description: "Photos and colour fields",
      variant: "mono-white",
      background: "#FF5A1F",
    },
    {
      title: "Mono ink",
      description: "Small sizes on light, print, fax",
      variant: "mono-ink",
      background: "#F5F4F2",
    },
  ],
  construction: [
    [
      "Clear space",
      "Keep empty space equal to half the glyph height on every side of any logo.",
    ],
    [
      "Minimum size",
      "Glyph 16 px on screen, 5 mm in print. Horizontal lockup 96 px wide, 25 mm in print. Stacked lockup 64 px wide.",
    ],
    ["On Ink", "Use the primary logo: orange glyph, white wordmark."],
    [
      "On light",
      "Use primary-on-light at 48 px glyph height and above. Below that, use mono ink, because orange on Paper is only 2.8:1.",
    ],
    ["On Doom Orange", "Use mono ink. Never put the orange glyph on orange."],
    [
      "On photos",
      "Place the logo on the darkest calm area, such as the sky in the dune image. Add a soft Ink shade if needed.",
    ],
  ],
  misuse: [
    "Stretch or squash",
    "Recolour outside the palette",
    "Add outlines, glows or shadows",
    "Rotate or tilt",
    "Rebuild the wordmark in another font",
    "Place on busy imagery",
  ],
  typeScale: [
    { name: "Hero", size: 98, spec: "98 / 0.98 / -3.6%" },
    { name: "Section", size: 64, spec: "64 / 1.03 / -3.5%" },
    { name: "Lead", size: 36, spec: "36 / 1.16 / -2.5%" },
    { name: "Body", size: 17, spec: "17 / 1.55" },
    { name: "Label", size: 15, spec: "15 / 500" },
    { name: "Mono", size: 13, spec: "13 / 400" },
  ],
  gradients: [
    {
      name: "Sunrise gradient",
      image: "sunrise",
      description:
        "Large panels: the closing call to action and landing page tiles.",
    },
    {
      name: "Ember gradient",
      image: "ember",
      description: "Featured items, such as the most booked plan.",
    },
    {
      name: "Satin gradient",
      image: "satin",
      description: "Supporting tiles with a dark scrim behind white text.",
    },
    {
      name: "Process gradient",
      image: "process",
      description: "Behind white product cards and log panels.",
    },
  ],
  voice: [
    ["Tagline", "We doom the bottlenecks here."],
    ["Descriptor", "Design and engineering for AI startups"],
    [
      "One line",
      "Doom Studio designs and builds the landing page, product or workflow that has been stuck for weeks, for a fixed price.",
    ],
    [
      "Short boilerplate",
      "Doom Studio is a design and engineering studio for AI startups, based in Bangalore. One team designs and builds landing pages, product UI, Next.js builds and AI automation for a fixed price, with a live preview from day one and the code handed over at the end.",
    ],
    [
      "Founder",
      "Brooklyn (Siddharth Manjul) is the founder of Doom Studio. A technical founder, he designs interfaces and writes production code in TypeScript, Rust and Swift, and builds his own products on the same stack he uses for clients.",
    ],
  ],
  do: [
    "Say what is stuck and what we do about it.",
    "Use numbers: $799, 14 days, 20-minute call.",
    "Short sentences. Plain words. One idea per line.",
    "Sentence case for headlines and buttons.",
    "Two-tone headlines: the claim in Bone, the payoff in Smoke.",
  ],
  dont: [
    "No em dashes. Use a full stop or a comma.",
    'No Oxford comma: "design, build and ship".',
    "No hype words: revolutionary, cutting-edge, synergy, leverage, supercharge.",
    "No exclamation marks.",
    'Never "AI-powered" as a selling point on its own.',
  ],
  words: [
    "doom",
    "bottleneck",
    "ship",
    "fixed price",
    "live preview",
    "hand over",
    "stuck",
  ],
  banners: [
    {
      title: "Open Graph / link preview",
      file: "doom-og-image-1200x630.jpg",
      width: 1200,
      height: 630,
    },
    {
      title: "X header",
      file: "doom-x-header-1500x500.jpg",
      width: 1500,
      height: 500,
    },
    {
      title: "LinkedIn profile banner",
      file: "doom-linkedin-banner-1584x396.jpg",
      width: 1584,
      height: 396,
    },
    {
      title: "LinkedIn company cover",
      file: "doom-linkedin-company-cover-1128x191.jpg",
      width: 1128,
      height: 191,
    },
    {
      title: "YouTube channel art",
      file: "doom-youtube-banner-2560x1440.jpg",
      width: 2560,
      height: 1440,
    },
    {
      title: "Desktop and call background",
      file: "doom-wallpaper-2560x1440.jpg",
      width: 2560,
      height: 1440,
    },
  ],
  posts: [
    {
      title: "Feed post, square",
      file: "doom-post-square-1080x1080.jpg",
      width: 1080,
      height: 1080,
    },
    {
      title: "Feed post, portrait",
      file: "doom-post-portrait-1080x1350.jpg",
      width: 1080,
      height: 1350,
    },
    {
      title: "Story",
      file: "doom-story-1080x1920.jpg",
      width: 1080,
      height: 1920,
    },
  ],
  files: [
    [
      "Fonts",
      "Inter Tight, Inter and Geist Mono. Free on Google Fonts under the SIL Open Font License. The logo files need no fonts.",
    ],
    [
      "Artwork",
      "The dune and gradients are original artwork made for Doom Studio.",
    ],
    ["Still to supply", "Founder photo, contact email and booking link."],
    [
      "Where it lives",
      "This board on the Doom Studio Website canvas, plus brand-kit.zip and the Codex handoff.",
    ],
  ],
};
