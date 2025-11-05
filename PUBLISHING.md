# Publishing to npm

## Prerequisites

1. **npm account**: Create one at https://www.npmjs.com/signup
2. **Verify email**: Make sure your npm email is verified
3. **Choose package name**: Check if `payload-posthog-analytics` is available at https://www.npmjs.com/package/payload-posthog-analytics

## Steps to Publish

### 1. Update package.json

Before publishing, update these fields in `package.json`:

```json
{
  "name": "payload-posthog-analytics", // Or your chosen name if taken
  "version": "1.0.0",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/payload-posthog-analytics"
  }
}
```

### 2. Test Locally (Recommended)

Test the package in another project before publishing:

```bash
# In the plugin directory
cd src/plugins/analytics
npm link

# In your test project
npm link payload-posthog-analytics

# Use it in your test project's payload.config.ts
import { analyticsPlugin } from 'payload-posthog-analytics'
```

### 3. Login to npm

```bash
npm login
```

Enter your username, password, and email when prompted.

### 4. Publish

```bash
cd src/plugins/analytics
npm publish
```

If the package name is taken, you can:
- Publish under a scope: `@your-username/payload-posthog-analytics`
- Choose a different name

To publish under a scope, update `package.json`:

```json
{
  "name": "@your-username/payload-posthog-analytics"
}
```

Then publish with:

```bash
npm publish --access public
```

### 5. Verify

Visit https://www.npmjs.com/package/payload-posthog-analytics (or your package name) to see your published package.

## Publishing Updates

When you make changes:

1. **Update version** in `package.json`:
   - Patch (bug fixes): `1.0.0` → `1.0.1`
   - Minor (new features): `1.0.0` → `1.1.0`
   - Major (breaking changes): `1.0.0` → `2.0.0`

2. **Publish**:
   ```bash
   npm publish
   ```

## Recommended: Create a Separate Repo

For easier maintenance, consider moving the plugin to its own repository:

```bash
# Create new repo on GitHub
mkdir payload-posthog-analytics
cd payload-posthog-analytics

# Copy plugin files
cp -r /path/to/elite/src/plugins/analytics/* .

# Initialize git
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/payload-posthog-analytics.git
git push -u origin main

# Publish to npm
npm publish
```

## Alternative: Use GitHub Packages

If you prefer, you can publish to GitHub Packages instead of npm:

```bash
# Update package.json
{
  "name": "@your-username/payload-posthog-analytics",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}

# Login to GitHub packages
npm login --registry=https://npm.pkg.github.com

# Publish
npm publish
```

## Tips

- **Test thoroughly** before publishing
- **Add a LICENSE** file (MIT recommended)
- **Tag releases** in git: `git tag v1.0.0 && git push --tags`
- **Write a CHANGELOG.md** to track changes between versions
- **Consider CI/CD** for automated testing and publishing

## Unpublishing

If you need to unpublish (within 72 hours):

```bash
npm unpublish payload-posthog-analytics@1.0.0
```

**Note**: Unpublishing is discouraged. It's better to publish a new version.
