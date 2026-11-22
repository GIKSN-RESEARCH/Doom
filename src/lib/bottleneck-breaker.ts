/*
 * Bottleneck Breaker: the auto-playing arcade board in the Doom Studio hero.
 * Framework free. Port it to TypeScript as src/lib/bottleneck-breaker.ts and keep every constant.
 *
 *   const game = new BottleneckBreaker(canvas, { onChange: (state) => ... });
 *   game.start();                 // begins the loop, pauses itself when off screen
 *   game.steer(event.clientX);    // pointer steering; auto-play resumes after 2.6 s idle
 *   game.restart();               // rebuilds the wall
 *   game.stop();                  // on unmount
 *
 * onChange receives { hits, total, ai }: ai is false while a person is steering.
 * prefers-reduced-motion: the board renders but the ball does not move.
 */
export type GameState = { hits: number; total: number; ai: boolean };
type Brick = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  alive: boolean;
  delay: number;
  tone: number;
};
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  s: number;
  c: number;
  rot: number;
};
type Pop = { x: number; y: number; life: number };
type Options = { onChange?: (state: GameState) => void; labels?: string[] };

export class BottleneckBreaker {
  cv: HTMLCanvasElement;
  onChange: Options["onChange"] | null;
  state: GameState;
  sourceLabels?: string[];
  labels!: string[];
  fontText = "Inter, system-ui, sans-serif";
  fontDisplay = '"Inter Tight", Inter, system-ui, sans-serif';
  reduced = false;
  ai = true;
  aiShown = true;
  lastInput = 0;
  lastTs = 0;
  aiOff = 0;
  raf = 0;
  visible = true;
  io?: IntersectionObserver;
  W!: number;
  H!: number;
  bricks!: Brick[];
  total = 18;
  hits = 0;
  pw!: number;
  ph!: number;
  py!: number;
  px!: number;
  ptx!: number;
  parts!: Particle[];
  pops!: Pop[];
  shake = 0;
  pulse = 0;
  buildT = 0;
  won = false;
  winAt = 0;
  bx!: number;
  by!: number;
  bvx!: number;
  bvy!: number;
  trail!: [number, number][];

  constructor(canvas: HTMLCanvasElement, opts: Options = {}) {
    this.cv = canvas;
    this.onChange = opts.onChange || null;
    this.state = { hits: 0, total: 18, ai: true };
    this.sourceLabels = opts.labels;
  }

  setState(patch: Partial<GameState>) {
    Object.assign(this.state, patch);
    if (this.onChange) this.onChange({ ...this.state });
  }

  steer(clientX: number) {
    const rc = this.cv.getBoundingClientRect();
    this.ptx = clientX - rc.left;
    this.ai = false;
    this.lastInput = performance.now();
  }

  restart() {
    this.rebuild();
  }

