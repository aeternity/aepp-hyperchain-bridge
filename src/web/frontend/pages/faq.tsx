import Title from "../components/base/title";

export default function FAQ() {
  return (
    <main className="flex flex-1 flex-row overflow-hidden">
      <div className="overflow-x-scroll bg-white shadow rounded-md mt-12 mb-9 flex-col max-sm:my-5 md:my-20 md:w-[600px] max-w-screen-2xl px-4 m-auto z-10 h-[calc(100dvh-20rem)] max-md:h-[calc(100dvh-15rem)]">
        <Title title="Frequently Asked Questions (FAQs)" className="my-4" />

        <h2 className="text-2xl font-semibold my-4">
          What is the Hyperchains Bridge?
        </h2>
        <p className="mb-3 text-sm">
          The Hyperchains Bridge is a decentralized application (dApp) that
          enables seamless and secure transfers of tokens between the æternity
          Layer 1 blockchain and its modular Hyperchains. It establishes a
          trustless connection between networks without relying on centralized
          intermediaries.
        </p>
        <div className="divider" />

        <h2 className="text-2xl font-semibold my-4">
          How does the Hyperchains Bridge work?
        </h2>
        <p className="mb-3 text-sm">
          The bridge operates in two main steps:
          <ul className="m-4 [&>li]:mb-2 list-decimal">
            <li>
              <b className="font-semibold">Initiating a Transfer:</b> A user
              triggers a bridge action through smart contracts, specifying asset
              details and the destination chain.
            </li>
            <li>
              <b className="font-semibold">Verification and Completion:</b> The
              bridge backend listens for the event, verifies it, and completes
              the transaction on the destination network — minting or releasing
              tokens as needed.
            </li>
          </ul>
          All transactions are cryptographically secured and validated on both
          ends.
        </p>
        <div className="divider" />

        <h2 className="text-2xl font-semibold my-4">What are Hyperchains?</h2>
        <p className="mb-3 text-sm">
          Hyperchains are modular, independent blockchain instances that are
          cryptographically anchored to a safer PoW network.. Each Hyperchain
          can be optimized for specific applications, allowing scalable and
          customized blockchain environments.
        </p>
        <div className="divider" />

        <h2 className="text-2xl font-semibold my-4">
          Why is the Hyperchains Bridge important?
        </h2>
        <p className="mb-3 text-sm">
          The bridge is a critical piece of infrastructure that:
          <ul className="m-4 [&>li]:mb-2 list-disc">
            <li>Expands token utility across different chains.</li>
            <li>
              Strengthens Proof of Stake (PoS) dynamics by redistributing tokens
              among participants.
            </li>
            <li>
              Supports horizontal scaling by connecting specialized blockchains.
            </li>
            <li>
              Enables developers to build decentralized applications that
              operate across multiple blockchain environments.
            </li>
          </ul>
        </p>
        <div className="divider" />

        <h2 className="text-2xl font-semibold my-4">
          Is the Hyperchains Bridge secure?
        </h2>
        <p className="mb-3 text-sm">
          Yes. Security and decentralization are core principles. The bridge:
          <ul className="m-4 [&>li]:mb-2 list-disc">
            <li>Uses Sophia smart contracts for on-chain validation.</li>
            <li>Verifies digital signatures and transaction metadata.</li>
            <li>
              Employs backend infrastructure built with modern, secure
              technologies (Bun.js, Supabase).
            </li>
            <li>
              Operates without custodial intermediaries — users remain in
              control of their assets.
            </li>
          </ul>
        </p>
        <div className="divider" />

        <h2 className="text-2xl font-semibold my-4">
          What assets can I transfer?
        </h2>
        <p className="mb-3 text-sm">
          You can bridge native Hyperchain coins, native $AE coins , and AEX-9
          tokens on both directions.
        </p>
        <div className="divider" />

        <h2 className="text-2xl font-semibold my-4">
          Are there fees for using the bridge?
        </h2>
        <p className="mb-3 text-sm">
          Like most blockchain operations, using the bridge may involve network
          fees (such as gas fees) However, the bridge itself does not impose
          additional service charges beyond those blockchain-native costs.
        </p>
        <div className="divider" />

        <h2 className="text-2xl font-semibold my-4">
          How fast are asset transfers?
        </h2>
        <p className="mb-3 text-sm">
          Transfers are processed as soon as blockchain confirmations are
          received. Thanks to the event-driven design of the bridge,
          transactions are completed quickly — often within seconds to a few
          minutes, depending on network conditions.
        </p>
        <div className="divider" />

        <h2 className="text-2xl font-semibold my-4">
          Can developers build on top of the bridge?
        </h2>
        <p className="mb-3 text-sm">
          Absolutely. Developers can integrate bridge functionality into their
          decentralized applications (dApps), enabling cross-chain token
          movement and interactions. Documentation and code examples are
          available to help accelerate integration.
        </p>
        <div className="divider" />

        <h2 className="text-2xl font-semibold my-4">
          Where can I learn more or get started?
        </h2>
        <p className="mb-3 text-sm">
          You can:
          <ul className="m-4 [&>li]:mb-2 list-disc">
            <li>
              Visit the{" "}
              <a
                href="https://github.com/aeternity/aepp-hyperchain-bridge"
                className="text-blue-500 hover:text-blue-700"
                target="_blank"
              >
                Hyperchains Bridge GitHub repository
              </a>{" "}
              for technical resources.
            </li>
            <li>
              Join the æternity community on{" "}
              <a
                href="https://t.me/aeternity"
                className="text-blue-500 hover:text-blue-700"
                target="_blank"
              >
                Telegram
              </a>{" "}
              or{" "}
              <a
                href="https://forum.aeternity.com"
                className="text-blue-500 hover:text-blue-700"
                target="_blank"
              >
                aeternity forum
              </a>{" "}
              to ask questions and collaborate with others.
            </li>
          </ul>
        </p>
      </div>
    </main>
  );
}
