'use client';

import { ChangeEvent, useState } from "react";
import { useWizardStore } from "../../lib/wizard/store";

export function TreasuryStep() {
  const treasury = useWizardStore((state) => state.treasury);
  const updateTreasury = useWizardStore((state) => state.updateTreasury);
  const [memberInput, setMemberInput] = useState<string>("");

  const handleToggle = (field: "createTreasury" | "createMultisig") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateTreasury({ [field]: event.target.checked } as never);
    };

  const handleChange = (field: string) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      if (field === "multisigThreshold") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
          updateTreasury({ multisigThreshold: parsed });
        }
        return;
      }
      updateTreasury({ [field]: value } as never);
    };

  const addMember = () => {
    if (!memberInput.trim()) {
      return;
    }
    updateTreasury({ multisigMembers: [...treasury.multisigMembers, memberInput.trim()] });
    setMemberInput("");
  };

  const removeMember = (index: number) => {
    const next = treasury.multisigMembers.filter((_, idx) => idx !== index);
    updateTreasury({ multisigMembers: next });
  };

  return (
    <section className="grid gap-4 text-sm text-slate-200">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Treasury & custody</h2>
        <p className="text-xs text-slate-400">
          Decide where governance controlled assets live. We can bootstrap a PDA treasury and optional
          multisig council for additional checks.
        </p>
      </header>

      <label className="flex items-center gap-3 rounded border border-white/10 bg-black/40 px-3 py-2 text-xs uppercase tracking-wide text-slate-300">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border border-white/20 bg-black"
          checked={treasury.createTreasury}
          onChange={handleToggle("createTreasury")}
        />
        Create governance treasury vault
      </label>

      {treasury.createTreasury ? (
        <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
          Override treasury account (optional)
          <input
            className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            placeholder="Supply a PDA or existing vault"
            value={treasury.treasuryAccount ?? ""}
            onChange={handleChange("treasuryAccount")}
          />
        </label>
      ) : (
        <p className="text-xs text-amber-300">
          Without a treasury we will only configure governance params. You can wire vaults later through the CLI output.
        </p>
      )}

      <label className="flex items-center gap-3 rounded border border-white/10 bg-black/40 px-3 py-2 text-xs uppercase tracking-wide text-slate-300">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border border-white/20 bg-black"
          checked={treasury.createMultisig}
          onChange={handleToggle("createMultisig")}
        />
        Configure multisig council
      </label>

      {treasury.createMultisig && (
        <div className="grid gap-3 rounded border border-white/10 bg-black/40 p-4">
          <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
            Approval threshold
            <input
              className="rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
              type="number"
              min={1}
              value={treasury.multisigThreshold}
              onChange={handleChange("multisigThreshold")}
            />
          </label>

          <div className="grid gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">Council members</span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="flex-1 rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
                placeholder="Wallet address"
                value={memberInput}
                onChange={(event) => setMemberInput(event.target.value)}
              />
              <button
                type="button"
                className="rounded bg-primary px-4 py-2 text-xs font-semibold text-white"
                onClick={addMember}
              >
                Add member
              </button>
            </div>
            <ul className="space-y-2 text-xs">
              {treasury.multisigMembers.map((member, index) => (
                <li
                  key={member}
                  className="flex items-center justify-between rounded border border-white/10 bg-black/40 px-3 py-2"
                >
                  <span className="font-mono text-sky-200">{member}</span>
                  <button
                    type="button"
                    className="text-emerald-200 transition hover:text-emerald-100"
                    onClick={() => removeMember(index)}
                  >
                    Remove
                  </button>
                </li>
              ))}
              {treasury.multisigMembers.length === 0 && (
                <li className="rounded border border-dashed border-white/10 bg-black/20 px-3 py-2 text-slate-400">
                  Add at least one member wallet to enable the council.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
        Notes
        <textarea
          className="min-h-[80px] rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          placeholder="Context on custody expectations"
          value={treasury.notes ?? ""}
          onChange={handleChange("notes")}
        />
      </label>
    </section>
  );
}
