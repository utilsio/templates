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

## Safari Compatibility

The template includes a `/api/signature-callback` endpoint that enables both subscription and cancellation flows in Safari and other browsers that block third-party cookies.

### How It Works

Safari blocks third-party cookies in iframes, preventing the SDK from reading deviceId. The solution uses server-side signature generation:

**Subscribe Flow:**
1. User clicks subscribe in Safari (no deviceId available)
2. SDK redirects to utilsio.dev/subscription/init which reads deviceId from first-party cookies
3. utilsio.dev calls your `/api/signature-callback` endpoint (server-to-server)
4. Your server generates signature using the app secret
5. utilsio.dev redirects to confirmation page with signature

**Cancel Flow:**
1. User clicks cancel in Safari (no deviceId available)
2. SDK makes DELETE request without deviceId/signature, includes signatureCallbackUrl
3. utilsio.dev reads deviceId from first-party cookies
4. utilsio.dev calls your `/api/signature-callback` endpoint (server-to-server)
5. Your server generates signature using the app secret
6. utilsio.dev verifies signature and deletes subscription

### Implementation

**In your component:**
```tsx
const {redirectToConfirm, cancelSubscription} = useUtilsio();

// Subscribe - pass appUrl for Safari support
redirectToConfirm({
  appId,
  appName: "Demo App",
  amountPerDay: "1",
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  nextSuccess: `${appUrl}/success`,
  nextCancelled: `${appUrl}/cancelled`,
});

// Cancel - pass appUrl for Safari support
await cancelSubscription([subscriptionId], process.env.NEXT_PUBLIC_APP_URL);
```

### Security

The callback endpoint:
- Validates the origin header (`X-utilsio-Origin: utilsio.dev`)
- Requires HTTPS in production
- Validates timestamp is recent (within 10 seconds) to prevent replay attacks
- Verifies appId matches your configured app
- Keeps your app secret secure on your server

### Endpoint Location

The signature callback is automatically included in this template:
- **Path:** `/api/signature-callback/route.ts`
- **Method:** POST
- **Called by:** utilsio.dev (server-to-server only)
- **Handles:** Both subscribe and cancel flows

No additional configuration needed - it works out of the box!

## Resources

- [utilsio Documentation](https://utilsio.dev/docs)
- [utilsio Creator Dashboard](https://utilsio.dev/creator/apps)
- [@utilsio/react SDK](https://github.com/utilsio/sdks)

## License

Apache-2.0
