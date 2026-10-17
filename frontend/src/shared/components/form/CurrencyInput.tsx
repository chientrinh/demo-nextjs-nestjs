"use client";

import { useEffect, useRef, useState } from "react";

interface CurrencyInputProps {
  id?: string;
  value: number | null;
  onChange: (value: number) => void;
  placeholder?: string;
  error?: boolean;
  hint?: string;
  disabled?: boolean;
  allowNegative?: boolean;
  className?: string;
}

const format = (value: number): string =>
  new Intl.NumberFormat("vi-VN").format(Math.abs(value));

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  placeholder = "0",
  error = false,
  hint,
  disabled = false,
  allowNegative = false,
  className = "",
}) => {
  const [text, setText] = useState(() =>
    value == null ? "" : format(value),
  );
  const lastEmitted = useRef<number | null>(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(value == null ? "" : format(value));
    }
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const negative = allowNegative && raw.trimStart().startsWith("-");
    const digits = raw.replace(/\D/g, "");

    if (digits === "") {
      setText(negative ? "-" : "");
      lastEmitted.current = 0;
      onChange(0);
      return;
    }

    const parsed = Number(digits) * (negative ? -1 : 1);
    setText(`${negative ? "-" : ""}${format(parsed)}`);
    lastEmitted.current = parsed;
    onChange(parsed);
  };

  let inputClasses =
    "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-right text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

  if (disabled) {
    inputClasses +=
      " border-gray-300 bg-gray-100 text-gray-500 opacity-40 cursor-not-allowed dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400";
  } else if (error) {
    inputClasses +=
      " border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:border-error-500 dark:focus:border-error-800";
  } else {
    inputClasses +=
      " border-gray-300 bg-transparent text-gray-800 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800";
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        disabled={disabled}
        placeholder={placeholder}
        value={text}
        onChange={handleChange}
        className={`${inputClasses} ${className}`}
      />
      {error && hint ? (
        <p className="mt-1.5 text-xs text-error-500">{hint}</p>
      ) : null}
      {!error && hint ? (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default CurrencyInput;
