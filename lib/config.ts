import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import { z } from "zod";

const clusterSchema = z.enum(["devnet", "testnet", "mainnet-beta"]);

const envSchema = z.object({
  NEXT_PUBLIC_SOLANA_CLUSTER: clusterSchema.default("devnet"),
  NEXT_PUBLIC_SOLANA_RPC: z.string().url().optional(),
  NEXT_PUBLIC_GOVERNANCE_PROGRAM_ID: z.string().min(32, "Set NEXT_PUBLIC_GOVERNANCE_PROGRAM_ID"),
  NEXT_PUBLIC_REALM: z.string().min(32, "Set NEXT_PUBLIC_REALM"),
  NEXT_PUBLIC_GOVERNANCE: z.string().min(32, "Set NEXT_PUBLIC_GOVERNANCE"),
  NEXT_PUBLIC_COMMUNITY_MINT: z.string().min(32, "Set NEXT_PUBLIC_COMMUNITY_MINT"),
  NEXT_PUBLIC_TREASURY: z.string().min(32, "Set NEXT_PUBLIC_TREASURY").optional(),
  NEXT_PUBLIC_GOVERNANCE_PROGRAM_VERSION: z.coerce.number().int().positive().default(3),
  NEXT_PUBLIC_DAO_NAME: z.string().optional(),
  NEXT_PUBLIC_DAO_TAGLINE: z.string().optional()
});

type EnvValues = z.infer<typeof envSchema>;

const parseEnv = (): EnvValues => {
  const raw: Record<string, string | undefined> = {
    NEXT_PUBLIC_SOLANA_CLUSTER: process.env.NEXT_PUBLIC_SOLANA_CLUSTER,
    NEXT_PUBLIC_SOLANA_RPC: process.env.NEXT_PUBLIC_SOLANA_RPC,
    NEXT_PUBLIC_GOVERNANCE_PROGRAM_ID: process.env.NEXT_PUBLIC_GOVERNANCE_PROGRAM_ID,
    NEXT_PUBLIC_REALM: process.env.NEXT_PUBLIC_REALM,
    NEXT_PUBLIC_GOVERNANCE: process.env.NEXT_PUBLIC_GOVERNANCE,
    NEXT_PUBLIC_COMMUNITY_MINT: process.env.NEXT_PUBLIC_COMMUNITY_MINT,
    NEXT_PUBLIC_TREASURY: process.env.NEXT_PUBLIC_TREASURY,
    NEXT_PUBLIC_GOVERNANCE_PROGRAM_VERSION: process.env.NEXT_PUBLIC_GOVERNANCE_PROGRAM_VERSION,
    NEXT_PUBLIC_DAO_NAME: process.env.NEXT_PUBLIC_DAO_NAME,
    NEXT_PUBLIC_DAO_TAGLINE: process.env.NEXT_PUBLIC_DAO_TAGLINE
  };

  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const missing = result.error.issues
      .filter((issue) => issue.code === "invalid_type" && issue.received === "undefined")
      .map((issue) => issue.path.join("."));

    const missingMessage = missing.length
      ? `Missing required environment variables: ${missing.join(", ")}`
      : result.error.message;

    const guidance =
      "Populate .env.local with the values emitted by the Lili CLI (deploy dao) or provide explicit overrides before running the dashboard.";

    throw new Error(`${missingMessage}. ${guidance}`);
  }

  return result.data;
};

const env = parseEnv();

export const daoConfig = {
  cluster: env.NEXT_PUBLIC_SOLANA_CLUSTER,
  rpcUrl: env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl(env.NEXT_PUBLIC_SOLANA_CLUSTER),
  realm: new PublicKey(env.NEXT_PUBLIC_REALM),
  governanceProgramId: new PublicKey(env.NEXT_PUBLIC_GOVERNANCE_PROGRAM_ID),
  programVersion: env.NEXT_PUBLIC_GOVERNANCE_PROGRAM_VERSION,
  governance: new PublicKey(env.NEXT_PUBLIC_GOVERNANCE),
  communityMint: new PublicKey(env.NEXT_PUBLIC_COMMUNITY_MINT),
  treasury: env.NEXT_PUBLIC_TREASURY ? new PublicKey(env.NEXT_PUBLIC_TREASURY) : null,
  daoName: env.NEXT_PUBLIC_DAO_NAME ?? "Lili DAO",
  daoTagline: env.NEXT_PUBLIC_DAO_TAGLINE ?? "On-chain governance powered by Lili"
};

export type DaoConfig = typeof daoConfig;
