import Image from "next/image";
import { bookingHref, site } from "@/lib/content";
import { DooGlyph, Label, SplitButton } from "./ui";
import styles from "./Cta.module.css";

export function CallPrepCard({ compact = false }: { compact?: boolean }) {
  const { card } = site.cta;
  return (
    <div className={`${styles.card} ${compact ? styles.compact : ""}`}>
      <div className={styles.header}>
        <h3>{card.title}</h3>
        <DooGlyph size={28} />
      </div>
      <ul className={styles.items}>
        {card.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className={styles.note}>{card.note}</p>
    </div>
  );
}

export function Cta() {
  const { cta } = site;
  return (
    <section
      id="contact"
      className={styles.panel}
      aria-labelledby="contact-heading"
    >
      <Image
        className={styles.background}
        src="/images/gradient-sunrise.jpg"
        alt=""
        fill
        sizes="(max-width: 640px) 960px, (max-width: 1360px) calc(100vw - 40px), 1320px"
      />
      <div className={styles.layout}>
        <div className={styles.copy}>
          <Label>{cta.label}</Label>
          <h2
            id="contact-heading"
            className={`section-heading ${styles.heading}`}
          >
            <span>{cta.headlineMuted}</span>
            <br />
            {cta.headline}
          </h2>
          <p className={styles.description}>{cta.body}</p>
          <SplitButton
            href={bookingHref}
            target="_blank"
            className={styles.button}
          >
            {cta.button}
          </SplitButton>
        </div>
        <CallPrepCard />
      </div>
    </section>
  );
}
