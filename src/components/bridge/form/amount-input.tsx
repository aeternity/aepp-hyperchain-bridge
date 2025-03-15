import { ErrorMessage, Field, Label } from "@/components/base/fieldset";
import { Input } from "@/components/base/input";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { use, useEffect } from "react";

interface Props {
  amount: string;
  max?: number;
  error?: string;
  className?: string;
  onChange: (value: string) => void;
}

export default function AmountInput({ onChange, amount, max, error, className }: Props) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const number = Number(event.target.value);
    if (isNaN(number) || number < 0) return;

    onChange(event.target.value);
  };

  useEffect(() => {
    if (max !== undefined && Number(amount) > max) {
      onChange(max.toString());
    }
  }, [amount, max]);

  return (
    <Field className={className}>
      <Label className="flex flex-row">
        <span className="font-semibold">Amount</span>
        <div className="tooltip ml-1 self-center" data-tip="Amount of tokens to be bridged">
          <InformationCircleIcon width={14} height={14} />
        </div>
      </Label>
      <Input
        invalid={!!error}
        value={amount}
        onChange={handleChange}
        className="font-medium"
        placeholder="Enter amount"
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Field>
  );
}
