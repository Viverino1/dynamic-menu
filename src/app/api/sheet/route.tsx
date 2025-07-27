import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function GET() {
  const sheetData = await redis.get("sheetData");

  if (!sheetData) {
    return NextResponse.json({ message: "No data found" }, { status: 404 });
  }
  return NextResponse.json(sheetData);
}

export async function POST(request: Request) {
  const data = await request.json();
  console.log(
    `Sheet data is being updated at ${new Date().toLocaleTimeString()} on ${new Date().toLocaleDateString()}`
  );

  await redis.set("sheetData", JSON.stringify(data));

  await pusher.trigger("sheet-channel", "sheet-updated", {});

  return NextResponse.json({ message: "Data updated successfully!" });
}
