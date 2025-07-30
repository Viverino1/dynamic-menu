"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Pusher from "pusher-js";
import { getDeviceId } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSheetData() {
  const { data, mutate }: { data: SheetData | undefined; mutate: () => void } = useSWR("/api/sheet", fetcher);

  const [state, setState] = useState<State>("loading");
  const [device, setDevice] = useState<Device | null>(null);
  const [menu, setMenu] = useState<Record<string, MenuItem[]>>({});

  useEffect(() => {
    if (data && data.menuItems) {
      const deviceId = getDeviceId();
      const newDevice = data.devices.find((d) => d.deviceId === deviceId);
      if (!newDevice) {
        fetch("/api/device", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ deviceId }),
        }).catch(() => {
          setState("error");
        });
      } else {
        const newMenu: Record<string, MenuItem[]> = {};

        for (const category of newDevice?.categories ?? []) {
          newMenu[category] = data.menuItems.filter((item) => item.category === category);
        }

        // Only update state if there is a change
        const isMenuChanged = JSON.stringify(menu) !== JSON.stringify(newMenu);
        const isDeviceChanged = JSON.stringify(device) !== JSON.stringify(newDevice);

        if (isMenuChanged) setMenu(newMenu);
        if (isDeviceChanged) setDevice(newDevice);

        setState("success");
      }
    }
  }, [data, device, menu]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe("sheet-channel");
    channel.bind("sheet-updated", () => {
      mutate(); // re-fetch fresh data on update
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [mutate]);

  return { menu, device, state };
}
