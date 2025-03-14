"use client";

import "../../public/globals.css";
import { SnackbarProvider } from "notistack";

import Footer from "@/components/footer";
import Header from "@/components/header";
import AppProvider from "@/context/app-provider";
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
        <SnackbarProvider>
          <AppProvider>
            <WalletProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="max-w-screen-2xl flex-1 self-center px-4 xl:px-0">{children}</main>
                <Footer />
              </div>
            </WalletProvider>
          </AppProvider>
        </SnackbarProvider>
      </body>
    </html>
  );
}
