'use client';

import { z } from "zod";

export const governanceTokenSchema = z
  .object({
    mint: z.string(),
  symbol: z
    .string()
    .min(1, "Token symbol required")
    .max(10, "Symbol should be short"),
  decimals: z
    .number({ invalid_type_error: "Decimals must be a number" })
    .int("Decimals must be an integer")
    .min(0)
    .max(9),
  supply: z.string().optional(),
  authority: z.enum(["locked", "mutable"]),
  source: z.enum(["lili", "custom", "realms"]),
  notes: z.string().optional()
  })
  .superRefine((token, ctx) => {
    if (token.source !== "lili") {
      if (!token.mint || token.mint.length < 32 || token.mint.length > 44) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mint"],
          message: "Provide a valid mint address when reusing an existing token"
        });
      }
    } else if (token.mint && token.mint.length > 0 && (token.mint.length < 32 || token.mint.length > 44)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mint"],
        message: "Mint must be 32-44 characters when provided"
      });
    }
  });

export type GovernanceTokenState = z.infer<typeof governanceTokenSchema>;

export const governanceRulesSchema = z.object({
  minTokensToCreateProposal: z
    .string()
    .min(1, "Minimum tokens required"),
  quorumPercent: z
    .number({ invalid_type_error: "Quorum must be a number" })
    .min(0)
    .max(100),
  votingPeriodDays: z
    .number({ invalid_type_error: "Voting period must be a number" })
    .int("Voting period must be an integer")
    .min(1)
    .max(90),
  voteTipping: z.enum(["strict", "early", "disabled"]),
  governanceProgramId: z.string().optional()
});

export type GovernanceRulesState = z.infer<typeof governanceRulesSchema>;

export const treasurySchema = z.object({
  createTreasury: z.boolean(),
  treasuryAccount: z.string().optional(),
  createMultisig: z.boolean(),
  multisigThreshold: z
    .number({ invalid_type_error: "Threshold must be a number" })
    .int()
    .min(1)
    .max(12),
  multisigMembers: z.array(
    z
      .string()
      .min(32, "Wallet address required")
      .max(44, "Wallet address must be valid")
  ),
  notes: z.string().optional()
});

export type TreasuryState = z.infer<typeof treasurySchema>;

export const realmsSchema = z.object({
  useRealms: z.boolean(),
  existingRealm: z
    .string()
    .optional()
    .or(z.literal("")),
  governanceProgramId: z
    .string()
    .optional()
    .or(z.literal("")),
  councilMint: z
    .string()
    .optional()
    .or(z.literal(""))
});

export type RealmsState = z.infer<typeof realmsSchema>;

export const wizardSnapshotSchema = z.object({
  cluster: z.string(),
  rpcUrl: z.string(),
  walletAddress: z.string().optional(),
  token: governanceTokenSchema,
  rules: governanceRulesSchema,
  treasury: treasurySchema,
  realms: realmsSchema,
  createdAt: z.string()
});

export type WizardSnapshot = z.infer<typeof wizardSnapshotSchema>;

export interface WizardData {
  token: GovernanceTokenState;
  rules: GovernanceRulesState;
  treasury: TreasuryState;
  realms: RealmsState;
}
