import { Field, Label } from "@/components/base/fieldset";
import {
  Listbox,
  ListboxLabel,
  ListboxOption,
  ListboxDescription,
} from "@/components/base/listbox";
import { shorten } from "@/utils/formatters";

interface Props {
  tokens: Token[];
  className?: string;
  isLoading: boolean;
  onSelect: (item: Token) => void;
}

export default function TokenSelect({ tokens, onSelect, className, isLoading }: Props) {
  return (
    <Field className={className}>
      <Label>Token To Bridge</Label>
      <Listbox className="cursor-pointer" placeholder={isLoading ? "Loading..." : "Select a token"}>
        {tokens.map((token: Token) => (
          <ListboxOption
            key={token.address}
            value={token.address}
            className="cursor-pointer"
            onClick={() => onSelect(token)}
          >
            <ListboxLabel>{`${token.balance} ${token.symbol} (${token.name})`}</ListboxLabel>
            <ListboxDescription>{shorten(token.address)}</ListboxDescription>
          </ListboxOption>
        ))}
      </Listbox>
    </Field>
  );
}
