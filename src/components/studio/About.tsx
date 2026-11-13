import { site } from "@/lib/content";
import { Label } from "./ui";
import styles from "./About.module.css";

export function About() {
  const { about } = site;
  return (
    <section className="section">
      <div className="container two-column">
        <div className="section-title">
          <Label>{about.label}</Label>
          <h2 className="section-heading">
            {about.headline} <span>{about.headlineMuted}</span>
          </h2>
        </div>
        <div className={styles.content}>
          <p className="lead">
            {about.lead} <span>{about.leadMuted}</span>
          </p>
          <div className={styles.stats}>
            {about.stats.map((stat) => (
              <div className={styles.stat} key={stat.label}>
                <span className={styles.number}>{stat.value}</span>
                <span className={styles.label}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
