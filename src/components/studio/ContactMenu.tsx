"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, Mail, Send } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import type { ContactLinks } from "@/lib/content";
import { Arrow } from "./ui";
import styles from "./ContactMenu.module.css";

type ContactMenuProps = ContactLinks & {
  label?: string;
  className?: string;
  onAction?: () => void;
};

export function ContactMenu({
  bookingHref,
  emailHref,
  telegramHref,
  label = "Contact",
  className = "",
  onAction,
}: ContactMenuProps) {
  const [open, setOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const email = emailHref.replace(/^mailto:/, "").split("?")[0];
  const telegramHandle = `@${new URL(telegramHref).pathname.slice(1)}`;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      // A native modal dialog makes portals outside it inert and hides them.
      setPortalContainer(trigger.current?.closest("dialog") ?? null);
    }
    setOpen(nextOpen);
  }

  useEffect(() => {
    if (!open || !portalContainer) return;
    const close = () => setOpen(false);
    portalContainer.addEventListener("close", close);
    return () => portalContainer.removeEventListener("close", close);
  }, [open, portalContainer]);

  return (
    <DropdownMenu.Root modal={false} open={open} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger
        ref={trigger}
        className={`${styles.trigger} ${className}`}
      >
        <span>{label}</span>
        <ChevronDown className={styles.chevron} size={14} aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal container={portalContainer}>
        <DropdownMenu.Content
          className={styles.menu}
          aria-label="Contact Doom Studio"
          align="start"
          sideOffset={10}
          collisionPadding={16}
        >
          <DropdownMenu.Item asChild onSelect={onAction}>
            <a
              className={styles.item}
              href={bookingHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CalendarDays
                className={styles.contactIcon}
                size={20}
                aria-hidden="true"
              />
              <span className={styles.copy}>
                <span className={styles.label}>Book a call</span>
                <span className={styles.detail}>Choose a time on Cal.com</span>
              </span>
              <Arrow size={16} />
              <span className={styles.srOnly}>(opens in a new tab)</span>
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className={styles.separator} />
          <DropdownMenu.Item asChild onSelect={onAction}>
            <a className={styles.item} href={emailHref}>
              <Mail className={styles.contactIcon} size={20} aria-hidden="true" />
              <span className={styles.copy}>
                <span className={styles.label}>Email</span>
                <span className={styles.detail}>{email}</span>
              </span>
              <Arrow size={16} />
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className={styles.separator} />
          <DropdownMenu.Item asChild onSelect={onAction}>
            <a
              className={styles.item}
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Send className={styles.contactIcon} size={20} aria-hidden="true" />
              <span className={styles.copy}>
                <span className={styles.label}>Telegram</span>
                <span className={styles.detail}>{telegramHandle}</span>
              </span>
              <Arrow size={16} />
              <span className={styles.srOnly}>(opens in a new tab)</span>
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
