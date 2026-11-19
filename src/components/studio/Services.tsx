import Image from "next/image";
import { site } from "@/lib/content";
import { DooGlyph, SectionHead } from "./ui";
import { StackMarquee } from "./StackMarquee";
import styles from "./Services.module.css";

const swatches = [
  "#0B0B0C",
  "#2A2A2D",
  "#4A4846",
  "#8E8C89",
  "#C9C6C2",
  "#EFEDEA",
  "#FFFFFF",
  "#FFD9C7",
  "#FF8A4C",
  "#FF5A1F",
  "#D8401B",
  "#8E2D14",
];

export function Services() {
  const { services } = site;
  return (
    <section id="services" className="section">
      <div className="container section-stack">
        <SectionHead
          label={services.label}
          headline={services.headline}
          muted={services.headlineMuted}
          intro={services.intro}
        />
        <div className={styles.grid}>
          {services.items.map((item, i) => (
            <div
              className={`${styles.bento} ${item.style === "surface" ? styles.surface : styles.imageTile} ${item.span === 2 ? styles.wide : ""}`}
              key={item.title}
            >
              {"image" in item && item.image && (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes={
                    item.span === 2
                      ? "(max-width: 1100px) 100vw, 50vw"
                      : "(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 25vw"
                  }
                  className={styles.background}
                />
              )}
              {i === 2 && <div className={styles.scrim} />}
              <div className={styles.inner}>
                {i === 1 && (
                  <span className={styles.icon}>
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
                      <path d="M4 5h16v10H4z M8 19h8 M12 15v4" />
                    </svg>
                  </span>
                )}
                {i === 5 && (
                  <span className={styles.icon}>
                    <DooGlyph size={20} />
                  </span>
                )}
                {i === 4 && (
                  <svg
                    aria-hidden="true"
                    width="92"
                    height="92"
                    viewBox="0 0 100 100"
                    className={styles.radar}
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="rgba(255,255,255,0.35)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      fill="none"
                      stroke="rgba(255,255,255,0.35)"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="14"
                      fill="none"
                      stroke="rgba(255,255,255,0.35)"
                    />
                    <path
                      d="M50 50L50 4A46 46 0 0 1 90 28Z"
                      fill="rgba(255,255,255,0.18)"
                    />
                    <circle cx="68" cy="30" r="3" fill="white" />
                    <circle cx="34" cy="62" r="3" fill="white" />
                    <circle cx="58" cy="74" r="3" fill="white" />
                  </svg>
                )}
                <h3
                  className={`${styles.title} ${i === 1 || i === 4 || i === 5 ? styles.push : ""}`}
                >
                  {item.title}
                </h3>
                <p
                  className={`${styles.description} ${i === 0 ? styles.landingCopy : ""} ${i === 5 ? styles.systemCopy : ""}`}
                >
                  {item.body}
                </p>
                {"chips" in item && item.chips && (
                  <div className={styles.chips}>
                    {item.chips.map((chip) => (
                      <span className={styles.chip} key={chip}>
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
                {"list" in item && item.list && (
                  <div className={styles.list}>
                    {item.list.map((line) => (
                      <span key={line}>→ {line}</span>
                    ))}
                  </div>
                )}
                {i === 3 && (
                  <div className={styles.bars} aria-hidden="true">
                    {swatches.map((color) => (
                      <i style={{ background: color }} key={color} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <StackMarquee
          label={services.stack.label}
          items={services.stack.items}
        />
      </div>
    </section>
  );
}
