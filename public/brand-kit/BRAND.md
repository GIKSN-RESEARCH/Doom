# Doom Studio brand guidelines

Version 1.0, November 2026. Everything in this kit was made for the Doom Studio site v5 design.

## Name and lines

- **Name:** Doom Studio. Two words, capital D and S. Use DOOM STUDIO in capitals only as a display wordmark, such as the site footer.
- **Tagline:** We doom the bottlenecks here.
- **Descriptor:** Design and engineering for AI startups
- **Website:** thedoomstudio.com

## Boilerplate

**One line**

Doom Studio designs and builds the landing page, product or workflow that has been stuck for weeks, for a fixed price.

**Short (about 45 words)**

Doom Studio is a design and engineering studio for AI startups, based in Bangalore. One team designs and builds landing pages, product UI, Next.js builds and AI automation for a fixed price, with a live preview from day one and the code handed over at the end.

**Long (about 100 words)**

Doom Studio is a design and engineering studio for AI startups, based in Bangalore. One team designs and builds landing pages, product UI, Next.js builds and AI automation for a fixed price, with a live preview from day one and the code handed over at the end. The studio runs on four steps: a 20-minute call, a fixed quote in writing, a build in the open and a launch with 14 days of fixes included. Founders talk to the person who builds the work, from the first call to the handover. Doom Studio ships its own products on the same stack, including Brier, AI Library, Trustload and Prometheus.

**Founder**

Brooklyn (Siddharth Manjul) is the founder of Doom Studio. A technical founder, he designs interfaces and writes production code in TypeScript, Rust and Swift, and builds his own products on the same stack he uses for clients.

## Logo

The mark is the DOO glyph: a solid D with two round eyes. It always appears as one of the files in `01-logo`. Every file has its type converted to outlines, so no font is needed.

| Version | Files | Use |
|---|---|---|
| Horizontal | `horizontal/doom-studio-horizontal-*.svg` | Default. Site nav, documents, decks, email |
| Stacked | `stacked/doom-studio-stacked-*.svg` | Square spaces, merch, splash screens |
| Glyph | `glyph/doom-glyph-*.svg` | Favicon, avatar, small spaces, pattern |
| Wordmark | `wordmark/doom-studio-wordmark-*.svg` | Rare. Only when the glyph already appears nearby |
| App icon | `app-icon/doom-app-icon-*.svg` | Profile pictures, app and PWA icons |

Colour variants: `primary` (orange glyph, white type, for dark), `primary-on-light` (orange glyph, ink type), `mono-white`, `mono-ink`. Every SVG has PNG exports in a `png` folder beside it.

### Rules

- **Clear space:** Keep empty space equal to half the glyph height on every side of any logo.
- **Minimum size:** Glyph 16 px on screen, 5 mm in print. Horizontal lockup 96 px wide, 25 mm in print. Stacked lockup 64 px wide.
- **On Ink:** Use the primary logo: orange glyph, white wordmark.
- **On light:** Use primary-on-light at 48 px glyph height and above. Below that, use mono ink, because orange on Paper is only 2.8:1.
- **On Doom Orange:** Use mono ink. Never put the orange glyph on orange.
- **On photos:** Place the logo on the darkest calm area, such as the sky in the dune image. Add a soft Ink shade if needed.

### Do not

- Stretch or squash
- Recolour outside the palette
- Add outlines, glows or shadows
- Rotate or tilt
- Rebuild the wordmark in another font
- Place on busy imagery

## Colour

| Name | Hex | RGB | Role |
|---|---|---|---|
| Ink | `#0B0B0C` | 11 11 12 | Base background for the site, social and decks. The brand lives on Ink. |
| Surface | `#141415` | 20 20 21 | Cards, rows and panels on Ink. |
| Line | `#252527` | 37 37 39 | Borders and dividers on Ink. |
| Bone | `#F4F2EE` | 244 242 238 | Primary text on Ink. 17.6:1 on Ink. |
| Ash | `#A6A29C` | 166 162 156 | Secondary text and labels. 7.8:1 on Ink. |
| Smoke | `#7C7A77` | 124 122 119 | Muted half of two-tone headlines. 4.6:1 on Ink, large text only. |
| Paper | `#F5F4F2` | 245 244 242 | Light cards and light-background documents. |
| Doom Orange | `#FF5A1F` | 255 90 31 | The accent. Logo, primary actions, active states, small signals. 6.3:1 on Ink. |

Proportion: Ink and Surface carry about 85% of any layout. Bone and Ash carry the text. Doom Orange stays under 5%, as a signal, never as a fill behind paragraphs.

