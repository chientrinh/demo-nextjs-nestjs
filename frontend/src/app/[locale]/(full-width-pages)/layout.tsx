import { RequireGuest } from "@/modules/auth";

export default function FullWidthPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireGuest>
      <div>{children}</div>
    </RequireGuest>
  );
}
