import { Field, Label } from "@/components/base/fieldset";
import {
  Listbox,
  ListboxLabel,
  ListboxOption,
  ListboxDescription,
} from "@/components/base/listbox";
import { formatBalance, shorten } from "@/utils/formatters";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  tokens: Token[];
  className?: string;
  isLoading: boolean;
  onSelect: (address: string) => void;
}

export default function TokenSelect({ tokens, onSelect, className, isLoading }: Props) {
  return (
    <Field className={className}>
      <Label className="flex flex-row">
        <span className="font-semibold">Token</span>
        <div className="tooltip ml-1 self-center" data-tip="Token to be bridged">
          <InformationCircleIcon width={14} height={14} />
        </div>
      </Label>
      <Listbox className="cursor-pointer" placeholder={isLoading ? "Loading..." : "Select a token"}>
        {tokens.map((token: Token) => (
          <ListboxOption
            key={token.address}
            value={token.address}
            className="cursor-pointer"
            onClick={() => onSelect(token.address)}
          >
            <ListboxLabel>
              <span className="font-medium">{formatBalance({ balance: token.balance })}</span>
              <span className="ml-1">{token.name}</span>
              <span className="ml-1 font-medium">({token.symbol})</span>
            </ListboxLabel>
            <ListboxDescription>{token.address}</ListboxDescription>
          </ListboxOption>
        ))}
      </Listbox>
    </Field>
  );
}
