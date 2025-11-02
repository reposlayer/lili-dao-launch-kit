'use client';

import { ChangeEvent } from "react";
import { useWizardStore } from "../../lib/wizard/store";

export function RulesStep() {
  const rules = useWizardStore((state) => state.rules);
  const updateRules = useWizardStore((state) => state.updateRules);

  const handleChange = (field: string) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      if (field === "quorumPercent" || field === "votingPeriodDays") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
          updateRules({ [field]: parsed } as never);
        }
        return;
      }
      updateRules({ [field]: value } as never);
    };

  return (
    <section className="grid gap-4 text-sm text-slate-200">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Governance rules</h2>
        <p className="text-xs text-slate-400">
          Fine tune how proposals are created and resolved. These settings translate directly into SPL
          Governance config instructions.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
          Min tokens for proposal
          <input
            className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={rules.minTokensToCreateProposal}
            onChange={handleChange("minTokensToCreateProposal")}
          />
        </label>
        <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
          Quorum %
          <input
            className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            type="number"
            min={0}
            max={100}
            value={rules.quorumPercent}
            onChange={handleChange("quorumPercent")}
          />
        </label>
        <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
          Voting period (days)
          <input
            className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            type="number"
            min={1}
            max={90}
            value={rules.votingPeriodDays}
            onChange={handleChange("votingPeriodDays")}
          />
        </label>
      </div>

      <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
        Vote tipping
        <select
          className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          value={rules.voteTipping}
          onChange={handleChange("voteTipping")}
        >
          <option value="strict">Full voting period</option>
          <option value="early">Early resolution when quorum reached</option>
          <option value="disabled">No tipping</option>
        </select>
      </label>

      <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
        Governance program override (optional)
        <input
          className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          placeholder="Use custom Governance Program ID"
          value={rules.governanceProgramId ?? ""}
          onChange={handleChange("governanceProgramId")}
        />
      </label>
    </section>
  );
}
