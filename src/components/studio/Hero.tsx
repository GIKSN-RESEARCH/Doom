import Image from "next/image";
import { contactLinks, navItems, secondaryCta, site } from "@/lib/content";
import { BottleneckBreaker } from "./BottleneckBreaker";
import { Nav } from "./Nav";
import { ContactMenu } from "./ContactMenu";
import { DooGlyph } from "./ui";
import styles from "./Hero.module.css";

export function Hero() {
  const { hero, nav } = site;
  return (
    <section id="top" className={styles.hero}>
      <Image
        className={styles.background}
        src="/images/hero-dune.jpg"
        alt=""
        fill
        preload
        fetchPriority="high"
        sizes="(max-width: 960px) 1600px, 100vw"
      />
      <div className={styles.shade} />
      <Nav items={navItems} cta={nav.cta} contactLinks={contactLinks} />
      <div className={`container ${styles.grid}`}>
        <div className={styles.top}>
          <div className={styles.copy}>
            <span className={styles.label}>{hero.label}</span>
            <h1 className={styles.headline}>
              {hero.headline[0]}
              <br />
              {hero.headline[1]} <span>{hero.headlineMuted}</span>
            </h1>
          </div>
          <div className={styles.side}>
            <p className={styles.body}>{hero.body}</p>
            <div className={styles.buttons}>
              <ContactMenu {...contactLinks} label={hero.primaryCta} />
              <a className={styles.ghost} href={secondaryCta.href}>
                {secondaryCta.label}
              </a>
            </div>
          </div>
        </div>
        <BottleneckBreaker copy={hero.game} />
      </div>
      <div className={`container ${styles.strip}`}>
        <div className={styles.stripInner}>
          <span className={styles.stripLabel}>{hero.stripLabel}</span>
          {hero.strip.map((name) => (
            <span className={styles.product} key={name}>
              <DooGlyph size={16} tone="white" />
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
