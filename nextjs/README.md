# utilsio Next.js Template

Official Next.js starter template for integrating utilsio crypto subscriptions. A minimal, production-ready app demonstrating the full subscribe, manage, and cancel flow — powered by Superfluid money streams and USDT on Polygon.

Clone it to get a working subscription app in under 10 minutes, or use it as a reference implementation while integrating the `@utilsio/react` SDK into an existing project.

## What's Included

| File / Directory | Purpose |
|---|---|
| `src/app/layout.tsx` | `UtilsioProvider` wrapping the entire app |
| `src/app/page.tsx` | Subscribe and cancel UI using `useUtilsio()` |
| `src/app/actions.ts` | Server action for HMAC-SHA256 request signing |
| `src/app/api/signature-callback/route.ts` | Safari-compatible server-to-server callback endpoint |
| `src/app/success/page.tsx` | Post-subscribe redirect landing page |
| `src/app/cancelled/page.tsx` | Cancelled-flow redirect landing page |
| `.env.example` | Environment variable template |

**Tech stack:** Next.js 16 · App Router · TypeScript · Tailwind CSS · `@utilsio/react`

---

## Prerequisites

- Node.js 18+ or Bun
- A utilsio account with an app created at [utilsio.dev/creator/apps](https://utilsio.dev/creator/apps)

From the creator dashboard you'll need:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_UTILSIO_APP_ID` | Your public app UUID |
| `UTILSIO_APP_SECRET` | Your app secret (**never expose to client**) |
| `UTILSIO_APP_SALT` | Your app salt (**never expose to client**) |

---

## Quick Start

```bash
# Clone the templates repository
git clone https://github.com/utilsio/templates
cd templates/nextjs

# Install dependencies (Bun recommended)
bun install

# Copy and fill in environment variables
cp .env.example .env.local
# Edit .env.local with your credentials from utilsio.dev/creator/apps

# Start the development server
bun dev
# App runs on http://localhost:3001
```

That's it. Open [http://localhost:3001](http://localhost:3001) to see the subscription UI.

---

## Environment Variables

```env
# ─── Public (safe to expose to the browser) ──────────────────────────────────
NEXT_PUBLIC_UTILSIO_APP_ID=your_app_id_uuid_here
NEXT_PUBLIC_UTILSIO_APP_URL=https://utilsio.dev
NEXT_PUBLIC_APP_URL=http://localhost:3001

# ─── Secret (backend only — NEVER prefix with NEXT_PUBLIC_) ──────────────────
UTILSIO_APP_SECRET=your_app_secret_here
UTILSIO_APP_SALT=your_app_salt_here
```

- `NEXT_PUBLIC_APP_URL` tells the SDK where to redirect after subscription flows. Change it to your production domain when deploying.
- `NEXT_PUBLIC_UTILSIO_APP_URL` is the utilsio service URL. Keep it as `https://utilsio.dev`.
- `UTILSIO_APP_SECRET` and `UTILSIO_APP_SALT` are used server-side to generate HMAC signatures. They must never reach the browser.

---

## How It Works

### Authentication

`UtilsioProvider` in `layout.tsx` renders a hidden iframe pointing to utilsio.dev. That iframe reads the user's session cookie in a first-party context and sends the `deviceId` back via `postMessage`. The SDK then calls `getAuthHeadersAction` (your server action) to generate a signature and fetches the user's subscription state.

### Request Signing

All requests to utilsio's API are signed with HMAC-SHA256 to prove they come from your app:

```
Client                   Your Server (actions.ts)        utilsio API
  │                              │                            │
  ├─ getAuthHeadersAction ──────>│                            │
  │                              ├─ deriveAppHashHex()        │
  │                              ├─ signRequest()             │
  │<─ { signature, timestamp } ──┤                            │
  ├─ API request with sig ───────────────────────────────────>│
  │<─ subscription data ─────────────────────────────────────┤
```

`UTILSIO_APP_SECRET` never leaves your server.

### Subscribe Flow

1. User clicks subscribe → `redirectToConfirm()` redirects to `utilsio.dev/subscription/init`
2. User confirms on utilsio.dev
3. utilsio.dev redirects to `nextSuccess` URL on success, or `nextCancelled` URL if declined

### Cancel Flow

1. User clicks cancel → `cancelSubscription()` sends a DELETE request to utilsio API
2. utilsio verifies the signature and terminates the Superfluid stream
3. SDK automatically refreshes state; `currentSubscription` becomes `null`

---

## Key Source Files

### `src/app/layout.tsx`

Sets up `UtilsioProvider` for the whole app:

```typescript
import { UtilsioProvider } from "@utilsio/react/client";
import { getAuthHeadersAction } from "./actions";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UtilsioProvider
          utilsioBaseUrl={process.env.NEXT_PUBLIC_UTILSIO_APP_URL!}
          appId={process.env.NEXT_PUBLIC_UTILSIO_APP_ID!}
          getAuthHeadersAction={getAuthHeadersAction}
        >
          {children}
        </UtilsioProvider>
      </body>
    </html>
  );
}
```

### `src/app/actions.ts`

Server action that generates request signatures. The derived key is computed once at module load (scrypt is CPU-intensive):

```typescript
"use server";
import { deriveAppHashHex, signRequest } from "@utilsio/react/server";

const appHashHex = deriveAppHashHex({
  appSecret: process.env.UTILSIO_APP_SECRET!,
  salt: process.env.UTILSIO_APP_SALT!,
});

export async function getAuthHeadersAction(input: {
  deviceId: string;
  additionalData?: string;
}) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signRequest({
    appHashHex,
    deviceId: input.deviceId,
    appId: process.env.NEXT_PUBLIC_UTILSIO_APP_ID!,
    timestamp,
    additionalData: input.additionalData,
  });
  return { signature, timestamp: String(timestamp) };
}
```

### `src/app/page.tsx`

Main subscription component. Uses `useUtilsio()` to read state and trigger actions:

```typescript
"use client";
import { useUtilsio } from "@utilsio/react/client";

function SubscribeButton() {
  const { user, currentSubscription, loading, redirectToConfirm, cancelSubscription } = useUtilsio();

  const handleSubscribe = () => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    redirectToConfirm({
      appId: process.env.NEXT_PUBLIC_UTILSIO_APP_ID!,
      appName: "Demo App",
      amountPerDay: "0.01",  // 0.01 USD/day ≈ 0.30 USD/month
      appUrl,
      nextSuccess: `${appUrl}/success`,
      nextCancelled: `${appUrl}/cancelled`,
    });
  };

  if (currentSubscription) {
    return <button onClick={() => cancelSubscription([currentSubscription.id], process.env.NEXT_PUBLIC_APP_URL!)}>Cancel</button>;
  }

  return <button onClick={handleSubscribe}>Subscribe</button>;
}
```

### `src/app/api/signature-callback/route.ts`

Server-to-server endpoint called by utilsio.dev for Safari-compatible flows. Validates origin, timestamp, and appId before generating a signature.

---

## Safari & Privacy Browser Compatibility

Safari and Brave block third-party cookies in iframes, preventing the SDK from reading `deviceId` directly. This template includes the `/api/signature-callback` endpoint to handle these cases.

### Subscribe Flow (Safari)

1. User clicks subscribe → SDK redirects to `utilsio.dev/subscription/init`
2. utilsio.dev reads `deviceId` from its own first-party cookies
3. utilsio.dev calls `POST /api/signature-callback` on your server
4. Your server generates the signature and returns it
5. utilsio.dev redirects the user to the confirmation page

### Cancel Flow (Safari)

1. User clicks cancel → SDK sends DELETE request with `signatureCallbackUrl`, no `deviceId`
2. utilsio.dev reads `deviceId` from its own first-party cookies
3. utilsio.dev calls `POST /api/signature-callback` on your server
4. Your server generates the signature and returns it
5. utilsio.dev cancels the subscription

### Requirements

Always pass `appUrl` to `redirectToConfirm` and `cancelSubscription`:

```typescript
// Both of these enable the Safari fallback
redirectToConfirm({ ..., appUrl: process.env.NEXT_PUBLIC_APP_URL! });
await cancelSubscription([id], process.env.NEXT_PUBLIC_APP_URL!);
```

### Callback Endpoint Security

The `/api/signature-callback` endpoint validates:
- `X-utilsio-Origin: utilsio.dev` header (ensures calls come from utilsio.dev)
- HTTPS in production
- Timestamp within ±60 seconds (prevents replay attacks)
- `appId` matches your configured app

---

## Available Scripts

```bash
bun dev           # Start dev server on http://localhost:3001
bun build         # Production build (auto-switches to npm version of SDK)
bun start         # Run production server on port 3001
bun lint          # Run ESLint

# SDK version management (for monorepo development)
bun run use:local # Switch to local workspace version of @utilsio/react
bun run use:npm   # Switch back to published npm version of @utilsio/react
```

---

## Monorepo Development

When developing inside the utilsio monorepo (modifying the SDK and testing against this template):

```bash
# Switch to workspace version
cd templates/nextjs
bun run use:local   # Builds SDK, packs it, installs into this template

# After testing, revert before committing
bun run use:npm     # Or just run: bun build (auto-reverts)
```

This ensures the template always ships pointing to the published npm package, not a local file path.

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from templates/nextjs
vercel
```

Set these environment variables in your Vercel project settings:

```
NEXT_PUBLIC_UTILSIO_APP_ID=...
NEXT_PUBLIC_UTILSIO_APP_URL=https://utilsio.dev
NEXT_PUBLIC_APP_URL=https://yourdomain.vercel.app   ← update to your domain
UTILSIO_APP_SECRET=...
UTILSIO_APP_SALT=...
```

### Other Platforms

Any Node.js-compatible hosting works (Railway, Render, Fly.io, AWS, etc.). Update `NEXT_PUBLIC_APP_URL` to your production domain after deploying.

---

## Troubleshooting

**`user` is always `null`**
Expected in Safari and Brave. Don't gate your UI on `user` — show the subscribe button regardless. Authentication is handled automatically during the redirect flow.

**Subscription doesn't appear after confirm**
Call `refresh()` from `useUtilsio()` on page load or after returning from a redirect.

**Signature verification fails**
Ensure `UTILSIO_APP_SECRET`, `UTILSIO_APP_SALT`, and `NEXT_PUBLIC_UTILSIO_APP_ID` match the values in your creator dashboard exactly.

**Cancel fails on Safari**
You must pass `appUrl` as the second argument to `cancelSubscription()` and have the `/api/signature-callback` endpoint deployed.

**Dev server on wrong port**
The template is configured to run on port 3001 (via `bun --bun next dev -p 3001`). `NEXT_PUBLIC_APP_URL` in `.env.local` should match.

---

## Resources

- **Full Documentation:** [utilsio.dev/docs](https://utilsio.dev/docs)
- **React SDK Reference:** [utilsio.dev/docs/sdks/react](https://utilsio.dev/docs/sdks/react)
- **Integration Guide:** [utilsio.dev/docs/guides/nextjs](https://utilsio.dev/docs/guides/nextjs/quickstart)
- **Creator Dashboard:** [utilsio.dev/creator/apps](https://utilsio.dev/creator/apps)
- **SDK Source:** [github.com/utilsio/sdks](https://github.com/utilsio/sdks)

## License

Apache-2.0
