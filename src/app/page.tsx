import Bridge from "@/components/bridge";

export default function Page() {
  return (
    <div className="mt-12 mb-9 flex flex-col md:my-20 md:w-[810px]">
      <h1 className="mb-4 text-4xl font-semibold">Hyperchain Bridge</h1>
      <span className="font-roboto text-muted-foreground hidden text-sm md:flex">
        Bridge your assets between Aeternity mainnet and Hyperchains
      </span>
      <Bridge />
    </div>
  );
}
