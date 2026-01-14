# Contributing to utilsio Templates

Thank you for contributing to utilsio templates! This guide outlines the general workflow for developing and releasing templates.

## Template Structure

Each template is a standalone project that can be cloned and used independently. Templates should:

- Include a `prebuild.sh` script that prepares the template for release
- Use npm package versions by default (e.g., `>=0.1.0`)
- Switch to workspace dependencies during development (e.g., `workspace:*`)
- Be framework-agnostic and self-contained

## Development Workflow

### 1. Starting Development

When developing a template within the monorepo:

```bash
cd templates/<template-name>

# Switch to workspace dependencies for local development
# (Each template defines how to do this in its own scripts)
```

### 2. Make Your Changes

Develop and test your template as you normally would. The template should work both:
- As a standalone project (when cloned separately)
- Within the monorepo (for local development)

### 3. Releasing the Template

**IMPORTANT:** Templates must use npm package versions (not workspace references) when committed, so they work standalone.

#### Automated Release (Recommended)

```bash
cd templates
./release-template.sh <template-name>
```

This script will:
1. Run the template's `prebuild.sh` script
2. Convert workspace dependencies to npm versions
3. Stage the changes
4. Show you what will be committed

Then follow the instructions to commit and push.

#### Manual Release

If you prefer to release manually, follow your template's specific instructions for converting dependencies.

## Creating a New Template

### Required Files

Every template must include:

1. **`prebuild.sh`** - Script that prepares the template for release
   - Must be executable (`chmod +x prebuild.sh`)
   - Should convert workspace references to npm versions
   - Should validate the conversion succeeded

2. **`README.md`** - Template-specific documentation
   - How to use the template
   - Required environment variables
   - Framework-specific setup instructions

3. **`package.json`** or equivalent - Dependency manifest
   - Must use npm versions by default (e.g., `>=0.1.0`, not `workspace:*`)
   - Should include scripts for local development and release

### Example `prebuild.sh`

```bash
#!/bin/bash
set -e

echo "🔧 Preparing <template-name> template for release..."

# Convert workspace dependencies to package versions
# (Implementation varies by language/framework)

# Verify the conversion
# (Add validation logic here)

echo "✨ Prebuild complete!"
```

### Testing Your Template

1. **Test in monorepo:**
   - Switch to workspace dependencies
   - Verify local packages work correctly

2. **Test standalone:**
   - Clone to a temporary directory
   - Install dependencies (should use npm versions)
   - Verify the template works independently

## Best Practices

1. **Keep templates simple** - Focus on showcasing utilsio features
2. **Test standalone** before releasing major changes
3. **Document everything** - Clear README with setup instructions
4. **Use the release script** - Automates conversion and reduces errors
5. **Framework-agnostic** - Each template handles its own tooling

## Questions?

- Open an issue in the main utilsio repository
- Check existing templates for reference

Happy coding! 🚀
