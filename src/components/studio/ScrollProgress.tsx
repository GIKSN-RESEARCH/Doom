"use client";

import { useEffect, useRef } from "react";
import styles from "./ScrollProgress.module.css";

export function ScrollProgress() {
  const indicator = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = indicator.current;
    if (!element) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const scrollable = root.scrollHeight - root.clientHeight;
      const progress =
        scrollable > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollable))
          : 0;
      element.style.setProperty("--scroll-progress", String(progress));
    };
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={indicator}
      className={styles.progress}
      data-scroll-progress=""
      aria-hidden="true"
    >
      <div className={styles.fill} />
    </div>
  );
}
