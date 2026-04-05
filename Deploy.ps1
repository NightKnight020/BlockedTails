# BlockedTails.com Deployment Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BlockedTails.com Deployment Assistant" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check for Git
try {
    $gitVersion = git --version
    Write-Host "✓ Git installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git not found. Please install Git from https://git-scm.com/" -ForegroundColor Red
}

# Check for GitHub CLI
try {
    $ghVersion = gh --version 2>$null
    Write-Host "✓ GitHub CLI installed" -ForegroundColor Green
    $hasGH = $true
} catch {
    Write-Host "ℹ GitHub CLI not found (optional)" -ForegroundColor Yellow
    $hasGH = $false
}

Write-Host ""
Write-Host "DEPLOYMENT OPTIONS:" -ForegroundColor Yellow
Write-Host ""

if ($hasGH) {
    Write-Host "Option A: Automatic deployment with GitHub CLI" -ForegroundColor Green
    Write-Host "  Run: gh repo create blockedtails --public --source=. --remote=origin --push" -ForegroundColor White
    Write-Host "  Then enable GitHub Pages via: gh repo view --web" -ForegroundColor White
    Write-Host ""
}

Write-Host "Option B: Manual deployment (recommended)" -ForegroundColor Green
Write-Host "  1. Create repository: https://github.com/new" -ForegroundColor White
Write-Host "     - Name: blockedtails" -ForegroundColor White
Write-Host "     - Public, no README/.gitignore/license" -ForegroundColor White
Write-Host "  2. Upload files via web interface" -ForegroundColor White
Write-Host "  3. Enable Pages in Settings → Pages" -ForegroundColor White
Write-Host "  4. Set custom domain: blockedtails.com" -ForegroundColor White
Write-Host ""

Write-Host "Files ready for deployment:" -ForegroundColor Cyan
Get-ChildItem -File | ForEach-Object {
    Write-Host "  - $($_.Name) ($($_.Length) bytes)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "For DNS configuration, see DEPLOY.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to open GitHub repository creation page..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open GitHub in browser
Start-Process "https://github.com/new"