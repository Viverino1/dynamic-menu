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
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Quicksand:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-quicksand">{children}</body>
    </html>
  );
}
