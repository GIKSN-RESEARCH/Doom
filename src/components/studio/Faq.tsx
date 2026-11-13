import { site } from "@/lib/content";
import { SectionHead } from "./ui";
import styles from "./Faq.module.css";

export function Faq() {
  const { faq } = site;
  return (
    <section id="faq" className="section">
      <div className={`container two-column ${styles.grid}`}>
        <SectionHead
          label={faq.label}
          headline={faq.headline}
          muted={faq.headlineMuted}
          intro={faq.intro}
        />
        <div className={styles.list}>
          {faq.items.map((item, i) => (
            <details className={styles.item} key={item.q} open={i === 0}>
              <summary>
                <span>{item.q}</span>
                <span className={styles.plus}>
                  <svg
                    aria-hidden="true"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
