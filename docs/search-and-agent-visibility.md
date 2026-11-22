# Search and agent visibility

Research and site audit: 23 November 2026. Primary origin: `https://www.thedoomstudio.com`.
Google Search Console ownership is already verified. Account reports and sitemap submission were not accessed in this task.

## What the implementation provides

| Resource | Purpose | Indexing policy |
| --- | --- | --- |
| `/sitemap.xml` | The four existing canonical HTML pages: `/`, `/brand-kit`, `/reading`, `/updates` | Public page discovery |
| `/robots.txt` | Allows public crawling and declares the sitemap; excludes API and admin paths | Crawler rules |
| `/llms.txt` | Short index of official studio information and contact links | Fetchable; `noindex, follow` |
| `/index.md` | Clean text of the studio's services, stack, process, starting prices, founder, products and FAQ | Fetchable; `noindex, follow`; canonical points to `/` |
| `/brand-kit/index.md` | Identity summary and direct links to official assets | Fetchable; `noindex, follow`; canonical points to `/brand-kit` |
| `/llms-full.txt` | Both Markdown documents combined for clients that prefer one fetch | Fetchable; `noindex, follow` |
| `/og-preview` | Internal artwork preview | `noindex, follow`; crawlable so engines can see the directive |

The Markdown is generated at build time from selected public sections in `src/content/site.json`. It excludes the hidden Selected Work section and the archive's database fallback examples. It omits the unconfirmed `[7] days` pricing placeholder. Booking links go to the existing Cal.com page; nothing books a call automatically.

The homepage and brand page advertise their Markdown copies with HTML `rel="alternate"` links. HTTP `Link` headers advertise the Markdown alternate and `llms.txt`. Text responses use explicit content types and permit cross-origin reads of these public documents.

