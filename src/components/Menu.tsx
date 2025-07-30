import { formatTitle, formatUSD } from "@/lib/utils";
import { RefObject, useEffect, useRef, useState } from "react";
import PaintBrush from "./PaintBrush";

export default function Menu({
  menu,
  isPortrait,
  needsDimensionSwap,
  nativeIsPortrait,
}: {
  menu: Record<string, MenuItem[]>;
  isPortrait: boolean;
  needsDimensionSwap: boolean;
  nativeIsPortrait: boolean;
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
  }, [isPortrait, needsDimensionSwap]);
  return (
    <main className="w-full h-full relative" ref={ref}>
      {rect && (
        <MenuContent
          menu={menu}
          screen={rect}
          nativeIsPortrait={nativeIsPortrait}
          needsDimensionSwap={needsDimensionSwap}
        />
      )}
    </main>
  );
}

function decideIsRight(
  ref: RefObject<HTMLDivElement | HTMLLIElement | null>,
  screen: Rect,
  needsDimensionSwap: boolean
): boolean {
  if (ref.current) {
    const rect: Rect = ref.current.getBoundingClientRect();
    if ((needsDimensionSwap ? rect.y : rect.x) >= screen.width / 2) return true;
  }
  return false;
}

function MenuContent({
  menu,
  screen,
  nativeIsPortrait,
  needsDimensionSwap,
}: {
  menu: Record<string, MenuItem[]>;
  screen: Rect;
  nativeIsPortrait: boolean;
  needsDimensionSwap: boolean;
}) {
  const space = nativeIsPortrait ? "vh" : "vw";

  return (
    <div className="columns-2 gap-0 h-full" style={{ columnFill: "auto", paddingTop: `1.25${space}` }}>
      {Object.entries(menu).map(([category, items], i) => {
        return (
          <div key={category + i}>
            <CategoryTitle
              space={space == "vh" ? "vw" : "vh"}
              category={category}
              screen={screen}
              needsDimensionSwap={needsDimensionSwap}
            />
            <ul style={{ marginTop: `1.25${space}`, marginBottom: `1.25${space}` }}>
              {items.map((item, i) => {
                return (
                  <MenuItem
                    key={item.name + item.price + i}
                    item={item}
                    space={space}
                    screen={screen}
                    needsDimensionSwap={needsDimensionSwap}
                  />
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function CategoryTitle({
  category,
  space,
  screen,
  needsDimensionSwap,
}: {
  category: string;
  space: "vh" | "vw";
  screen: Rect;
  needsDimensionSwap: boolean;
}) {
  const title = formatTitle(category);

  const ref = useRef<HTMLDivElement>(null);
  const [isRight, setIsRight] = useState<boolean>(false);

  useEffect(() => {
    setIsRight(decideIsRight(ref, screen, needsDimensionSwap));
  }, [screen, needsDimensionSwap]);

  return (
    <div
      style={{ breakInside: "avoid" }}
      className={`relative w-fit overflow-clip ${isRight ? "text-background" : "text-foreground"}`}
      ref={ref}
    >
      <div className="absolute w-full right-0 top-0 bottom-0 z-10" style={{ width: `50${space}` }}>
        <PaintBrush color={isRight ? undefined : "#f7f7f7"} className="h-auto w-full" />
      </div>

      <h2
        className="relative inset-0 flex items-center w-fit z-20 whitespace-nowrap"
        style={{
          fontSize: `5${space}`,
          transform: `translateY(-0.75${space})`,
          paddingLeft: `2${space}`,
          paddingRight: `10${space}`,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function MenuItem({
  item,
  space,
  screen,
  needsDimensionSwap,
}: {
  item: MenuItem;
  space: "vh" | "vw";
  screen: Rect;
  needsDimensionSwap: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [isRight, setIsRight] = useState<boolean>(false);

  useEffect(() => {
    setIsRight(decideIsRight(ref, screen, needsDimensionSwap));
  }, [screen, needsDimensionSwap]);

  return (
    <li
      ref={ref}
      className={`flex w-full justify-between items-center ${isRight ? "text-foreground" : "text-background"}`}
      style={{ paddingRight: `1.25${space}`, paddingLeft: `1.25${space}`, fontSize: `1.25${space}` }}
    >
      <div>{item.name}</div>
      <div style={{ width: `4${space}` }}>{formatUSD(item.price)}</div>
    </li>
  );
}
