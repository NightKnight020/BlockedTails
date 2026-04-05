# BlockedTails.com Deployment to GitHub Pages

## Files Ready for Deployment:
- `index.html` - Main application page
- `app.js` - Flight tracking application logic
- `CNAME` - Custom domain configuration (blockedtails.com)

## Quick Deployment Instructions:

### Option 1: Manual Deployment via GitHub Web Interface
1. Go to https://github.com/new
2. Create a new repository named `blockedtails`
3. Select "Public" repository
4. DO NOT initialize with README, .gitignore, or license
5. Click "Create repository"
6. On the next page, look for "uploading an existing file" or use the web interface to upload:
   - index.html
   - app.js
   - CNAME
7. Commit directly to the `main` branch
8. Go to Repository Settings → Pages
9. Under "Source", select "Deploy from a branch"
10. Select `main` branch and `/ (root)` folder
11. Click "Save"
12. Under "Custom domain", enter `blockedtails.com` and click "Save"
13. Wait for deployment (takes 1-2 minutes)

### Option 2: Command Line Deployment (if you have GitHub CLI)
```bash
# Navigate to the deployment directory
cd blockedtails-deploy

# Create repository (requires GitHub CLI)
gh repo create blockedtails --public --source=. --remote=origin --push

# Enable GitHub Pages
gh api -X POST /repos/{owner}/blockedtails/pages \
  -f source@='{"branch":"main","path":"/"}' \
  -f cname='blockedtails.com'
```

### Option 3: Using Git Commands (if you have SSH key set up)
```bash
# Navigate to the deployment directory
cd blockedtails-deploy

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin git@github.com:YOUR_USERNAME/blockedtails.git

# Push to GitHub
git push -u origin main

# Then enable GitHub Pages via web interface as in Option 1
```

## Verification:
After deployment, visit:
- https://YOUR_USERNAME.github.io/blockedtails/ (temporary URL)
- http://blockedtails.com (after DNS propagation, which requires configuring DNS records)

## DNS Configuration for Custom Domain:
1. Go to your domain registrar (where you purchased blockedtails.com)
2. Add these DNS records:
   - A record: `@` → `185.199.108.153`
   - A record: `@` → `185.199.109.153`
   - A record: `@` → `185.199.110.153`
   - A record: `@` → `185.199.111.153`
   - CNAME record: `www` → `YOUR_USERNAME.github.io`
3. Wait for DNS propagation (up to 48 hours, usually faster)

## Application Features:
- Real-time flight tracking visualization
- Search for specific tail numbers
- Highlight blocked aircraft
- Interactive map with Mapbox integration
- Responsive design for mobile and desktop

## Time Completed: 2026-04-05 00:50 EDT
## Status: READY FOR DEPLOYMENT