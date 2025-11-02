import { GovernanceRulesState, GovernanceTokenState, RealmsState, TreasuryState, WizardSnapshot } from "./schema";

export interface DaoBlueprint {
  cluster: string;
  rpcUrl: string;
  walletAddress?: string;
  governanceToken: GovernanceTokenState;
  governanceRules: GovernanceRulesState;
  treasury: TreasuryState;
  realms: RealmsState;
}

export interface BlueprintRequest {
  cluster: string;
  rpcUrl: string;
  walletAddress?: string;
  token: GovernanceTokenState;
  rules: GovernanceRulesState;
  treasury: TreasuryState;
  realms: RealmsState;
}

export const createDaoBlueprint = (request: BlueprintRequest): DaoBlueprint => ({
  cluster: request.cluster,
  rpcUrl: request.rpcUrl,
  walletAddress: request.walletAddress,
  governanceToken: request.token,
  governanceRules: request.rules,
  treasury: request.treasury,
  realms: request.realms
});

export const createWizardSnapshot = (
  request: BlueprintRequest,
  issuedAt: Date = new Date()
): WizardSnapshot => ({
  cluster: request.cluster,
  rpcUrl: request.rpcUrl,
  walletAddress: request.walletAddress,
  token: request.token,
  rules: request.rules,
  treasury: request.treasury,
  realms: request.realms,
  createdAt: issuedAt.toISOString()
});

export const formatCliCommand = (blueprint: DaoBlueprint) =>
  `lili deploy dao --cluster ${blueprint.cluster} --file dao-blueprint.json`;
