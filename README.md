# utilsio Templates

Official starter templates for integrating Utilsio crypto subscriptions into your projects.

## Available Templates

### Next.js 16 Template

A complete Next.js application demonstrating Utilsio integration.

- **Location:** `nextjs/`
- **Features:**
  - 🔐 Seamless Authentication - Hidden iframe pattern for cross-domain auth
  - 💳 One-Click Subscriptions - Subscribe with POL tokens (Polygon)
  - ⚡ Daily Billing - Powered by Superfluid money streams
  - 🎨 Clean UI - Built with Next.js 16 and Tailwind CSS

See `nextjs/README.md` for detailed setup instructions.

## Quick Start

### Standalone Usage (Recommended for new projects)

Clone just the templates repository and start building:

```bash
# Clone the templates repository
git clone https://github.com/utilsio/templates
cd templates

# Install dependencies from templates root
pnpm install
# or: bun install

# Navigate to Next.js template
cd nextjs

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your utilsio app credentials

# Start development server (runs on port 3001)
pnpm dev
# or: bun run dev

# Build for production
pnpm build
# or: bun run build
```

### Monorepo Development (For utilsio contributors)

When developing within the main utilsio monorepo:

```bash
# From monorepo root
pnpm install
# or: bun install

# Navigate to template
cd templates/nextjs

# Switch to workspace version for local development
pnpm run use:local
# or: bun run use:local

# Start development server
pnpm dev
# or: bun run dev

# Before committing: revert to npm version
pnpm run use:npm
# or: bun run use:npm
# OR just run build (auto-reverts to npm version)
pnpm build
# or: bun run build
```

## Development Workflow

Each template is a standalone application that can be used independently:

```bash
# Navigate to template
cd nextjs

# Install dependencies
pnpm install
# or: bun install

# Start development server
pnpm dev
# or: bun run dev

# Build for production
pnpm build
# or: bun run build

# Run production build
pnpm start
# or: bun run start
```

## Resources

- [utilsio Documentation](https://utilsio.dev/docs)
- [utilsio Creator Dashboard](https://utilsio.dev/creator/apps)
- [@utilsio/react SDK](https://github.com/utilsio/sdks)

## License

Apache-2.0
