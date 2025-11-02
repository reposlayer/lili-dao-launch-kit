'use client';

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { defaultRealmsState, defaultRulesState, defaultTokenState, defaultTreasuryState } from "./defaults";
import { GovernanceRulesState, GovernanceTokenState, RealmsState, TreasuryState } from "./schema";

export type WizardStepId =
  | "intro"
  | "token"
  | "rules"
  | "treasury"
  | "realms"
  | "review";

export interface WizardProgress {
  currentStep: WizardStepId;
  visited: Set<WizardStepId>;
}

export interface WizardState {
  token: GovernanceTokenState;
  rules: GovernanceRulesState;
  treasury: TreasuryState;
  realms: RealmsState;
  progress: WizardProgress;
  setStep: (step: WizardStepId) => void;
  markVisited: (step: WizardStepId) => void;
  updateToken: (patch: Partial<GovernanceTokenState>) => void;
  updateRules: (patch: Partial<GovernanceRulesState>) => void;
  updateTreasury: (patch: Partial<TreasuryState>) => void;
  updateRealms: (patch: Partial<RealmsState>) => void;
  reset: (defaults?: Partial<WizardState>) => void;
  initializeFromEnv: (input: {
    mint?: string;
    symbol?: string;
    decimals?: number;
    quorumPercent?: number;
    votingPeriodDays?: number;
    minTokensToCreateProposal?: string;
    realmsProgramId?: string;
    existingRealm?: string;
    councilMint?: string;
  }) => void;
}

export const WIZARD_STEP_ORDER: WizardStepId[] = [
  "intro",
  "token",
  "rules",
  "treasury",
  "realms",
  "review"
];

export const useWizardStore = create<WizardState>()(
  immer((set) => ({
    token: defaultTokenState(),
    rules: defaultRulesState(),
    treasury: defaultTreasuryState(),
    realms: defaultRealmsState(),
    progress: {
      currentStep: "intro",
      visited: new Set(["intro"])
    },
    setStep: (step) =>
      set((state) => {
        const visited = new Set(state.progress.visited);
        visited.add(step);
        state.progress = {
          currentStep: step,
          visited
        };
      }),
    markVisited: (step) =>
      set((state) => {
        const visited = new Set(state.progress.visited);
        visited.add(step);
        state.progress.visited = visited;
      }),
    updateToken: (patch) =>
      set((state) => {
        state.token = { ...state.token, ...patch };
      }),
    updateRules: (patch) =>
      set((state) => {
        state.rules = { ...state.rules, ...patch };
      }),
    updateTreasury: (patch) =>
      set((state) => {
        state.treasury = { ...state.treasury, ...patch };
      }),
    updateRealms: (patch) =>
      set((state) => {
        state.realms = { ...state.realms, ...patch };
      }),
    reset: (defaults) =>
      set(() => ({
        token: defaults?.token ?? defaultTokenState(),
        rules: defaults?.rules ?? defaultRulesState(),
        treasury: defaults?.treasury ?? defaultTreasuryState(),
        realms: defaults?.realms ?? defaultRealmsState(),
        progress: defaults?.progress ?? {
          currentStep: "intro",
          visited: new Set(["intro"])
        }
      })),
    initializeFromEnv: (input) =>
      set((state) => {
        state.token = {
          ...state.token,
          ...(input.mint ? { mint: input.mint, source: "custom" } : {}),
          ...(input.symbol ? { symbol: input.symbol } : {}),
          ...(typeof input.decimals === "number"
            ? { decimals: input.decimals }
            : {})
        };
        state.rules = {
          ...state.rules,
          ...(typeof input.quorumPercent === "number"
            ? { quorumPercent: input.quorumPercent }
            : {}),
          ...(typeof input.votingPeriodDays === "number"
            ? { votingPeriodDays: input.votingPeriodDays }
            : {}),
          ...(input.minTokensToCreateProposal
            ? { minTokensToCreateProposal: input.minTokensToCreateProposal }
            : {}),
          ...(input.realmsProgramId
            ? { governanceProgramId: input.realmsProgramId }
            : {})
        };
        state.realms = {
          ...state.realms,
          ...(input.existingRealm ? { useRealms: true, existingRealm: input.existingRealm } : {}),
          ...(input.realmsProgramId ? { governanceProgramId: input.realmsProgramId } : {}),
          ...(input.councilMint ? { councilMint: input.councilMint } : {})
        };
      })
  }))
);

export const getStepIndex = (step: WizardStepId) =>
  WIZARD_STEP_ORDER.findIndex((candidate) => candidate === step);

export const getNextStep = (step: WizardStepId): WizardStepId | undefined => {
  const idx = getStepIndex(step);
  return idx === -1 ? undefined : WIZARD_STEP_ORDER[idx + 1];
};

export const getPrevStep = (step: WizardStepId): WizardStepId | undefined => {
  const idx = getStepIndex(step);
  if (idx <= 0) {
    return undefined;
  }
  return WIZARD_STEP_ORDER[idx - 1];
};
