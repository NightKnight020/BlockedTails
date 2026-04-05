@echo off
echo ========================================
echo BlockedTails.com Deployment Assistant
echo ========================================
echo.
echo This script helps deploy BlockedTails.com to GitHub Pages.
echo.
echo Prerequisites:
echo 1. GitHub account
echo 2. Git installed
echo 3. (Optional) GitHub CLI for automatic deployment
echo.
echo Steps:
echo 1. Create a new repository at https://github.com/new
echo    - Name: blockedtails
echo    - Public repository
echo    - DO NOT initialize with README, .gitignore, or license
echo.
echo 2. Upload files manually via GitHub web interface:
echo    - index.html
echo    - app.js  
echo    - CNAME
echo    - DEPLOY.md (optional)
echo.
echo 3. Enable GitHub Pages:
echo    - Go to Repository Settings -> Pages
echo    - Source: Deploy from a branch
echo    - Branch: main, Folder: / (root)
echo    - Custom domain: blockedtails.com
echo.
echo 4. Configure DNS at your domain registrar.
echo.
echo For detailed instructions, see DEPLOY.md
echo.
pause