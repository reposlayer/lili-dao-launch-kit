import { GovernanceRulesState, GovernanceTokenState, RealmsState, TreasuryState } from "./schema";

export const defaultTokenState = (mint?: string, symbol?: string): GovernanceTokenState => ({
  mint: mint ?? "",
  symbol: symbol ?? "DAO",
  decimals: 9,
  supply: "",
  authority: "locked",
  source: mint ? "custom" : "lili",
  notes: ""
});

export const defaultRulesState = (): GovernanceRulesState => ({
  minTokensToCreateProposal: "1",
  quorumPercent: 20,
  votingPeriodDays: 7,
  voteTipping: "strict",
  governanceProgramId: ""
});

export const defaultTreasuryState = (): TreasuryState => ({
  createTreasury: true,
  treasuryAccount: "",
  createMultisig: false,
  multisigThreshold: 1,
  multisigMembers: [],
  notes: ""
});

export const defaultRealmsState = (): RealmsState => ({
  useRealms: false,
  existingRealm: "",
  governanceProgramId: "",
  councilMint: ""
});
