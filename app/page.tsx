import { DaoWizardApp } from "../components/DaoWizardApp";
import { readWizardEnv } from "../lib/wizard/env";

export default function Home() {
  const initialEnv = readWizardEnv();
  return <DaoWizardApp initialEnv={initialEnv} />;
}