Contrast checks (WCAG 2.1): Bone on Ink 17.6:1, Ash on Ink 7.8:1, Smoke on Ink 4.6:1, Doom Orange on Ink 6.3:1, Ink on Doom Orange 6.3:1, Ink on Paper 17.9:1. White on Doom Orange is only 3.1:1, so orange buttons use Ink text. Doom Orange on Paper is 2.8:1, so do not set orange text on light backgrounds.

Files in `02-colour`: `doom-studio-palette.css` (CSS variables), `doom-studio-palette.json` and `doom-studio-palette.ase` (Adobe swatches for Illustrator, Photoshop and Figma plugins).

Imagery tones, for matching graphics to the dune and gradients only: Sky Teal `#27444B`, Dusk Mauve `#8B6F66`, Dune Shadow `#1D1513`, Dune Light `#F58B40`, Ember `#C7481B`.

## Typography

All three families are free on Google Fonts under the SIL Open Font License.

| Family | Weights | Role | Spec |
|---|---|---|---|
| Inter Tight | 500 | Display and headlines | Hero 98/0.98, -3.6% tracking. Section 64/1.03, -3.5%. Logo and wordmark use 600. |
| Inter | 400, 500 | Body, UI and buttons | Body 16 to 19 on 1.5 line height. Labels 15 at 500. |
| Geist Mono | 400, 500 | Data, logs, URLs and numbers | 12 to 13 for logs and metadata. Never for paragraphs. |

Headlines use the two-tone pattern: the claim in Bone, the payoff in Smoke, for example "Fixed prices. **No surprises.**"

## Imagery

- **Dune** (`05-imagery`): Hero and social. The signature image. Text sits in the sky or on the shadow side, never on the lit face.
- **Sunrise gradient** (`05-imagery`): Large panels: the closing call to action and landing page tiles.
- **Ember gradient** (`05-imagery`): Featured items, such as the most booked plan.
- **Satin gradient** (`05-imagery`): Supporting tiles with a dark scrim behind white text.
- **Process gradient** (`05-imagery`): Behind white product cards and log panels.

The dune and gradients are original artwork made for Doom Studio. Do not swap in stock photos without checking the licence.

## Voice

Direct, plain and specific. Talk like the person who will build it.

**Do**

- Say what is stuck and what we do about it.
- Use numbers: $799, 14 days, 20-minute call.
- Short sentences. Plain words. One idea per line.
- Sentence case for headlines and buttons.
- Two-tone headlines: the claim in Bone, the payoff in Smoke.

**Do not**

- No em dashes. Use a full stop or a comma.
- No Oxford comma: "design, build and ship".
- No hype words: revolutionary, cutting-edge, synergy, leverage, supercharge.
- No exclamation marks.
- Never "AI-powered" as a selling point on its own.

Words we use: doom, bottleneck, ship, fixed price, live preview, hand over, stuck.

## Social and media

| Asset | Size | File |
|---|---|---|
| Open Graph / link preview | 1200 x 630 | `04-social/.../doom-og-image-1200x630.jpg` |
| X header | 1500 x 500 | `04-social/.../doom-x-header-1500x500.jpg` |
| LinkedIn profile banner | 1584 x 396 | `04-social/.../doom-linkedin-banner-1584x396.jpg` |
| LinkedIn company cover | 1128 x 191 | `04-social/.../doom-linkedin-company-cover-1128x191.jpg` |
| YouTube channel art | 2560 x 1440 | `04-social/.../doom-youtube-banner-2560x1440.jpg` |
| Desktop and call background | 2560 x 1440 | `04-social/.../doom-wallpaper-2560x1440.jpg` |
| Feed post, square | 1080 x 1080 | `04-social/.../doom-post-square-1080x1080.jpg` |
| Feed post, portrait | 1080 x 1350 | `04-social/.../doom-post-portrait-1080x1350.jpg` |
| Story | 1080 x 1920 | `04-social/.../doom-story-1080x1920.jpg` |
| Avatar, dark | 400 and 800 square | `04-social/avatar/doom-avatar-dark-*.png` |
| Avatar, orange | 400 and 800 square | `04-social/avatar/doom-avatar-orange-*.png` |

Default avatar: the dark one everywhere. The orange one is for places where the profile sits on a dark page and needs to stand out.

Banner copy sits clear of the profile photo: right of 420 px on X, right of 470 px on LinkedIn.

## Icons

`03-icons` has `favicon.ico` (16 to 64), `favicon.svg`, `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` and `site.webmanifest`. Theme colour is Ink `#0B0B0C`.

## Still to supply

- Founder photo for the site and press.
- Contact email and booking link.
