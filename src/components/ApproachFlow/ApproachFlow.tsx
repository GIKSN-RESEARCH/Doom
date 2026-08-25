import "./ApproachFlow.css";

const DESIGN_STEPS = [
  {
    id: "reality",
    idx: "01",
    title: "Reality",
    hint: "Start with the job people actually do. Not the screen they asked for.",
    kind: "start" as const,
  },
  {
    id: "clarity",
    idx: "02",
    title: "Clarity",
    hint: "Cut until one decision is obvious. Decorative work gets dropped.",
    kind: "process" as const,
  },
  {
    id: "system",
    idx: "03",
    title: "System",
    hint: "Structure the product so it still holds when real use hits it.",
    kind: "process" as const,
  },
];

export default function ApproachFlow() {
  return (
    <div className="approach-flow" data-track="design">
      <div className="approach-flow__track">
        <span className="approach-flow__track-dot" aria-hidden="true" />
        Design
      </div>

      <div className="approach-flow__board">
        <ol className="approach-flow__col">
          {DESIGN_STEPS.map((step) => (
            <li key={step.id} className="approach-flow__col">
              <article
                className={`af-node${step.kind === "start" ? " af-node--start" : ""}`}
              >
                <span className="af-node__idx">{step.idx}</span>
                <h3 className="af-node__title">{step.title}</h3>
                <p className="af-node__hint">{step.hint}</p>
              </article>
              <span className="af-wire" aria-hidden="true" />
            </li>
          ))}

          <li className="approach-flow__col">
            <div
              className="af-diamond"
              role="img"
              aria-label="Decision: does it survive real users?"
            >
              <div className="af-diamond__inner">
                <p>Real users</p>
                <span>Does it hold?</span>
              </div>
            </div>
            <span className="af-wire" aria-hidden="true" />
          </li>

          <li className="af-split">
            <div className="af-split__arm af-split__arm--no">
              <p className="af-split__label">No — rework</p>
              <article className="af-node af-node--side">
                <span className="af-node__idx">Loop</span>
                <h3 className="af-node__title">Go back</h3>
                <p className="af-node__hint">
                  If it breaks in the wild, return to structure. No cosmetic
                  patch.
                </p>
              </article>
            </div>
            <div className="af-split__arm">
              <p className="af-split__label">Yes — lock</p>
              <article className="af-node af-node--side">
                <span className="af-node__idx">04</span>
                <h3 className="af-node__title">Lock</h3>
                <p className="af-node__hint">
                  Freeze what works. Make the system hard to break on purpose.
                </p>
              </article>
            </div>
          </li>

          <li className="approach-flow__col">
            <svg className="af-join" viewBox="0 0 200 40" aria-hidden="true">
              <path d="M50 0 V12 C50 26 72 26 100 26 C128 26 150 26 150 12 V0" />
              <path d="M100 26 V33" />
              <polygon points="96,33 104,33 100,40" />
            </svg>
            <article className="af-node af-node--end">
              <span className="af-node__idx">05</span>
              <h3 className="af-node__title">Ship sharp</h3>
              <p className="af-node__hint">
                Intentional. Fast to understand. No decorative fluff.
              </p>
            </article>
          </li>
        </ol>
      </div>
    </div>
  );
}
