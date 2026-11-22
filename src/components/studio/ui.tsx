import Image from "next/image";
import type {
  CSSProperties,
  HTMLAttributeAnchorTarget,
  ReactNode,
} from "react";
import styles from "./ui.module.css";

export function Arrow({
  direction = "diagonal",
  size = 20,
}: {
  direction?: "diagonal" | "right";
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.icon}
    >
      <path
        d={
          direction === "diagonal"
            ? "M7 17L17 7M8 7h9v9"
            : "M5 12h14M13 6l6 6-6 6"
        }
      />
    </svg>
  );
}

export function DooGlyph({
  size = 26,
  tone = "orange",
  className = "",
}: {
  size?: number;
  tone?: "orange" | "white" | "ink";
  className?: string;
}) {
  return (
    <Image
      className={`${styles.glyph} ${className}`}
      src={`/brand-kit/01-logo/glyph/doom-glyph-${tone}.svg`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      unoptimized
    />
  );
}

export function Logo({
  className = "",
  width = 144,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <Image
      src="/brand/logo-horizontal.svg"
      alt="Doom Studio"
      width={width}
      height={Math.round((width * 84) / 506.63)}
      style={{ width, height: "auto", maxWidth: "100%" }}
      className={`${styles.logo} ${className}`}
      unoptimized
    />
  );
}

export function SplitButton({
  children,
  href,
  target,
  size = 48,
  tone = "white",
  className = "",
  onClick,
}: {
  children: ReactNode;
  href: string;
  target?: HTMLAttributeAnchorTarget;
  size?: number;
  tone?: "white" | "orange";
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      className={`${styles.split} ${styles[tone]} ${className}`}
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      style={{ "--sz": `${size}px` } as CSSProperties}
      onClick={onClick}
    >
      <span className={styles.label}>{children}</span>
      <span className={styles.square}>
        <Arrow />
      </span>
    </a>
  );
}

export function Label({
  children,
  centered = false,
}: {
  children: ReactNode;
  centered?: boolean;
}) {
  return (
    <span className={`${styles.eyebrow} ${centered ? styles.centered : ""}`}>
      {children}
    </span>
  );
}

export function StatusChip({
  children,
  tone = "nt",
  className = "",
}: {
  children: ReactNode;
  tone?: string;
  className?: string;
}) {
  return (
    <span
      className={`${styles.status} ${styles[tone === "ok" || tone === "wait" ? tone : "nt"]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SectionHead({
  label,
  headline,
  muted,
  intro,
}: {
  label: string;
  headline: string;
  muted: string;
  intro?: string;
}) {
  return (
    <div className="section-head">
      <div className="section-title">
        <Label>{label}</Label>
        <h2 className="section-heading">
          {headline} <span>{muted}</span>
        </h2>
      </div>
      {intro && <p className="section-intro">{intro}</p>}
    </div>
  );
}
