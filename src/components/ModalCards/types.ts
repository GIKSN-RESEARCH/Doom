export interface CardData {
  id: string | number;
  imageUrl: string;
  title: string;
  description: string;
  gradientColor?: string; // overrides the component-level default for this card only
}

export type AnimationSpeed = "slow" | "normal" | "fast" | "none";
export type AnimationVariant = "scale" | "fade" | "slide";

export interface ModalCardsProps {
  /** Array of card items to render */
  cards?: CardData[];
  /** Extra CSS classes for the grid container */
  className?: string;
  /** Fallback backdrop tint when a card has no gradientColor of its own (default: "#6366f1") */
  gradientColor?: string;
  /** Spring animation speed preset (default: "normal") */
  animationSpeed?: AnimationSpeed;
  /** Custom spring stiffness overriding the preset */
  springStiffness?: number;
  /** Custom spring damping overriding the preset */
  springDamping?: number;
  /** Animation style: "scale" for layoutId morphing, "fade" or "slide" for standard dialog transitions */
  animationVariant?: AnimationVariant;
  /** Whether clicking the backdrop closes the modal (default: true) */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes the modal (default: true) */
  closeOnEscape?: boolean;
  /** Whether to render the circular close button in the modal (default: true) */
  showCloseButton?: boolean;
  /** Accessible label applied to the modal dialog (default: "Card details modal") */
  ariaLabel?: string;
  /** CSS background position for the radial gradient center (default: "50% 10%") */
  backdropGradientPosition?: string;
  /** Extra CSS classes for the modal container */
  modalClassName?: string;
  /** Extra CSS classes for the backdrop layer */
  backdropClassName?: string;
}

export const SPEED_PRESETS: Record<
  AnimationSpeed,
  { stiffness: number; damping: number } | null
> = {
  slow: { stiffness: 160, damping: 22 },
  normal: { stiffness: 260, damping: 28 },
  fast: { stiffness: 420, damping: 32 },
  none: null,
};

export const defaultCards: CardData[] = [
  {
    id: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=600&fit=crop",
    title: "Mountain Vista",
    description:
      "Serene alpine peaks shrouded in morning mist, carving sharp silhouettes against a golden dawn sky.",
  },
  {
    id: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    title: "Ocean Waves",
    description:
      "Crystalline turquoise surf rolling over deep coastal reefs in perpetual kinetic rhythm.",
    gradientColor: "#14b8a6",
  },
  {
    id: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=800&h=600&fit=crop",
    title: "Forest Path",
    description:
      "Sunlight filtering through ancient emerald canopies onto moss-covered winding trails.",
    gradientColor: "#22c55e",
  },
];
