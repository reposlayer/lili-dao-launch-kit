"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallet, type WalletContextState } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  fetchGovernance,
  fetchProposals,
  fetchRealm,
  fetchVoteRecordsForWallet,
  fetchWalletTokenOwnerRecord
} from "../lib/governance/api";
import { parseProposal, type ParsedProposal } from "../lib/governance/format";
import { castVote, createProposal, finalizeProposal } from "../lib/governance/actions";

export const governanceQueryKeys = {
  realm: () => ["governance", "realm"] as const,
  governance: () => ["governance", "config"] as const,
  proposals: () => ["governance", "proposals"] as const,
  voteRecords: (wallet: string | null) => ["governance", "vote-records", wallet] as const,
  tokenOwnerRecord: (wallet: string | null) => ["governance", "token-owner-record", wallet] as const
};

export const useRealmQuery = () =>
  useQuery({
    queryKey: governanceQueryKeys.realm(),
    queryFn: fetchRealm,
    staleTime: 60_000
  });

export const useGovernanceQuery = () =>
  useQuery({
    queryKey: governanceQueryKeys.governance(),
    queryFn: fetchGovernance,
    staleTime: 60_000
  });

export const useProposalsQuery = () =>
  useQuery<ParsedProposal[]>({
    queryKey: governanceQueryKeys.proposals(),
    queryFn: async () => {
      const [proposals, governance] = await Promise.all([fetchProposals(), fetchGovernance()]);
      const governanceAccount = governance ?? null;
      return proposals
        .map((proposal) => parseProposal(proposal, governanceAccount))
        .sort((a, b) => b.draftedAt.getTime() - a.draftedAt.getTime());
    },
    refetchInterval: 30_000
  });

export const useVoteRecordsQuery = (walletPublicKey: PublicKey | null) =>
  useQuery({
    queryKey: governanceQueryKeys.voteRecords(walletPublicKey?.toBase58() ?? null),
    queryFn: async () => {
      if (!walletPublicKey) return [];
      return fetchVoteRecordsForWallet(walletPublicKey);
    },
    enabled: !!walletPublicKey,
    refetchInterval: 30_000
  });

export const useTokenOwnerRecordQuery = (walletPublicKey: PublicKey | null) =>
  useQuery({
    queryKey: governanceQueryKeys.tokenOwnerRecord(walletPublicKey?.toBase58() ?? null),
    queryFn: async () => {
      if (!walletPublicKey) return null;
      return fetchWalletTokenOwnerRecord(walletPublicKey);
    },
    enabled: !!walletPublicKey,
    refetchInterval: 60_000
  });

const invalidateGovernanceQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: governanceQueryKeys.proposals() });
  queryClient.invalidateQueries({ queryKey: governanceQueryKeys.voteRecords(null), exact: false });
  queryClient.invalidateQueries({ queryKey: governanceQueryKeys.tokenOwnerRecord(null), exact: false });
};

export const useCreateProposalMutation = (wallet: WalletContextState) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { title: string; summary?: string; description?: string; link?: string }) => {
      if (!wallet) throw new Error("Wallet context missing");
      return createProposal(wallet, input);
    },
    onSuccess: () => {
      invalidateGovernanceQueries(queryClient);
    }
  });
};

export const useCastVoteMutation = (wallet: WalletContextState) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { proposalAddress: string; tokenOwnerRecord: string; support: boolean }) => {
      if (!wallet?.publicKey) throw new Error("Connect a wallet before voting");
      return castVote(wallet, {
        proposal: new PublicKey(input.proposalAddress),
        proposalOwnerRecord: new PublicKey(input.tokenOwnerRecord),
        support: input.support
      });
    },
    onSuccess: () => {
      invalidateGovernanceQueries(queryClient);
    }
  });
};

export const useFinalizeProposalMutation = (wallet: WalletContextState) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposalAddress: string) => {
      if (!wallet?.publicKey) throw new Error("Connect a wallet before finalizing");
      return finalizeProposal(wallet, new PublicKey(proposalAddress));
    },
    onSuccess: () => {
      invalidateGovernanceQueries(queryClient);
    }
  });
};

export const useWalletGovernanceContext = () => {
  const wallet = useWallet();
  const { data: tokenOwnerRecord, isLoading: torLoading } = useTokenOwnerRecordQuery(wallet.publicKey ?? null);
  const { data: voteRecords } = useVoteRecordsQuery(wallet.publicKey ?? null);

  return {
    wallet,
    tokenOwnerRecord,
    voteRecords,
    torLoading
  };
};
