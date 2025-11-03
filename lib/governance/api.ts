import { getConnection } from "../solana";
import { daoConfig } from "../config";
import {
  getRealm,
  getAllProposals,
  getGovernance,
  getAllTokenOwnerRecords,
  getTokenOwnerRecordAddress,
  getVoteRecordsByVoter
} from "@solana/spl-governance";
import { PublicKey } from "@solana/web3.js";
import type {
  ProgramAccount,
  Proposal,
  Realm,
  Governance,
  TokenOwnerRecord,
  VoteRecord
} from "@solana/spl-governance";

export type RealmAccount = ProgramAccount<Realm>;
export type GovernanceAccount = ProgramAccount<Governance>;
export type ProposalAccount = ProgramAccount<Proposal>;
export type TokenOwnerRecordAccount = ProgramAccount<TokenOwnerRecord>;
export type VoteRecordAccount = ProgramAccount<VoteRecord>;

export const fetchRealm = async () => {
  const connection = getConnection();
  return getRealm(connection, daoConfig.realm);
};

export const fetchGovernance = async () => {
  const connection = getConnection();
  return getGovernance(connection, daoConfig.governance);
};

export const fetchProposals = async () => {
  const connection = getConnection();
  const nested = await getAllProposals(connection, daoConfig.governanceProgramId, daoConfig.realm);
  return nested.flat();
};

export const fetchTokenOwnerRecords = async () => {
  const connection = getConnection();
  return getAllTokenOwnerRecords(connection, daoConfig.governanceProgramId, daoConfig.realm);
};

export const fetchWalletTokenOwnerRecord = async (wallet: PublicKey) => {
  const connection = getConnection();
  try {
    const address = await getTokenOwnerRecordAddress(
      daoConfig.governanceProgramId,
      daoConfig.realm,
      daoConfig.communityMint,
      wallet
    );
    const account = await connection.getAccountInfo(address);
    if (!account) {
      return null;
    }
    return address;
  } catch (error) {
    console.warn("Failed to fetch token owner record", error);
    return null;
  }
};

export const fetchVoteRecordsForWallet = async (wallet: PublicKey) => {
  const connection = getConnection();
  return getVoteRecordsByVoter(connection, daoConfig.governanceProgramId, wallet);
};
