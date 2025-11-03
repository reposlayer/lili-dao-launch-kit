"use client";

import { useMemo, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ProposalState } from "@solana/spl-governance";
import { daoConfig } from "../../lib/config";
import {
  useCastVoteMutation,
  useCreateProposalMutation,
  useFinalizeProposalMutation,
  useGovernanceQuery,
  useProposalsQuery,
  useRealmQuery,
  useWalletGovernanceContext
} from "../../hooks/useGovernance";

const formatNumber = (value: number | bigint) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Number(value));

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "-";
  const hours = Math.floor(seconds / 3600);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h`;
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
};

export function GovernanceDashboard() {
  const { wallet, tokenOwnerRecord, voteRecords, torLoading } = useWalletGovernanceContext();
  const realmQuery = useRealmQuery();
  const governanceQuery = useGovernanceQuery();
  const proposalsQuery = useProposalsQuery();

  const createProposalMutation = useCreateProposalMutation(wallet);
  const castVoteMutation = useCastVoteMutation(wallet);
  const finalizeProposalMutation = useFinalizeProposalMutation(wallet);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    description: "",
    link: ""
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const realmName = realmQuery.data?.account.name ?? daoConfig.daoName;
  const proposalDepositReady = !!tokenOwnerRecord;

  const governanceStats = useMemo(() => {
    const config = governanceQuery.data?.account.config;
    if (!config) return null;
    return {
      votingPeriod: formatDuration(config.baseVotingTime),
      minTokensToPropose: config.minCommunityTokensToCreateProposal.toString(),
      quorumPercent: config.communityVoteThreshold?.value ?? null
    };
  }, [governanceQuery.data]);

  const hasWallet = !!wallet.publicKey;

  const handleCreateProposal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);
    createProposalMutation.mutate(
      {
        title: form.title,
        summary: form.summary || undefined,
        description: form.description || undefined,
        link: form.link || undefined
      },
      {
        onSuccess: (proposalAddress) => {
          setForm({ title: "", summary: "", description: "", link: "" });
          setStatusMessage(`Proposal ${proposalAddress} created.`);
        },
        onError: (error) => {
          setStatusMessage(error instanceof Error ? error.message : "Failed to create proposal");
        }
      }
    );
  };

  const handleVote = (proposalAddress: string, tokenOwnerRecordAddress: string, support: boolean) => {
    setStatusMessage(null);
    castVoteMutation.mutate(
      { proposalAddress, tokenOwnerRecord: tokenOwnerRecordAddress, support },
      {
        onSuccess: () => {
          setStatusMessage("Vote submitted.");
        },
        onError: (error) => {
          setStatusMessage(error instanceof Error ? error.message : "Vote failed");
        }
      }
    );
  };

  const handleFinalize = (proposalAddress: string) => {
    setStatusMessage(null);
    finalizeProposalMutation.mutate(proposalAddress, {
      onSuccess: () => {
        setStatusMessage("Proposal finalized.");
      },
      onError: (error) => {
        setStatusMessage(error instanceof Error ? error.message : "Finalize failed");
      }
    });
  };

  const voteRecordsByProposal = useMemo(() => {
    return new Set((voteRecords ?? []).map((record) => record.account.proposal.toBase58()));
  }, [voteRecords]);

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6 shadow">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-primary/80">{daoConfig.cluster}</p>
            <h1 className="text-2xl font-semibold text-white">{realmName}</h1>
            {daoConfig.daoTagline && <p className="text-sm text-slate-300">{daoConfig.daoTagline}</p>}
          </div>
          <WalletMultiButton />
        </div>
        <dl className="grid gap-4 sm:grid-cols-3 text-xs text-slate-300">
          <div>
            <dt className="font-semibold text-slate-100">Realm</dt>
            <dd className="text-slate-400 break-words">{daoConfig.realm.toBase58()}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-100">Community Mint</dt>
            <dd className="text-slate-400 break-words">{daoConfig.communityMint.toBase58()}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-100">Governance Program</dt>
            <dd className="text-slate-400 break-words">{daoConfig.governanceProgramId.toBase58()}</dd>
          </div>
        </dl>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Active Proposals</h2>
            <button
              type="button"
              onClick={() => proposalsQuery.refetch()}
              className="text-xs text-primary disabled:opacity-40"
              disabled={proposalsQuery.isFetching}
            >
              Refresh
            </button>
          </header>
          {proposalsQuery.isLoading ? (
            <p className="text-sm text-slate-400">Loading proposals...</p>
          ) : proposalsQuery.data && proposalsQuery.data.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {proposalsQuery.data.map((proposal) => {
                const inVotingWindow = proposal.state === ProposalState.Voting;
                const alreadyVoted = voteRecordsByProposal.has(proposal.address);
                const canVote = hasWallet && inVotingWindow && !alreadyVoted && !castVoteMutation.isPending;
                const canFinalize = hasWallet && proposal.state === ProposalState.Voting && proposal.votingEnd !== null && proposal.votingEnd < new Date();

                return (
                  <li key={proposal.address} className="rounded border border-white/5 bg-black/20 p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-base font-semibold text-white">{proposal.name}</h3>
                        <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300">
                          {proposal.stateLabel}
                        </span>
                      </div>
                      {proposal.summary && <p className="text-sm text-slate-300">{proposal.summary}</p>}
                      {proposal.link && (
                        <a
                          href={proposal.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary underline"
                        >
                          View details
                        </a>
                      )}
                      <dl className="grid gap-2 text-xs text-slate-400 sm:grid-cols-2">
                        <div>
                          <dt className="font-semibold text-slate-200">Yes Votes</dt>
                          <dd>{formatNumber(proposal.yesVotes)}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-200">No Votes</dt>
                          <dd>{formatNumber(proposal.noVotes)}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-200">Voting Starts</dt>
                          <dd>{proposal.votingStart?.toLocaleString() ?? "-"}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-200">Voting Ends</dt>
                          <dd>{proposal.votingEnd?.toLocaleString() ?? "-"}</dd>
                        </div>
                      </dl>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button
                          type="button"
                          className="rounded bg-emerald-500/80 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                          disabled={!canVote}
                          onClick={() => handleVote(proposal.address, proposal.tokenOwnerRecord, true)}
                        >
                          Vote Yes
                        </button>
                        <button
                          type="button"
                          className="rounded bg-rose-500/80 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                          disabled={!canVote}
                          onClick={() => handleVote(proposal.address, proposal.tokenOwnerRecord, false)}
                        >
                          Vote No
                        </button>
                        <button
                          type="button"
                          className="rounded border border-white/20 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                          disabled={!canFinalize || finalizeProposalMutation.isPending}
                          onClick={() => handleFinalize(proposal.address)}
                        >
                          Finalize
                        </button>
                      </div>
                      {alreadyVoted && <p className="text-[11px] text-slate-500">You already voted on this proposal.</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No proposals yet. Create one to get governance started.</p>
          )}
        </section>

        <aside className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/5 p-6">
          <header className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-white">Create Proposal</h2>
            <p className="text-xs text-slate-300">
              Draft, sign off, and open a single-choice proposal against the configured governance.
            </p>
          </header>
          {!hasWallet && <p className="text-sm text-amber-300">Connect a wallet to propose changes.</p>}
          {hasWallet && !torLoading && !proposalDepositReady && (
            <p className="text-sm text-amber-300">
              Deposit governance tokens will occur automatically on your first action.
            </p>
          )}
          <form className="flex flex-col gap-3" onSubmit={handleCreateProposal}>
            <label className="flex flex-col gap-1 text-xs text-slate-200">
              Title
              <input
                required
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="Upgrade treasury program"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-200">
              Summary
              <input
                value={form.summary}
                onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
                className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="One-line summary"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-200">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="h-24 rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="Explain the intent, execution steps, and impact."
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-200">
              Reference Link
              <input
                value={form.link}
                onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
                className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                placeholder="https://"
              />
            </label>
            <button
              type="submit"
              disabled={!hasWallet || createProposalMutation.isPending}
              className="rounded bg-primary px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {createProposalMutation.isPending ? "Creating..." : "Create Proposal"}
            </button>
          </form>
          {statusMessage && <p className="text-xs text-slate-200">{statusMessage}</p>}
          {createProposalMutation.error && (
            <p className="text-xs text-rose-300">
              {createProposalMutation.error instanceof Error
                ? createProposalMutation.error.message
                : "Failed to create proposal"}
            </p>
          )}
        </aside>
      </div>

      {governanceStats && (
        <section className="rounded-xl border border-white/10 bg-white/5 p-6 text-xs text-slate-300">
          <h2 className="text-sm font-semibold text-white">Governance Settings</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="font-semibold text-slate-100">Voting Period</dt>
              <dd>{governanceStats.votingPeriod}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-100">Min Tokens to Propose</dt>
              <dd>{governanceStats.minTokensToPropose}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-100">Quorum (%)</dt>
              <dd>{governanceStats.quorumPercent ?? "-"}</dd>
            </div>
          </dl>
        </section>
      )}
    </section>
  );
}
