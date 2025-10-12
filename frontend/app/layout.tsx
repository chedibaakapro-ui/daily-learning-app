import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Learning",
  description: "Your daily dose of knowledge",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}