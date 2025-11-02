# DAO Launch Kit
    ██╗     ██╗██╗     ██╗     ██████╗██╗     ██╗
    ██║     ██║██║     ██║    ██╔════╝██║     ██║
    ██║     ██║██║     ██║    ██║     ██║     ██║
    ██║     ██║██║     ██║    ██║     ██║     ██║
    ███████╗██║███████╗██║    ╚██████╗███████╗██║
    ╚══════╝╚═╝╚══════╝╚═╝     ╚═════╝╚══════╝╚═╝
Starter Next.js App Router template for bootstrapping Solana SPL Governance DAOs. Includes wallet connect UI, configurable governance parameters, and helper utilities for orchestrating on-chain setup flows.
=======

Full-stack Next.js template that ships a multi-step wizard for provisioning Solana SPL Governance DAOs. Guide contributors through wallet connection, governance token setup, rule selection, treasury planning, and optional Realms integration, then export a ready-to-run blueprint for the Lili CLI.
>>>>>>> c528d8d (gg)

## Features

- Guided DAO wizard with validation and progress tracking
- Wallet adapter UI (Phantom + Solflare) backed by shared Solana provider
- Blueprint export that plugs directly into `lili deploy dao`
- Environment-driven defaults for cluster, mint metadata, and Realms overrides
- Tailwind CSS styling with dark surface components ready for extension

## Quickstart

```bash
pnpm install
pnpm dev
```

Copy `.env.example` → `.env.local` and tweak values to pre-fill the wizard:

```env
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_GOVERNANCE_MINT=
NEXT_PUBLIC_GOVERNANCE_SYMBOL=DAO
NEXT_PUBLIC_GOVERNANCE_DECIMALS=9
NEXT_PUBLIC_MIN_TOKENS_FOR_PROPOSAL=1
NEXT_PUBLIC_GOVERNANCE_QUORUM=20
NEXT_PUBLIC_REALM=
NEXT_PUBLIC_REALMS_PROGRAM_ID=
```

Launch `pnpm dev`, connect a wallet, walk through the wizard, and download the generated `dao-blueprint.json`. Run the suggested command to execute the deployment with Lili.

## Extend

- Wire custom server actions to push blueprints into CI/CD when teams finish the wizard.
- Add draft persistence by syncing the Zustand store to Postgres or Supabase.
- Integrate on-chain lookups (e.g. fetch mint supply) while keeping validation via Zod.
