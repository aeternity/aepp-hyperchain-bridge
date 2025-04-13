import { LinkIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";

interface Props {
  title: string;
  value: string;
  ref?: React.RefObject<HTMLInputElement | null>;
  setValue: (value: string) => void;
}

export default function UrlInput({ value, setValue, title, ref }: Props) {
  return (
    <fieldset className="fieldset w-1/2 px-4 max-[400px]:w-full">
      <legend className="fieldset-legend">{title}</legend>
      <label className="input validator">
        <input
          ref={ref}
          type="url"
          required
          value={value}
          title="Must be valid URL"
          placeholder={`Enter ${title}`}
          onChange={(e) => setValue(e.target.value)}
        />
      </label>
      <p className="validator-hint">
        <span className="text-error">Please enter a valid URL</span>
      </p>
    </fieldset>
  );
}
