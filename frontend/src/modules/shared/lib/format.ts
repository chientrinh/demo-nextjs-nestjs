export const formatUsd = (value: number): string => {
  const sign = value < 0 ? "-" : "";
  return `${sign}$${new Intl.NumberFormat("en-US").format(Math.abs(value))}`;
};

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-US").format(value);

export const formatDate = (dateKey: string): string => {
  const [year, month, day] = dateKey.split("-");
  return `${day}/${month}/${year}`;
};

export const formatCompactUsd = (value: number): string => {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${abs}`;
};

export const truncate = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
];

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
];

const SCALES = ["", " thousand", " million", " billion", " trillion"];

function readThreeDigits(value: number): string {
  const words: string[] = [];
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;

  if (hundreds > 0) words.push(`${ONES[hundreds]} hundred`);

  if (rest >= 20) {
    const tens = Math.floor(rest / 10);
    const units = rest % 10;
    words.push(units > 0 ? `${TENS[tens]}-${ONES[units]}` : TENS[tens]);
  } else if (rest > 0) {
    words.push(ONES[rest]);
  }

  return words.join(" ");
}

export const readEnglishAmount = (value: number): string => {
  if (!Number.isFinite(value) || value === 0) return "Zero dollars";

  const negative = value < 0;
  let rest = Math.abs(Math.trunc(value));
  const groups: number[] = [];

  while (rest > 0) {
    groups.push(rest % 1000);
    rest = Math.floor(rest / 1000);
  }

  const parts: string[] = [];
  for (let index = groups.length - 1; index >= 0; index -= 1) {
    const group = groups[index];
    if (group === 0) continue;
    const chunk = readThreeDigits(group);
    const scale = SCALES[index] ?? "";
    parts.push(`${chunk}${scale}`);
  }

  const sentence = `${parts.join(" ")} dollars`;
  const normalized = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  return negative ? `Minus ${normalized.toLowerCase()}` : normalized;
};
