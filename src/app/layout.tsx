import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { MarketTicker } from "@/components/layout/market-ticker";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "PortfolioIQ — Smart Portfolio Analysis for Indian Investors",
  description:
    "Upload holdings from CDSL, NSDL, or any broker. Analyze returns, compare with NIFTY 50 & Sensex, get smart allocation suggestions.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <ThemeProvider>
          <Navbar user={session} />
          <MarketTicker />
          <main className="min-h-[calc(100vh-6rem)]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
