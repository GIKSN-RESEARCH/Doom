import { footerColumns, site } from "@/lib/content";
import { Logo } from "./ui";
import styles from "./Footer.module.css";

export function Footer() {
  const { footer } = site;
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.body}`}>
        <a href="#top" className={styles.logo} aria-label="Doom Studio home">
          <Logo width={160} />
        </a>
        <p className={styles.tagline}>{footer.tagline}</p>
        <div className={styles.columns}>
          {footerColumns.map((column) => (
            <div className={styles.column} key={column.title}>
              <span className={styles.heading}>{column.title}</span>
              {column.links.map(([label, href]) => (
                <a href={href} key={label}>
                  {label}
                </a>
              ))}
              {column.title === "Studio" && <a href="/brand-kit">Brand kit</a>}
            </div>
          ))}
        </div>
        <div className={styles.wordmark} aria-hidden="true">
          {footer.wordmark}
        </div>
        <div className={styles.legal}>
          {footer.legal.map((line, i) => (
            <span key={line}>
              {i > 0 && <i aria-hidden="true" />}
              {line}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
