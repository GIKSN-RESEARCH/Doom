import Image from "next/image";
import { bookingHref, emailHref, site } from "@/lib/content";
import { Label, SplitButton, StatusChip } from "./ui";
import styles from "./Cta.module.css";

export function SprintCard({ compact = false }: { compact?: boolean }) {
  const { card } = site.cta;
  return (
    <div className={`glass ${styles.card} ${compact ? styles.compact : ""}`}>
      <div className={styles.header}>
        <span>{card.title}</span>
        <StatusChip tone="ok" className={styles.live}>
          <i />
          {card.status}
        </StatusChip>
      </div>
      <div className={styles.body}>
        <div className={styles.dayRow}>
          <span className={styles.day}>
            Day {card.day}
            <span> of {card.of}</span>
          </span>
          <span className={styles.fixed}>{card.tag}</span>
        </div>
        <div className={styles.segments} aria-hidden="true">
          {Array.from({ length: card.of }, (_, i) => (
            <i
              className={
                i < card.day - 1
                  ? styles.done
                  : i === card.day - 1
                    ? styles.now
                    : undefined
              }
              key={i}
            />
          ))}
        </div>
        <div className={styles.bottom}>
          <span>{card.left}</span>
          <span>{card.right}</span>
        </div>
      </div>
    </div>
  );
}

export function Cta() {
  const { cta, links } = site;
  return (
    <section id="contact">
      <div className={`container ${styles.cta}`}>
        <Label centered>{cta.label}</Label>
        <h2 className={`section-heading ${styles.heading}`}>
          <span>{cta.headlineMuted}</span>
          <br />
          {cta.headline}
        </h2>
        <p className={styles.description}>{cta.body}</p>
        <SplitButton href={bookingHref} className={styles.button}>
          {cta.button}
        </SplitButton>
        <span className={styles.mail}>
          {cta.mailPrefix} <a href={emailHref}>{links.email}</a>
        </span>
      </div>
      <div className={styles.panel}>
        <Image src="/images/gradient-sunrise.jpg" alt="" fill sizes="100vw" />
        <SprintCard />
      </div>
    </section>
  );
}
