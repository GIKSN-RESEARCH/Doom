import { footerColumns, site } from "@/lib/content";
import { Logo } from "./ui";
import styles from "./Footer.module.css";

export function Footer() {
  const { footer } = site;
  return (
    <footer id="footer" className={styles.footer}>
      <div className={`container ${styles.body}`}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <a href="#top" className={styles.logo} aria-label="Doom Studio home">
              <Logo width={160} />
            </a>
            <p className={styles.tagline}>{footer.tagline}</p>
          </div>
          <nav className={styles.columns} aria-label="Footer navigation">
            {footerColumns.map((column) => (
              <div className={styles.column} key={column.title}>
                <span className={styles.heading}>{column.title}</span>
                {column.links.map(([label, href]) => (
                  <a href={href} key={label}>
                    {label}
                  </a>
                ))}
              </div>
            ))}
          </nav>
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
      {/* Inter Tight 600 ink bounds at 1000px, cropped to the upper 70%. */}
      <svg
        className={styles.wordmark}
        viewBox="52.734 -737.305 6297.182 523.905"
        aria-hidden="true"
        focusable="false"
      >
        <text x="0" y="0">
          {footer.wordmark}
        </text>
      </svg>
    </footer>
  );
}
