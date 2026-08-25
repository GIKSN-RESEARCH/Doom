"use client";

import React, { useEffect, useRef } from "react";
import { motion, type Transition } from "motion/react";
import { Plus } from "lucide-react";
import type { CardData, AnimationVariant } from "./types";

interface ModalProps {
  activeCard: CardData;
  onClose: () => void;
  gradientColorFallback?: string;
  backdropGradientPosition?: string;
  backdropClassName?: string;
  modalClassName?: string;
  animationVariant?: AnimationVariant;
  transition?: Transition;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
  ariaLabel?: string;
}

export function Modal({
  activeCard,
  onClose,
  gradientColorFallback = "#6366f1",
  backdropGradientPosition = "50% 10%",
  backdropClassName = "",
  modalClassName = "",
  animationVariant = "scale",
  transition,
  closeOnBackdropClick = true,
  showCloseButton = true,
  ariaLabel = "Card details modal",
}: ModalProps) {
  const isScale = animationVariant === "scale";
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const tint = activeCard.gradientColor ?? gradientColorFallback;

  // Auto-focus the close button or modal container for accessibility
  useEffect(() => {
    if (showCloseButton && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [showCloseButton]);

  const modalVariants = {
    fade: {
      initial: { opacity: 0, scale: 0.96 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.96 },
    },
    slide: {
      initial: { opacity: 0, y: 28 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 28 },
    },
  };

  return (
    <>
      {/* Themed Radial Backdrop */}
      <motion.div
        key={`backdrop-${activeCard.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
        onClick={closeOnBackdropClick ? onClose : undefined}
        className={`fixed inset-0 z-40 backdrop-blur-sm ${backdropClassName}`}
        style={{
          background: `radial-gradient(circle at ${backdropGradientPosition}, color-mix(in srgb, ${tint} 28%, transparent) 0%, transparent 65%), rgba(0, 0, 0, 0.86)`,
        }}
        aria-hidden="true"
      />

      {/* Floating Centered Modal */}
      <motion.div
        key={`modal-${activeCard.id}`}
        layoutId={isScale ? `card-${activeCard.id}` : undefined}
        variants={!isScale && animationVariant ? modalVariants[animationVariant] : undefined}
        initial={!isScale && animationVariant ? "initial" : undefined}
        animate={!isScale && animationVariant ? "animate" : undefined}
        exit={!isScale && animationVariant ? "exit" : undefined}
        transition={transition}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={`fixed left-1/2 top-1/2 z-50 w-[min(92vw,48rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/15 bg-neutral-900 shadow-2xl ${modalClassName}`}
      >
        {/* Top Panoramic Image */}
        <div className="relative aspect-[16/9] sm:aspect-[2/1] w-full overflow-hidden bg-neutral-950">
          <motion.img
            layoutId={isScale ? `card-${activeCard.id}-image` : undefined}
            transition={transition}
            src={activeCard.imageUrl}
            alt={activeCard.title}
            className="h-full w-full object-cover"
          />

          {/* Scrim Overlay & Title */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 sm:p-6">
            <motion.h3
              layoutId={isScale ? `card-${activeCard.id}-title` : undefined}
              transition={transition}
              className="font-heading text-xl font-bold tracking-tight text-white sm:text-2xl"
            >
              {activeCard.title}
            </motion.h3>
          </div>

          {/* Close Button (Explicit 0 -> 135deg spin converting + into ×) */}
          {showCloseButton && (
            <motion.button
              ref={closeButtonRef}
              layoutId={isScale ? `card-${activeCard.id}-button` : undefined}
              transition={transition}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              aria-label="Close modal dialog"
              className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <motion.span
                initial={{ rotate: 0 }}
                animate={{ rotate: 135 }}
                exit={{ rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 280,
                  damping: 20,
                  delay: isScale ? 0.08 : 0,
                }}
                className="flex items-center justify-center"
              >
                <Plus size={16} strokeWidth={2.5} />
              </motion.span>
            </motion.button>
          )}
        </div>

        {/* Bottom Content / Description Panel */}
        <div className="border-t border-white/10 bg-neutral-900 p-5 sm:p-6">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              delay: isScale ? 0.16 : 0.05,
              duration: 0.28,
              ease: "easeOut",
            }}
            className="text-sm leading-relaxed text-neutral-300 sm:text-base"
          >
            {activeCard.description}
          </motion.p>
        </div>
      </motion.div>
    </>
  );
}
