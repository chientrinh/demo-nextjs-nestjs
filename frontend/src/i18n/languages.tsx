import Image from "next/image";
import type { Locale } from "./routing";

// Simple flag icons
const ViFlagIcon = ({ className }: { className?: string }) => (
  <Image
    className={className}
    src="/images/flag/flag-vi.svg"
    alt="VI"
    width={20}
    height={20}
  />
);

const EnFlagIcon = ({ className }: { className?: string }) => (
  <Image
    className={className}
    src="/images/flag/flag-en.svg"
    alt="EN"
    width={20}
    height={20}
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
