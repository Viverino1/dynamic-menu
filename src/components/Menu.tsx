import { formatTitle } from "@/lib/utils";
import { JSX, useEffect, useRef, useState } from "react";

export default function Menu({
  menu,
  device,
  isPortrait,
  needsDimensionSwap,
}: {
  menu: Record<string, MenuItem[]>;
  device: Device;
  isPortrait: boolean;
  needsDimensionSwap: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateRect = () => (ref.current ? setRect(ref.current.getBoundingClientRect()) : null);
    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [ref.current, isPortrait]);
  return (
    <main className="w-full h-full relative" ref={ref}>
      {rect && (
        <MenuContent
          menu={menu}
          screen={{
            x: 0,
            y: 0,
            width: needsDimensionSwap ? rect.height : rect.width,
            height: needsDimensionSwap ? rect.width : rect.height,
          }}
          isPortrait={isPortrait}
        />
      )}
    </main>
  );
}

function MenuItem({ item, rect }: { item: MenuItem; rect: Rect }) {
  return (
    <h3
      className="border w-full h-full overflow-clip"
      style={{ position: "absolute", width: rect.width, height: rect.height, top: rect.y, left: rect.x }}
    >
      {item.name}
    </h3>
  );
}

function Category({ category, rect }: { category: Category; rect: Rect }) {
  return (
    <h3
      className="border w-full h-full overflow-clip"
      style={{ position: "absolute", width: rect.width, height: rect.height, top: rect.y, left: rect.x }}
    >
      {formatTitle(category)}
    </h3>
  );
}

const ITEM_HEIGHT = 0.1 / 2; // Value in percentage of the container height.

function MenuContent({
  menu,
  screen,
  isPortrait,
}: {
  menu: Record<string, MenuItem[]>;
  screen: Rect;
  isPortrait: boolean;
}) {
  const elements: JSX.Element[] = [];

  let prevRect: Rect = { x: 0, y: 0, width: 0, height: 0 };

  const itemWidth = isPortrait ? screen.width / 2 : screen.width / 4;
  const itemHeight = screen.height * ITEM_HEIGHT;
  const categoryHeight = itemHeight * 2;

  const func = (isCategory: boolean = false) => {
    const rect: Rect = {
      x: prevRect.x,
      y: prevRect.y + prevRect.height,
      width: itemWidth,
      height: isCategory ? categoryHeight : itemHeight,
    };

    if (rect.y + rect.height > screen.height + 1) {
      // If the next item would overflow the screen, reset to the top of the next column.
      rect.x += itemWidth;
      rect.y = 0;
    }

    prevRect = rect;

    return rect;
  };

  for (const [category, items] of Object.entries(menu)) {
    const rect = func(true);
    elements.push(<Category key={category} category={category as Category} rect={rect} />);
    for (const item of items) {
      const rect = func();
      elements.push(<MenuItem key={`${category}-${item.name}`} item={item} rect={rect} />);
    }
  }

  return <>{elements}</>;
}
