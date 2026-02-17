#!/usr/bin/env node

/**
 * Firebase Index Deployment Script
 * 
 * This script deploys the enhanced Firestore indexes to Firebase.
 * 
 * Usage: node scripts/deployIndexes.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Deploying Enhanced Firestore Indexes...');
console.log('==========================================');

try {
  // Change to project root
  const projectRoot = path.join(__dirname, '..');
  process.chdir(projectRoot);
  
  console.log('📁 Project root:', projectRoot);
  console.log('📋 Checking firestore.indexes.json...');
  
  // Verify the indexes file exists
  const fs = require('fs');
  const indexesPath = path.join(projectRoot, 'firestore.indexes.json');
  
  if (!fs.existsSync(indexesPath)) {
    throw new Error('firestore.indexes.json not found in project root');
  }
  
  console.log('✅ firestore.indexes.json found');
  
  // Read and validate the indexes file
  const indexesContent = fs.readFileSync(indexesPath, 'utf8');
  const indexes = JSON.parse(indexesContent);
  
  console.log(`📊 Found ${indexes.indexes.length} indexes to deploy`);
  
  // Check if firebase-tools is available
  try {
    execSync('firebase --version', { stdio: 'ignore' });
    console.log('✅ Firebase CLI is available');
  } catch (error) {
    console.log('❌ Firebase CLI not found. Please install it with: npm install -g firebase-tools');
    process.exit(1);
  }
  
  // Check if user is logged in
  try {
    const loginStatus = execSync('firebase login:status', { encoding: 'utf8' });
    console.log('✅ Firebase login status checked');
  } catch (error) {
    console.log('❌ Not logged into Firebase. Please run: firebase login');
    process.exit(1);
  }
  
  // Check if project is initialized
  try {
    const projectStatus = execSync('firebase use --json', { encoding: 'utf8' });
    const projectInfo = JSON.parse(projectStatus);
    console.log(`✅ Using Firebase project: ${projectInfo.activeProject}`);
  } catch (error) {
    console.log('❌ Firebase project not initialized. Please run: firebase use <project-id>');
    process.exit(1);
  }
  
  console.log('\n🔄 Deploying indexes...');
  console.log('⚠️  Note: Index creation can take 10-20 minutes to complete in Firebase');
  
  // Deploy the indexes
  const deployOutput = execSync('firebase deploy --only firestore:indexes', { 
    encoding: 'utf8',
    stdio: 'inherit'
  });
  
  console.log('\n🎉 Index deployment completed successfully!');
  console.log('\n📋 Indexes will be available once Firebase finishes building them.');
  console.log('📱 You can monitor progress in the Firebase Console:');
  console.log('   https://console.firebase.google.com/project/[PROJECT_ID]/firestore/indexes');
  
  console.log('\n✨ Enhanced exercise library queries are now optimized!');
  console.log('   - Tier 1 + Tier 2 + Name filtering');
  console.log('   - Difficulty-based filtering');
  console.log('   - Muscle group filtering');
  console.log('   - Equipment filtering');
  console.log('   - Training goals filtering');
  console.log('   - Metric type filtering');
  
} catch (error) {
  console.error('❌ Index deployment failed:', error.message);
  
  if (error.stdout) {
    console.error('STDOUT:', error.stdout);
  }
  if (error.stderr) {
    console.error('STDERR:', error.stderr);
  }
  
  console.log('\n🔧 Troubleshooting steps:');
  console.log('1. Ensure you are logged into Firebase: firebase login');
  console.log('2. Initialize Firebase project: firebase use <project-id>');
  console.log('3. Check firestore.indexes.json syntax');
  console.log('4. Verify Firebase CLI is up to date: npm install -g firebase-tools');
  
  process.exit(1);
}