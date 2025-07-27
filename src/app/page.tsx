"use client";

import { useSheetData } from "@/hooks/useSheetData";

export default function HomePage() {
  const { menu, error } = useSheetData();

  if (error) return <div>Error loading sheet data.</div>;
  if (!menu) return <div>Loading...</div>;

  return <main></main>;
}
