import { formatBalance } from "@/frontend/utils/formatters";
import { Token } from "@aepp-hyperchain-bridge/shared";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  className?: string;
  tokens: Token[];
  error?: string;
  onSelect: (tokenAddress: string) => void;
}

export default function TokenSelect({
  tokens,
  className,
  error,
  onSelect,
}: Props) {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) =>
    onSelect(event.target.value);

  return (
    <fieldset className={`fieldset ${className}`}>
      <legend className="fieldset-legend ">
        <span className="font-semibold">Token</span>
        <div
          className="tooltip ml-1 self-center font-normal"
          data-tip="Token to be bridged"
        >
          <InformationCircleIcon width={14} height={14} />
        </div>
      </legend>
      <select
        defaultValue="Select a token"
        className={`select ${!!error ? "select-error" : ""}`}
        onChange={handleSelect}
      >
        <option disabled={true}>Select a token</option>
        {tokens.map(({ address, balance, name, decimals, symbol }) => (
          <option key={address} value={address}>
            {`${formatBalance({ balance, decimals })} ${symbol} (${name})`}
          </option>
        ))}
      </select>
      <span className="fieldset-label text-error">{error}</span>
    </fieldset>
  );
}
