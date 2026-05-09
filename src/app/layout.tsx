import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Improvement Box",
  description: "Internal trial foundation for improvement proposals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
