"use client";

import { useRef, useState, type CSSProperties } from "react";
import type { ProcessStep } from "@/lib/content";
import { Arrow, DooGlyph } from "./ui";
import styles from "./Process.module.css";

export function ProcessTabs({
  steps,
  defaultStep,
  detailLabel,
  outcomeLabel,
}: {
  steps: ProcessStep[];
  defaultStep: number;
  detailLabel: string;
  outcomeLabel: string;
}) {
  const [active, setActive] = useState({
    index: defaultStep,
    rotation: -defaultStep * 90,
  });
  const selected = active.index;
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function selectStep(index: number) {
    setActive((current) => {
      let distance = index - current.index;

      // Follow the shortest path around the four faces, including the wrap.
      if (distance > steps.length / 2) distance -= steps.length;
      if (distance < -steps.length / 2) distance += steps.length;

      return {
        index,
        rotation: current.rotation - distance * 90,
      };
    });
  }

  return (
    <div className={styles.grid}>
      <div
        role="tablist"
        aria-label="Process steps"
        aria-orientation="vertical"
        className={styles.tabs}
      >
        {steps.map((item, i) => (
          <button
            type="button"
            role="tab"
            className={`${styles.row} ${selected === i ? styles.selected : ""}`}
            key={item.num}
            id={`process-tab-${i}`}
            aria-label={`${item.num} ${item.title}`}
            aria-describedby={selected === i ? `process-desc-${i}` : undefined}
            aria-controls={`process-detail-${i}`}
            aria-selected={selected === i}
            tabIndex={selected === i ? 0 : -1}
            ref={(element) => {
              tabs.current[i] = element;
            }}
            onClick={() => selectStep(i)}
            onKeyDown={(event) => {
              const direction =
                event.key === "ArrowDown" || event.key === "ArrowRight"
                  ? 1
                  : event.key === "ArrowUp" || event.key === "ArrowLeft"
                    ? -1
                    : 0;
              if (!direction && event.key !== "Home" && event.key !== "End")
                return;
              event.preventDefault();
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? steps.length - 1
                    : (i + direction + steps.length) % steps.length;
              selectStep(next);
              tabs.current[next]?.focus({ preventScroll: true });
            }}
          >
            <span className={styles.number}>{item.num}</span>
            <span className={styles.text}>
              <span className={styles.title}>{item.title}</span>
              <span
                className={styles.descriptionWrap}
                aria-hidden={selected !== i}
              >
                <span id={`process-desc-${i}`} className={styles.description}>
                  {item.desc}
                </span>
              </span>
            </span>
            <span className={styles.arrow}>
              <Arrow direction="right" />
            </span>
          </button>
        ))}
      </div>
      <div className={styles.scene}>
        <div
          className={styles.cube}
          style={{ "--cube-rotation": `${active.rotation}deg` } as CSSProperties}
        >
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={styles.panel}
              id={`process-detail-${i}`}
              role="tabpanel"
              aria-labelledby={`process-tab-${i}`}
              aria-hidden={selected !== i}
              inert={selected !== i}
              tabIndex={selected === i ? 0 : -1}
              style={{ "--face-rotation": `${i * 90}deg` } as CSSProperties}
            >
              <div className={styles.panelHeader}>
                <span>{detailLabel}</span>
                <DooGlyph size={28} />
              </div>
              <div className={styles.panelBody}>
                <h3 className={styles.detailTitle}>{step.detailTitle}</h3>
                <ul className={styles.details}>
                  {step.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.outcome}>
                <span>{outcomeLabel}</span>
                <p>{step.outcome}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
