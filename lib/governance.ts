import BN from "bn.js";
import { Connection, PublicKey } from "@solana/web3.js";
import { GovernanceConfig } from "@solana/spl-governance";

export type DaoConfig = {
  communityMint: string;
  minTokensToCreateProposal: string;
  minTokensToQuorum: string;
  votingPeriodDays: number;
};

export async function bootstrapDao(
  wallet: PublicKey,
  config: DaoConfig,
  connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC ?? "https://api.devnet.solana.com")
) {
  const communityMint = new PublicKey(config.communityMint);

  const governanceConfig: GovernanceConfig = {
    communityMintMaxVoteWeightSource: { value: new BN(1000000) },
    minCommunityTokensToCreateGovernance: new BN(config.minTokensToCreateProposal),
    minCommunityTokensToCreateProposal: new BN(config.minTokensToCreateProposal),
    minCommunityTokensToVote: new BN(0),
    minCommunityTokensToExecute: new BN(0),
    communityVoteThreshold: { type: 0, value: Number(config.minTokensToQuorum) },
    minInstructionHoldUpTime: 0,
    maxVotingTime: config.votingPeriodDays * 24 * 60 * 60,
    voteTipping: 0
  };

  return {
    communityMint,
    governanceConfig,
    authority: wallet,
    connection
  };
}
