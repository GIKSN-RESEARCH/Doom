"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ProcessStep } from "@/lib/content";
import { Arrow, DooGlyph, StatusChip } from "./ui";
import styles from "./Process.module.css";

export function ProcessTabs({
  steps,
  defaultStep,
  logTitle,
  logTag,
}: {
  steps: ProcessStep[];
  defaultStep: number;
  logTitle: string;
  logTag: string;
}) {
  const [selected, setSelected] = useState(defaultStep);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const step = steps[selected];
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
            aria-controls="process-log"
            aria-selected={selected === i}
            tabIndex={selected === i ? 0 : -1}
            ref={(element) => {
              tabs.current[i] = element;
            }}
            onClick={() => setSelected(i)}
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
              setSelected(next);
              tabs.current[next]?.focus();
            }}
          >
            <span className={styles.number}>{item.num}</span>
            <span className={styles.text}>
              <span className={styles.title}>{item.title}</span>
              <span className={styles.description}>{item.desc}</span>
            </span>
            <span className={styles.arrow}>
              <Arrow direction="right" />
            </span>
          </button>
        ))}
      </div>
      <div className={styles.panel}>
        <Image
          src="/images/gradient-process.jpg"
          alt=""
          fill
          sizes="(max-width: 960px) 100vw, 50vw"
        />
        <div className={styles.card}>
          <div className={styles.tile}>
            <DooGlyph size={48} />
          </div>
          <div
            className={styles.log}
            id="process-log"
            role="tabpanel"
            aria-labelledby={`process-tab-${selected}`}
            aria-live="polite"
            tabIndex={0}
          >
            <div className={styles.header}>
              <span>
                <i />
                {logTitle} ·{" "}
                <span className={styles.stepName}>{step.name}</span>
              </span>
              <span className={styles.example}>{logTag}</span>
            </div>
            <div className={styles.events}>
              {step.events.map(([time, event, status, tone], i) => (
                <div className={styles.event} key={`${selected}-${i}`}>
                  <span className={styles.time}>{time}</span>
                  <span className={styles.eventText}>{event}</span>
                  <StatusChip tone={tone}>{status}</StatusChip>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
