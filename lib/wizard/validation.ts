import { GovernanceRulesState, GovernanceTokenState, RealmsState, TreasuryState, WizardData } from "./schema";
import { governanceRulesSchema, governanceTokenSchema, realmsSchema, treasurySchema } from "./schema";
import { WizardStepId } from "./store";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const validateToken = (token: GovernanceTokenState): string[] => {
  const outcome = governanceTokenSchema.safeParse(token);
  if (outcome.success) {
    return [];
  }
  return outcome.error.issues.map((issue) => issue.message);
};

const validateRules = (rules: GovernanceRulesState): string[] => {
  const outcome = governanceRulesSchema.safeParse(rules);
  if (outcome.success) {
    return [];
  }
  return outcome.error.issues.map((issue) => issue.message);
};

const validateTreasury = (treasury: TreasuryState): string[] => {
  const issues: string[] = [];
  const base = treasurySchema.safeParse(treasury);
  if (!base.success) {
    issues.push(...base.error.issues.map((item) => item.message));
  }
  if (treasury.createMultisig) {
    if (treasury.multisigMembers.length < 1) {
      issues.push("Add at least one multisig member wallet");
    }
    if (treasury.multisigThreshold > treasury.multisigMembers.length) {
      issues.push("Threshold must be less than or equal to member count");
    }
  }
  return issues;
};

const validateRealms = (realms: RealmsState): string[] => {
  const base = realmsSchema.safeParse(realms);
  if (!base.success) {
    return base.error.issues.map((issue) => issue.message);
  }
  if (realms.useRealms && !realms.existingRealm) {
    return ["Provide an existing Realm address when opting into Realms"];
  }
  return [];
};

export const validateStep = (step: WizardStepId, data: WizardData): ValidationResult => {
  switch (step) {
    case "token":
      return wrap(validateToken(data.token));
    case "rules":
      return wrap(validateRules(data.rules));
    case "treasury":
      return wrap(validateTreasury(data.treasury));
    case "realms":
      return wrap(validateRealms(data.realms));
    case "review": {
      const errors = [
        ...validateToken(data.token),
        ...validateRules(data.rules),
        ...validateTreasury(data.treasury),
        ...validateRealms(data.realms)
      ];
      return wrap(errors);
    }
    default:
      return { valid: true, errors: [] };
  }
};

const wrap = (errors: string[]): ValidationResult => ({
  valid: errors.length === 0,
  errors
});
