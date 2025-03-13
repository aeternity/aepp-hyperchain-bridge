import { Field, Label } from "@/components/base/fieldset";
import {
  Listbox,
  ListboxLabel,
  ListboxOption,
  ListboxDescription,
} from "@/components/base/listbox";

interface Props {
  tokens: Token[];
  className?: string;
  selectedToken: Token;
  onSelect: (item: Token) => void;
}

export default function TokenSelect({ tokens, selectedToken, onSelect, className }: Props) {
  return (
    <Field className={className}>
      <Label>Token</Label>
      <Listbox className="cursor-pointer" value={selectedToken.address}>
        {tokens.map((token: Token) => (
          <ListboxOption
            key={token.address}
            value={token.address}
            className="cursor-pointer"
            onClick={() => onSelect(token)}
          >
            <ListboxLabel>{`${token.symbol} (${token.name})`}</ListboxLabel>
            <ListboxDescription>{token.address}</ListboxDescription>
          </ListboxOption>
        ))}
      </Listbox>
    </Field>
  );
}
