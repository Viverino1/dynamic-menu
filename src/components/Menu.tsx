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

  // Function to process items and combine family pack items
  const processItems = (items: MenuItem[]) => {
    const processed: (MenuItem & { familyPrice?: number })[] = [];
    const familyPackItems = new Map<string, MenuItem>();

    // First pass: collect family pack items
    items.forEach((item) => {
      if (item.tags?.includes("family-pack")) {
        familyPackItems.set(item.name, item);
      }
    });

    // Second pass: process regular items and add family prices
    items.forEach((item) => {
      if (!item.tags?.includes("family-pack")) {
        const familyItem = familyPackItems.get(item.name);

        if (familyItem) {
          processed.push({
            ...item,
            familyPrice: familyItem.price,
          });
        } else {
          processed.push(item);
        }
      }
    });

    // Sort items: those with family prices go to the end
    return processed.sort((a, b) => {
      if (a.familyPrice && !b.familyPrice) return 1; // a goes to end
      if (!a.familyPrice && b.familyPrice) return -1; // b goes to end
      return 0; // maintain original order for items of same type
    });
  };

  return (
    <div
      className="columns-2 gap-0 h-full"
      style={{
        columnFill: "auto",
        paddingTop: `1.25${space}`,
        paddingBottom: `1.25${space}`,
      }}
    >
      {Object.entries(menu).map(([category, items], i) => {
        const processedItems = processItems(items);

        return (
          <div
            className="flex flex-col"
            key={category + i}
            style={{ marginTop: `${i == 0 ? 0 : 1.25}${space}`, gap: `1.25${space}` }}
          >
            <CategoryTitle
              space={space == "vh" ? "vw" : "vh"}
              category={category}
              screen={screen}
              needsDimensionSwap={needsDimensionSwap}
            />
            <ul className="flex flex-col" style={{ gap: `.35${space}` }}>
              {processedItems.map((item, i) => {
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

  const invertSpace = space === "vh" ? "vw" : "vh";

  useEffect(() => {
    setIsRight(decideIsRight(ref, screen, needsDimensionSwap));
  }, [screen, needsDimensionSwap]);

  return (
    <div className="flex justify-between">
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
      {/* <div
        className="flex items-end font-bold"
        style={{ marginRight: `1.25${invertSpace}`, fontSize: `.85${invertSpace}`, gap: `0.5${invertSpace}` }}
      >
        <div
          className={`flex items-center justify-center ${isRight ? "text-foreground" : "text-background"}`}
          style={{ width: `3${invertSpace}` }}
        >
          FM
        </div>
        <div
          className={`flex items-center justify-center ${isRight ? "text-foreground" : "text-background"}`}
          style={{ width: `3${invertSpace}` }}
        >
          REG
        </div>
      </div> */}
    </div>
  );
}

function MenuItem({
  item,
  space,
  screen,
  needsDimensionSwap,
}: {
  item: MenuItem & { familyPrice?: number };
  space: "vh" | "vw";
  screen: Rect;
  needsDimensionSwap: boolean;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const [isRight, setIsRight] = useState<boolean>(false);

  useEffect(() => {
    setIsRight(decideIsRight(ref, screen, needsDimensionSwap));
  }, [screen, needsDimensionSwap]);

  // Check if it's weekend (Saturday = 6, Sunday = 0)
  const isWeekend = () => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  };

  // Don't render weekend special items if it's not weekend
  if (item.name.includes("(weekend Spl)") && !isWeekend()) {
    return null;
  }

  return (
    <li
      ref={ref}
      className={`flex w-full justify-between items-center font-bold ${
        item.availability != "available" ? "line-through opacity-50" : "opacity-100"
      } ${isRight ? "text-foreground" : "text-background"}`}
      style={{
        paddingRight: `1.25${space}`,
        paddingLeft: `1.25${space}`,
        fontSize: `1.25${space}`,
        gap: `0.5${space}`,
      }}
    >
      <div className="whitespace-nowrap truncate">{item.name.replace("(weekend Spl)", "")}</div>
      <div className="flex items-center" style={{ gap: `0.5${space}`, fontSize: `.85${space}` }}>
        {item.familyPrice && <div style={{ width: `3${space}` }}>{formatUSD(item.familyPrice)}</div>}
        <div style={{ width: `3${space}` }}>{formatUSD(item.price)}</div>
      </div>
    </li>
  );
}
