import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/Navbar";
import ThemeProvider from "@/components/common/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookBazzar — Buy & Sell Books Online",
  description:
    "BookBazzar is a full-stack online bookstore where users can browse, buy, sell, and review books. Built with Next.js and ASP.NET Core.",
  keywords: ["bookstore", "buy books", "sell books", "online bookstore", "BookBazzar"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class">
          <Navbar />
          <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
