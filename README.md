# Doom Studio

Next.js implementation of the supplied Site v5 handoff and Doom Studio brand kit.
The homepage and `/brand-kit` are static. Existing editorial pages, admin and
content APIs are preserved. Their previous styles are isolated in `src/app/legacy.css`.

## Getting Started

First, run the development server:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Design and content

- `src/content/site.json`: website copy and the Cal.com booking destination.
- `src/content/visibility.ts`: controls whether Selected Work and its links appear.
- `src/design/tokens.css`: the supplied design tokens.
- `src/components/studio/`: the new page sections and CSS Modules.
- `src/lib/bottleneck-breaker.ts`: typed port of the supplied game.
- `src/app/brand-kit/`: responsive reproduction of the supplied brand board.
- `public/images/` and `public/brand/`: website artwork and identity assets.
- `public/brand-kit/`: original assets, guidelines PDF and downloadable ZIP.

The source handoff folders remain intact. The mobile menu expands from its
control, supports keyboard navigation and closes with Escape. The homepage uses
native scrolling and retains refresh-to-hero behavior.

The repository keeps its existing Bun lockfile and package-manager configuration.
`next/font/google` fetches Inter Tight, Inter and Geist Mono at build time and
self-hosts them. The browser makes no Google Fonts requests.

## Owner-supplied placeholders

These are intentionally unchanged for the next content pass:

- `[24 hours]` in the process copy.
- `[7] days` in the landing-page plan.

Selected Work is off for now. Its cards and artwork are kept for re-enabling.
The supplied GitHub URL remains unchanged pending the owner's review.

## Checks and production preview

```bash
bun run lint
bun run build
node node_modules/typescript/bin/tsc --noEmit
bun run start
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
