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
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 24,
        mass: 0.5,
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-label={`View details for ${card.id}`}
      style={{ backgroundColor: "#4B1426" }}
      className="group relative flex flex-col w-full cursor-pointer overflow-hidden rounded-3xl border border-[#4B1426] bg-[#4B1426] p-3 sm:p-4 shadow-xl transition-colors duration-200 hover:bg-[#330d19] hover:border-[#6E2740] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
    >
      {/* Screenshot Image Frame with maroon border */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#4B1426] bg-neutral-950">
        <motion.img
          layoutId={isScale ? `card-${card.id}-image` : undefined}
          transition={transition}
          src={card.imageUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-105"
        />

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
      </div>

      {/* Bottom Product Explanation */}
      {card.description && (
        <div className="pt-3.5 sm:pt-4 px-1 sm:px-2 text-left">
          <p className="font-heading text-sm sm:text-base font-medium leading-relaxed text-[#fff2f2]">
            {card.description}
          </p>
        </div>
      )}
    </motion.div>
  );
}
