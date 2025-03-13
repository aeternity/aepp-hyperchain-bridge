import { Field, Label } from "@/components/base/fieldset";
import {
  Listbox,
  ListboxLabel,
  ListboxOption,
  ListboxDescription,
} from "@/components/base/listbox";
import { Network } from "@/constants/networks";

interface Props {
  className?: string;
  networks: Network[];
  selectedNetwork: Network;
  onSelect: (item: Network) => void;
}

export default function NetworkSelect({ networks, selectedNetwork, className, onSelect }: Props) {
  return (
    <Field className={className}>
      <Label>Destination Network</Label>
      <Listbox className="cursor-pointer" value={selectedNetwork.name}>
        {networks.map((network: Network) => (
          <ListboxOption
            key={network.id}
            value={network.name}
            className="cursor-pointer"
            onClick={() => onSelect(network)}
          >
            <ListboxLabel>{network.name}</ListboxLabel>
            <ListboxDescription>{network.url}</ListboxDescription>
          </ListboxOption>
        ))}
      </Listbox>
    </Field>
  );
}
