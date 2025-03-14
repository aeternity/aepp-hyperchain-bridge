import { ErrorMessage, Field, Label } from "@/components/base/fieldset";
import {
  Listbox,
  ListboxLabel,
  ListboxOption,
  ListboxDescription,
} from "@/components/base/listbox";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  className?: string;
  networks: Network[];
  isLoading: boolean;
  error?: string;
  onSelect: (networkId: string) => void;
}

export default function NetworkSelect({ networks, className, isLoading, error, onSelect }: Props) {
  return (
    <Field className={className}>
      <Label className="flex flex-row">
        <span className="font-semibold">Destination Network</span>
        <div
          className="tooltip ml-1 self-center"
          data-tip="Network where the token will be bridged to"
        >
          <InformationCircleIcon width={14} height={14} />
        </div>
      </Label>

      <Listbox
        invalid={!!error}
        className="cursor-pointer"
        placeholder={isLoading ? "Loading..." : "Select a network"}
      >
        {networks.map((network: Network) => (
          <ListboxOption
            key={network.id}
            value={network.name}
            className="cursor-pointer"
            onClick={() => onSelect(network.id)}
          >
            <ListboxLabel className="font-medium">{network.name}</ListboxLabel>
            <ListboxDescription>{network.url}</ListboxDescription>
          </ListboxOption>
        ))}
      </Listbox>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Field>
  );
}
