'use client';

import { useWizardStore, WIZARD_STEP_ORDER } from "../../lib/wizard/store";

const LABELS: Record<string, string> = {
  intro: "Overview",
  token: "Governance Token",
  rules: "Rules",
  treasury: "Treasury",
  realms: "Realms",
  review: "Summary"
};

export function WizardStepper() {
  const progress = useWizardStore((state) => state.progress);

  return (
    <ol className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
      {WIZARD_STEP_ORDER.map((stepId, index) => {
        const isActive = progress.currentStep === stepId;
        const isComplete = progress.visited.has(stepId) && !isActive;
        const baseClass =
          "grid h-7 w-7 place-items-center rounded-full border text-[11px] font-semibold transition";
        const chipClass = isActive
          ? `${baseClass} border-sky-400 bg-sky-500/10 text-sky-200`
          : isComplete
            ? `${baseClass} border-emerald-400 bg-emerald-500/10 text-emerald-200`
            : `${baseClass} border-white/10 bg-white/5 text-slate-400`;
        return (
          <li key={stepId} className="flex items-center gap-2">
            <span className={chipClass}>
              {index + 1}
            </span>
            <span className="font-medium tracking-wide text-slate-200">{LABELS[stepId]}</span>
            {index < WIZARD_STEP_ORDER.length - 1 && (
              <span className="mx-1 hidden h-px w-8 bg-white/10 sm:block" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
