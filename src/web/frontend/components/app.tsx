import "../assets/globals.css";

import { SnackbarProvider } from "notistack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Footer from "./footer";
import Header from "./header";
import Bridge from "../pages/bridge";
import WalletProvider from "../context/wallet-provider";
import NotificationProvider from "../context/notification-provider";
import BridgeActionProvider from "../context/bridge-action-provider";
import NetworkBalanceProvider from "../context/network-balance-provider";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <NotificationProvider>
          <WalletProvider>
            <NetworkBalanceProvider>
              <BridgeActionProvider>
                <div className="flex min-h-screen flex-col">
                  <Header />
                  <Bridge />
                  <Footer />
                </div>
              </BridgeActionProvider>
            </NetworkBalanceProvider>
          </WalletProvider>
        </NotificationProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}
