import type { ProposalAccount, GovernanceAccount } from "./api";
import { ProposalState } from "@solana/spl-governance";

export type ParsedProposal = {
  address: string;
  tokenOwnerRecord: string;
  name: string;
  summary: string | null;
  description: string | null;
  link: string | null;
  state: ProposalState;
  stateLabel: string;
  yesVotes: number;
  noVotes: number;
  votingStart: Date | null;
  votingEnd: Date | null;
  draftedAt: Date;
};

const decodeDescriptionLink = (raw: string): { summary: string | null; description: string | null; link: string | null } => {
  if (!raw) {
    return { summary: null, description: null, link: null };
  }

  if (raw.startsWith("data:")) {
    try {
      const [, payload] = raw.split(",");
      const decoded = (() => {
        if (typeof window !== "undefined" && typeof window.atob === "function") {
          return window.atob(payload);
        }
        if (typeof Buffer !== "undefined") {
          return Buffer.from(payload, "base64").toString("utf8");
        }
        return payload;
      })();
      const json = JSON.parse(decoded);
      return {
        summary: typeof json.summary === "string" ? json.summary : null,
        description: typeof json.description === "string" ? json.description : null,
        link: typeof json.link === "string" ? json.link : null
      };
    } catch (error) {
      console.warn("Failed to parse proposal description link", error);
      return { summary: null, description: null, link: null };
    }
  }

  if (raw.startsWith("http")) {
    return { summary: null, description: null, link: raw };
  }

  return { summary: raw, description: null, link: null };
};

const PROPOSAL_STATE_LABELS: Record<ProposalState, string> = {
  [ProposalState.Draft]: "Draft",
  [ProposalState.SigningOff]: "Signing Off",
  [ProposalState.Voting]: "Voting",
  [ProposalState.Succeeded]: "Succeeded",
  [ProposalState.Executing]: "Executing",
  [ProposalState.Completed]: "Completed",
  [ProposalState.Cancelled]: "Cancelled",
  [ProposalState.Defeated]: "Defeated",
  [ProposalState.ExecutingWithErrors]: "Executing with errors",
  [ProposalState.Vetoed]: "Vetoed"
};

export const parseProposal = (proposal: ProposalAccount, governance: GovernanceAccount | null): ParsedProposal => {
  const { summary, description, link } = decodeDescriptionLink(proposal.account.descriptionLink);
  const yesVotes = proposal.account.yesVotesCount.toNumber();
  const noVotes = proposal.account.noVotesCount.toNumber();

  let votingEnd: Date | null = null;
  if (proposal.account.votingAt && governance) {
    const votingStart = proposal.account.votingAt.toNumber() * 1000;
    const baseVotingTime = governance.account.config.baseVotingTime * 1000;
    votingEnd = new Date(votingStart + baseVotingTime);
  }

  return {
    address: proposal.pubkey.toBase58(),
    tokenOwnerRecord: proposal.account.tokenOwnerRecord.toBase58(),
    name: proposal.account.name,
    summary,
    description,
    link,
    state: proposal.account.state,
    stateLabel: PROPOSAL_STATE_LABELS[proposal.account.state],
    yesVotes,
    noVotes,
    votingStart: proposal.account.votingAt ? new Date(proposal.account.votingAt.toNumber() * 1000) : null,
    votingEnd,
    draftedAt: new Date(proposal.account.draftAt.toNumber() * 1000)
  };
};
