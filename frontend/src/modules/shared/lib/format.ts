export const formatVnd = (value: number): string =>
  `${new Intl.NumberFormat("vi-VN").format(value)} ₫`;

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat("vi-VN").format(value);

export const formatDate = (dateKey: string): string => {
  const [year, month, day] = dateKey.split("-");
  return `${day}/${month}/${year}`;
};

export const formatCompactVnd = (value: number): string => {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
  if (abs >= 1_000) return `${Math.round(value / 1_000)}k`;
  return `${value}`;
};

export const truncate = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;

const DIGIT_WORDS = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

const SCALE_WORDS = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

function readThreeDigits(value: number, forceFull: boolean): string[] {
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const units = value % 10;
  const words: string[] = [];

  if (hundreds > 0 || forceFull) {
    words.push(`${DIGIT_WORDS[hundreds]} trăm`);
  }

  if (tens === 0) {
    if (units > 0 && (hundreds > 0 || forceFull)) words.push("lẻ");
    if (units > 0) words.push(DIGIT_WORDS[units]);
    return words;
  }

  if (tens === 1) {
    words.push("mười");
  } else {
    words.push(`${DIGIT_WORDS[tens]} mươi`);
  }

  if (units === 1) {
    words.push(tens > 1 ? "mốt" : "một");
  } else if (units === 5) {
    words.push("lăm");
  } else if (units > 0) {
    words.push(DIGIT_WORDS[units]);
  }

  return words;
}

export const readVietnameseAmount = (value: number): string => {
  if (!Number.isFinite(value) || value === 0) return "Không đồng";

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
    const forceFull = index !== groups.length - 1;
    parts.push(readThreeDigits(group, forceFull).join(" "));
    if (SCALE_WORDS[index]) parts.push(SCALE_WORDS[index]);
  }

  const sentence = `${parts.join(" ")} đồng`;
  const normalized = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  return negative ? `Âm ${normalized.toLowerCase()}` : normalized;
};
