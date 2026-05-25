import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Ledger",
  description:
    "A family financial management dashboard for manual household records.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
