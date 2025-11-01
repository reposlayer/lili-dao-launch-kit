# DAO Launch Kit
    ██╗     ██╗██╗     ██╗     ██████╗██╗     ██╗
    ██║     ██║██║     ██║    ██╔════╝██║     ██║
    ██║     ██║██║     ██║    ██║     ██║     ██║
    ██║     ██║██║     ██║    ██║     ██║     ██║
    ███████╗██║███████╗██║    ╚██████╗███████╗██║
    ╚══════╝╚═╝╚══════╝╚═╝     ╚═════╝╚══════╝╚═╝
Starter Next.js App Router template for bootstrapping Solana SPL Governance DAOs. Includes wallet connect UI, configurable governance parameters, and helper utilities for orchestrating on-chain setup flows.

## Features

- Wallet adapter UI (Phantom + Solflare) with auto-connect
- Governance config helper in `lib/governance.ts`
- Tailwind CSS styling + prebuilt form layout
- Environment-first configuration for RPC endpoints and realm IDs

## Quickstart

```bash
pnpm install
pnpm dev
```

Copy `.env.example` → `.env.local` and customise values:

```env
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_REALM=RealmPublicKey
NEXT_PUBLIC_TREASURY=DaoTreasuryPublicKey
```

## Extend

- Wire `bootstrapDao` into your backend or anchor scripts to create governance accounts.
- Add proposal creation server actions inside `app/actions`.
- Integrate analytics or CRM tools for DAO contributors.
