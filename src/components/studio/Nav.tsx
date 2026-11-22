"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { NavItem } from "@/lib/content";
import { Arrow, Logo, SplitButton } from "./ui";
import styles from "./Nav.module.css";

type MenuState = "closed" | "opening" | "open" | "closing";

export function Nav({
  items,
  cta,
  bookingHref,
  innerPage = false,
}: {
  items: NavItem[];
  cta: string;
  bookingHref: string;
  innerPage?: boolean;
}) {
  const [active, setActive] = useState(items[0]?.href);
  const [menuState, setMenuState] = useState<MenuState>("closed");
  const dialog = useRef<HTMLDialogElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openFrame = useRef(0);
  const opener = useRef<HTMLButtonElement>(null);
  const hrefFor = (href: string) =>
    innerPage && href.startsWith("#") ? `/${href}` : href;

  const finishClose = useCallback(() => {
    cancelAnimationFrame(openFrame.current);
    dialog.current?.close();
    setMenuState("closed");
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);

  const closeMenu = useCallback(() => {
    if (!dialog.current?.open) return;
    cancelAnimationFrame(openFrame.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuState("closing");
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    closeTimer.current = setTimeout(finishClose, reduced ? 0 : 520);
  }, [finishClose]);

  function openMenu() {
    cancelAnimationFrame(openFrame.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    dialog.current?.showModal();
    setMenuState("opening");
    openFrame.current = requestAnimationFrame(() => {
      openFrame.current = requestAnimationFrame(() => setMenuState("open"));
    });
  }

  useEffect(() => {
    if (innerPage) return;
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const navigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    let resetFrame = 0;
    if (navigation?.type === "reload") {
      if (window.location.hash) {
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${window.location.search}`,
        );
      }
      // Keep the previous site's refresh-to-hero behavior without a scroll engine.
      const reset = () =>
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      reset();
      resetFrame = requestAnimationFrame(reset);
    }
    return () => {
      cancelAnimationFrame(resetFrame);
      window.history.scrollRestoration = previous;
    };
  }, [innerPage]);

  useEffect(() => {
    if (innerPage) return;
    const sections = items
      .map(({ href }) => document.querySelector(href))
      .filter((section): section is Element => Boolean(section));
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting)
            visible.set(`#${entry.target.id}`, entry.boundingClientRect.top);
          else visible.delete(`#${entry.target.id}`);
        }
        const nearest = [...visible.entries()].sort(
          (a, b) => Math.abs(a[1]) - Math.abs(b[1]),
        )[0];
        if (nearest) setActive(nearest[0]);
        else if (window.scrollY < 300) setActive(items[0]?.href);
      },
      { rootMargin: "-10% 0px -40% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items, innerPage]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 961px)");
    const handleResize = () => {
      if (desktop.matches) finishClose();
    };
    desktop.addEventListener("change", handleResize);
    return () => {
      desktop.removeEventListener("change", handleResize);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      cancelAnimationFrame(openFrame.current);
    };
  }, [finishClose]);

  return (
    <header className={`${styles.nav} ${innerPage ? styles.brandNav : ""}`}>
      <div className={`container ${styles.inner}`}>
        <a
          className={styles.logo}
          href={innerPage ? "/" : "#top"}
          aria-label="Doom Studio home"
        >
          <Logo width={innerPage ? 260 : 144} />
        </a>
        <div className={styles.desktop}>
          {innerPage ? (
            <Link className={styles.back} href="/">
              Back to studio <Arrow size={16} />
            </Link>
          ) : (
            <>
              <nav
                className={styles.segments}
                aria-label="Primary"
              >
                {items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={active === item.href ? styles.active : undefined}
                    aria-current={active === item.href ? "location" : undefined}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
              <SplitButton href={bookingHref} target="_blank">
                {cta}
              </SplitButton>
            </>
          )}
        </div>
        <button
          ref={opener}
          className={styles.toggle}
          type="button"
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
          aria-expanded={menuState !== "closed" && menuState !== "closing"}
          aria-controls="mobile-navigation"
          onClick={openMenu}
        >
          <span />
          <span />
        </button>
      </div>
      <dialog
        id="mobile-navigation"
        ref={dialog}
        className={styles.dialog}
        data-state={menuState}
        aria-label="Navigation menu"
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const focusable = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), [tabindex="0"]',
            ),
          ).filter((element) => element.getClientRects().length > 0);
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeMenu();
        }}
        onClose={() => {
          setMenuState("closed");
          opener.current?.focus({ preventScroll: true });
        }}
      >
        <div className={styles.menuShell}>
          <div className={styles.menuHeader}>
            <a
              className={styles.menuLogo}
              href={innerPage ? "/" : "#top"}
              onClick={closeMenu}
            >
              <Logo />
            </a>
            <button
              className={styles.close}
              type="button"
              aria-label="Close navigation menu"
              onClick={closeMenu}
              autoFocus
            >
              <span />
              <span />
            </button>
          </div>
          <nav aria-label="Mobile primary" className={styles.mobileLinks}>
            {items.map((item, i) => (
              <a
                key={item.href}
                href={hrefFor(item.href)}
                onClick={closeMenu}
                style={{ "--i": i } as CSSProperties}
              >
                <span>{item.label}</span>
                <Arrow size={24} />
              </a>
            ))}
          </nav>
          <div className={styles.menuBottom}>
            <a
              className={styles.brandLink}
              href="/brand-kit"
              onClick={closeMenu}
            >
              Brand and media kit <Arrow size={16} />
            </a>
            <SplitButton
              className={styles.mobileCta}
              href={hrefFor(bookingHref)}
              target="_blank"
              onClick={closeMenu}
            >
              {cta}
            </SplitButton>
            <span className={styles.menuTagline}>
              Design and engineering for AI startups
            </span>
          </div>
        </div>
      </dialog>
    </header>
  );
}
