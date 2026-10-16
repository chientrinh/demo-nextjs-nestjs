import type { Locale } from "./routing";

// Simple flag icons as inline SVG spans
const ViFlagIcon = ({ className }: { className?: string }) => (
  <img
    className={className}
    src="/images/flag/flag-vi.svg"
    alt="VI"
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = "none";
    }}
  />
);

const EnFlagIcon = ({ className }: { className?: string }) => (
  <img
    className={className}
    src="/images/flag/flag-en.svg"
    alt="EN"
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = "none";
    }}
  />
);

export interface Language {
  id: Locale;
  name: string;
  shortName: string;
  dir: "ltr" | "rtl";
  FlagIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
}

export const languages: Language[] = [
  {
    id: "vi",
    name: "Tiếng Việt",
    shortName: "VI",
    dir: "ltr",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FlagIcon: ViFlagIcon as any,
  },
  {
    id: "en",
    name: "English",
    shortName: "EN",
    dir: "ltr",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    FlagIcon: EnFlagIcon as any,
  },
];

export function getLanguage(locale: Locale | string): Language {
  return languages.find((l) => l.id === locale) ?? languages[0];
}

export function isRtl(locale: Locale): boolean {
  return getLanguage(locale).dir === "rtl";
}
