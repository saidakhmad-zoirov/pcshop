import type { Metadata } from "next";
import { Chakra_Petch, Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthBootstrap from "@/components/AuthBootstrap";

const display = Chakra_Petch({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin", "cyrillic"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "PC Forge — kompyuter qismlari va yig'ish", template: "%s · PC Forge" },
  description: "Protsessor, videokarta, ona plata va boshqa qismlar. Mosligini tekshirib, kompyuteringizni yig'ing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col">
        <AuthBootstrap />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
