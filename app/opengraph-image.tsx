import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FamilyLedger — Household money, clearly handled.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#e8ebe6",
          padding: 72,
          fontFamily: "system-ui, sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            backgroundColor: "#0e0f0c",
            borderRadius: 32,
            padding: 64,
            color: "#e8ebe6"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 24,
              fontWeight: 600
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "rgba(232, 235, 230, 0.12)",
                color: "#9fe870",
                fontSize: 24
              }}
            >
              Rp
            </div>
            <span>FamilyLedger</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 22,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: "#9fe870"
              }}
            >
              For Indonesian households
            </span>
            <div
              style={{
                display: "flex",
                fontSize: 76,
                lineHeight: 1.05,
                fontWeight: 900,
                color: "#9fe870",
                marginTop: 24,
                maxWidth: 950
              }}
            >
              Household money, clearly handled.
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 28,
                lineHeight: 1.3,
                color: "rgba(232, 235, 230, 0.78)",
                marginTop: 28,
                maxWidth: 900
              }}
            >
              Track income, expenses, accounts, budgets, and goals in IDR — no
              bank connection required.
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
