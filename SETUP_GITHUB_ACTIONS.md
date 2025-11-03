# GitHub Actions Setup for Cloudflare Pages

This guide will help you set up automatic deployments to Cloudflare Pages using GitHub Actions.

## Step 1: Create Cloudflare API Token

1. Visit https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use template **"Edit Cloudflare Workers"** OR create custom token with:
   - **Permissions:**
     - Account → Cloudflare Pages → Edit
   - **Account Resources:**
     - Include → Your Account (Rahman.sakeeb@gmail.com's Account)
4. Click **"Continue to summary"** → **"Create Token"**
5. **Copy the token** - you'll need it in the next step!

## Step 2: Add Secrets to GitHub Repository

### Option A: Via GitHub Web Interface (Recommended)

1. Go to https://github.com/Sakeeb91/shafkatrahman-website/settings/secrets/actions
2. Click **"New repository secret"**
3. Add two secrets:

   **Secret 1:**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: [Paste the API token from Step 1]

   **Secret 2:**
   - Name: `CLOUDFLARE_ACCOUNT_ID`
   - Value: `749969683e1be38526dfba377dc53524`

### Option B: Via GitHub CLI (if you have `gh` CLI installed)

```bash
# Navigate to your project
cd "/Users/sakeeb/Code repositories/shafkatrahman/shafkatrahman-website"

# Add API token (you'll be prompted to paste it)
gh secret set CLOUDFLARE_API_TOKEN

# Add Account ID
gh secret set CLOUDFLARE_ACCOUNT_ID -b"749969683e1be38526dfba377dc53524"
```

## Step 3: Test the Workflow

1. Commit and push the workflow file:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions workflow for Cloudflare Pages deployment"
   git push
   ```

2. Check the deployment:
   - Go to https://github.com/Sakeeb91/shafkatrahman-website/actions
   - You should see the "Deploy to Cloudflare Pages" workflow running
   - Wait for it to complete (usually 30-60 seconds)

## Step 4: Verify Deployment

After the workflow completes:
1. Visit https://shafkatrahman.com to verify your site is live
2. The workflow will run automatically on every push to `main`
3. Pull requests will also get preview deployments!

## How It Works

- **Push to `main` branch** → Automatic production deployment
- **Create pull request** → Automatic preview deployment with unique URL
- **Commit status** → Shows deployment status directly in GitHub

## Troubleshooting

### Workflow fails with authentication error
- Verify your `CLOUDFLARE_API_TOKEN` is correct and has proper permissions
- Token should have "Account → Cloudflare Pages → Edit" permission

### Workflow fails with "Project not found"
- Verify the `projectName` in `.github/workflows/deploy.yml` matches your Cloudflare project name
- Check: `wrangler pages project list`

### Can't see secrets in GitHub
- Go to: https://github.com/Sakeeb91/shafkatrahman-website/settings/secrets/actions
- You won't see the values (for security), but you'll see the names

## Benefits

✅ **Automatic deployments** - No more manual `wrangler pages deploy`
✅ **Preview deployments** - Every PR gets a preview URL
✅ **Deployment history** - See all deployments in GitHub Actions
✅ **Status checks** - See deployment status in pull requests
✅ **Rollback capability** - Revert to any previous commit

## Current Account Info

- **Account ID:** `749969683e1be38526dfba377dc53524`
- **Project Name:** `shafkatrahman`
- **Production Domain:** `shafkatrahman.com`

---

**Note:** After setup, you can delete the `SETUP_GITHUB_ACTIONS.md` file if you want. It's just for reference.
