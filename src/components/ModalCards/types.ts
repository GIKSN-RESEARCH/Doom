export interface CardData {
  id: string | number;
  imageUrl: string;
  logoUrl?: string;
  logoBg?: string;
  linkUrl?: string;
  title?: string;
  description?: string;
  gradientColor?: string; // overrides the component-level default for this card only
  subtitle?: string;
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
    id: "giksn",
    imageUrl: "/work/giksn/screenshot.png",
    logoUrl: "/work/giksn/logo.jpg",
    linkUrl: "https://giksn.com",
    description:
      "GIKSN Research is an independent research lab exploring what comes next in intelligence, computing and systems.",
    gradientColor: "#9333ea",
  },
  {
    id: "rinne",
    imageUrl: "/work/rinne/screenshot.png",
    logoUrl: "/work/rinne/logo.png",
    logoBg: "#ffffff",
    linkUrl: "https://rinne.giksn.com",
    description:
      "A CLI harness you talk to directly. Plans a graph, runs the AI tools and model APIs already on your machine and verifies until the goal is met.",
    gradientColor: "#06b6d4",
  },
];
