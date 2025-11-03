import { Transaction, TransactionInstruction, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import {
  withDepositGoverningTokens,
  withCreateProposal,
  withSignOffProposal,
  withCastVote,
  withFinalizeVote,
  VoteType,
  Vote,
  YesNoVote
} from "@solana/spl-governance";
import {
  getAssociatedTokenAddress,
  getAccount,
  getMint
} from "@solana/spl-token";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { daoConfig } from "../config";
import { getConnection } from "../solana";
import { getTokenOwnerRecordAddress } from "@solana/spl-governance";
const PROGRAM_VERSION = daoConfig.programVersion;

const buildTransaction = (instructions: TransactionInstruction[], payer: PublicKey) => {
  const tx = new Transaction();
  tx.feePayer = payer;
  instructions.forEach((ix) => tx.add(ix));
  return tx;
};

export const ensureCommunityTokenOwnerRecord = async (wallet: WalletContextState) => {
  if (!wallet.publicKey) throw new Error("Connect a wallet to continue");
  const connection = getConnection();
  const owner = wallet.publicKey;
  const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
    daoConfig.governanceProgramId,
    daoConfig.realm,
    daoConfig.communityMint,
    owner
  );

  const existingRecord = await connection.getAccountInfo(tokenOwnerRecordAddress);
  if (existingRecord) {
    return tokenOwnerRecordAddress;
  }

  const instructions: TransactionInstruction[] = [];

  const ownerAta = await getAssociatedTokenAddress(daoConfig.communityMint, owner, false);
  const ataAccount = await connection.getAccountInfo(ownerAta);
  if (!ataAccount) {
    throw new Error("Wallet must hold governance tokens before participating");
  }

  const mint = await getMint(connection, daoConfig.communityMint);
  const tokenAccount = await getAccount(connection, ownerAta);
  const unity = BigInt(10) ** BigInt(mint.decimals);
  const available = tokenAccount.amount;

  if (available === 0n) {
    throw new Error("Wallet needs governance tokens before creating proposals");
  }

  const depositAmount = available < unity ? available : unity;

  await withDepositGoverningTokens(
    instructions,
    daoConfig.governanceProgramId,
    PROGRAM_VERSION,
    daoConfig.realm,
    ownerAta,
    daoConfig.communityMint,
    owner,
    owner,
    owner,
    new BN(depositAmount.toString()),
    true
  );

  const transaction = buildTransaction(instructions, owner);
  await wallet.sendTransaction(transaction, connection, { skipPreflight: false });

  return tokenOwnerRecordAddress;
};

const encodeProposalDetails = (title: string, summary: string | undefined, description: string | undefined, link: string | undefined) => {
  const payload = JSON.stringify({ title, summary, description, link });
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return `data:application/json;base64,${window.btoa(payload)}`;
  }
  if (typeof Buffer !== "undefined") {
    return `data:application/json;base64,${Buffer.from(payload).toString("base64")}`;
  }
  return payload;
};

export const createProposal = async (
  wallet: WalletContextState,
  params: { title: string; summary?: string; description?: string; link?: string }
) => {
  if (!wallet.publicKey) throw new Error("Connect a wallet to continue");
  const connection = getConnection();
  const owner = wallet.publicKey;

  const tokenOwnerRecord = await ensureCommunityTokenOwnerRecord(wallet);

  const instructions: TransactionInstruction[] = [];
  const name = params.title.trim();
  if (!name) {
    throw new Error("Proposal title required");
  }

  const encodedDetails = encodeProposalDetails(name, params.summary, params.description, params.link);
  const voteType = VoteType.SINGLE_CHOICE;
  const options = ["Approve"];

  const proposalPubkey = await withCreateProposal(
    instructions,
    daoConfig.governanceProgramId,
    PROGRAM_VERSION,
    daoConfig.realm,
    daoConfig.governance,
    tokenOwnerRecord,
    name,
    encodedDetails,
    daoConfig.communityMint,
    owner,
    undefined,
    voteType,
    options,
    true,
    owner
  );

  withSignOffProposal(
    instructions,
    daoConfig.governanceProgramId,
    PROGRAM_VERSION,
    daoConfig.realm,
    daoConfig.governance,
    proposalPubkey,
    owner,
    undefined,
    tokenOwnerRecord
  );

  const transaction = buildTransaction(instructions, owner);
  await wallet.sendTransaction(transaction, connection, { skipPreflight: false });

  return proposalPubkey.toBase58();
};

export const castVote = async (
  wallet: WalletContextState,
  params: { proposal: PublicKey; proposalOwnerRecord: PublicKey; support: boolean }
) => {
  if (!wallet.publicKey) throw new Error("Connect a wallet to continue");
  const connection = getConnection();
  const owner = wallet.publicKey;
  const tokenOwnerRecord = await ensureCommunityTokenOwnerRecord(wallet);

  const vote = params.support ? Vote.fromYesNoVote(YesNoVote.Yes) : Vote.fromYesNoVote(YesNoVote.No);

  const instructions: TransactionInstruction[] = [];

  await withCastVote(
    instructions,
    daoConfig.governanceProgramId,
    PROGRAM_VERSION,
    daoConfig.realm,
    daoConfig.governance,
    params.proposal,
    params.proposalOwnerRecord,
    tokenOwnerRecord,
    owner,
    daoConfig.communityMint,
    vote,
    owner
  );

  const transaction = buildTransaction(instructions, owner);
  await wallet.sendTransaction(transaction, connection, { skipPreflight: false });
};

export const finalizeProposal = async (wallet: WalletContextState, proposal: PublicKey) => {
  if (!wallet.publicKey) throw new Error("Connect a wallet to continue");
  const connection = getConnection();
  const owner = wallet.publicKey;

  const tokenOwnerRecord = await ensureCommunityTokenOwnerRecord(wallet);

  const instructions: TransactionInstruction[] = [];
  await withFinalizeVote(
    instructions,
    daoConfig.governanceProgramId,
    PROGRAM_VERSION,
    daoConfig.realm,
    daoConfig.governance,
    proposal,
    tokenOwnerRecord,
    owner
  );

  const transaction = buildTransaction(instructions, owner);
  await wallet.sendTransaction(transaction, connection, { skipPreflight: false });
};
