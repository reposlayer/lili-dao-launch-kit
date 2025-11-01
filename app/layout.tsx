import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SolanaProvider } from "../components/SolanaProvider";

export const metadata: Metadata = {
  title: "DAO Launch Kit",
  description: "Spin up governance flows with Solana SPL Governance"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
