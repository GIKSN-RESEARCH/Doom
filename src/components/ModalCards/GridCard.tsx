"use client";

import React, { useRef } from "react";
import { motion, type Transition } from "motion/react";
import { Plus } from "lucide-react";
import type { CardData, AnimationVariant } from "./types";

interface GridCardProps {
  card: CardData;
  onOpen: (card: CardData, triggerEl: HTMLElement | null) => void;
  animationVariant?: AnimationVariant;
  transition?: Transition;
}

export function GridCard({
  card,
  onOpen,
  animationVariant = "scale",
  transition,
}: GridCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isScale = animationVariant === "scale";

  const handleClick = () => {
    onOpen(card, cardRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(card, cardRef.current);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      layoutId={isScale ? `card-${card.id}` : undefined}
      transition={transition}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-label={`View details for ${card.title}`}
      className="group relative aspect-[4/3] sm:aspect-[16/11] w-full cursor-pointer overflow-hidden rounded-2xl bg-neutral-900 shadow-lg transition-shadow duration-300 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
    >
      {/* Background Image */}
      <motion.img
        layoutId={isScale ? `card-${card.id}-image` : undefined}
        transition={transition}
        src={card.imageUrl}
        alt={card.title}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
      />

      {/* Scrim Overlay & Title */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 sm:p-5">
        <motion.h3
          layoutId={isScale ? `card-${card.id}-title` : undefined}
          transition={transition}
          className="font-heading text-lg font-bold tracking-tight text-white sm:text-xl"
        >
          {card.title}
        </motion.h3>
      </div>

      {/* Action / Expand Button */}
      <motion.button
        layoutId={isScale ? `card-${card.id}-button` : undefined}
        transition={transition}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        onClick={(e) => {
          e.stopPropagation();
          onOpen(card, cardRef.current);
        }}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80"
      >
        <motion.span
          initial={{ rotate: 45 }}
          animate={{ rotate: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="flex items-center justify-center"
        >
          <Plus size={16} strokeWidth={2.5} />
        </motion.span>
      </motion.button>
    </motion.div>
  );
}
