import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brand } from "@/content/brand";
import palette from "@/content/palette.json";
import { contactLinks, navItems, secondaryCta, site } from "@/lib/content";
import { ContactMenu } from "@/components/studio/ContactMenu";
import { Nav } from "@/components/studio/Nav";
import { CallPrepCard } from "@/components/studio/Cta";
import {
  Arrow,
  DooGlyph,
  Label,
  Logo,
  SplitButton,
  StatusChip,
} from "@/components/studio/ui";
import heroStyles from "@/components/studio/Hero.module.css";
import styles from "./page.module.css";

const kit = "/brand-kit";
const horizontal = `${kit}/01-logo/horizontal/doom-studio-horizontal`;

export const metadata: Metadata = {
  title: "Brand and media kit",
  description:
    "The Doom Studio brand and media kit. Logos, colour, typography, original artwork and ready-to-use media assets.",
  alternates: {
    canonical: "/brand-kit",
    types: { "text/markdown": "/brand-kit/index.md" },
  },
  openGraph: {
    title: "Doom Studio brand and media kit",
    description: "The DOO glyph, brand guidelines and original media assets.",
    url: "/brand-kit",
    type: "website",
    images: [{ url: site.meta.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Doom Studio brand and media kit",
    description: "The DOO glyph, brand guidelines and original media assets.",
    images: [site.meta.ogImage],
  },
};

function BrandSection({
  id,
  number,
  label,
  title,
  muted,
  children,
}: {
  id: string;
  number: string;
  label: string;
  title: string;
  muted: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section} id={id}>
      <div className={`container ${styles.sectionInner}`}>
        <div className={styles.heading}>
          <Label>
            {number} · {label}
          </Label>
          <h2>
            {title} <span>{muted}</span>
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function AssetCard({
  src,
  title,
  description,
  background,
  mode = "logo",
}: {
  src: string;
  title: string;
  description?: string;
  background?: string;
  mode?: "logo" | "photo";
}) {
  return (
    <a href={src} download className={styles.asset}>
      <div
        className={`${styles.assetVisual} ${mode === "logo" ? styles.logoVisual : styles.photoVisual}`}
        style={{ background }}
      >
        <Image
          src={src}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 25vw"
          unoptimized={src.endsWith(".svg")}
        />
      </div>
      <div className={styles.assetCaption}>
        <span>{title}</span>
        {description && <span>{description}</span>}
      </div>
    </a>
  );
}

function MediaCard({
  item,
  folder,
}: {
  item: { title: string; file: string; width: number; height: number };
  folder: "banners" | "posts";
}) {
  const src = `${kit}/04-social/${folder}/${item.file}`;
  return (
    <a className={styles.mediaCard} href={src} download>
      <Image
        src={src}
        alt={item.title}
        width={item.width}
        height={item.height}
        sizes={
          folder === "posts"
            ? "(max-width: 640px) 100vw, 33vw"
            : "(max-width: 640px) 100vw, 50vw"
        }
      />
      <span className={styles.mediaCaption}>
        <span>{item.title}</span>
        <span>
          {item.width} x {item.height}
        </span>
      </span>
    </a>
  );
}

export default function BrandKitPage() {
  return (
    <>
      <a href="#brand-content" className="skip-link">
        Skip to brand guidelines
      </a>
      <main id="top" className={styles.page}>
        <section className={styles.hero}>
          <Image
            src="/images/hero-dune.jpg"
            alt=""
            fill
            preload
            fetchPriority="high"
            sizes="(max-width: 640px) 960px, 100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroShade} />
          <Nav
            items={navItems}
            cta={site.nav.cta}
            contactLinks={contactLinks}
            innerPage
          />
          <div className={`container ${styles.heroCopy}`}>
            <Label>{brand.version}</Label>
            <h1>
              We doom the
              <br />
              bottlenecks <span>here.</span>
            </h1>
          </div>
        </section>

        <div id="brand-content">
          <BrandSection
            id="logo"
            number="01"
            label="Logo"
            title="The DOO"
            muted="glyph."
          >
            <a
              href={`${horizontal}-primary.svg`}
              download
              className={styles.logoShowcase}
            >
              <Image
                src={`${horizontal}-primary.svg`}
                width={740}
                height={123}
                alt="Doom Studio primary logo"
                unoptimized
              />
            </a>
            <div className={styles.fourGrid}>
              {brand.logoVariants.map((variant) => (
                <AssetCard
                  key={variant.variant}
                  title={variant.title}
                  description={variant.description}
                  src={`${horizontal}-${variant.variant}.svg`}
                  background={variant.background}
                />
              ))}
            </div>
            <div className={styles.threeGrid}>
              <AssetCard
                src={`${kit}/01-logo/stacked/doom-studio-stacked-primary.svg`}
                title="Stacked"
                description="Square spaces, merch, splash screens"
              />
              <div className={styles.asset}>
                <div className={styles.pairVisual}>
                  <DooGlyph size={112} />
                  <DooGlyph size={112} tone="white" />
                </div>
                <div className={styles.assetCaption}>
                  <span>Glyph</span>
                  <span>Favicon, avatar and small spaces</span>
                </div>
              </div>
              <div className={styles.asset}>
                <div className={`${styles.pairVisual} ${styles.appVisual}`}>
                  <Image
                    src={`${kit}/01-logo/app-icon/doom-app-icon-dark.svg`}
                    width={132}
                    height={132}
                    alt="Dark Doom Studio app icon"
                    unoptimized
                  />
                  <Image
                    src={`${kit}/01-logo/app-icon/doom-app-icon-orange.svg`}
                    width={132}
                    height={132}
                    alt="Orange Doom Studio app icon"
                    unoptimized
                  />
                </div>
                <div className={styles.assetCaption}>
                  <span>App icon</span>
                  <span>Profile pictures, PWA and app icons</span>
                </div>
              </div>
            </div>
          </BrandSection>

          <BrandSection
            id="construction"
            number="02"
            label="Construction"
            title="Clear space and"
            muted="minimum size."
          >
            <div className={styles.twoGrid}>
              <div className={styles.construction}>
                <div className={styles.constructionArt}>
                  <div className={styles.clearSpace}>
                    <span className={styles.halfX}>0.5x</span>
                    <DooGlyph size={144} tone="white" />
                    <span className={styles.fullX}>x</span>
                  </div>
                </div>
                <p>
                  x = glyph height. Clear space 0.5x on every side. Eyes are two
                  equal circles on the centre line.
                </p>
              </div>
              <dl className={styles.rules}>
                {brand.construction.map(([term, description]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </BrandSection>

          <BrandSection
            id="misuse"
            number="03"
            label="Misuse"
            title="Keep it as"
            muted="drawn."
          >
            <div className={styles.threeGrid}>
              {brand.misuse.map((example, i) => (
                <div className={styles.asset} key={example}>
                  <div
                    className={`${styles.misuseVisual} ${styles[`misuse${i}`]}`}
                    aria-hidden="true"
                  >
                    {i === 4 ? (
                      <span className={styles.wrongFont}>
                        <DooGlyph size={32} />
                        Doom Studio
                      </span>
                    ) : (
                      <Image
                        src={`${horizontal}-${i === 5 ? "mono-white" : "primary"}.svg`}
                        width={250}
                        height={42}
                        alt=""
                        unoptimized
                      />
                    )}
                  </div>
                  <div className={styles.misuseCaption}>
                    <span>Don&apos;t</span>
                    {example}
                  </div>
                </div>
              ))}
            </div>
          </BrandSection>

          <BrandSection
            id="colour"
            number="04"
            label="Colour"
            title="Ink first."
            muted="Orange as a signal."
          >
            <div className={`${styles.fourGrid} ${styles.palette}`}>
              {palette.brand.map((color, i) => (
                <div className={styles.swatch} key={color.name}>
                  <div
                    className={styles.swatchColor}
                    style={{
                      background: color.hex,
                      color: i >= 3 ? "#0B0B0C" : "#F4F2EE",
                    }}
                  >
                    {color.name}
                  </div>
                  <span className={styles.colorCode}>{color.hex}</span>
                  <span className={styles.colorCode}>
                    RGB {color.rgb.join(" ")}
                  </span>
                  <p>{color.role}</p>
                </div>
              ))}
            </div>
            <div className={styles.proportion} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <p className={styles.proportionCaption}>
              Proportion. Ink and Surface carry the layout, Doom Orange stays
              under 5%.
            </p>
            <div className={styles.tones}>
              <p>Imagery tones · for matching graphics to the dune only</p>
              <div className={styles.fiveGrid}>
                {palette.imageryTones.map((color) => (
                  <div key={color.name}>
                    <i style={{ background: color.hex }} />
                    <span>{color.name}</span>
                    <span className={styles.colorCode}>{color.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          </BrandSection>

          <BrandSection
            id="typography"
            number="05"
            label="Typography"
            title="Three families."
            muted="One voice."
          >
            <div className={styles.typeRows}>
              <div>
                <div>
                  <span>Inter Tight</span>
                  <small>500 · Display and headlines</small>
                </div>
                <p className={styles.displaySample}>
                  Fixed prices. <span>No surprises.</span>
                </p>
              </div>
              <div>
                <div>
                  <span>Inter</span>
                  <small>400, 500 · Body, UI and buttons</small>
                </div>
                <p className={styles.bodySample}>{site.hero.body}</p>
              </div>
              <div>
                <div>
                  <span>Geist Mono</span>
                  <small>400, 500 · Data, logs and URLs</small>
                </div>
                <p className={styles.monoSample}>
                  Scope&nbsp; Agreed in writing
                  <br />
                  Review&nbsp; Feedback and next steps
                  <br />
                  thedoomstudio.com
                </p>
              </div>
            </div>
            <div className={styles.typeScale}>
              {brand.typeScale.map((type) => (
                <div key={type.name}>
                  <span>{type.name}</span>
                  <span
                    style={{ fontSize: type.size }}
                    className={type.name === "Mono" ? styles.monoAa : undefined}
                  >
                    Aa
                  </span>
                  <small>{type.spec}</small>
                </div>
              ))}
            </div>
          </BrandSection>

          <BrandSection
            id="imagery"
            number="06"
            label="Imagery"
            title="Dune and"
            muted="warm gradients."
          >
            <a
              href={`${kit}/05-imagery/doom-dune-3200x2000.jpg`}
              download
              className={styles.dunePanel}
            >
              <Image
                src="/images/hero-dune.jpg"
                alt="Doom Studio signature dune artwork"
                fill
                sizes="100vw"
              />
              <div>
                <span>Dune</span>
                <p>
                  Hero and social. The signature image. Text sits in the sky or
                  on the shadow side, never on the lit face.
                </p>
              </div>
            </a>
            <div className={styles.fourGrid}>
              {brand.gradients.map((gradient) => (
                <AssetCard
                  src={`${kit}/05-imagery/doom-gradient-${gradient.image}.jpg`}
                  title={gradient.name}
                  description={gradient.description}
                  mode="photo"
                  key={gradient.image}
                />
              ))}
            </div>
          </BrandSection>

          <BrandSection
            id="interface"
            number="07"
            label="Interface"
            title="The pieces the site"
            muted="is built from."
          >
            <div className={styles.threeGrid}>
              <div className={styles.interfaceCard}>
                <span>Primary action</span>
                <div>
                  <ContactMenu {...contactLinks} label={site.hero.primaryCta} />
                </div>
              </div>
              <div className={styles.interfaceCard}>
                <span>Navigation</span>
                <div className={styles.navExample}>
                  {navItems.slice(0, 4).map((item, i) => (
                    <a
                      href={`/${item.href}`}
                      className={i === 0 ? styles.navSelected : undefined}
                      key={item.href}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
              <div className={styles.interfaceCard}>
                <span>Secondary action</span>
                <div>
                  <Link
                    href={`/${secondaryCta.href}`}
                    className={heroStyles.ghost}
                  >
                    {secondaryCta.label}
                  </Link>
                </div>
              </div>
              <div className={styles.interfaceCard}>
                <span>Status chips</span>
                <div className={styles.statusExamples}>
                  <StatusChip tone="ok">Live</StatusChip>
                  <StatusChip tone="ok">Done</StatusChip>
                  <StatusChip tone="wait">Review</StatusChip>
                  <StatusChip>12 files</StatusChip>
                  <span className={styles.mostBooked}>Most booked</span>
                </div>
              </div>
              <div className={styles.interfaceCard}>
                <span>Card on Ink</span>
                <div className={styles.processExample}>
                  <span>03</span>
                  <div>
                    <span>{site.process.steps[2].title}</span>
                    <p>{site.process.steps[2].desc}</p>
                  </div>
                </div>
              </div>
              <div className={styles.interfaceCard}>
                <span>Glass card on imagery</span>
                <div className={styles.glassExample}>
                  <Image
                    src="/images/gradient-sunrise.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <CallPrepCard compact />
                </div>
              </div>
            </div>
            <div className={styles.specBar}>
              <span>Radius</span>10 buttons <span>14 nav and FAQ</span>18 to 22
              cards <span>999 chips</span>
              <span>Spacing</span>4 · 8 · 12 · 16 · 20 · 24 · 32 · 56 · 130
            </div>
          </BrandSection>

          <BrandSection
            id="voice"
            number="08"
            label="Voice"
            title="Say it"
            muted="plainly."
          >
            <div className={styles.twoGrid}>
              <div className={styles.voiceCopy}>
                {brand.voice.map(([label, copy], i) => (
                  <div key={label}>
                    <span>{label}</span>
                    <p
                      className={
                        i === 0
                          ? styles.tagline
                          : i === 1
                            ? styles.descriptor
                            : undefined
                      }
                    >
                      {copy}
                    </p>
                  </div>
                ))}
              </div>
              <div className={styles.voiceRules}>
                <div>
                  <span>Do</span>
                  <ul>
                    {brand.do.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span>Don&apos;t</span>
                  <ul>
                    {brand.dont.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span>Words we use</span>
                  <div className={styles.words}>
                    {brand.words.map((word) => (
                      <span key={word}>{word}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </BrandSection>

          <BrandSection
            id="media"
            number="09"
            label="Social and media"
            title="Ready to"
            muted="upload."
          >
            <div className={styles.twoGrid}>
              <div className={styles.mediaStack}>
                {brand.banners.slice(0, 4).map((item) => (
                  <MediaCard item={item} folder="banners" key={item.file} />
                ))}
              </div>
              <div className={styles.mediaStack}>
                {brand.banners.slice(4).map((item) => (
                  <MediaCard item={item} folder="banners" key={item.file} />
                ))}
              </div>
            </div>
            <div className={styles.threeGrid}>
              {brand.posts.map((item) => (
                <MediaCard item={item} folder="posts" key={item.file} />
              ))}
            </div>
            <div className={styles.avatarGrid}>
              {["dark", "orange"].map((tone) => (
                <a
                  href={`${kit}/04-social/avatar/doom-avatar-${tone}-800.png`}
                  download
                  className={styles.avatar}
                  key={tone}
                >
                  <Image
                    src={`${kit}/04-social/avatar/doom-avatar-${tone}-400.png`}
                    width={132}
                    height={132}
                    alt={`Doom Studio ${tone} avatar`}
                  />
                  <span>
                    Avatar, {tone}
                    {tone === "dark" ? " · default" : ""}
                  </span>
                </a>
              ))}
              <div className={styles.faviconCard}>
                <div className={styles.lightTab}>
                  <Image
                    src="/brand/favicon.svg"
                    width={16}
                    height={16}
                    alt=""
                    unoptimized
                  />
                  Doom Studio
                </div>
                <div className={styles.darkTab}>
                  <Image
                    src="/brand/favicon.svg"
                    width={16}
                    height={16}
                    alt=""
                    unoptimized
                  />
                  Doom Studio
                </div>
                <span>Favicon at 16 px, light and dark tabs</span>
              </div>
            </div>
          </BrandSection>

          <BrandSection
            id="files"
            number="10"
            label="Files"
            title="What is in"
            muted="the kit."
          >
            <div className={styles.twoGrid}>
              <pre className={styles.fileTree}>{`brand-kit/
  BRAND.md                 guidelines in text
  01-logo/                 horizontal, stacked, glyph,
                           wordmark and app-icon SVGs,
                           outlined, with PNGs in png/
  02-colour/               palette as CSS, JSON and ASE
  03-icons/                favicon.ico and .svg, touch icon,
                           PWA icons and site.webmanifest
  04-social/               avatar/, banners/, posts/
  05-imagery/              dune and four gradients
  06-media/site-screens/   desktop and mobile screenshots of site v5`}</pre>
              <dl className={styles.rules}>
                {brand.files.map(([term, description]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{description}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className={styles.downloads}>
              <SplitButton href={`${kit}/doom-studio-brand-kit.zip`}>
                Download brand kit
              </SplitButton>
              <a
                href={`${kit}/doom-studio-brand-guidelines.pdf`}
                target="_blank"
                rel="noreferrer"
              >
                View original guidelines <Arrow size={18} />
              </a>
              <a href={`${kit}/02-colour/doom-studio-palette.ase`} download>
                Download colour palette <Arrow size={18} />
              </a>
            </div>
          </BrandSection>
        </div>
      </main>
      <footer className={`container ${styles.footer}`}>
        <Link href="/" aria-label="Doom Studio home">
          <Logo width={144} />
        </Link>
        <p>Doom Studio brand and media kit · Version 1.0 · thedoomstudio.com</p>
      </footer>
    </>
  );
}
