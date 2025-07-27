import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { google, sheets_v4 } from "googleapis";

const redis = Redis.fromEnv();

const sheets: sheets_v4.Sheets = google.sheets({
  version: "v4",
  auth: new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  }),
});

export async function POST(request: Request) {
  const { deviceId }: { deviceId: string } = await request.json();
  const device: Device = {
    name: `device-${deviceId.slice(0, 4)}`,
    deviceId: deviceId,
    orientation: "portrait",
    invert: false,
    categories: [],
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Settings",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[device.name, device.deviceId, device.orientation]],
    },
  });

  return NextResponse.json({ message: "Device registered successfully!" });
}
