import type { Metadata } from "next";
import { AnalyticsProvider } from "@/components/analytics-provider";
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
      <body>
        {children}
        <AnalyticsProvider />
      </body>
    </html>
  );
}
