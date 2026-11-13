import { site } from "@/lib/content";
import { ProcessTabs } from "./ProcessTabs";
import { SectionHead } from "./ui";

export function Process() {
  const { process } = site;
  return (
    <section id="process" className="section">
      <div className="container section-stack">
        <SectionHead
          label={process.label}
          headline={process.headline}
          muted={process.headlineMuted}
          intro={process.intro}
        />
        <ProcessTabs
          steps={process.steps}
          defaultStep={process.defaultStep}
          logTitle={process.logTitle}
          logTag={process.logTag}
        />
      </div>
    </section>
  );
}
