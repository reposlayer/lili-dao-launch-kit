'use client';

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface IntroStepProps {
  cluster: string;
  rpcUrl: string;
}

export function IntroStep({ cluster, rpcUrl }: IntroStepProps) {
  return (
    <section className="grid gap-4">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-white">DAO Launch Kit</h2>
        <p className="text-sm text-slate-300">
          This guided flow prepares governance artifacts for a new SPL Governance realm.
          Connect a signer, confirm token details, and export the blueprint to automate deployments with
          the Lili CLI.
        </p>
      </header>

      <div className="rounded-lg border border-white/10 bg-black/40 p-4 text-sm text-slate-200">
        <p className="font-semibold text-white">Environment</p>
        <ul className="mt-2 space-y-1 text-xs text-slate-300">
          <li>
            <span className="font-medium text-slate-200">Cluster:</span> {cluster}
          </li>
          <li>
            <span className="font-medium text-slate-200">RPC URL:</span> {rpcUrl || "Not configured"}
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
        <div>
          <p className="font-medium text-white">Wallet connection</p>
          <p className="text-xs text-slate-400">We need a signer to provision mints and governance accounts.</p>
        </div>
        <WalletMultiButton className="rounded bg-primary px-4 py-2 text-sm font-medium text-white" />
      </div>
    </section>
  );
}
