"use client";

import React, { useEffect, useRef } from "react";
import { motion, type Transition } from "motion/react";
import { Plus, ArrowUpRight } from "lucide-react";
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
  const [isLinkHovered, setIsLinkHovered] = React.useState(false);

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

      {/* Floating Brand Logo in Far Top-Left Empty Space */}
      {activeCard.logoUrl && (
        <motion.div
          initial={{
            x: "calc(50vw - clamp(1.5rem, 5vw, 4.5rem) - 50%)",
            y: "calc(50vh - clamp(2rem, 5.5vh, 4.5rem) - 50%)",
            scale: 0.2,
            opacity: 0,
            filter: "blur(12px)",
          }}
          animate={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
          }}
          exit={{
            x: "calc(50vw - clamp(1.5rem, 5vw, 4.5rem) - 50%)",
            y: "calc(50vh - clamp(2rem, 5.5vh, 4.5rem) - 50%)",
            scale: 0.2,
            opacity: 0,
            filter: "blur(8px)",
            transition: { duration: 0.22, ease: "easeInOut" },
          }}
          transition={{
            delay: isScale ? 0.32 : 0.05,
            type: "spring",
            stiffness: 180,
            damping: 20,
            mass: 0.85,
          }}
          className="pointer-events-auto fixed top-[clamp(2rem,5.5vh,4.5rem)] left-[clamp(1.5rem,5vw,4.5rem)] z-50 flex items-center justify-center rounded-2xl sm:rounded-3xl border bg-black/70 p-3 sm:p-4 shadow-2xl backdrop-blur-2xl"
          style={{
            borderColor: `color-mix(in srgb, ${tint} 45%, rgba(255, 255, 255, 0.2))`,
            boxShadow: `0 25px 60px rgba(0, 0, 0, 0.9), 0 0 45px color-mix(in srgb, ${tint} 35%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.25)`,
          }}
        >
          <div
            className="relative flex h-14 w-14 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl p-2.5 sm:p-3"
            style={{
              backgroundColor: activeCard.logoBg || "rgba(255, 255, 255, 0.06)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeCard.logoUrl}
              alt=""
              className="h-full w-full object-contain"
            />
          </div>
        </motion.div>
      )}

      {/* Floating Platform Link in Far Bottom-Right Empty Space (Hover: White Background + Background Accent Color Font) */}
      {activeCard.linkUrl && (
        <motion.a
          href={activeCard.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setIsLinkHovered(true)}
          onMouseLeave={() => setIsLinkHovered(false)}
          onFocus={() => setIsLinkHovered(true)}
          onBlur={() => setIsLinkHovered(false)}
          initial={{
            x: "calc(-50vw + clamp(1.5rem, 5vw, 4.5rem) + 50%)",
            y: "calc(-50vh + clamp(2rem, 5.5vh, 4.5rem) + 50%)",
            scale: 0.2,
            opacity: 0,
            filter: "blur(12px)",
          }}
          animate={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
          }}
          exit={{
            x: "calc(-50vw + clamp(1.5rem, 5vw, 4.5rem) + 50%)",
            y: "calc(-50vh + clamp(2rem, 5.5vh, 4.5rem) + 50%)",
            scale: 0.2,
            opacity: 0,
            filter: "blur(8px)",
            transition: { duration: 0.22, ease: "easeInOut" },
          }}
          transition={{
            delay: isScale ? 0.32 : 0.05,
            type: "spring",
            stiffness: 180,
            damping: 20,
            mass: 0.85,
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          aria-label={`Visit ${activeCard.linkUrl}`}
          className="group pointer-events-auto fixed bottom-[clamp(2rem,5.5vh,4.5rem)] right-[clamp(1.5rem,5vw,4.5rem)] z-50 flex items-center justify-center rounded-2xl sm:rounded-3xl border px-5 py-3 sm:px-6 sm:py-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{
            backgroundColor: isLinkHovered ? "#ffffff" : "rgba(0, 0, 0, 0.75)",
            borderColor: isLinkHovered
              ? "#ffffff"
              : `color-mix(in srgb, ${tint} 45%, rgba(255, 255, 255, 0.2))`,
            boxShadow: isLinkHovered
              ? `0 25px 60px rgba(0, 0, 0, 0.9), 0 0 50px ${tint}`
              : `0 25px 60px rgba(0, 0, 0, 0.9), 0 0 45px color-mix(in srgb, ${tint} 35%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.25)`,
          }}
        >
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <span
              className="font-heading text-base sm:text-lg md:text-xl font-bold tracking-tight transition-colors duration-300"
              style={{
                color: isLinkHovered ? tint : "#ffffff",
              }}
            >
              {activeCard.linkUrl}
            </span>
            <ArrowUpRight
              className="size-5 sm:size-6 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              style={{
                color: isLinkHovered ? tint : "rgba(255, 255, 255, 0.8)",
              }}
              strokeWidth={2.5}
            />
          </div>
        </motion.a>
      )}

      {/* Floating Centered Modal Card (Consistently maintains maroon #4B1426 background) */}
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
        className={`fixed left-1/2 top-1/2 z-50 w-[min(92vw,48rem)] -translate-x-1/2 -translate-y-1/2 flex flex-col overflow-hidden rounded-3xl border border-[#4B1426] bg-[#4B1426] p-3 sm:p-4 shadow-2xl ${modalClassName}`}
        style={{
          backgroundColor: "#4B1426",
          borderColor: "#4B1426",
          boxShadow: `0 25px 70px rgba(0, 0, 0, 0.9), 0 0 45px rgba(75, 20, 38, 0.45)`,
        }}
      >
        {/* Panoramic Image Frame with maroon border */}
        <div className="relative aspect-[16/9] sm:aspect-[2/1] w-full overflow-hidden rounded-2xl border border-[#4B1426] bg-neutral-950">
          <motion.img
            layoutId={isScale ? `card-${activeCard.id}-image` : undefined}
            transition={transition}
            src={activeCard.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />

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
              className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-none bg-black/60 text-white backdrop-blur-md hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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

        {/* Bottom Product Explanation */}
        {activeCard.description && (
          <div className="pt-4 sm:pt-5 pb-1 sm:pb-2 px-2 sm:px-3 text-left">
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                delay: isScale ? 0.16 : 0.05,
                duration: 0.28,
                ease: "easeOut",
              }}
              className="font-heading text-base sm:text-lg md:text-xl font-medium leading-relaxed text-[#fff2f2]"
            >
              {activeCard.description}
            </motion.p>
          </div>
        )}
      </motion.div>
    </>
  );
}
