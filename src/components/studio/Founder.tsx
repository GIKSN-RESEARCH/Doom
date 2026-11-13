import { site } from "@/lib/content";
import { Label } from "./ui";
import styles from "./Founder.module.css";

export function Founder() {
  const { founder } = site;
  return (
    <section className="section">
      <div className={`container two-column ${styles.grid}`}>
        <div className={styles.photo}>
          <span>{founder.photo}</span>
        </div>
        <div className={styles.content}>
          <Label>{founder.label}</Label>
          <h2 className={`lead ${styles.lead}`}>
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
