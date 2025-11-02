'use client';

import { useState } from "react";
import type { DaoBlueprint } from "../../lib/wizard/blueprint";

interface ReviewStepProps {
  blueprint: DaoBlueprint;
  cliCommand: string;
  statusMessage: string | null;
  onDownload: () => void;
}

export function ReviewStep({ blueprint, cliCommand, statusMessage, onDownload }: ReviewStepProps) {
  const [copied, setCopied] = useState(false);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(cliCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy command", error);
    }
  };

  return (
    <section className="grid gap-5 text-sm text-slate-200">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Review & export</h2>
        <p className="text-xs text-slate-400">
          Everything is ready. Download the blueprint JSON and run the CLI command to materialize the DAO.
        </p>
      </header>

      <div className="grid gap-3 rounded border border-white/10 bg-black/40 p-4 text-xs">
        <h3 className="text-sm font-semibold text-slate-100">Deployment context</h3>
        <ul className="grid gap-1 text-slate-300">
          <li>
            <span className="font-medium text-slate-100">Cluster:</span> {blueprint.cluster}
          </li>
          <li>
            <span className="font-medium text-slate-100">RPC:</span> {blueprint.rpcUrl || "Not set"}
          </li>
          {blueprint.walletAddress && (
            <li>
              <span className="font-medium text-slate-100">Wallet:</span> {blueprint.walletAddress}
            </li>
          )}
        </ul>
      </div>

      <div className="grid gap-3 rounded border border-white/10 bg-black/40 p-4 text-xs">
        <h3 className="text-sm font-semibold text-slate-100">Token</h3>
        <ul className="grid gap-1 text-slate-300">
          <li>
            <span className="font-medium text-slate-100">Source:</span> {blueprint.governanceToken.source}
          </li>
          <li>
            <span className="font-medium text-slate-100">Mint:</span> {blueprint.governanceToken.mint || "Will be created"}
          </li>
          <li>
            <span className="font-medium text-slate-100">Symbol:</span> {blueprint.governanceToken.symbol}
          </li>
          <li>
            <span className="font-medium text-slate-100">Decimals:</span> {blueprint.governanceToken.decimals}
          </li>
        </ul>
      </div>

      <div className="grid gap-3 rounded border border-white/10 bg-black/40 p-4 text-xs">
        <h3 className="text-sm font-semibold text-slate-100">Governance</h3>
        <ul className="grid gap-1 text-slate-300">
          <li>
            <span className="font-medium text-slate-100">Proposal threshold:</span> {blueprint.governanceRules.minTokensToCreateProposal}
          </li>
          <li>
            <span className="font-medium text-slate-100">Quorum:</span> {blueprint.governanceRules.quorumPercent}%
          </li>
          <li>
            <span className="font-medium text-slate-100">Voting period:</span> {blueprint.governanceRules.votingPeriodDays} days
          </li>
          <li>
            <span className="font-medium text-slate-100">Tipping:</span> {blueprint.governanceRules.voteTipping}
          </li>
        </ul>
      </div>

      <div className="grid gap-3 rounded border border-white/10 bg-black/40 p-4 text-xs">
        <h3 className="text-sm font-semibold text-slate-100">Treasury</h3>
        <ul className="grid gap-1 text-slate-300">
          <li>
            <span className="font-medium text-slate-100">Create vault:</span> {blueprint.treasury.createTreasury ? "Yes" : "No"}
          </li>
          {blueprint.treasury.createTreasury && blueprint.treasury.treasuryAccount && (
            <li>
              <span className="font-medium text-slate-100">Account:</span> {blueprint.treasury.treasuryAccount}
            </li>
          )}
          <li>
            <span className="font-medium text-slate-100">Multisig:</span> {blueprint.treasury.createMultisig ? "Enabled" : "Disabled"}
          </li>
          {blueprint.treasury.createMultisig && (
            <li>
              <span className="font-medium text-slate-100">Threshold:</span> {blueprint.treasury.multisigThreshold} / {blueprint.treasury.multisigMembers.length}
            </li>
          )}
        </ul>
      </div>

      <div className="grid gap-3 rounded border border-white/10 bg-black/40 p-4 text-xs">
        <h3 className="text-sm font-semibold text-slate-100">Realms</h3>
        <ul className="grid gap-1 text-slate-300">
          <li>
            <span className="font-medium text-slate-100">Mode:</span> {blueprint.realms.useRealms ? "Integrate" : "Lili native"}
          </li>
          {blueprint.realms.useRealms && (
            <>
              <li>
                <span className="font-medium text-slate-100">Realm:</span> {blueprint.realms.existingRealm || "Required"}
              </li>
              {blueprint.realms.governanceProgramId && (
                <li>
                  <span className="font-medium text-slate-100">Program ID:</span> {blueprint.realms.governanceProgramId}
                </li>
              )}
            </>
          )}
        </ul>
      </div>

      <div className="flex flex-col gap-3 rounded border border-white/10 bg-white/5 p-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <span className="font-medium text-slate-100">CLI command</span>
          <code className="rounded bg-black/50 px-3 py-2 font-mono text-[11px] text-sky-200">
            {cliCommand}
          </code>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded bg-black/60 px-4 py-2 text-[11px] font-semibold text-slate-200"
            onClick={copyCommand}
          >
            {copied ? "Copied" : "Copy command"}
          </button>
          <button
            type="button"
            className="rounded bg-primary px-4 py-2 text-[11px] font-semibold text-white"
            onClick={onDownload}
          >
            Download blueprint
          </button>
        </div>
      </div>

      {statusMessage && (
        <p className="rounded border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          {statusMessage}
        </p>
      )}
    </section>
  );
}
