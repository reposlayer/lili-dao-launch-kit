'use client';

import { ChangeEvent } from "react";
import { useWizardStore } from "../../lib/wizard/store";

export function RealmsStep() {
  const realms = useWizardStore((state) => state.realms);
  const updateRealms = useWizardStore((state) => state.updateRealms);

  const handleToggle = (event: ChangeEvent<HTMLInputElement>) => {
    updateRealms({ useRealms: event.target.checked });
  };

  const handleChange = (field: string) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateRealms({ [field]: event.target.value } as never);
    };

  return (
    <section className="grid gap-4 text-sm text-slate-200">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Realms compatibility</h2>
        <p className="text-xs text-slate-400">
          Prefer the native Lili governance flow but keep option to wire outputs into Realms. Enable if
          you plan to register the DAO with an existing Realms instance.
        </p>
      </header>

      <label className="flex items-center gap-3 rounded border border-white/10 bg-black/40 px-3 py-2 text-xs uppercase tracking-wide text-slate-300">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border border-white/20 bg-black"
          checked={realms.useRealms}
          onChange={handleToggle}
        />
        Enable Realms integration
      </label>

      {realms.useRealms ? (
        <div className="grid gap-3 rounded border border-white/10 bg-black/40 p-4">
          <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
            Existing Realm address
            <input
              className="rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
              value={realms.existingRealm ?? ""}
              onChange={handleChange("existingRealm")}
              placeholder="Realm public key"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
            Governance program ID (optional)
            <input
              className="rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
              value={realms.governanceProgramId ?? ""}
              onChange={handleChange("governanceProgramId")}
              placeholder="Override program"
            />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
            Council mint (optional)
            <input
              className="rounded border border-white/10 bg-black/60 px-3 py-2 text-sm text-white"
              value={realms.councilMint ?? ""}
              onChange={handleChange("councilMint")}
              placeholder="Council mint public key"
            />
          </label>
        </div>
      ) : (
        <div className="rounded border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
          Staying on the Lili track keeps your governance lifecycle inside the CLI and Anchor programs.
          You can re-run the wizard later if you want to publish into Realms.
        </div>
      )}
    </section>
  );
}
