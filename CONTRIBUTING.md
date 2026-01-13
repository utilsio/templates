# Contributing to utilsio Templates

Thank you for contributing to utilsio templates! This guide will help you set up your development environment and understand the workflow.

## Development Setup

### Prerequisites

- [pnpm](https://pnpm.io) installed globally (recommended) or [Bun](https://bun.sh)
- Git configured
- Access to the main utilsio monorepo (for contributors)

### Local Development in Monorepo

When developing templates within the main utilsio monorepo:

#### 1. Initial Setup

```bash
# From the monorepo root
cd /path/to/utilsio
pnpm install
# or: bun install

# Navigate to templates (submodule)
cd templates
```

#### 2. Switch to Local Workspace Dependencies

Before starting development, switch the template to use workspace dependencies:

```bash
cd nextjs
pnpm run use:local
# or: bun run use:local
```

This command:
- Changes `@utilsio/react` from `>=0.1.0` → `workspace:*`
- Runs install from monorepo root to link local packages
- Allows you to test template changes with local package versions

#### 3. Development

```bash
# Start dev server (runs on port 3001)
pnpm dev
# or: bun run dev

# In another terminal, make changes to the template or local packages
# Changes will hot-reload automatically
```

#### 4. Testing

```bash
# Test that the build works
pnpm build
# or: bun run build

# Test the production build
pnpm start
# or: bun run start
```

### Preparing for Git Push

**IMPORTANT:** Templates must be committed with npm package versions, NOT workspace versions, so they work standalone when cloned.

#### Before Committing

You have two options:

**Option 1: Use the build script (Recommended)**
```bash
pnpm build
# or: bun run build
```
The build script automatically converts `workspace:*` → `>=0.1.0` before building.

**Option 2: Manually revert**
```bash
pnpm run use:npm
# or: bun run use:npm
```

#### Verify Before Pushing

Always check that `package.json` has the npm version:

```bash
# Check the dependency
cat package.json | grep "@utilsio/react"
# Should show: "@utilsio/react": ">=0.1.0"
# NOT: "@utilsio/react": "workspace:*"
```

#### Git Workflow

```bash
# 1. Make sure you're using npm versions
pnpm run use:npm
# or: bun run use:npm

# 2. Stage your changes
git add .

# 3. Commit
git commit -m "feat: add new feature to nextjs template"

# 4. Push
git push
```

### Testing Standalone Template

To verify the template works when cloned standalone:

```bash
# Clone to a temporary directory
cd /tmp
git clone https://github.com/utilsio/templates test-templates
cd test-templates

# Install and run
pnpm install
# or: bun install
cd nextjs
cp .env.example .env.local
pnpm dev
# or: bun run dev
```

If this works without errors, your template is ready!

## Template Structure

### Configuration Files

- **`package.json`**: Must use npm versions by default (`>=0.1.0`)
- **`next.config.ts`**: Turbopack root set to `../../` for monorepo compatibility
- **`.env.example`**: Documents required environment variables
- **`src/lib/supabase.ts`**: Stub file to satisfy monorepo's proxy.ts import

### Scripts Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `dev` | Start dev server | Daily development |
| `build` | Build for production + auto-convert to npm version | Before committing, testing builds |
| `start` | Run production build | Testing production behavior |
| `use:local` | Switch to workspace dependencies | Start of monorepo dev session |
| `use:npm` | Switch to npm dependencies | Before committing (or just use `build`) |

## Common Issues

### Issue: "Workspace dependency not found"

**Cause:** You ran install from template directory with `workspace:*` version.

**Solution:**
```bash
# Switch to npm version
pnpm run use:npm
# or: bun run use:npm

# Or if in monorepo, switch to local and install from root
pnpm run use:local
# or: bun run use:local
```

### Issue: "Turbopack can't find next package"

**Cause:** Incorrect turbopack.root configuration.

**Solution:** Ensure `next.config.ts` has:
```typescript
turbopack: {
  root: path.resolve(__dirname, "../../"),
}
```

### Issue: Build fails with proxy.ts error

**Cause:** Missing stub file at `src/lib/supabase.ts`.

**Solution:** Ensure the stub file exists:
```typescript
// src/lib/supabase.ts
export const supabaseServerClient = () => {
  throw new Error("This should not be called from the template");
};
```

## Best Practices

1. **Always use `use:local` when starting monorepo development**
2. **Always verify npm versions before pushing** (`grep "@utilsio/react" package.json`)
3. **Test standalone clone** before releasing major changes
4. **Keep templates simple** - they should showcase utilsio features, not be complex apps
5. **Document environment variables** in `.env.example`

## Questions?

- Open an issue in the main utilsio repository
- Ask in the utilsio Discord
- Check existing templates for reference

Happy coding! 🚀
