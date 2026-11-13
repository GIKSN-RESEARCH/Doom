import Image from "next/image";
import { site } from "@/lib/content";
import { Arrow, SectionHead, StatusChip } from "./ui";
import styles from "./Work.module.css";

export function Work() {
  const { work } = site;
  return (
    <section id="work" className="section">
      <div className="container section-stack">
        <SectionHead
          label={work.label}
          headline={work.headline}
          muted={work.headlineMuted}
          intro={work.intro}
        />
        <div className={styles.grid}>
          {work.items.map((item) => (
            <a className={styles.card} href="#work" key={item.n}>
              <div className={styles.image}>
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(max-width: 960px) calc(100vw - 64px), (max-width: 1320px) calc((100vw - 84px) / 2), 618px"
                />
                <div className={`glass ${styles.panel}`}>
                  <div className={styles.panelHeader}>
                    <span>{item.name}</span>
                    <span>{work.panelTag}</span>
                  </div>
                  {item.rows.map(([label, status, tone]) => (
                    <div className={styles.row} key={label}>
                      <span>{label}</span>
                      <StatusChip tone={tone}>{status}</StatusChip>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.body}>
                <div className={styles.top}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.number}>{item.n}</span>
                </div>
                <span className={styles.line}>{item.line}</span>
                <span className={styles.tags}>
                  <span>{item.tags}</span>
                  <span className={styles.arrow}>
                    <Arrow size={18} />
                  </span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
