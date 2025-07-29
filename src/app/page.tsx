"use client";

import Menu from "@/components/Menu";
import { useSheetData } from "@/hooks/useSheetData";
import { useState, useEffect } from "react";

export default function App() {
  const { menu, device, state } = useSheetData();
  if (state == "loading") return <div>Loading...</div>;
  if (state == "error" || !menu || !device) return <div>Error loading sheet data.</div>;
  return (
    <>
      <AppContent key={JSON.stringify({ menu, device })} menu={menu} device={device} />
    </>
  );
}

function AppContent({ menu, device }: { menu: Record<string, MenuItem[]>; device: Device }) {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1920,
    height: typeof window !== "undefined" ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // Detect native screen aspect ratio
  const nativeIsPortrait = windowDimensions.height > windowDimensions.width;

  // Calculate rotation based on device orientation and invert, considering native aspect ratio
  const getTransformStyles = () => {
    let rotation = 0;

    // If device wants portrait but screen is naturally landscape, or vice versa, we need to rotate
    if (device.orientation === "portrait") {
      if (nativeIsPortrait) {
        // Screen is naturally portrait, device wants portrait - no rotation needed
        rotation = device.invert ? 180 : 0;
      } else {
        // Screen is naturally landscape, device wants portrait - need 90 degree rotation
        rotation = device.invert ? -90 : 90;
      }
    } else {
      // device.orientation === "landscape"
      if (nativeIsPortrait) {
        // Screen is naturally portrait, device wants landscape - need 90 degree rotation
        rotation = device.invert ? 90 : -90;
      } else {
        // Screen is naturally landscape, device wants landscape - no rotation needed
        rotation = device.invert ? 180 : 0;
      }
    }

    return {
      transform: `rotate(${rotation}deg)`,
      transformOrigin: "center center",
    };
  };

  const transformStyles = getTransformStyles();

  // Determine if we need to swap dimensions based on whether rotation is 90 or -90 degrees
  const rotationMatch = transformStyles.transform.match(/-?\d+/);
  const rotationDegrees = rotationMatch ? parseInt(rotationMatch[0]) : 0;
  const needsDimensionSwap = Math.abs(rotationDegrees) === 90;
  const containerStyles = needsDimensionSwap
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
      <div
        className="flex relative z-10"
        style={{
          ...containerStyles,
          ...transformStyles,
        }}
      >
        {/* <div className="w-1/2 h-full bg-primary text-background"></div>
        <div className="w-1/2 h-full bg-background text-foreground"></div> */}

        <img src="/bg.jpg" alt="" className=" w-full h-full opacity-75" />
        <div className="absolute inset-0 z-20">
          <Menu menu={menu} isPortrait={device.orientation === "portrait"} needsDimensionSwap={needsDimensionSwap} />
        </div>
      </div>
    </div>
  );
}
