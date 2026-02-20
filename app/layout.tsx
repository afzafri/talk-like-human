import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalkLikeHuman",
  description: "Because your text deserves a pulse.",
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
