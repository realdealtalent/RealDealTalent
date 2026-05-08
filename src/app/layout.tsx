import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real Deal Talent",
  description:
    "Real Deal Talent places Sales & Operations talent with Industrial Services, Manufacturing & Distribution, and Heavy Equipment companies across the US & Canada.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
