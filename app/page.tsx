"use client";

import { ChangeEvent, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { bootstrapDao } from "../lib/governance";

export default function Home() {
  const wallet = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  type FormState = {
    communityMint: string;
    minTokensToCreateProposal: string;
    minTokensToQuorum: string;
    votingPeriodDays: number;
  };

  const [form, setForm] = useState<FormState>({
    communityMint: "MintPublicKey",
    minTokensToCreateProposal: "1",
    minTokensToQuorum: "100",
    votingPeriodDays: 3
  });

  const handleSubmit = async () => {
    if (!wallet.publicKey) {
      setStatus("Connect a wallet");
      return;
    }

    setStatus("Preparing governance config...");
    try {
      const result = await bootstrapDao(wallet.publicKey, form);
      setStatus(`DAO blueprint ready for ${result.communityMint.toBase58()}`);
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">DAO Launch Kit</h1>
          <p className="text-slate-300">Prep SPL Governance state, treasury vaults, and proposals.</p>
        </div>
        <WalletMultiButton className="rounded bg-primary px-4 py-2 text-sm font-medium text-white" />
      </header>

      <section className="grid gap-6 rounded-xl border border-white/10 bg-white/5 p-6">
        <div>
          <label className="block text-sm font-medium text-slate-300">Community Mint</label>
          <input
            className="mt-2 w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={form.communityMint}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              setForm((prev) => ({ ...prev, communityMint: event.target.value }))
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-300">Min tokens to create proposal</label>
            <input
              className="mt-2 w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={form.minTokensToCreateProposal}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setForm((prev) => ({
                  ...prev,
                  minTokensToCreateProposal: event.target.value
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Quorum threshold</label>
            <input
              className="mt-2 w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={form.minTokensToQuorum}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setForm((prev) => ({ ...prev, minTokensToQuorum: event.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">Voting period (days)</label>
            <input
              className="mt-2 w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              type="number"
              value={form.votingPeriodDays}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setForm((prev) => ({ ...prev, votingPeriodDays: Number(event.target.value) }))
              }
            />
          </div>
        </div>
        <button
          className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white"
          onClick={handleSubmit}
        >
          Generate DAO blueprint
        </button>
        {status && <p className="text-xs text-slate-400">{status}</p>}
      </section>
    </main>
  );
}
