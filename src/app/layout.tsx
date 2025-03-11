"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import WalletProvider from "@/context/wallet-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadata = {
  title: "Hyperchain Bridge",
  description: "Aeternity Hyperchain Bridge",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          <div className="flex min-h-screen flex-col">
            <header className="flex flex-col md:flex">
              <Header />
            </header>
            <main className="flex-grow p-4">{children}</main>
            <footer className="bg-gray-300 p-4">Footer</footer>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
