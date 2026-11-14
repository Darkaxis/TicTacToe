import type { Metadata } from "next";
import { Rajdhani, Chakra_Petch, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PRTS // TACTICAL MATRIX — Rhodes Island Tic-Tac-Toe",
  description:
    "Arknights PRTS Neural Tactical Simulation Matrix — React 19, Next.js, Tailwind CSS, and shadcn/ui.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${rajdhani.variable} ${chakraPetch.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans bg-[#090A0D] text-[#ECEAE4] antialiased">
        {children}
      </body>
    </html>
  );
}

