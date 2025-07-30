import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Desibites STL Dynamic Menu",
  description: "Dynamic menu app for Desibites STL",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body>{children}</body>
    </html>
  );
}
