import Title from "../components/base/title";

export default function Docs() {
  return (
    <main className="flex flex-1 flex-row overflow-hidden">
      <div className="overflow-x-scroll bg-white shadow rounded-md mt-12 mb-9 flex-col max-sm:my-5 md:my-20 md:w-[600px] max-w-screen-2xl px-4 m-auto z-10 h-[calc(100dvh-20rem)] max-md:h-[calc(100dvh-15rem)]">
        <Title title="Documentation" className="my-4" />
        <p className="mb-3 flex text-sm ml-2">
          The Hyperchains Bridge is a decentralized application (dApp) that
          forms the foundational infrastructure for cross-chain communication
          within the æternity ecosystem. It establishes a direct, trustless
          connection between the æternity blockchain and its network of modular
          Hyperchains.
        </p>
        <p className="mb-3 flex text-sm">
          By securing token transfers with cryptographic proofs and eliminating
          the need for centralized intermediaries, the Hyperchains Bridge
          enables seamless movement of assets across chains. It empowers
          developers and users alike to interact effortlessly across different
          execution environments, laying the groundwork for a scalable,
          interconnected blockchain ecosystem.
        </p>

        <div className="divider" />

        <h2 className="text-2xl font-semibold my-4">Why is it important ?</h2>
        <p className="mb-3 flex text-sm">
          Beyond its technical role, the Hyperchains Bridge plays a crucial part
          in strengthening the utility, security, and scalability of Hyperchains
          within the æternity ecosystem.
        </p>
        <ul className="text-sm list-disc list [&>li]:ml-4 [&>li]:mb-2">
          <li>
            It enables users to bridge assets back to the æternity mainnet as
            wrapped tokens, facilitating deeper liquidity and enabling the
            creation of new trading pairs on decentralized exchanges (DEXs).
          </li>
          <li>
            By supporting the redistribution of tokens across chains, the bridge
            enhances Proof of Stake (PoS) dynamics — promoting a healthier, more
            distributed stake among validators, delegators, and participants of
            Hyperchains.
          </li>
          <li>
            This wider distribution directly contributes to the security,
            resilience, and decentralization of Hyperchains, ensuring their
            long-term viability and strengthening their role within the broader
            æternity ecosystem.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold my-4">
          How to connect your Superhero Wallet to the demo Hyperchain
        </h2>
        <div className="mb-3 flex text-sm">
          <ul className="list-decimal ml-4 [&>li]:mb-2">
            <li>
              Open your Superhero wallet and click on the networks menu on the
              top
            </li>
            <li>Click on "More"</li>
            <li>Introduce "Network name" = aehc_demo</li>
            <li>
              Scroll down until the aeternity network section and paste these
              values:
            </li>
            <ul className="list-disc ml-4 [&>li]:mb-2">
              <li>Network URL: https://demo.hyperchains.aeternity.io</li>
              <li>
                Network middleware: https://demo.hyperchains.aeternity.io:8443
              </li>
              <li>Leave tipping backend as it is.</li>
              <li>Explorer: https://aescan.demo.hyperchains.aepps.com</li>
            </ul>
            <li>
              Now you are ready to get some demo hyperchain coins from the
              faucet at{" "}
              <a
                href="https://faucet.demo.hyperchains.aepps.com"
                className="text-blue-500 hover:text-blue-700"
                target="_blank"
              >
                https://faucet.demo.hyperchains.aepps.com
              </a>{" "}
              and complete your bridges from and to the demo hyperchain.
            </li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold my-4">
          How the Hyperchains Bridge works
        </h2>
        <p className="mb-3 flex text-sm">
          When you move assets between the Aeternity blockchain and a
          Hyperchain, the process is secure, smooth, and efficient. Here’s a
          simple look at what happens behind the scenes:
        </p>
        <h3 className="text-lg font-medium">1. Start a transfer</h3>
        <p className="mb-3 flex text-sm">
          You begin by submitting a request through our bridge app. Whether
          you're sending tokens to a Hyperchain or bringing them back to
          Aeternity, you simply specify the amount, the type of asset, and the
          destination.
        </p>

        <h3 className="text-lg font-medium">2. Secure Smart Contracts</h3>
        <p className="mb-3 flex text-sm">
          Your request is picked up by special smart contracts — self-executing
          programs living on the blockchain. These contracts lock (or "freeze")
          your assets safely on the starting network, making sure no one else
          can access them while the transfer is in progress.
        </p>

        <h3 className="text-lg font-medium">3. Monitor and confirm</h3>
        <p className="mb-3 flex text-sm">
          The system monitors both Aeternity and the Hyperchains for your
          transaction. Once your locked assets are confirmed on the source
          chain, the system triggers the next step automatically — no manual
          intervention required.
        </p>

        <h3 className="text-lg font-medium">4. Minting or releasing assets</h3>
        <ul className="mb-3 text-sm list-disc ml-4 [&>li]:mb-2">
          <li>
            If you are sending assets to a Hyperchain, fresh tokens ("wrapped"
            versions of your original assets) are created on the Hyperchain and
            sent to your wallet.
          </li>
          <li>
            If you are bringing assets back to Aeternity, the original locked
            tokens are released to you after burning the wrapped tokens on the
            Hyperchain.
          </li>
        </ul>

        <h3 className="text-lg font-medium">5. Complete and verified</h3>
        <p className="mb-3 flex text-sm">
          The entire process is verified by the bridge's secure backend,
          ensuring that your transfer is fast, traceable, and tamper-proof. At
          every step, advanced cryptographic proofs and blockchain records
          guarantee the security of your assets.
        </p>
      </div>
    </main>
  );
}
