'use client';

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WizardStepper } from "./wizard/WizardStepper";
import { IntroStep } from "./wizard/IntroStep";
import { TokenStep } from "./wizard/TokenStep";
import { RulesStep } from "./wizard/RulesStep";
import { TreasuryStep } from "./wizard/TreasuryStep";
import { RealmsStep } from "./wizard/RealmsStep";
import { ReviewStep } from "./wizard/ReviewStep";
import { getNextStep, getPrevStep, useWizardStore, type WizardStepId, WIZARD_STEP_ORDER } from "../lib/wizard/store";
import { readWizardEnv, type WizardEnv } from "../lib/wizard/env";
import { createDaoBlueprint, formatCliCommand } from "../lib/wizard/blueprint";
import { validateStep } from "../lib/wizard/validation";

interface DaoWizardAppProps {
  initialEnv?: WizardEnv;
}

const introGateMessage = "Connect a wallet before moving forward.";

export function DaoWizardApp({ initialEnv }: DaoWizardAppProps) {
  const wallet = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [env] = useState<WizardEnv>(initialEnv ?? readWizardEnv());

  const currentStep = useWizardStore((state) => state.progress.currentStep);
  const setStep = useWizardStore((state) => state.setStep);
  const initializeFromEnv = useWizardStore((state) => state.initializeFromEnv);
  const wizardData = useWizardStore((state) => ({
    token: state.token,
    rules: state.rules,
    treasury: state.treasury,
    realms: state.realms
  }));

  useEffect(() => {
    initializeFromEnv({
      mint: env.governanceMint,
      symbol: env.governanceSymbol,
      decimals: env.governanceDecimals,
      quorumPercent: env.quorumPercent,
      votingPeriodDays: env.votingPeriodDays,
      minTokensToCreateProposal: env.minTokensToCreateProposal,
      realmsProgramId: env.realmsProgramId,
      existingRealm: env.existingRealm,
      councilMint: env.councilMint
    });
  }, [env, initializeFromEnv]);

  const blueprint = useMemo(
    () =>
      createDaoBlueprint({
        cluster: env.cluster,
        rpcUrl: env.rpcUrl,
        walletAddress: wallet.publicKey?.toBase58(),
        token: wizardData.token,
        rules: wizardData.rules,
        treasury: wizardData.treasury,
        realms: wizardData.realms
      }),
    [env.cluster, env.rpcUrl, wallet.publicKey, wizardData]
  );

  const cliCommand = useMemo(() => formatCliCommand(blueprint), [blueprint]);

  const goToStep = (step: WizardStepId) => {
    setErrors([]);
    setStatus(null);
    setStep(step);
  };

  const handlePrev = () => {
    const previous = getPrevStep(currentStep);
    if (!previous) return;
    goToStep(previous);
  };

  const handleNext = () => {
    if (currentStep === "intro" && !wallet.publicKey) {
      setErrors([introGateMessage]);
      return;
    }

    const validation = validateStep(currentStep, wizardData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const next = getNextStep(currentStep);
    if (!next) {
      return;
    }
    setErrors([]);
    goToStep(next);
  };

  const handleDownload = () => {
    const fileName = `dao-blueprint-${Date.now()}.json`;
    const data = JSON.stringify(blueprint, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus(`Blueprint saved as ${fileName}. Run the CLI command next.`);
  };

  const renderStep = () => {
    switch (currentStep) {
      case "intro":
        return <IntroStep cluster={env.cluster} rpcUrl={env.rpcUrl} />;
      case "token":
        return <TokenStep />;
      case "rules":
        return <RulesStep />;
      case "treasury":
        return <TreasuryStep />;
      case "realms":
        return <RealmsStep />;
      case "review":
        return (
          <ReviewStep
            blueprint={blueprint}
            cliCommand={cliCommand}
            statusMessage={status}
            onDownload={handleDownload}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <WizardStepper />
        <p className="text-xs text-slate-400">
          Step {WIZARD_STEP_ORDER.indexOf(currentStep) + 1} of {WIZARD_STEP_ORDER.length}
        </p>
      </header>

      <section className="grid gap-6 rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg">
        {renderStep()}
      </section>

      {errors.length > 0 && (
        <div className="rounded border border-rose-400/40 bg-rose-500/10 p-4 text-xs text-rose-100">
          <p className="font-semibold">Fix these before continuing:</p>
          <ul className="mt-2 space-y-1">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <footer className="flex flex-col gap-2 text-xs text-slate-300 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!getPrevStep(currentStep)}
            className="rounded border border-white/10 px-4 py-2 font-semibold text-slate-200 disabled:opacity-40"
          >
            Back
          </button>
          {currentStep !== "review" && (
            <button
              type="button"
              onClick={handleNext}
              className="rounded bg-primary px-4 py-2 font-semibold text-white"
            >
              Continue
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-500">
          Outputs feed directly into the Lili CLI. Re-run the flow anytime to refresh governance configs.
        </p>
      </footer>
    </main>
  );
}
