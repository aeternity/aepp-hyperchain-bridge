"use client";

import "./globals.css";
import Header from "@/components/header";
import WalletProvider from "@/context/wallet-provider";

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
      <body className={`antialiased`}>
        <WalletProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="max-w-screen-2xl flex-1 self-center px-4 xl:px-0">{children}</main>
            <footer className="bg-gray-300 p-4">Footer</footer>
          </div>
        </WalletProvider>
      </body>
    </html>
  );
}
