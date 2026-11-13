"use client";

import { useEffect, useRef, useState } from "react";
import {
  BottleneckBreaker as Breaker,
  type GameState,
} from "@/lib/bottleneck-breaker";
import type { GameCopy } from "@/lib/content";
import styles from "./BottleneckBreaker.module.css";

export function BottleneckBreaker({ copy }: { copy: GameCopy }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<Breaker | null>(null);
  const keyboardPosition = useRef(0.5);
  const [state, setState] = useState<GameState>({
    hits: 0,
    total: 18,
    ai: true,
  });

  useEffect(() => {
    if (!canvas.current) return;
    const board = new Breaker(canvas.current, {
      onChange: setState,
      labels: copy.bricks,
    });
    game.current = board;
    board.start();
    return () => {
      board.stop();
      game.current = null;
    };
  }, [copy.bricks]);

  return (
    <div className={styles.game}>
      <div className={styles.frame}>
        <div className={styles.hud}>
          <span className={styles.title}>{copy.title}</span>
          <span className={styles.score}>
            {copy.scoreLabel} <b>{String(state.hits).padStart(2, "0")}</b> /{" "}
            <span>{state.total}</span>
          </span>
          <span className={styles.right}>
            <span className={styles.mode}>
              <i />
              <span>{state.ai ? copy.modeAuto : copy.modeHuman}</span>
            </span>
            <button
              type="button"
              className={styles.restart}
              onClick={() => game.current?.restart()}
            >
              {copy.restart}
            </button>
          </span>
        </div>
        <canvas
          ref={canvas}
          className={styles.canvas}
          role="img"
          tabIndex={0}
          aria-label="Bottleneck Breaker. A ball breaks blocks named after common startup bottlenecks. It plays by itself, and you can move your cursor over it to steer the paddle."
          aria-describedby="game-keyboard-controls"
          onPointerMove={(event) => game.current?.steer(event.clientX)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            keyboardPosition.current = Math.max(
              0,
              Math.min(
                1,
                keyboardPosition.current +
                  (event.key === "ArrowRight" ? 0.08 : -0.08),
              ),
            );
            const rect = event.currentTarget.getBoundingClientRect();
            game.current?.steer(
              rect.left + rect.width * keyboardPosition.current,
            );
          }}
        />
      </div>
      <span className={styles.caption}>{copy.caption}</span>
      <span className="sr-only" id="game-keyboard-controls">
        Use the left and right arrow keys to steer the paddle. The game returns
        to auto-play when you stop.
      </span>
    </div>
  );
}
