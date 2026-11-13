import Image from "next/image";
import { bookingHref, site } from "@/lib/content";
import { Arrow, SectionHead } from "./ui";
import styles from "./Pricing.module.css";

export function Pricing() {
  const { pricing } = site;
  return (
    <section id="pricing" className="section">
      <div className="container section-stack">
        <SectionHead
          label={pricing.label}
          headline={pricing.headline}
          muted={pricing.headlineMuted}
          intro={pricing.intro}
        />
        <div className={styles.grid}>
          {pricing.plans.map((plan) => (
            <div
              className={`${styles.plan} ${plan.featured ? styles.featured : ""}`}
              key={plan.name}
            >
              {plan.featured && (
                <Image
                  src="/images/gradient-ember.jpg"
                  className={styles.background}
                  alt=""
                  fill
                  sizes="(max-width: 1100px) 100vw, 33vw"
                />
              )}
              <div className={styles.inner}>
                <div className={styles.name}>
                  <span>{plan.name}</span>
                  {plan.badge && (
                    <span className={styles.badge}>{plan.badge}</span>
                  )}
                </div>
                <div className={styles.price}>
                  <span className={styles.from}>{pricing.fromLabel}</span>
                  <span className={styles.amount}>{plan.price}</span>
                  <span className={styles.from}>{plan.unit}</span>
                </div>
                <span className={styles.time}>{plan.time}</span>
                <p className={styles.description}>{plan.desc}</p>
                <a className={styles.button} href={bookingHref}>
                  {plan.cta}
                  <Arrow direction="right" size={18} />
                </a>
                <ul>
                  {plan.items.map((item) => (
                    <li key={item}>
                      <span className={styles.check}>
                        <svg
                          aria-hidden="true"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