  start() {
    this.reduced = !!(
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
    this.labels = this.sourceLabels || [
      "Unclear page",
      "No signups",
      "Stuck MVP",
      "Manual ops",
      "Slow handoffs",
      "Off-brand UI",
      "Missed launch",
      "Weak copy",
      "Messy onboarding",
      "Laggy UI",
      "Spaghetti code",
      "Endless edits",
      "No design system",
      "Flaky deploys",
      "No analytics",
      "Clunky checkout",
      "Stale brand",
      "Bloated stack",
    ];
    // next/font self-hosts these families under generated names.
    const fonts = getComputedStyle(this.cv);
    this.fontText =
      fonts.getPropertyValue("--font-inter").trim() || this.fontText;
    this.fontDisplay =
      fonts.getPropertyValue("--font-inter-tight").trim() || this.fontDisplay;
    this.ai = true;
    this.aiShown = true;
    this.lastInput = 0;
    this.lastTs = 0;
    this.aiOff = 0;
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
    // Pause the loop while the board is off screen.
    this.visible = true;
    if (typeof IntersectionObserver !== "undefined") {
      this.io = new IntersectionObserver((entries) => {
        this.visible = entries[0].isIntersecting;
      });
      this.io.observe(this.cv);
    }
    if (document.fonts && document.fonts.load) {
      document.fonts
        .load("600 13px " + this.fontText.split(",")[0])
        .catch(() => {});
      document.fonts
        .load("600 12px " + this.fontDisplay.split(",")[0])
        .catch(() => {});
    }
  }
  stop() {
    cancelAnimationFrame(this.raf);
    if (this.io) this.io.disconnect();
  }

  speed() {
    return this.W < 520 ? 320 : this.W < 900 ? 440 : 540;
  }

  setup(w: number, h: number) {
    this.W = w;
    this.H = h;
    const narrow = w < 520;
    const cols = narrow ? 2 : w < 900 ? 4 : 6,
      rows = narrow ? 5 : 3;
    const pad = narrow ? 14 : w < 900 ? 20 : 26,
      gap = narrow ? 8 : w < 900 ? 10 : 12,
      top = narrow ? 14 : w < 900 ? 20 : 26;
    const bw = (w - pad * 2 - gap * (cols - 1)) / cols,
      bh = narrow ? 36 : 46;
    this.bricks = [];
    let k = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.bricks.push({
          x: pad + c * (bw + gap),
          y: top + r * (bh + gap),
          w: bw,
          h: bh,
          label: this.labels[k % this.labels.length],
          alive: true,
          delay: k * 0.04,
          tone: (k + r) % 4 === 2 ? 1 : 0,
        });
        k++;
      }
    }
    this.total = this.bricks.length;
    this.hits = 0;
    this.pw = narrow ? 96 : w < 900 ? 148 : 176;
    this.ph = 18;
    this.py = h - 30;
    this.px = w / 2;
    this.ptx = w / 2;
    this.parts = [];
    this.pops = [];
    this.shake = 0;
    this.pulse = 0;
    this.buildT = performance.now();
    this.won = false;
    this.resetBall();
    this.setState({ hits: 0, total: this.total });
  }

  resetBall() {
    const sp = this.speed();
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
    this.bx = this.px;
    this.by = this.py - 30;
    this.bvx = Math.cos(a) * sp;
    this.bvy = Math.sin(a) * sp;
    this.trail = [];
  }

  rebuild() {
    if (!this.bricks) return;
    for (let i = 0; i < this.bricks.length; i++) this.bricks[i].alive = true;
    this.hits = 0;
    this.won = false;
    this.buildT = performance.now();
    this.resetBall();
    this.setState({ hits: 0 });
  }

  burst(b: Brick) {
    for (let i = 0; i < 22; i++) {
      this.parts.push({
        x: b.x + Math.random() * b.w,
        y: b.y + Math.random() * b.h,
        vx: (Math.random() - 0.5) * 380,
        vy: -Math.random() * 300,
        life: 1,
        s: 3 + Math.random() * 5,
        c: i % 3,
        rot: Math.random() * 6,
      });
    }
    this.pops.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, life: 1 });
  }

  rr(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
  }

  loop(ts: number) {
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible) {
      this.lastTs = 0;
      return;
    }
    const c = this.cv;
    if (!c) return;
    const w = c.clientWidth,
      h = c.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.round(w * dpr),
      ch = Math.round(h * dpr);
    if (c.width !== cw || c.height !== ch) {
      c.width = cw;
      c.height = ch;
    }
    if (!this.bricks || Math.abs(this.W - w) > 2 || Math.abs(this.H - h) > 2)
      this.setup(w, h);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dt = Math.min(0.033, this.lastTs ? (ts - this.lastTs) / 1000 : 0.016);
    this.lastTs = ts;
    const now = performance.now();

    // who is steering
    if (now - this.lastInput > 2600) this.ai = true;
    if (this.ai !== this.aiShown) {
      this.aiShown = this.ai;
      this.setState({ ai: this.ai });
    }
    if (this.ai)
      this.ptx =
        this.bvy > 0 ? this.bx + this.aiOff : w / 2 + (this.bx - w / 2) * 0.45;
    this.px += (this.ptx - this.px) * Math.min(1, dt * (this.ai ? 12 : 24));
    const hp = this.pw / 2;
    if (this.px < hp + 6) this.px = hp + 6;
    if (this.px > w - hp - 6) this.px = w - hp - 6;

    // physics
    const r = 8;
    if (!this.won && !this.reduced) {
      const steps = 4,
        sdt = dt / steps;
      for (let s = 0; s < steps; s++) {
        this.bx += this.bvx * sdt;
        this.by += this.bvy * sdt;
        if (this.bx < r) {
          this.bx = r;
          this.bvx = Math.abs(this.bvx);
        }
        if (this.bx > w - r) {
          this.bx = w - r;
          this.bvx = -Math.abs(this.bvx);
        }
        if (this.by < r) {
          this.by = r;
          this.bvy = Math.abs(this.bvy);
        }
        if (
          this.bvy > 0 &&
          this.by + r >= this.py - this.ph / 2 &&
          this.by + r <= this.py + this.ph / 2 + 12 &&
          Math.abs(this.bx - this.px) <= hp + r
        ) {
          const off = Math.max(-1, Math.min(1, (this.bx - this.px) / hp));
          const ang = -Math.PI / 2 + off * 1.0;
          const sp = this.speed();
          this.bvx = Math.cos(ang) * sp;
          this.bvy = Math.sin(ang) * sp;
          this.by = this.py - this.ph / 2 - r;
          this.aiOff = (Math.random() - 0.5) * this.pw * 0.8;
          this.pulse = 1;
        }
        if (this.by > h + 40) {
          this.resetBall();
          break;
        }
        const B = this.bricks;
        for (let i = 0; i < B.length; i++) {
          const b = B[i];
          if (!b.alive) continue;
          if (
            this.bx + r > b.x &&
            this.bx - r < b.x + b.w &&
            this.by + r > b.y &&
            this.by - r < b.y + b.h
          ) {
            const ox = Math.min(this.bx + r - b.x, b.x + b.w - (this.bx - r));
            const oy = Math.min(this.by + r - b.y, b.y + b.h - (this.by - r));
            if (ox < oy) this.bvx = -this.bvx;
            else this.bvy = -this.bvy;
            b.alive = false;
            this.hits++;
            this.burst(b);
            this.shake = 5;
            if (this.hits >= this.total) {
              this.won = true;
              this.winAt = now;
            }
            this.setState({ hits: this.hits });
            break;
          }
        }
      }
    }
    if (this.won && now - this.winAt > 3200) this.rebuild();

    // draw
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const sx = (Math.random() - 0.5) * this.shake,
      sy = (Math.random() - 0.5) * this.shake;
    this.shake *= Math.exp(-dt * 14);
    ctx.translate(sx, sy);

    const narrow = w < 520;
    const el = this.reduced ? 99 : (now - this.buildT) / 1000;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.font = "600 " + (narrow ? 12 : 13) + "px " + this.fontText;
    const B = this.bricks;
    for (let i = 0; i < B.length; i++) {
      const b = B[i];
      if (!b.alive) continue;
      const t = Math.max(0, Math.min(1, (el - b.delay) / 0.6));
      if (t <= 0) continue;
      const e = 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
      const y = b.y + (1 - e) * -90;
      ctx.globalAlpha = Math.min(1, t * 2);
      ctx.shadowColor = "rgba(11,11,12,0.35)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 8;
      this.rr(ctx, b.x, y, b.w, b.h, 12);
      ctx.fillStyle = b.tone ? "rgba(11,11,12,0.82)" : "rgba(250,249,247,0.93)";
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.lineWidth = 1;
      ctx.strokeStyle = b.tone
        ? "rgba(255,255,255,0.22)"
        : "rgba(255,255,255,0.9)";
      ctx.stroke();
      ctx.fillStyle = "#FF5A1F";
      ctx.beginPath();
      ctx.arc(b.x + 16, y + b.h / 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = b.tone ? "#F4F2EE" : "#0B0B0C";
      let label = b.label;
      const maxW = b.w - 36;
      while (label.length > 3 && ctx.measureText(label).width > maxW)
        label = label.slice(0, -2) + ".";
      ctx.fillText(label, b.x + 28, y + b.h / 2 + 0.5);
    }
    ctx.globalAlpha = 1;

    // debris
    const P = this.parts;
    const cols = ["#FFFFFF", "#FF5A1F", "#0B0B0C"];
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i];
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 1.2;
      p.rot += dt * 6;
      if (p.life <= 0 || p.y > h + 40) {
        P.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.min(1, p.life);
      ctx.fillStyle = cols[p.c];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      ctx.restore();
    }
    // "Doomed" tags
    const Q = this.pops;
    ctx.font = "600 12px " + this.fontText;
    ctx.textAlign = "center";
    for (let i = Q.length - 1; i >= 0; i--) {
      const q = Q[i];
      q.life -= dt * 1.1;
      if (q.life <= 0) {
        Q.splice(i, 1);
        continue;
      }
      const yy = q.y - (1 - q.life) * 34;
      ctx.globalAlpha = Math.min(1, q.life * 1.6);
      const tw = ctx.measureText("Doomed").width + 20;
      this.rr(ctx, q.x - tw / 2, yy - 12, tw, 24, 12);
      ctx.fillStyle = "#FF5A1F";
      ctx.fill();
      ctx.fillStyle = "#0B0B0C";
      ctx.fillText("Doomed", q.x, yy + 0.5);
    }
    ctx.globalAlpha = 1;

    // ball
    if (!this.won) {
      this.trail.push([this.bx, this.by]);
      if (this.trail.length > 14) this.trail.shift();
      for (let i = 0; i < this.trail.length; i++) {
        const q = this.trail[i],
          f = i / this.trail.length;
        ctx.globalAlpha = f * 0.4;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(q[0], q[1], r * (0.3 + 0.6 * f), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowColor = "rgba(255,90,31,0.95)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(this.bx, this.by, r, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }

    // paddle
    this.pulse *= Math.exp(-dt * 8);
    const pw = this.pw * (1 + 0.06 * this.pulse),
      ph = this.ph * (1 + 0.2 * this.pulse);
    ctx.shadowColor = "rgba(11,11,12,0.45)";
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 8;
    this.rr(ctx, this.px - pw / 2, this.py - ph / 2, pw, ph, 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "#0B0B0C";
    ctx.font = "600 11px " + this.fontDisplay;
    ctx.fillText("DOOM", this.px, this.py + 0.5);

    // all clear
    if (this.won) {
      const a = Math.min(1, (now - this.winAt) / 400);
      ctx.globalAlpha = a;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "500 " + (narrow ? 34 : 52) + "px " + this.fontDisplay;
      ctx.fillText("All clear.", w / 2, h * 0.4);
      ctx.font = "400 " + (narrow ? 14 : 16) + "px " + this.fontText;
      ctx.fillStyle = "rgba(255,255,255,0.82)";
      ctx.fillText(
        "Every bottleneck doomed. Next backlog loading.",
        w / 2,
        h * 0.4 + (narrow ? 34 : 46),
      );
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = "left";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
