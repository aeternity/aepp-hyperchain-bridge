import { useEffect } from "react";

import { InformationCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  amount: string;
  max?: number;
  error?: string;
  className?: string;
  onChange: (value: string) => void;
}

export default function AmountInput({
  onChange,
  amount,
  max,
  error,
  className,
}: Props) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const number = Number(event.target.value);
    if (isNaN(number) || number < 0) return;

    onChange(event.target.value);
  };

  useEffect(() => {
    if (max !== undefined && Number(amount) > max) {
      onChange(max.toString());
    }
  }, [amount, max, onChange]);

  return (
    <fieldset className={`fieldset ${className}`}>
      <legend className="fieldset-legend gap-0">
        <span className="font-semibold">Amount</span>
        <div
          className="tooltip ml-1 self-center font-normal"
          data-tip="Amount of tokens to be bridged"
        >
          <InformationCircleIcon width={14} height={14} />
        </div>
      </legend>
      <input
        type="text"
        className={`input w-full ${error ? "input-error" : ""}`}
        value={amount}
        onChange={handleChange}
        placeholder="Enter amount"
      />
      <p className="fieldset-label text-error">{error}</p>
    </fieldset>
  );
}
