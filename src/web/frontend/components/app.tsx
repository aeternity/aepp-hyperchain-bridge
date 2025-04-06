import "../assets/globals.css";

import { SnackbarProvider } from "notistack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Footer from "./footer";
import Header from "./header";
import Bridge from "../pages/bridge";
import AppProvider from "../context/app-provider";
import WalletProvider from "../context/wallet-provider";
import NetworkProvider from "../context/network-provider";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider>
        <AppProvider>
          <WalletProvider>
            <NetworkProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <Bridge />
                <Footer />
              </div>
            </NetworkProvider>
          </WalletProvider>
        </AppProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}
