export interface WizardEnv {
  cluster: string;
  rpcUrl: string;
  walletAddress?: string;
  governanceMint?: string;
  governanceSymbol?: string;
  governanceDecimals?: number;
  quorumPercent?: number;
  votingPeriodDays?: number;
  minTokensToCreateProposal?: string;
  realmsProgramId?: string;
  existingRealm?: string;
  councilMint?: string;
}

const parseNumber = (value?: string) => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const readWizardEnv = (): WizardEnv => ({
  cluster: process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet",
  rpcUrl: process.env.NEXT_PUBLIC_SOLANA_RPC ?? "",
  walletAddress: process.env.NEXT_PUBLIC_WALLET_ADDRESS ?? "",
  governanceMint:
    process.env.NEXT_PUBLIC_COMMUNITY_MINT ??
    process.env.NEXT_PUBLIC_GOVERNANCE_MINT ??
    "",
  governanceSymbol: process.env.NEXT_PUBLIC_GOVERNANCE_SYMBOL ?? "",
  governanceDecimals: parseNumber(process.env.NEXT_PUBLIC_GOVERNANCE_DECIMALS),
  quorumPercent: parseNumber(process.env.NEXT_PUBLIC_GOVERNANCE_QUORUM),
  votingPeriodDays: parseNumber(process.env.NEXT_PUBLIC_GOVERNANCE_VOTING_DAYS),
  minTokensToCreateProposal:
    process.env.NEXT_PUBLIC_MIN_TOKENS_FOR_PROPOSAL ?? "",
  realmsProgramId:
    process.env.NEXT_PUBLIC_REALMS_PROGRAM_ID ?? process.env.NEXT_PUBLIC_REALM_PROGRAM_ID ?? "",
  existingRealm: process.env.NEXT_PUBLIC_REALM ?? "",
  councilMint: process.env.NEXT_PUBLIC_COUNCIL_MINT ?? ""
});
