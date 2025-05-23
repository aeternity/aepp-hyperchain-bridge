import { Network } from "@/types/network";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  className?: string;
  networks: Network[];
  error?: string;
  value: string;
  onSelect: (networkId: string) => void;
}

export default function NetworkSelect({
  networks,
  className,
  error,
  value,
  onSelect,
}: Props) {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) =>
    onSelect(event.target.value);

  return (
    <fieldset className={`fieldset ${className}`}>
      <legend className="fieldset-legend gap-0">
        <span className="font-semibold">Destination Network</span>
        <div
          className="tooltip ml-1 self-center font-normal"
          data-tip="Network where the token will be bridged to"
        >
          <InformationCircleIcon width={14} height={14} />
        </div>
      </legend>
      <select
        className={`select ${!!error && "select-error"}`}
        value={value || "Select a network"}
        onChange={handleSelect}
      >
        <option disabled={true}>Select a network</option>
        {networks.map(({ id, name }) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
      <span className="fieldset-label text-error">{error}</span>
    </fieldset>
  );
}
