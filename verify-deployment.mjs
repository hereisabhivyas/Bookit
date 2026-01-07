#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * Checks if all necessary configurations are in place before deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    log(`  ✓ ${description}`, 'green');
    return true;
  } else {
    log(`  ✗ ${description} - MISSING`, 'red');
    return false;
  }
}

function checkEnvVariable(filePath, variable, description) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    log(`  ✗ ${description} - File not found: ${filePath}`, 'red');
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const hasVar = content.includes(variable);
  
  if (hasVar) {
    log(`  ✓ ${description}`, 'green');
    return true;
  } else {
    log(`  ✗ ${description} - Variable '${variable}' not found`, 'red');
    return false;
  }
}

async function main() {
  log('\n🚀 Pre-Deployment Verification\n', 'cyan');
  
  let issues = 0;
  
  // Check Backend Files
  log('📦 Backend API (Render)', 'blue');
  if (!checkFileExists('api/package.json', 'package.json exists')) issues++;
  if (!checkFileExists('api/index.js', 'index.js exists')) issues++;
  if (!checkFileExists('api/render.yaml', 'render.yaml exists')) issues++;
  if (!checkFileExists('api/.env.example', '.env.example exists')) issues++;
  
  // Check Backend Config
  log('\n⚙️  Backend Configuration', 'blue');
  if (!checkEnvVariable('api/render.yaml', 'ALLOWED_ORIGINS', 'CORS origins configured')) issues++;
  if (!checkEnvVariable('api/render.yaml', 'API_URL', 'API URL configured')) issues++;
  
  // Check User App Files
  log('\n📱 User App (Vercel)', 'blue');
  if (!checkFileExists('vibe-weaver-main/package.json', 'package.json exists')) issues++;
  if (!checkFileExists('vibe-weaver-main/vercel.json', 'vercel.json exists')) issues++;
  if (!checkFileExists('vibe-weaver-main/.env.example', '.env.example exists')) issues++;
  if (!checkFileExists('vibe-weaver-main/src/lib/api.ts', 'API client exists')) issues++;
  
  // Check User App Config
  log('\n⚙️  User App Configuration', 'blue');
  if (!checkEnvVariable('vibe-weaver-main/.env.example', 'VITE_API_URL', 'API URL in .env.example')) issues++;
  if (!checkEnvVariable('vibe-weaver-main/.env', 'VITE_API_URL', 'API URL in .env')) issues++;
  
  // Check Admin App Files
  log('\n👨‍💼 Admin App (Vercel)', 'blue');
  if (!checkFileExists('Admin/package.json', 'package.json exists')) issues++;
  if (!checkFileExists('Admin/vercel.json', 'vercel.json exists')) issues++;
  if (!checkFileExists('Admin/.env.example', '.env.example exists')) issues++;
  if (!checkFileExists('Admin/src/lib/api.ts', 'API client exists')) issues++;
  
  // Check Admin App Config
  log('\n⚙️  Admin App Configuration', 'blue');
  if (!checkEnvVariable('Admin/.env.example', 'VITE_API_URL', 'API URL in .env.example')) issues++;
  if (!checkEnvVariable('Admin/.env', 'VITE_API_URL', 'API URL in .env')) issues++;
  
  // Summary
  log('\n' + '='.repeat(50), 'cyan');
  if (issues === 0) {
    log('✅ All checks passed! Ready for deployment.', 'green');
    log('\nDeployment URLs:', 'cyan');
    log('  Backend:  https://bookit-dijk.onrender.com', 'yellow');
    log('  User App: https://bookit-cyan.vercel.app/', 'yellow');
    log('  Admin:    https://bookitadmin.vercel.app/', 'yellow');
    log('\nNext: Follow the steps in DEPLOYMENT_READY.md\n', 'blue');
    process.exit(0);
  } else {
    log(`❌ Found ${issues} issue(s). Please fix before deploying.`, 'red');
    log('\nSee DEPLOYMENT_READY.md for detailed instructions.\n', 'yellow');
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
