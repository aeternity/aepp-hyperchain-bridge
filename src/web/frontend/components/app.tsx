import "../assets/globals.css";

import { SnackbarProvider } from "notistack";
import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Footer from "./footer";
import Header from "./header";
import FAQ from "../pages/faq";
import Docs from "../pages/docs";
import Bridge from "../pages/bridge";

import WalletProvider from "../context/wallet-provider";
import NotificationProvider from "../context/notification-provider";
import BridgeActionProvider from "../context/action-provider";
import NetworkBalanceProvider from "../context/balance-provider";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <NotificationProvider>
          <WalletProvider>
            <NetworkBalanceProvider>
              <BridgeActionProvider>
                <BrowserRouter>
                  <div className="flex min-h-screen flex-col relative overflow-hidden">
                    <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[url(../assets/hc-logo.svg)] bg-[auto_50px] z-[0] opacity-5 rotate-[30deg] bg-repeat-space pointer-events-none"></div>
                    <Header />
                    <Routes>
                      <Route path="/" element={<Bridge />} />
                      <Route path="/docs" element={<Docs />} />
                      <Route path="/faq" element={<FAQ />} />
                    </Routes>
                    <Footer />
                  </div>
                </BrowserRouter>
              </BridgeActionProvider>
            </NetworkBalanceProvider>
          </WalletProvider>
        </NotificationProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}
