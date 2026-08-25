const CX = 428;
const CY = 252;
const R = 176;

function polar(deg) {
  const a = (deg * Math.PI) / 180;
  return [CX + R * Math.cos(a), CY + R * Math.sin(a)];
}

function tangent(deg, back, fwd) {
  const a = (deg * Math.PI) / 180;
  const [x, y] = polar(deg);
  const dx = -Math.sin(a);
  const dy = Math.cos(a);
  return {
    x1: x - dx * back,
    y1: y - dy * back,
    x2: x + dx * fwd,
    y2: y + dy * fwd
  };
}

const T1 = tangent(102, 420, 280);
const T2 = tangent(328, 360, 300);
const ARC_START = polar(252);
const ARC_END = polar(198);

const P0 = [318, 392];
const C1 = [368, 236];
const C2 = [512, 318];
const P3 = [748, 118];
const MID = [454, 278];

function ticksAlong(x1, y1, x2, y2, count, len) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const mag = Math.hypot(dx, dy) || 1;
  const nx = (-dy / mag) * len;
  const ny = (dx / mag) * len;
  const marks = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const x = x1 + dx * t;
    const y = y1 + dy * t;
    marks.push([x, y, x + nx, y + ny]);
  }
  return marks;
}

const TICKS_A = ticksAlong(470, 58, 778, 58, 7, 10);
const TICKS_B = ticksAlong(T2.x1, T2.y1, T2.x2, T2.y2, 5, 8);

const DesignConstructionLines = ({
  className,
  accentColor = "#e07a93",
  lineColor = "#fff2f2",
  mutedColor = "#8a7377",
  opacity = 1
}) => (
  <div
    className={`design-construction-lines${className ? ` ${className}` : ""}`}
    aria-hidden="true"
  >
    <svg
      viewBox="0 0 800 460"
      preserveAspectRatio="xMidYMid slice"
      width="100%"
      height="100%"
      fill="none"
    >
      <defs>
        <filter id="dcl-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g
        opacity={0.16 * opacity}
        stroke={mutedColor}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`gv${i}`} x1={500 + i * 28} y1={292} x2={500 + i * 28} y2={428} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`gh${i}`} x1={500} y1={292 + i * 22.6} x2={724} y2={292 + i * 22.6} />
        ))}
      </g>

      <g
        opacity={0.38 * opacity}
        stroke={mutedColor}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        <line x1="210" y1="-30" x2="860" y2="490" />
        <line x1={T1.x1} y1={T1.y1} x2={T1.x2} y2={T1.y2} />
        <line x1={T2.x1} y1={T2.y1} x2={T2.x2} y2={T2.y2} />
        {TICKS_A.map(([x1, y1, x2, y2], i) => (
          <line key={`ta${i}`} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
        {TICKS_B.map(([x1, y1, x2, y2], i) => (
          <line key={`tb${i}`} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>

      <g
        opacity={0.88 * opacity}
        stroke={lineColor}
        strokeWidth="1.75"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        <path
          d={`M ${ARC_START[0].toFixed(1)} ${ARC_START[1].toFixed(1)} A ${R} ${R} 0 1 1 ${ARC_END[0].toFixed(1)} ${ARC_END[1].toFixed(1)}`}
        />
        <path d="M 472 62 H 778 V 328" />
        <path d="M 338 168 L 538 126 L 572 248 L 520 278 L 372 320 Z" />
      </g>

      <g
        opacity={0.38 * opacity}
        stroke={mutedColor}
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="square"
      >
        <line x1={P0[0]} y1={P0[1]} x2={C1[0]} y2={C1[1]} />
        <line x1={P3[0]} y1={P3[1]} x2={C2[0]} y2={C2[1]} />
        <circle cx={C1[0]} cy={C1[1]} r="2.4" fill={mutedColor} stroke="none" />
        <circle cx={C2[0]} cy={C2[1]} r="2.4" fill={mutedColor} stroke="none" />
      </g>

      <path
        d={`M ${P0[0]} ${P0[1]} C ${C1[0]} ${C1[1]}, ${C2[0]} ${C2[1]}, ${P3[0]} ${P3[1]}`}
        stroke={accentColor}
        strokeWidth="1.75"
        opacity={0.92 * opacity}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="square"
        strokeLinejoin="miter"
        filter="url(#dcl-glow)"
      />

      <g
        fill="none"
        stroke={accentColor}
        strokeWidth="1"
        opacity={0.92 * opacity}
        vectorEffect="non-scaling-stroke"
        strokeLinecap="square"
      >
        {[P0, MID, P3].map(([x, y], i) => (
          <rect
            key={i}
            x={x - 3.2}
            y={y - 3.2}
            width="6.4"
            height="6.4"
            transform={`rotate(45 ${x} ${y})`}
          />
        ))}
      </g>
    </svg>
  </div>
);

export default DesignConstructionLines;
