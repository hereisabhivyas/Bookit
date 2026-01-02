@echo off
echo ================================
echo Vibe Weaver Deployment Setup
echo ================================
echo.

echo This script will help you prepare your project for deployment.
echo.

echo Step 1: Checking if git is initialized...
if exist .git (
    echo Git repository found!
) else (
    echo Initializing git repository...
    git init
    echo Git initialized!
)
echo.

echo Step 2: Creating .gitignore files...
echo node_modules > .gitignore
echo .env >> .gitignore
echo dist >> .gitignore
echo .DS_Store >> .gitignore
echo *.log >> .gitignore

cd api
echo node_modules > .gitignore
echo .env >> .gitignore
echo *.log >> .gitignore
echo Assets/uploads/* >> .gitignore
echo !Assets/uploads/.gitkeep >> .gitignore
echo secrets/ >> .gitignore
echo *.json >> .gitignore
echo !package.json >> .gitignore
echo !render.yaml >> .gitignore
cd ..

cd vibe-weaver-main
echo node_modules > .gitignore
echo .env >> .gitignore
echo dist >> .gitignore
echo .DS_Store >> .gitignore
echo *.log >> .gitignore
cd ..

cd Admin
echo node_modules > .gitignore
echo .env >> .gitignore
echo dist >> .gitignore
echo .DS_Store >> .gitignore
echo *.log >> .gitignore
cd ..

echo .gitignore files created!
echo.

echo Step 3: Adding all files to git...
git add .
echo Files added!
echo.

echo Step 4: Creating initial commit...
git commit -m "Initial commit - ready for deployment"
echo Commit created!
echo.

echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo 1. Create a new repository on GitHub
echo 2. Run: git remote add origin YOUR_GITHUB_URL
echo 3. Run: git push -u origin main
echo 4. Follow the DEPLOYMENT.md guide
echo.
echo Press any key to exit...
pause >nul
