import { DaoWizardApp } from "../components/DaoWizardApp";
import { GovernanceDashboard } from "../components/governance/GovernanceDashboard";
import { readWizardEnv } from "../lib/wizard/env";

export default function Home() {
  const initialEnv = readWizardEnv();
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-12">
      <GovernanceDashboard />
      <section className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg">
        <header className="mb-6 flex flex-col gap-1 text-white">
          <h2 className="text-xl font-semibold">Provision Another DAO</h2>
          <p className="text-sm text-slate-300">
            Need a fresh realm? Walk through the blueprint wizard and run the generated Lili CLI command.
          </p>
        </header>
        <DaoWizardApp initialEnv={initialEnv} />
      </section>
    </main>
  );
}
