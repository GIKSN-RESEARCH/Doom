"use client";

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { AnimatePresence, type Transition } from "motion/react";
import type { CardData, ModalCardsProps } from "./types";
import { defaultCards, SPEED_PRESETS } from "./types";
import { GridCard } from "./GridCard";
import { Modal } from "./Modal";

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function ModalCards({
  cards = defaultCards,
  className = "",
  gradientColor = "#6366f1",
  animationSpeed = "normal",
  springStiffness,
  springDamping,
  animationVariant = "scale",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  ariaLabel = "Card details modal",
  backdropGradientPosition = "50% 10%",
  modalClassName = "",
  backdropClassName = "",
}: ModalCardsProps) {
  const [activeCard, setActiveCard] = useState<CardData | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Check prefers-reduced-motion via external store subscriber
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // Compute spring transition
  const spring = SPEED_PRESETS[animationSpeed] ?? SPEED_PRESETS.normal;
  const isNone = animationSpeed === "none" || prefersReducedMotion;
  const transition: Transition =
    spring && !isNone
      ? {
          type: "spring",
          stiffness: springStiffness ?? spring.stiffness,
          damping: springDamping ?? spring.damping,
        }
      : { duration: 0 };

  const handleOpen = useCallback(
    (card: CardData, triggerEl: HTMLElement | null) => {
      triggerRef.current = triggerEl;
      setActiveCard(card);
    },
    []
  );

  const handleClose = useCallback(() => {
    setActiveCard(null);
    // Return focus to triggering card button
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  // Scroll lock & Escape key handling
  useEffect(() => {
    if (!activeCard) return;

    // Lock body scroll and compensate scrollbar width to prevent layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCard, closeOnEscape, handleClose]);

  return (
    <>
      {/* Responsive Grid of Cards */}
      <div
        className={
          className
            ? className
            : cards.length === 2
            ? "grid w-full grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:gap-12 max-w-6xl mx-auto"
            : "grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-10 lg:gap-12"
        }
      >
        {cards.map((card) => (
          <GridCard
            key={card.id}
            card={card}
            onOpen={handleOpen}
            animationVariant={animationVariant}
            transition={transition}
          />
        ))}
      </div>

      {/* Expanded Modal Dialog */}
      <AnimatePresence>
        {activeCard && (
          <Modal
            key={`modal-container-${activeCard.id}`}
            activeCard={activeCard}
            onClose={handleClose}
            gradientColorFallback={gradientColor}
            backdropGradientPosition={backdropGradientPosition}
            backdropClassName={backdropClassName}
            modalClassName={modalClassName}
            animationVariant={animationVariant}
            transition={transition}
            closeOnBackdropClick={closeOnBackdropClick}
            showCloseButton={showCloseButton}
            ariaLabel={ariaLabel}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default ModalCards;
