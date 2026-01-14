# Contributing to utilsio Templates

Thank you for contributing to utilsio templates! This guide will help you set up your development environment and understand the workflow.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) installed globally (recommended) or [pnpm](https://pnpm.io)
- Git configured
- Access to the main utilsio monorepo (for contributors)

### Local Development in Monorepo

When developing templates within the main utilsio monorepo:

#### 1. Initial Setup

```bash
# From the monorepo root
cd /path/to/utilsio
bun install

# Navigate to templates (submodule)
cd templates
```

#### 2. Switch to Local Workspace Dependencies

Before starting development, switch the template to use workspace dependencies:

```bash
# For any template (nextjs, react, etc.)
cd <template-name>
bun run use:local
```

This command:
- Changes `@utilsio/react` from `>=0.1.0` → `workspace:*`
- Runs install from monorepo root to link local packages
- Allows you to test template changes with local package versions

#### 3. Development

```bash
# Start dev server
bun dev

# In another terminal, make changes to the template or local packages
# Changes will hot-reload automatically
```

#### 4. Testing

```bash
# Test that the build works
bun run build

# Test the production build
bun run start
```

## Releasing Templates

**IMPORTANT:** Templates must be released with npm package versions, NOT workspace versions, so they work standalone when cloned.

### Automated Release (Recommended)

We provide automation scripts to handle the conversion and release process:

```bash
# From the templates/ directory
./release-template.sh <template-name>

# Example:
./release-template.sh nextjs
```

This script will:
1. Run the template's `prebuild.sh` script
2. Convert `workspace:*` → `>=0.1.0` in package.json
3. Stage the changes
4. Show you what will be committed
5. Provide instructions for final commit and push

**What happens behind the scenes:**

Each template has a `prebuild.sh` script that:
- Converts workspace dependencies to npm versions
- Verifies the conversion succeeded
- Prepares the template for standalone usage

### Manual Release

If you prefer to release manually:

```bash
cd <template-name>

# Convert to npm version
bun run use:npm

# Verify the change
cat package.json | grep "@utilsio/react"
# Should show: "@utilsio/react": ">=0.1.0"

# Commit and push
git add package.json
git commit -m "chore: prepare <template-name> template for release"
git push
```

### Creating a New Template

When creating a new template:

1. **Create the template directory:**
   ```bash
   cd templates
   mkdir my-template
   cd my-template
   ```

2. **Set up package.json with scripts:**
   ```json
   {
     "scripts": {
       "dev": "bun --bun next dev -p 3001",
       "build": "bun run use:npm && bun --bun next build",
       "start": "bun --bun next start -p 3001",
       "use:local": "sed -i '' 's/\"@utilsio\\/react\": \".*\"/\"@utilsio\\/react\": \"workspace:*\"/g' package.json && cd ../../ && bun install",
       "use:npm": "sed -i '' 's/\"@utilsio\\/react\": \"workspace:\\*\"/\"@utilsio\\/react\": \">=0.1.0\"/g' package.json"
     },
     "dependencies": {
       "@utilsio/react": ">=0.1.0"
     }
   }
   ```

3. **Create prebuild.sh script:**
   ```bash
   #!/bin/bash
   set -e
   
   echo "🔧 Preparing my-template for release..."
   
   # Convert workspace to npm version
   sed -i '' 's/"@utilsio\/react": "workspace:\*"/"@utilsio\/react": ">=0.1.0"/g' package.json
   
   # Verify
   if grep -q '"@utilsio/react": ">=0.1.0"' package.json; then
     echo "✅ Successfully converted to npm version"
   else
     echo "❌ Failed to convert dependency version"
     exit 1
   fi
   
   echo "✨ Prebuild complete!"
   ```

4. **Make it executable:**
   ```bash
   chmod +x prebuild.sh
   ```

5. **Test the template:**
   ```bash
   # Switch to workspace mode for development
   bun run use:local
   
   # Develop and test...
   bun dev
   
   # When ready to release
   cd ..
   ./release-template.sh my-template
   ```

## Template Structure

### Required Files

- **`package.json`**: Must use npm versions by default (`>=0.1.0`)
- **`prebuild.sh`**: Script to prepare template for release
- **Configuration files**: Framework-specific (e.g., `next.config.ts` for Next.js)
- **`.env.example`**: Documents required environment variables

### Scripts Reference

All templates should include these scripts:

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
bun run use:npm

# Or if in monorepo, switch to local and install from root
bun run use:local
```

### Issue: Forgot to convert to npm version before pushing

**Cause:** Pushed template with `workspace:*` dependency.

**Solution:**
```bash
# Run the release script
cd templates
./release-template.sh <template-name>

# Follow the instructions to commit and push the fix
```

### Issue: Template doesn't work when cloned standalone

**Cause:** Template has monorepo-specific configurations or workspace dependencies.

**Solution:**
- Ensure package.json uses npm versions (`>=0.1.0`)
- Test by cloning to /tmp and running `bun install`
- Remove any monorepo-specific code paths

## Testing Standalone Template

To verify the template works when cloned standalone:

```bash
# Clone to a temporary directory
cd /tmp
git clone https://github.com/utilsio/templates test-templates
cd test-templates/<template-name>

# Install and run
bun install
cp .env.example .env.local
bun dev
```

If this works without errors, your template is ready!

## Best Practices

1. **Always use `use:local` when starting monorepo development**
2. **Use `./release-template.sh` when preparing to release** (automated and safe)
3. **Test standalone clone** before releasing major changes
4. **Keep templates simple** - they should showcase utilsio features, not be complex apps
5. **Document environment variables** in `.env.example`
6. **Create prebuild.sh** for every new template
7. **Verify npm versions** before pushing (`grep "@utilsio/react" package.json`)

## Quick Reference

```bash
# Starting development
cd templates/<template-name>
bun run use:local
bun dev

# Releasing a template
cd templates
./release-template.sh <template-name>
git commit -m "chore: prepare template for release"
git push

# Creating new template
mkdir templates/my-template
cd templates/my-template
# Create package.json with required scripts
# Create prebuild.sh
chmod +x prebuild.sh
# Test with: cd .. && ./release-template.sh my-template
```

## Questions?

- Open an issue in the main utilsio repository
- Ask in the utilsio Discord
- Check existing templates for reference

Happy coding! 🚀
