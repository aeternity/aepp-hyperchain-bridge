import "../public/globals.css";

import { SnackbarProvider } from "notistack";

import Footer from "./components/footer";
import Header from "./components/header";
import AppProvider from "./context/app-provider";
import WalletProvider from "./context/wallet-provider";

import Bridge from "./pages/bridge";

export default function App() {
  return (
    <SnackbarProvider>
      <AppProvider>
        <WalletProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="max-w-screen-2xl flex-1 self-center px-4 xl:px-0">
              <Bridge />
            </main>
            <Footer />
          </div>
        </WalletProvider>
      </AppProvider>
    </SnackbarProvider>
  );
}
