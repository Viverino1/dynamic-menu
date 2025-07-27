"use client";

import { useSheetData } from "@/hooks/useSheetData";

export default function HomePage() {
  const { menu, device, state } = useSheetData();
  if (state == "loading") return <div>Loading...</div>;
  if (state == "error" || !menu || !device)
    return <div>Error loading sheet data.</div>;

  // Calculate rotation based on device orientation and invert
  const getTransformStyles = () => {
    let rotation = 0;

    if (device.orientation === "portrait") {
      rotation = device.invert ? -90 : 90;
    } else {
      // landscape
      rotation = device.invert ? 180 : 0;
    }

    return {
      transform: `rotate(${rotation}deg)`,
      transformOrigin: "center center",
    };
  };

  const transformStyles = getTransformStyles();

  // For landscape orientations, we need to swap width/height to maintain proper sizing
  const isLandscape = device.orientation === "portrait";
  const containerStyles = isLandscape
    ? {
        width: "100vh",
        height: "100vw",
      }
    : {
        width: "100vw",
        height: "100vh",
      };

  return (
    <div className="flex items-center justify-center w-[100vw] h-[100vh] overflow-hidden">
      <main
        className="flex"
        style={{
          ...containerStyles,
          ...transformStyles,
        }}
      >
        <div className="w-1/2 h-full bg-primary text-background"></div>
        <div className="w-1/2 h-full bg-background text-foreground"></div>
      </main>
    </div>
  );
}
