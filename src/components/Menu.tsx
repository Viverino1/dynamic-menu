import { formatTitle } from "@/lib/utils";
import { JSX, useEffect, useRef, useState } from "react";

export default function Menu({
  menu,
  isPortrait,
  needsDimensionSwap,
}: {
  menu: Record<string, MenuItem[]>;
  isPortrait: boolean;
  needsDimensionSwap: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    const updateRect = () => {
      if (ref.current) {
        const rect: Rect = ref.current.getBoundingClientRect();
        setRect({
          x: 0,
          y: 0,
          width: needsDimensionSwap ? rect.height : rect.width,
          height: needsDimensionSwap ? rect.width : rect.height,
        });
      }
    };
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [ref.current, isPortrait]);
  return (
    <main className="w-full h-full relative" ref={ref}>
      {rect && <MenuContent menu={menu} screen={rect} isPortrait={isPortrait} />}
    </main>
  );
}

function MenuContent({
  menu,
  screen,
  isPortrait,
}: {
  menu: Record<string, MenuItem[]>;
  screen: Rect;
  isPortrait: boolean;
}) {
  const space = "vw";

  // Darkness factor: 0.0 = no change, 1.0 = completely dark
  // Adjust this value to control how much darker the colors become
  const darknessFactor = 0.05;

  // Saturation factor: 0.0 = grayscale, 1.0 = no change, >1.0 = more saturated
  // Adjust this value to control how vibrant/saturated the colors are
  const saturationFactor = 1.15;

  // Function to adjust saturation and darkness of a hex color
  const adjustColor = (hex: string, darknessFactor: number, saturationFactor: number): string => {
    // Remove the # if present
    const color = hex.replace("#", "");

    // Parse RGB components
    let r = parseInt(color.slice(0, 2), 16);
    let g = parseInt(color.slice(2, 4), 16);
    let b = parseInt(color.slice(4, 6), 16);

    // Apply saturation adjustment
    // Convert to HSL-like adjustment by finding the average (gray component)
    const gray = (r + g + b) / 3;
    r = Math.round(gray + (r - gray) * saturationFactor);
    g = Math.round(gray + (g - gray) * saturationFactor);
    b = Math.round(gray + (b - gray) * saturationFactor);

    // Clamp values to 0-255 range
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    // Apply darkness factor
    r = Math.round(r * (1 - darknessFactor));
    g = Math.round(g * (1 - darknessFactor));
    b = Math.round(b * (1 - darknessFactor));

    // Convert back to hex
    const toHex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Original color palette
  const originalPalette = ["#97D6F4", "#F6A7EE", "#F8E486", "#A6E185", "#FEC598"];

  // Process the colors to make them darker and more saturated
  const colorPalette = originalPalette.map((color) => adjustColor(color, darknessFactor, saturationFactor));

  // Create a mapping of categories to colors
  const categories = Object.keys(menu);
  const categoryColors = categories.reduce((acc, category, index) => {
    acc[category] = colorPalette[index % colorPalette.length];
    return acc;
  }, {} as Record<string, string>);

  return (
    <>
      <div
        className={`w-full h-full flex flex-col flex-wrap justify-between`}
        style={{ padding: `1${space}`, gap: `1${space}` }}
      >
        {Object.keys(menu).map((category) => (
          <div
            key={category}
            style={{
              marginBottom: `0${space}`,
              padding: `1${space}`,
              backgroundColor: `${categoryColors[category]}CC`, // Adding 80 for 50% opacity
            }}
          >
            <h2 className="break-after-avoid font-bold" style={{ fontSize: `1.75${space}` }}>
              {formatTitle(category)}
            </h2>
            <div className="" style={{ fontSize: `1.25${space}` }}>
              {menu[category].map((item: MenuItem) => (
                <div
                  key={item.name + item.price}
                  className="w-full flex items-center justify-between break-inside-avoid"
                >
                  <h3>{item.name}</h3>
                  <h3>{item.price}</h3>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
