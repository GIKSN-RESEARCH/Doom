"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";
import {
  FileText,
  Compass,
  Sliders,
  Layout,
  Sparkles,
  Code2,
  CheckCircle2,
  Play,
  Terminal,
  Database,
  Cpu,
  Layers,
  ShieldCheck,
  Rocket,
  Palette,
  Server,
  Laptop,
  Radio,
  PackageCheck,
  Gauge,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ScanGridButton from "@/components/originkit/ui/scan-grid-button";
import "./ApproachFlow.css";

type TrackType = "design" | "engineering" | "suite";
type EdgeKind = "flow" | "stack" | "feedback" | "rail";

interface FlowNodeData {
  id: string;
  number: string;
  title: string;
  headerColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  mode: "human" | "ai" | "gate" | "evidence" | "shared" | "platform";
  modeLabel: string;
  tags: string[];
}

interface ColumnData {
  label: string;
  nodes: FlowNodeData[];
}

interface EdgeData {
  from: string;
  to: string;
  kind?: EdgeKind;
}

interface TrackData {
  id: TrackType;
  label: string;
  description: string;
  principle: string;
  feedbackLabel: string;
  columns: ColumnData[];
  edges: EdgeData[];
}

interface WirePath {
  d: string;
  kind: EdgeKind;
}

interface OrganicLayoutConfig {
  width: number;
  height: number;
  nodes: Record<string, { x: number; y: number }>;
}

const COLORS = {
  lime: "#EBFFA5",
  blue: "#BDD4FF",
  lilac: "#E0D4FC",
  mint: "#B5F6D5",
  amber: "#FFE5A3",
  salmon: "#FFD4D4",
  green: "#A1F4C5",
};

const TRACKS: Record<TrackType, TrackData> = {
  design: {
    id: "design",
    label: "Design",
    description:
      "A human-led discovery loop. AI expands the option space; user evidence earns the build handoff.",
    principle:
      "Humans set intent and taste. AI multiplies evidence and options. Real users close the gate.",
    feedbackLabel: "User signal → rework",
    columns: [
      {
        label: "Intent",
        nodes: [
          {
            id: "des-brief",
            number: "01",
            title: "Outcome Brief",
            headerColor: COLORS.lime,
            icon: FileText,
            description: "User job, success signal, risk boundary.",
            mode: "human",
            modeLabel: "Human lead",
            tags: ["Brief", "Metric"],
          },
        ],
      },
      {
        label: "Evidence",
        nodes: [
          {
            id: "des-field",
            number: "02",
            title: "User Evidence",
            headerColor: COLORS.blue,
            icon: Compass,
            description: "Interviews, workflow context, real constraints.",
            mode: "human",
            modeLabel: "Human lead",
            tags: ["Research", "Users"],
          },
          {
            id: "des-signals",
            number: "03",
            title: "Product Signals",
            headerColor: COLORS.mint,
            icon: Gauge,
            description: "Analytics, support themes, market behavior.",
            mode: "evidence",
            modeLabel: "Live evidence",
            tags: ["Data", "Baseline"],
          },
        ],
      },
      {
        label: "AI studio",
        nodes: [
          {
            id: "des-map",
            number: "04",
            title: "Signal Map",
            headerColor: COLORS.lilac,
            icon: Cpu,
            description: "Cluster signals. Expose gaps and conflicts.",
            mode: "ai",
            modeLabel: "AI scale",
            tags: ["Traceable", "Synthesis"],
          },
          {
            id: "des-swarm",
            number: "05",
            title: "Concept Swarm",
            headerColor: COLORS.amber,
            icon: Sparkles,
            description: "Generate flows, states, and viable directions.",
            mode: "ai",
            modeLabel: "AI scale",
            tags: ["Variants", "Edge states"],
          },
        ],
      },
      {
        label: "Human gate",
        nodes: [
          {
            id: "des-critique",
            number: "06",
            title: "Human Critique",
            headerColor: COLORS.salmon,
            icon: Sliders,
            description: "Select on clarity, taste, and feasibility.",
            mode: "gate",
            modeLabel: "Human gate",
            tags: ["Critique", "Kill weak"],
          },
          {
            id: "des-prototype",
            number: "07",
            title: "System Build",
            headerColor: COLORS.mint,
            icon: Layout,
            description: "Real content, tokens, responsive behavior.",
            mode: "shared",
            modeLabel: "Human + AI",
            tags: ["Figma", "Coded spike"],
          },
        ],
      },
      {
        label: "Design proof",
        nodes: [
          {
            id: "des-proof",
            number: "08",
            title: "User Proof",
            headerColor: COLORS.blue,
            icon: CheckCircle2,
            description: "Task success, comprehension, accessibility.",
            mode: "evidence",
            modeLabel: "Evidence gate",
            tags: ["Usability", "A11y"],
          },
          {
            id: "des-contract",
            number: "09",
            title: "Build Contract",
            headerColor: COLORS.green,
            icon: Code2,
            description: "Acceptance criteria and design-QA baseline.",
            mode: "gate",
            modeLabel: "Human sign-off",
            tags: ["Specs", "Ready"],
          },
        ],
      },
    ],
    edges: [
      { from: "des-brief", to: "des-field" },
      { from: "des-brief", to: "des-signals" },
      { from: "des-field", to: "des-map" },
      { from: "des-signals", to: "des-map" },
      { from: "des-map", to: "des-swarm", kind: "stack" },
      { from: "des-swarm", to: "des-critique" },
      { from: "des-critique", to: "des-prototype", kind: "stack" },
      { from: "des-prototype", to: "des-proof" },
      { from: "des-proof", to: "des-contract", kind: "stack" },
    ],
  },

  engineering: {
    id: "engineering",
    label: "Engineering",
    description:
      "Agents work on bounded branches. Human review, independent CI, and progressive delivery control production risk.",
    principle:
      "AI creates draft work. Tests create evidence. Humans own architecture, approval, and incidents.",
    feedbackLabel: "Production signal → next spec",
    columns: [
      {
        label: "Contract",
        nodes: [
          {
            id: "eng-spec",
            number: "01",
            title: "Release Spec",
            headerColor: COLORS.lime,
            icon: Terminal,
            description: "Contract, SLO, constraints, rollout risk.",
            mode: "human",
            modeLabel: "Human lead",
            tags: ["ADR", "Done means"],
          },
        ],
      },
      {
        label: "System plan",
        nodes: [
          {
            id: "eng-architecture",
            number: "02",
            title: "System Plan",
            headerColor: COLORS.blue,
            icon: Layers,
            description: "Boundaries, failure modes, data, threat model.",
            mode: "human",
            modeLabel: "Human lead",
            tags: ["Interfaces", "Threats"],
          },
        ],
      },
      {
        label: "Parallel agents",
        nodes: [
          {
            id: "eng-build",
            number: "03",
            title: "Build Agent",
            headerColor: COLORS.lilac,
            icon: Code2,
            description: "Scoped branch from repository instructions.",
            mode: "ai",
            modeLabel: "AI worker",
            tags: ["Small diff", "Logged"],
          },
          {
            id: "eng-tests",
            number: "04",
            title: "Test Agent",
            headerColor: COLORS.amber,
            icon: CheckCircle2,
            description: "Unit, contract, integration, journey proof.",
            mode: "ai",
            modeLabel: "AI worker",
            tags: ["Independent", "Fixtures"],
          },
          {
            id: "eng-security",
            number: "05",
            title: "Security Agent",
            headerColor: COLORS.salmon,
            icon: ShieldCheck,
            description: "Dependencies, secrets, permissions, abuse cases.",
            mode: "ai",
            modeLabel: "AI worker",
            tags: ["SAST", "Policy"],
          },
        ],
      },
      {
        label: "Review gate",
        nodes: [
          {
            id: "eng-review",
            number: "06",
            title: "Code Review",
            headerColor: COLORS.mint,
            icon: Sliders,
            description: "Correctness, intent, operability, maintenance.",
            mode: "gate",
            modeLabel: "Human gate",
            tags: ["PR review", "Owners"],
          },
          {
            id: "eng-ci",
            number: "07",
            title: "CI Evidence",
            headerColor: COLORS.amber,
            icon: PackageCheck,
            description: "Hermetic build, types, tests, security, perf.",
            mode: "gate",
            modeLabel: "Auto gate",
            tags: ["Signed", "Reproducible"],
          },
        ],
      },
      {
        label: "Production",
        nodes: [
          {
            id: "eng-canary",
            number: "08",
            title: "Canary",
            headerColor: COLORS.green,
            icon: Rocket,
            description: "Feature flag, small cohort, measured bake.",
            mode: "shared",
            modeLabel: "Controlled",
            tags: ["Tiers", "Rollback"],
          },
          {
            id: "eng-operate",
            number: "09",
            title: "Live Ops",
            headerColor: COLORS.blue,
            icon: Radio,
            description: "SLOs, alerts, rollback, blameless learning.",
            mode: "evidence",
            modeLabel: "Live evidence",
            tags: ["Telemetry", "Postmortem"],
          },
        ],
      },
    ],
    edges: [
      { from: "eng-spec", to: "eng-architecture" },
      { from: "eng-architecture", to: "eng-build" },
      { from: "eng-architecture", to: "eng-tests" },
      { from: "eng-architecture", to: "eng-security" },
      { from: "eng-build", to: "eng-review" },
      { from: "eng-tests", to: "eng-review" },
      { from: "eng-security", to: "eng-review" },
      { from: "eng-review", to: "eng-ci", kind: "stack" },
      { from: "eng-ci", to: "eng-canary" },
      { from: "eng-canary", to: "eng-operate", kind: "stack" },
    ],
  },

  suite: {
    id: "suite",
    label: "Product Suite",
    description:
      "Shared systems power distinct products through one governed platform, release train, and portfolio feedback loop.",
    principle:
      "The platform standardizes the boring parts. Product teams keep customer ownership and decision rights.",
    feedbackLabel: "Portfolio signal → next bet",
    columns: [
      {
        label: "Outcomes",
        nodes: [
          {
            id: "suite-outcomes",
            number: "01",
            title: "Outcomes Map",
            headerColor: COLORS.lime,
            icon: FileText,
            description: "Shared goals, customer journeys, platform SLAs.",
            mode: "human",
            modeLabel: "Executive",
            tags: ["North star", "Portfolio"],
          },
        ],
      },
      {
        label: "Platform cores",
        nodes: [
          {
            id: "suite-identity",
            number: "02",
            title: "Identity Core",
            headerColor: COLORS.blue,
            icon: ShieldCheck,
            description: "Auth, tenancy, entitlements, audit trail.",
            mode: "platform",
            modeLabel: "Platform",
            tags: ["One identity", "Policy"],
          },
          {
            id: "suite-data",
            number: "03",
            title: "Data & Events",
            headerColor: COLORS.lilac,
            icon: Database,
            description: "Canonical schemas, events, lineage, consent.",
            mode: "platform",
            modeLabel: "Platform",
            tags: ["Contracts", "Streaming"],
          },
          {
            id: "suite-design",
            number: "04",
            title: "UI System",
            headerColor: COLORS.mint,
            icon: Palette,
            description: "Tokens, components, content, accessibility.",
            mode: "platform",
            modeLabel: "Platform",
            tags: ["Versioned", "Multi-brand"],
          },
          {
            id: "suite-ai",
            number: "05",
            title: "AI Controls",
            headerColor: COLORS.amber,
            icon: Cpu,
            description: "Models, evals, permissions, cost controls.",
            mode: "platform",
            modeLabel: "Platform",
            tags: ["Guardrails", "Observability"],
          },
        ],
      },
      {
        label: "Golden path",
        nodes: [
          {
            id: "suite-path",
            number: "06",
            title: "Golden Path",
            headerColor: COLORS.green,
            icon: Server,
            description: "Templates, APIs, docs, paved workflows.",
            mode: "shared",
            modeLabel: "Self-service",
            tags: ["Backstage", "APIs"],
          },
        ],
      },
      {
        label: "Product lines",
        nodes: [
          {
            id: "suite-core",
            number: "07",
            title: "Core Product",
            headerColor: COLORS.blue,
            icon: Laptop,
            description: "Primary customer workflow and value.",
            mode: "shared",
            modeLabel: "Product pod",
            tags: ["Web", "Own metrics"],
          },
          {
            id: "suite-ops",
            number: "08",
            title: "Ops Console",
            headerColor: COLORS.salmon,
            icon: Sliders,
            description: "Control, support, exception handling.",
            mode: "shared",
            modeLabel: "Product pod",
            tags: ["Admin", "Audit"],
          },
          {
            id: "suite-insights",
            number: "09",
            title: "Insights",
            headerColor: COLORS.lilac,
            icon: Gauge,
            description: "Shared metrics, decisions, forecasting.",
            mode: "shared",
            modeLabel: "Product pod",
            tags: ["Analytics", "Signals"],
          },
          {
            id: "suite-edge",
            number: "10",
            title: "Companion Apps",
            headerColor: COLORS.mint,
            icon: Layout,
            description: "Native, partner, and ecosystem touchpoints.",
            mode: "shared",
            modeLabel: "Product pod",
            tags: ["Mobile", "Partners"],
          },
        ],
      },
      {
        label: "Control plane",
        nodes: [
          {
            id: "suite-gate",
            number: "11",
            title: "Integration",
            headerColor: COLORS.amber,
            icon: ShieldCheck,
            description: "Contracts, migrations, cross-journey tests.",
            mode: "gate",
            modeLabel: "Auto + human",
            tags: ["Compatibility", "E2E"],
          },
          {
            id: "suite-release",
            number: "12",
            title: "Release Train",
            headerColor: COLORS.green,
            icon: PackageCheck,
            description: "Flags, tiers, compatibility, rollback.",
            mode: "gate",
            modeLabel: "Controlled",
            tags: ["Progressive", "Coordinated"],
          },
          {
            id: "suite-signal",
            number: "13",
            title: "Portfolio Signal",
            headerColor: COLORS.blue,
            icon: Radio,
            description: "SLO, adoption, cost, user value.",
            mode: "evidence",
            modeLabel: "Live evidence",
            tags: ["Scorecard", "Next bet"],
          },
        ],
      },
    ],
    edges: [
      { from: "suite-outcomes", to: "suite-identity" },
      { from: "suite-outcomes", to: "suite-data" },
      { from: "suite-outcomes", to: "suite-design" },
      { from: "suite-outcomes", to: "suite-ai" },
      { from: "suite-identity", to: "suite-path" },
      { from: "suite-data", to: "suite-path" },
      { from: "suite-design", to: "suite-path" },
      { from: "suite-ai", to: "suite-path" },
      { from: "suite-path", to: "suite-core" },
      { from: "suite-path", to: "suite-ops" },
      { from: "suite-path", to: "suite-insights" },
      { from: "suite-path", to: "suite-edge" },
      { from: "suite-core", to: "suite-gate" },
      { from: "suite-ops", to: "suite-gate" },
      { from: "suite-insights", to: "suite-gate" },
      { from: "suite-edge", to: "suite-gate" },
      { from: "suite-gate", to: "suite-release", kind: "stack" },
      { from: "suite-release", to: "suite-signal", kind: "stack" },
    ],
  },
};

/* ──────────────── Organic Unstructured Canvas Layout Coordinates ──────────────── */

const ORGANIC_LAYOUTS: Record<TrackType, OrganicLayoutConfig> = {
  design: {
    width: 1340,
    height: 530,
    nodes: {
      "des-brief": { x: 20, y: 185 },
      "des-field": { x: 285, y: 35 },
      "des-signals": { x: 275, y: 320 },
      "des-map": { x: 555, y: 105 },
      "des-swarm": { x: 580, y: 295 },
      "des-critique": { x: 840, y: 45 },
      "des-prototype": { x: 865, y: 260 },
      "des-proof": { x: 1115, y: 100 },
      "des-contract": { x: 1130, y: 310 },
    },
  },

  engineering: {
    width: 1340,
    height: 570,
    nodes: {
      "eng-spec": { x: 20, y: 200 },
      "eng-architecture": { x: 285, y: 200 },
      "eng-build": { x: 555, y: 25 },
      "eng-tests": { x: 580, y: 200 },
      "eng-security": { x: 555, y: 375 },
      "eng-review": { x: 840, y: 85 },
      "eng-ci": { x: 865, y: 295 },
      "eng-canary": { x: 1115, y: 110 },
      "eng-operate": { x: 1130, y: 325 },
    },
  },

  suite: {
    width: 1350,
    height: 740,
    nodes: {
      "suite-outcomes": { x: 20, y: 285 },
      "suite-identity": { x: 285, y: 20 },
      "suite-data": { x: 305, y: 195 },
      "suite-design": { x: 285, y: 370 },
      "suite-ai": { x: 310, y: 545 },
      "suite-path": { x: 570, y: 285 },
      "suite-core": { x: 840, y: 20 },
      "suite-ops": { x: 865, y: 195 },
      "suite-insights": { x: 840, y: 370 },
      "suite-edge": { x: 865, y: 545 },
      "suite-gate": { x: 1120, y: 105 },
      "suite-release": { x: 1140, y: 285 },
      "suite-signal": { x: 1125, y: 465 },
    },
  },
};

function FlowCard({
  node,
  hasInput,
  hasOutput,
  hasTop,
  hasBottom,
  style,
}: {
  node: FlowNodeData;
  hasInput: boolean;
  hasOutput: boolean;
  hasTop?: boolean;
  hasBottom?: boolean;
  style?: React.CSSProperties;
}) {
  const Icon = node.icon;

  return (
    <article
      data-node-id={node.id}
      data-mode={node.mode}
      style={style}
      className="flow-card"
    >
      {hasInput && <span className="flow-card__port flow-card__port--in" />}
      {hasOutput && <span className="flow-card__port flow-card__port--out" />}
      {hasTop && <span className="flow-card__port flow-card__port--top" />}
      {hasBottom && <span className="flow-card__port flow-card__port--bottom" />}

      <div style={{ backgroundColor: node.headerColor }} className="flow-card__header">
        <div className="flow-card__header-left">
          <Icon className="size-4 shrink-0 text-[#121215]" />
          <span className="flow-card__header-title">
            {node.number}. {node.title}
          </span>
        </div>
        <Play className="flow-card__header-play size-3 fill-[#121215] text-[#121215]" />
      </div>

      <div className="flow-card__body">
        <div className="flow-card__meta">
          <span className="flow-card__mode">{node.modeLabel}</span>
        </div>
        <p className="flow-card__desc">{node.description}</p>
        <div className="flow-card__tools" aria-label="Production artifacts">
          {node.tags.map((tag) => (
            <span key={tag} className="flow-card__tool-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function FlowchartCanvas({ track }: { track: TrackData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [wirePaths, setWirePaths] = useState<WirePath[]>([]);
  const [canvasScale, setCanvasScale] = useState(1);
  const [boxWidth, setBoxWidth] = useState(1200);
  const x = useMotionValue(0);
  const [currentX, setCurrentX] = useState(0);
  const config = ORGANIC_LAYOUTS[track.id];

  // Auto-fit scale based on enclosing box width
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    const updateScale = () => {
      const w = el.clientWidth || (typeof window !== "undefined" ? window.innerWidth - 40 : 1200);
      setBoxWidth(w);
      if (w < 768) {
        // On mobile: keep comfortable, crisp, legible scale (0.72) for easy reading and panning
        setCanvasScale(0.72);
      } else {
        const scale = Math.max(0.62, Math.min(1, (w - 40) / config.width));
        setCanvasScale(scale);
      }
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    window.addEventListener("resize", updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [config.width]);

  // Reset horizontal pan to 0 when track changes
  useEffect(() => {
    animate(x, 0, { duration: 0.35, ease: [0.16, 1, 0.3, 1] });
  }, [track.id, x]);

  // Track live x position for button states
  useEffect(() => {
    return x.on("change", (latest) => {
      setCurrentX(latest);
    });
  }, [x]);

  useEffect(() => {
    const calculateWires = () => {
      const container = containerRef.current;
      if (!container) return;

      const getPort = (id: string, type: "in" | "out" | "top" | "bottom") => {
        const card = container.querySelector<HTMLElement>(`[data-node-id="${id}"]`);
        if (!card) return null;

        let px = card.offsetLeft;
        let py = card.offsetTop;

        if (type === "in") {
          px += 0;
          py += 22;
        } else if (type === "out") {
          px += card.offsetWidth;
          py += 22;
        } else if (type === "top") {
          px += card.offsetWidth / 2;
          py += 0;
        } else if (type === "bottom") {
          px += card.offsetWidth / 2;
          py += card.offsetHeight;
        }

        return { x: px, y: py };
      };

      const paths = track.edges.flatMap<WirePath>((edge) => {
        if (edge.kind === "stack") {
          // Direct vertical cascade through top and bottom port dots
          const source = getPort(edge.from, "bottom");
          const target = getPort(edge.to, "top");
          if (!source || !target) return [];

          const dy = Math.max(16, (target.y - source.y) * 0.45);
          const d = `M ${source.x} ${source.y} C ${source.x} ${source.y + dy}, ${target.x} ${target.y - dy}, ${target.x} ${target.y}`;
          return [{ d, kind: "stack" }];
        }

        // Horizontal forward flow: smooth natural S-curve from out port to in port
        const source = getPort(edge.from, "out");
        const target = getPort(edge.to, "in");
        if (!source || !target) return [];

        const dx = Math.max(22, (target.x - source.x) * 0.48);
        const d = `M ${source.x} ${source.y} C ${source.x + dx} ${source.y}, ${target.x - dx} ${target.y}, ${target.x} ${target.y}`;
        return [{ d, kind: edge.kind ?? "flow" }];
      });

      setWirePaths(paths);
    };

    calculateWires();
    const frame = requestAnimationFrame(calculateWires);
    const settleTimer = window.setTimeout(calculateWires, 120);
    window.addEventListener("resize", calculateWires);
    document.fonts?.ready.then(calculateWires);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", calculateWires);
    };
  }, [track, canvasScale]);

  const horizontalInIds = new Set(
    track.edges.filter((e) => e.kind !== "stack").map((e) => e.to)
  );
  const horizontalOutIds = new Set(
    track.edges.filter((e) => e.kind !== "stack").map((e) => e.from)
  );
  const stackInIds = new Set(
    track.edges.filter((e) => e.kind === "stack").map((e) => e.to)
  );
  const stackOutIds = new Set(
    track.edges.filter((e) => e.kind === "stack").map((e) => e.from)
  );
  const allNodes = track.columns.flatMap((col) => col.nodes);

  const scaledWidth = Math.round(config.width * canvasScale);
  const scaledHeight = Math.round(config.height * canvasScale);
  const isMobile = boxWidth < 768;
  const isDraggable = isMobile && boxWidth > 0 && boxWidth < scaledWidth;
  const minX = isDraggable ? boxWidth - scaledWidth - 36 : 0;
  const maxX = 16;
  const isAtStart = currentX >= -12;
  const isAtEnd = currentX <= minX + 12;

  const handlePanNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = Math.max(minX, x.get() - 260);
    animate(x, target, { duration: 0.4, ease: [0.16, 1, 0.3, 1] });
  };

  const handlePanPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = Math.min(maxX, x.get() + 260);
    animate(x, target, { duration: 0.4, ease: [0.16, 1, 0.3, 1] });
  };

  return (
    <div
      ref={boxRef}
      className="relative w-full rounded-[28px] border border-[#4b1426]/20 bg-[#fff2f2]/80 backdrop-blur-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7),0_12px_36px_rgba(75,20,38,0.06)] md:border-none md:border-0 md:bg-transparent md:shadow-none md:rounded-none overflow-hidden flex flex-col justify-center select-none"
      style={{
        height: `${scaledHeight + (isDraggable ? 64 : 32)}px`,
      }}
    >
      {/* Draggable & interactive canvas */}
      <motion.div
        drag={isDraggable ? "x" : false}
        dragConstraints={{
          left: minX,
          right: maxX,
        }}
        dragElastic={0.12}
        dragTransition={{ bounceStiffness: 500, bounceDamping: 28 }}
        style={{
          x,
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
        }}
        className={`relative ${isDraggable ? "cursor-grab active:cursor-grabbing touch-pan-y" : "mx-auto"}`}
      >
        <div
          ref={containerRef}
          className="approach-organic-canvas"
          style={{
            width: `${config.width}px`,
            height: `${config.height}px`,
            transform: `scale(${canvasScale})`,
            transformOrigin: "top left",
            flexShrink: 0,
          }}
        >
          {/* Dynamic SVG Connecting Strings / Wires */}
          <svg
            className="approach-flowchart__wires"
            width={config.width}
            height={config.height}
            style={{
              width: `${config.width}px`,
              height: `${config.height}px`,
            }}
            aria-hidden="true"
          >
            {wirePaths.map((wire, index) => (
              <g key={`${wire.kind}-${index}`} className={`flow-wire flow-wire--${wire.kind}`}>
                {/* Contrast backing stroke */}
                <path
                  d={wire.d}
                  fill="none"
                  stroke="#fff2f2"
                  strokeWidth="4"
                  strokeOpacity="0.88"
                />
                {/* Guide faint line */}
                <path
                  d={wire.d}
                  fill="none"
                  stroke="#4b1426"
                  strokeWidth="1.45"
                  strokeOpacity={0.22}
                />
                {/* Buttery smooth kinetic streaming dashed line */}
                <path
                  d={wire.d}
                  fill="none"
                  stroke="#4b1426"
                  strokeWidth="1.8"
                  strokeOpacity={0.82}
                  className="flow-wire-stream"
                />
              </g>
            ))}
          </svg>

          {/* Organically Positioned Graph Nodes */}
          {allNodes.map((node) => {
            const pos = config.nodes[node.id] ?? { x: 0, y: 0 };

            return (
              <FlowCard
                key={node.id}
                node={node}
                hasInput={horizontalInIds.has(node.id)}
                hasOutput={horizontalOutIds.has(node.id)}
                hasTop={stackInIds.has(node.id)}
                hasBottom={stackOutIds.has(node.id)}
                style={{
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                }}
              />
            );
          })}
        </div>
      </motion.div>

      {/* When the graph overflows on mobile: show edge gradient hints and tap/drag controls */}
      {isDraggable && (
        <>
          {/* Left edge gradient hint */}
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-[#fff2f2] to-transparent z-10 transition-opacity duration-200 ${
              isAtStart ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Right edge gradient hint */}
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-[#fff2f2] to-transparent z-10 transition-opacity duration-200 ${
              isAtEnd ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Interactive Tap & Drag Controller Bar at bottom */}
          <div className="absolute bottom-3 right-4 z-20 flex items-center gap-2 select-none">
            <div className="flex items-center gap-1 rounded-full border border-[#4b1426]/20 bg-[#fff2f2]/95 px-1.5 py-1 shadow-md backdrop-blur-md">
              <button
                type="button"
                onClick={handlePanPrev}
                disabled={isAtStart}
                aria-label="Move graph left"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#4b1426] transition-all active:scale-90 hover:bg-[#4b1426]/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </button>
              <span className="px-1.5 text-[11px] font-semibold tracking-tight text-[#4b1426]">
                Tap / Drag
              </span>
              <button
                type="button"
                onClick={handlePanNext}
                disabled={isAtEnd}
                aria-label="Move graph right"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[#4b1426] transition-all active:scale-90 hover:bg-[#4b1426]/10 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ApproachFlow() {
  const [activeTrack, setActiveTrack] = useState<TrackType>("design");
  const track = TRACKS[activeTrack];

  return (
    <div className="approach-section-layout">
      {/* ──────────────── 1-Column Centered Header Block (Top) ──────────────── */}
      <div className="approach-content-col">
        <div className="mb-12 w-full max-w-3xl text-center sm:mb-16">
          <p className="mb-3.5 text-xs font-semibold uppercase tracking-[0.35em] text-[#4b1426]">
            How we work
          </p>
          <h2 className="font-heading text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Approach
          </h2>
          <p className="mt-6 w-full text-base leading-relaxed text-foreground/70 sm:text-lg">
            We start with the problem, not the tools. We explore fast, cut what
            does not hold up, and ship what actually works. The goal is always to
            kill the bottleneck.
          </p>
        </div>

        {/* Track Selection Buttons */}
        <div className="approach-track-selector" role="tablist" aria-label="Select approach track">
          {(["design", "engineering", "suite"] as TrackType[]).map((tab) => {
            const isActive = activeTrack === tab;
            return (
              <ScanGridButton
                key={tab}
                label={TRACKS[tab].label}
                role="tab"
                ariaSelected={isActive}
                isActive={isActive}
                onClick={() => setActiveTrack(tab)}
                borderRadius={0}
                padding="10px 22px"
                font={{
                  fontFamily: "var(--font-clash-display)",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  letterSpacing: "-0.01em",
                }}
                colors={
                  isActive
                    ? {
                        fill: "#4b1426",
                        textColor: "#fff2f2",
                        hoverFill: "#380d1b",
                        hoverTextColor: "#ffffff",
                      }
                    : {
                        fill: "rgba(75, 20, 38, 0.05)",
                        textColor: "#4b1426",
                        hoverFill: "rgba(75, 20, 38, 0.12)",
                        hoverTextColor: "#4b1426",
                      }
                }
                border={{
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: isActive ? "#4b1426" : "rgba(75, 20, 38, 0.22)",
                }}
                scan={{
                  color: isActive ? "#fff2f2" : "#4b1426",
                  speed: 50,
                }}
                glitchIntensity={0}
                style={{
                  boxShadow: isActive
                    ? "0 4px 14px rgba(75, 20, 38, 0.28)"
                    : "none",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ──────────────── Full-Width Graph Canvas Block (Below, Zero Horizontal Scroll) ──────────────── */}
      <div className="approach-graph-col">
        <div className="approach-graph-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTrack}
              initial={{ opacity: 0, y: 25, scale: 0.98, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -25, scale: 0.98, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <FlowchartCanvas track={track} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
