import { Hero3 } from "@/components/ui/hero-3";

export default function OgPreviewPage() {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        background: "#fff2f2",
        overflow: "hidden",
        position: "relative",
      }}
      className="flex items-stretch justify-stretch"
    >
      <style>{`
        nextjs-portal,
        #__next-build-watcher,
        [data-nextjs-dialog-overlay],
        [data-nextjs-toast-wrapper] {
          display: none !important;
        }
      `}</style>
      <Hero3
        hideLinks={true}
        isStatic={true}
        logoText="Doom"
        logoSubtext="Studio"
        headline="We DOOM"
        headlineLine2="the bottlenecks."
        description="Doom Studio is a design and engineering team for founders who need the work shipped, not another deck. We take the unclear page, the half-built product or the messy workflow and turn it into something people can actually use."
        className="w-[1200px] h-[630px] !min-h-[630px] !max-h-[630px] p-6"
        panelClassName="!min-h-0 !h-full"
        taglineClassName="!text-[4.5rem] !leading-[0.92]"
        descriptionClassName="!p-6 !pt-8 !justify-end !pb-6"
        descriptionTextClassName="!text-[15.5px] !leading-[1.5] !text-[#1c0810]/90 font-normal"
      />
    </div>
  );
}
