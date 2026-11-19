"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./StackMarquee.module.css";

export function StackMarquee({
  label,
  items,
}: {
  label: string;
  items: { name: string; icon: string }[];
}) {
  const [paused, setPaused] = useState(false);

  return (
    <div className={styles.stack} data-paused={paused}>
      <div className={styles.header}>
        <h3 id="stack-heading" className={styles.label}>
          {label}
        </h3>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setPaused((current) => !current)}
          aria-label={paused ? "Resume stack animation" : "Pause stack animation"}
          aria-controls="stack-marquee"
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={paused ? "M7 4l13 8-13 8V4Z" : "M8 5v14M16 5v14"} />
          </svg>
        </button>
      </div>
      <div className={styles.viewport}>
        <div className={styles.track} id="stack-marquee">
          {[false, true].map((duplicate) => (
            <ul
              className={styles.group}
              key={String(duplicate)}
              aria-labelledby={duplicate ? undefined : "stack-heading"}
              aria-hidden={duplicate || undefined}
            >
              {items.map((item) => (
                <li className={styles.item} key={item.name}>
                  <Image
                    className={styles.logo}
                    src={item.icon}
                    alt=""
                    width={28}
                    height={28}
                    unoptimized
                  />
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
}
