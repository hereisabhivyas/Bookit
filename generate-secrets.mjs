#!/usr/bin/env node

/**
 * Generate Secure Secrets for Deployment
 * Run this before deploying to production
 */

import crypto from 'crypto';

console.log('\n🔐 Generating Secure Secrets for Production\n');
console.log('='.repeat(60));

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('\n📝 JWT_SECRET (copy this to Render):');
console.log('─'.repeat(60));
console.log(jwtSecret);
console.log('─'.repeat(60));

// Generate Session Secret
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('\n📝 SESSION_SECRET (optional, for future use):');
console.log('─'.repeat(60));
console.log(sessionSecret);
console.log('─'.repeat(60));

// Generate API Key
const apiKey = crypto.randomBytes(24).toString('base64');
console.log('\n📝 INTERNAL_API_KEY (optional, for future use):');
console.log('─'.repeat(60));
console.log(apiKey);
console.log('─'.repeat(60));

console.log('\n✅ Secrets generated successfully!');
console.log('\n⚠️  IMPORTANT:');
console.log('   1. Copy the JWT_SECRET above');
console.log('   2. Add it to Render environment variables');
console.log('   3. NEVER commit these secrets to Git');
console.log('   4. Store them securely (password manager recommended)');
console.log('');
