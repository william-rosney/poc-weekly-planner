# Fix Docker Dependency Sync Issues

Fix npm package-lock.json sync issues that prevent Docker builds from succeeding.

## What it does

1. **Clean install dependencies:**
   - Removes `node_modules` and `package-lock.json`
   - Runs fresh `npm install` to regenerate lock file

2. **Fix @swc/helpers version conflict:**
   - Explicitly installs `@swc/helpers@0.5.17` to satisfy peer dependencies
   - Resolves conflicts between Next.js and other packages

3. **Rebuild Docker containers:**
   - Runs `docker-compose up -d --build` with the updated lock file
   - Ensures containers use the fresh dependency tree

## When to use

- When Docker build fails with "Missing: @swc/helpers from lock file"
- When package.json and package-lock.json are out of sync
- After adding/updating npm packages that affect Docker builds

## Steps

Execute the following commands in order:

1. Clean and reinstall:

   ```bash
   rm -rf node_modules package-lock.json && npm install
   ```

2. Fix @swc/helpers version:

   ```bash
   npm install @swc/helpers@0.5.17 --save-exact
   ```

3. Rebuild Docker:
   ```bash
   docker-compose up -d --build
   ```

**Important:** This command requires a clean git working directory. Commit or stash changes before running.
