import BN from "bn.js";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  GovernanceConfig,
  VoteThreshold,
  VoteThresholdType,
  VoteTipping
} from "@solana/spl-governance";

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

  const governanceConfig = new GovernanceConfig({
    communityVoteThreshold: new VoteThreshold({
      type: VoteThresholdType.YesVotePercentage,
      value: Number(config.minTokensToQuorum)
    }),
    minCommunityTokensToCreateProposal: new BN(config.minTokensToCreateProposal),
    minInstructionHoldUpTime: 0,
    baseVotingTime: config.votingPeriodDays * 24 * 60 * 60,
    communityVoteTipping: VoteTipping.Strict,
    minCouncilTokensToCreateProposal: new BN(0),
    councilVoteThreshold: new VoteThreshold({ type: VoteThresholdType.Disabled }),
    councilVetoVoteThreshold: new VoteThreshold({ type: VoteThresholdType.Disabled }),
    communityVetoVoteThreshold: new VoteThreshold({ type: VoteThresholdType.Disabled }),
    councilVoteTipping: VoteTipping.Disabled,
    votingCoolOffTime: 0,
    depositExemptProposalCount: 0
  });

  return {
    communityMint,
    governanceConfig,
    authority: wallet,
    connection
  };
}
