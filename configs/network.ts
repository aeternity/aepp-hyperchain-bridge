import { MemoryAccount } from "@aeternity/aepp-sdk";

export interface Network {
  id: string;
  url: string;
  compilerUrl: string;
  getFundingAccount: () => Promise<MemoryAccount>;
}

export const aeTest: Network = {
  id: "ae_uat",
  url: "https://testnet.aeternity.io/",
  compilerUrl: "https://v8.compiler.aepps.com",
  getFundingAccount: async () => {
    const account = MemoryAccount.generate();

    const { status } = await fetch(
      `https://faucet.aepps.com/account/${account.address}`,
      {
        method: "POST",
      }
    );
    console.assert(
      [200, 425].includes(status),
      "Invalid faucet response code",
      status
    );

    return account;
  },
};

export const hcLocal: Network = {
  id: "hc_bridge_test",
  url: "http://localhost:3013",
  compilerUrl: "https://v8.compiler.aepps.com",
  getFundingAccount: async () => {
    return new MemoryAccount(
      "sk_24NRbUWuc2JXMLYwnTBWxX1HPnTRW7q4xUmWi3XygMbWGufvag"
    );
  },
};

export const hcPerf: Network = {
  id: "aehc_perf",
  url: "https://perf.hyperchains.aeternity.io/",
  compilerUrl: "https://v8.compiler.aepps.com",
  getFundingAccount: async () => {
    return new MemoryAccount(
      "sk_24NRbUWuc2JXMLYwnTBWxX1HPnTRW7q4xUmWi3XygMbWGufvag"
    );
  },
};
