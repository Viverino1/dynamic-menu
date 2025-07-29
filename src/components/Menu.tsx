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
  const space = isPortrait ? "vw" : "vh";
  return (
    <div
      className={`w-full h-full flex flex-col flex-wrap justify-between`}
      style={{ padding: `1${space}`, gap: `1${space}` }}
    >
      {Object.keys(menu).map((category) => (
        <div key={category} className="bg-yellow-500/50" style={{ marginBottom: `0${space}`, padding: `1${space}` }}>
          <h2 className="break-after-avoid font-bold" style={{ fontSize: `1.75${space}` }}>
            {formatTitle(category)}
          </h2>
          <div className="" style={{ fontSize: `1.25${space}` }}>
            {menu[category].map((item: MenuItem) => (
              <div key={item.name + item.price} className="w-full flex items-center justify-between break-inside-avoid">
                <h3>{item.name}</h3>
                <h3>{item.price}</h3>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
