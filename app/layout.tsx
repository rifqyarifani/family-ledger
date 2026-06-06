import type { Metadata } from "next";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { themeStorageKey } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://familyledger.app"
  ),
  title: {
    default: "FamilyLedger — Household money, clearly handled.",
    template: "%s · FamilyLedger"
  },
  description:
    "Track income, expenses, accounts, budgets, and savings goals with your family — in IDR, no bank connection required.",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png"
  },
  openGraph: {
    title: "FamilyLedger — Household money, clearly handled.",
    description:
      "The shared workspace where Indonesian families record income, expenses, accounts, budgets, and goals in IDR.",
    type: "website",
    locale: "id_ID"
  },
  twitter: {
    card: "summary_large_image",
    title: "FamilyLedger — Household money, clearly handled.",
    description:
      "The shared workspace where Indonesian families record income, expenses, accounts, budgets, and goals in IDR."
  }
};

const themeScript = `
(function () {
  try {
    var storedPreference = window.localStorage.getItem("${themeStorageKey}");
    var preference = storedPreference === "light" || storedPreference === "dark" || storedPreference === "system"
      ? storedPreference
      : "system";
    var systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = preference === "system" ? (systemDark ? "dark" : "light") : preference;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themePreference = preference;
  } catch (error) {
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.themePreference = "system";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <AnalyticsProvider />
      </body>
    </html>
  );
}
