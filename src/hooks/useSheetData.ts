"use client";

import { useEffect } from "react";
import useSWR from "swr";
import Pusher from "pusher-js";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useSheetData() {
  const {
    data,
    error,
    mutate,
  }: { data: SheetData | undefined; error: any; mutate: () => void } = useSWR(
    "/api/sheet",
    fetcher
  );

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

  return { menu: data?.menuItems, error };
}
