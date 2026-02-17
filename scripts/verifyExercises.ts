import { db } from './firebase.ts';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function verifyExercises() {
  console.log('🔍 Verifying catalogExercises collection...\n');
  
  // Get all exercises
  const snapshot = await getDocs(collection(db, 'catalogExercises'));
  
  console.log('📊 OVERALL STATS:');
  console.log(`   Total exercises: ${snapshot.size}`);
  console.log(`   Expected: 133`);
  console.log(`   Status: ${snapshot.size === 133 ? '✅ CORRECT' : '⚠️  MISMATCH'}\n`);
  
  // Check schema compliance
  console.log('🔍 SCHEMA VALIDATION:');
  
  let validCount = 0;
  let invalidCount = 0;
  const issues: string[] = [];
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    const requiredFields = [
      'id', 'name', 'tier_1', 'tier_2', 'difficulty', 
      'musclesTargeted', 'equipment', 'trainingGoals', 'metric',
      'description', 'setup', 'execution', 'breathing',
      'formCues', 'commonMistakes', 'progressions',
      'advancedVariations', 'safetyNotes', 'recommendedVolume'
    ];
    
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length === 0) {
      validCount++;
    } else {
      invalidCount++;
      issues.push(`${data.name || doc.id}: missing ${missingFields.join(', ')}`);
    }
  });
  
  console.log(`   Valid exercises: ${validCount}`);
  console.log(`   Invalid exercises: ${invalidCount}`);
  console.log(`   Schema compliance: ${(validCount / snapshot.size * 100).toFixed(1)}%\n`);
  
  if (invalidCount > 0) {
    console.log('❌ ISSUES FOUND:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    console.log('');
  }
  
  // Check tier_1 distribution
  console.log('📋 TIER 1 DISTRIBUTION:');
  const tier1Counts: Record<string, number> = {};
  snapshot.docs.forEach(doc => {
    const tier1 = doc.data().tier_1;
    tier1Counts[tier1] = (tier1Counts[tier1] || 0) + 1;
  });
  
  Object.entries(tier1Counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} exercises`);
    });
  
  console.log('');
  
  // Check tier_2 distribution
  console.log('🎯 TIER 2 DISTRIBUTION:');
  const tier2Counts: Record<string, number> = {};
  snapshot.docs.forEach(doc => {
    const tier2 = doc.data().tier_2;
    tier2Counts[tier2] = (tier2Counts[tier2] || 0) + 1;
  });
  
  Object.entries(tier2Counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count} exercises`);
    });
  
  console.log('');
  
  // Check difficulty distribution
  console.log('⭐ DIFFICULTY DISTRIBUTION:');
  const diffCounts: Record<string, number> = {};
  snapshot.docs.forEach(doc => {
    const diff = doc.data().difficulty;
    diffCounts[diff] = (diffCounts[diff] || 0) + 1;
  });
  
  ['Beginner', 'Intermediate', 'Advanced'].forEach(level => {
    const count = diffCounts[level] || 0;
    console.log(`   ${level}: ${count} exercises`);
  });
  
  console.log('');
  
  // Sample exercises
  console.log('✅ SAMPLE EXERCISES:');
  snapshot.docs.slice(0, 5).forEach(doc => {
    const data = doc.data();
    console.log(`   - ${data.name}`);
    console.log(`     ${data.tier_1} → ${data.tier_2} | ${data.difficulty}`);
    console.log(`     Metric: ${data.metric?.type} (${data.metric?.unit})`);
    console.log(`     Setup steps: ${data.setup?.length || 0}`);
    console.log(`     Form cues: ${data.formCues?.length || 0}`);
  });
  
  console.log('');
  
  // Final verdict
  if (snapshot.size === 133 && invalidCount === 0) {
    console.log('🎉 PERFECT! All exercises loaded correctly!');
    console.log('✅ Ready for production use!');
  } else if (snapshot.size === 133) {
    console.log('⚠️  Count is correct but some exercises have missing fields');
  } else {
    console.log(`⚠️  Expected 133 exercises but found ${snapshot.size}`);
  }
}

verifyExercises()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });