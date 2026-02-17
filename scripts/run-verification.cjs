#!/usr/bin/env node

// Simple Node.js script to run the verification
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('🔍 Running Exercise Database Verification...');
  
  // Change to project root and run the verification script
  const projectRoot = path.join(__dirname, '..');
  const scriptPath = path.join(__dirname, 'verifyExerciseDatabase.ts');
  
  // Use ts-node to run the TypeScript script
  const command = `cd ${projectRoot} && npx ts-node ${scriptPath}`;
  
  console.log('Running command:', command);
  execSync(command, { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Error running verification:', error.message);
  process.exit(1);
}