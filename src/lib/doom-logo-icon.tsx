import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Same mark as the hero wordmark:
 * Boxing Regular, uppercase, cream on ground.
 * DOOM tracking 0.18em, STUDIO tracking 0.5em, gap 0.3 of DOOM size (hero mt-1.5 on text-xl).
 */
export async function doomLogoIcon(size: number) {
  const fontData = await readFile(
    join(process.cwd(), "src/app/fonts/Boxing-Regular.otf")
  );

  const doomSize = Math.round(size * 0.1875);
  const studioSize = Math.round(doomSize * 0.6);
  const doomTracking = doomSize * 0.18;
  const studioTracking = studioSize * 0.5;
  const gap = Math.round(doomSize * 0.3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          color: "#fff2f2",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            lineHeight: 1,
          }}
        >
          <div
            style={{
              fontFamily: "Boxing",
              fontSize: doomSize,
              fontWeight: 400,
              letterSpacing: doomTracking,
              lineHeight: 1,
            }}
          >
            DOOM
          </div>
          <div
            style={{
              fontFamily: "Boxing",
              fontSize: studioSize,
              fontWeight: 400,
              letterSpacing: studioTracking,
              lineHeight: 1,
              marginTop: gap,
            }}
          >
            STUDIO
          </div>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
      fonts: [
        {
          name: "Boxing",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}
