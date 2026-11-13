import Image from "next/image";
import { site } from "@/lib/content";
import { Label } from "./ui";
import styles from "./Founder.module.css";

export function Founder() {
  const { founder } = site;
  return (
    <section id="founder" className="section" aria-labelledby="founder-heading">
      <div className={`container two-column ${styles.grid}`}>
        <div className={styles.photo}>
          <Image
            className={styles.portrait}
            src={founder.photo.src}
            alt={founder.photo.alt}
            fill
            sizes="(max-width: 664px) calc(100vw - 64px), (max-width: 960px) 600px, (max-width: 1320px) calc(50vw - 72px), 588px"
          />
        </div>
        <div className={styles.content}>
          <Label>{founder.label}</Label>
          <h2 id="founder-heading" className={`lead ${styles.lead}`}>
            {founder.lead} <span>{founder.leadMuted}</span>
          </h2>
          <p className="body-copy">{founder.body}</p>
          <div className={styles.tags}>
            {founder.links.map((link) => (
              <a className={styles.tag} href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
