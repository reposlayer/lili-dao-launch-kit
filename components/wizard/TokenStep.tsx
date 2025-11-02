'use client';

import { ChangeEvent } from "react";
import { useWizardStore } from "../../lib/wizard/store";

const tokenSources = [
  { value: "lili", label: "Provision new mint with Lili" },
  { value: "custom", label: "Use existing mint" },
  { value: "realms", label: "Managed externally (Realms)" }
] as const;

export function TokenStep() {
  const token = useWizardStore((state) => state.token);
  const updateToken = useWizardStore((state) => state.updateToken);

  const handleChange = (field: string) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      if (field === "decimals") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
          updateToken({ decimals: parsed });
        }
        return;
      }
      updateToken({ [field]: value } as never);
    };

  return (
    <section className="grid gap-4 text-sm text-slate-200">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Governance Token</h2>
        <p className="text-xs text-slate-400">
          Configure the mint the DAO will govern. Lili can create a fresh mint or you can bring an
          existing one. We keep decimals and supply flexible for large token caps.
        </p>
      </header>

      <div className="grid gap-3">
        <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
          Token source
          <select
            className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            value={token.source}
            onChange={handleChange("source")}
          >
            {tokenSources.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
            Mint address
            <input
              className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={token.mint}
              placeholder="Optional if Lili should mint"
              onChange={handleChange("mint")}
              disabled={token.source === "lili"}
            />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
            Symbol
            <input
              className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={token.symbol}
              onChange={handleChange("symbol")}
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
            Decimals
            <input
              className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              type="number"
              min={0}
              max={9}
              value={token.decimals}
              onChange={handleChange("decimals")}
            />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
            Supply (optional)
            <input
              className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              placeholder="10_000_000"
              value={token.supply ?? ""}
              onChange={handleChange("supply")}
            />
          </label>
          <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
            Authority
            <select
              className="rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
              value={token.authority}
              onChange={handleChange("authority")}
            >
              <option value="locked">Lock supply (recommended)</option>
              <option value="mutable">Keep mint authority</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1 text-xs uppercase tracking-wide text-slate-400">
          Notes
          <textarea
            className="min-h-[80px] rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
            placeholder="Context for contributors"
            value={token.notes ?? ""}
            onChange={handleChange("notes")}
          />
        </label>
      </div>

      <div className="rounded border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-200">
        Tip: When choosing the Lili path we generate mint + metadata and wire it into the CLI deploy
        context automatically.
      </div>
    </section>
  );
}