The sitemap now uses stable, content-specific modification dates. The archive entries omit dates because the current implementation does not establish a reliable database modification time. Updating a build no longer makes every page look newly edited. Google ignores sitemap `priority` and `changefreq`; accurate canonical URLs and meaningful `lastmod` values matter more. [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

The homepage title describes the business. Organization, Person, WebSite and Service data distinguish Doom Studio's X profile from the founder's personal profiles. No ratings, client metrics, street address or credentials have been invented. Truthful organization markup can help Google interpret an entity, without guaranteeing a special search appearance. [Organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization)

## What the live audit found

The deployed homepage, brand kit, archives, robots file and sitemap returned successful responses. The apex domain resolved to the `www` homepage, and HTML canonicals used `www`. Homepage content was present in server HTML, rather than requiring an agent to run the game or wait for client rendering. The deployed `llms.txt` returned 404 before this implementation.

The live archives contain published entries, so their existing indexing eligibility is preserved. However, `src/lib/readings.ts` also serves sample fallback entries when the database is unavailable, including unverified performance claims. Review that fallback behavior and the article text before promoting the archives. This task does not endorse those claims or copy them into agent documents. Archive details currently open inside the archive interface, rather than having individual canonical HTML URLs.

These findings describe a public browser audit, not Google's indexed copy or a Search Console report. New resources remain local until deployed. Search canonical selection also needs confirmation in URL Inspection. Redirects and canonical tags are signals, rather than a way to force Google's choice. [Canonical URL guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)

## Search Console: next steps for the verified property

1. **After deployment, submit the sitemap.** Open the Domain property for `thedoomstudio.com`, or the URL-prefix property matching `https://www.thedoomstudio.com/`. In **Sitemaps**, submit `https://www.thedoomstudio.com/sitemap.xml`. Check that Google can read it and reports the expected four URLs. Submission supports discovery; it does not guarantee indexing. [Sitemaps report](https://support.google.com/webmasters/answer/7451001?hl=en)
2. **Inspect the important URLs.** Use URL Inspection for the homepage and brand kit, run a live test, and check successful fetch, indexing eligibility, rendered content and canonical information. Request indexing once after the update. Inspect the archives if they are intended to attract search visits. Crawling can take days or weeks; repeating requests does not speed it up. [Requesting a recrawl](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
3. **Review Page indexing.** Investigate unexpected exclusions, server errors, redirects, duplicate canonicals and pages blocked from crawling. Exclusion of the text copies and OG preview by `noindex` is intentional. A crawler must be able to fetch a URL to read its `noindex` header; this is why the preview is not blocked in robots. Admin security still depends on authentication, not robots rules. [Google's noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
4. **Use Performance to choose improvements.** Review queries and landing pages by country and device. Compare successive 28-day periods when there is enough data. Track relevant non-brand impressions, clicks and conversions; position alone does not show lead quality. AI Overviews and AI Mode traffic is included in the Web search reporting rather than providing a guaranteed separate acquisition channel. [Search Console overview](https://support.google.com/webmasters/answer/9128668?hl=en), [Google AI features](https://developers.google.com/search/docs/appearance/ai-features)
5. **Check experience and problems.** Review Core Web Vitals, HTTPS, Manual actions and Security issues. Use PageSpeed Insights for diagnosis and field data when available. Good field thresholds are LCP at most 2.5 seconds, INP at most 200 milliseconds and CLS at most 0.1, assessed at the 75th percentile. A lab score is not proof that real visitors meet these thresholds; low-traffic sites may lack field data. No Lighthouse or field score is claimed by this audit. [Core Web Vitals](https://web.dev/articles/vitals)

## Helping agents access the site

`llms.txt` is a published proposal for concise, linked context. Its current format supports clean Markdown documents and discovery through alternate/described-by links. It is useful for compatible tools; adoption and citations are not guaranteed. It does not replace a sitemap, robots policy or the actual website. [The llms.txt proposal](https://llmstxt.org/)

Google says its AI search features use normal Search eligibility and SEO practices, with no extra AI file or special schema requirement. Keep important information in accessible text, descriptive headings and native links; maintain successful responses and consistent canonicals. [Google AI search requirements](https://developers.google.com/search/docs/appearance/ai-features)

The current wildcard robots policy permits public search crawlers and user-directed fetchers. This implementation does not add a separate training opt-in. If Vercel or a future Cloudflare/WAF setup challenges legitimate bots, inspect request logs before changing rules. Use the provider's verified-bot facilities or current published IP ranges alongside its documented identity; a user-agent string alone is easy to spoof. Do not disable protection globally.

Search discovery and model training use different crawlers. OpenAI documents OAI-SearchBot separately from GPTBot; Anthropic distinguishes Claude-SearchBot and Claude-User from ClaudeBot; Perplexity distinguishes its search bot and user fetcher. Some user-directed requests do not follow ordinary crawler rules, so robots must never be treated as access control. [OpenAI crawlers](https://developers.openai.com/api/docs/bots), [Anthropic crawlers](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)

## The next visibility work, in priority order

- **Publish useful service pages.** Start with the services you most want to sell. Explain the problem, deliverables, boundaries, process and relevant evidence on a real URL with its own title and canonical. The current `#services` anchor is part of the homepage, not another indexable page. Do not manufacture many near-identical keyword pages.
- **Publish proof you can substantiate.** Approved case studies should describe the starting problem, the actual work and measured outcomes. Give each substantial story a crawlable detail URL and link it from relevant services. Do not reuse sample metrics from the fallback data. Keep the live product list limited to AI Library, Rinne and GIKSN until other products launch.
- **Build genuine discovery paths.** Link the studio from the founder's profiles, real product sites and relevant published work. Keep the studio name, founder and destination URLs consistent. Avoid purchased links and fabricated reviews. Useful original content and understandable links are a stronger foundation than keyword stuffing. [Google SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- **Measure the business result.** Track qualified enquiries and outbound booking clicks in the chosen analytics setup. A booking-link click is not a completed booking; that requires a supported Cal.com completion integration. Use search queries and real enquiries to decide which page to improve next.
- **Improve measured performance.** Test the deployed mobile site, including animation and game cost, before adding more scripts. Address measured bottlenecks, then verify with real-user data when available.

## Maintenance and release checks

Update public copy in `src/content/site.json`; the text documents and structured data rebuild from it. Add genuine indexable HTML pages to `PUBLIC_PAGES` in `src/lib/seo.ts`. Advance a page's date only after a meaningful content change; leave unknown dates absent. Keep Markdown copies out of the XML sitemap.

Before release, run the production build and lint, then verify response status, MIME types, discovery headers, canonicals, sitemap XML, robots rules and JSON-LD. After deployment, repeat public URL checks and the Search Console steps above. Account submission, WAF configuration and Google's eventual indexing are separate from a passing local build.

Validation for this change passed: `bun run build` (including TypeScript), `bun run lint`, and browser checks against a local production server. The four text routes passed GET/HEAD, MIME, cache, CORS and indexing-header checks; all five linked brand assets returned 200. Sitemap XML, stable dates, four canonical entries, HTML discovery links, server-rendered headings, structured identities and preview exclusions also passed. This validates the local implementation, not the undeployed public endpoints or Google's indexed state.
