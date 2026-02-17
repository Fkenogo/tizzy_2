import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../src/config/firebase';

interface CatalogExercise {
  id: string;
  name: string;
  tier_1: string;
  tier_2: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  musclesTargeted: string[];
  equipment: string[];
  trainingGoals: string[];
  metric: {
    type: "reps" | "time" | "distance";
    unit: "reps" | "seconds" | "minutes" | "km";
    allowCustomUnit: boolean;
    metricOptions?: Array<{
      type: "time" | "distance";
      unit: "minutes" | "km";
    }>;
  };
  description: string;
  setup: string[];
  execution: string[];
  breathing: {
    inhale: string;
    exhale: string;
    pattern: string;
  };
  formCues: string[];
  commonMistakes: string[];
  progressions: string[];
  advancedVariations: string[];
  safetyNotes: string[];
  recommendedVolume: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  createdAt: any;
}

async function testExerciseDatabase(): Promise<void> {
  console.log('🧪 Testing Exercise Database...');
  
  try {
    // Test 1: Count total exercises
    console.log('\n📊 Test 1: Counting total exercises...');
    const exercisesRef = collection(db, 'catalogExercises');
    const countSnapshot = await getDocs(exercisesRef);
    const totalExercises = countSnapshot.size;
    console.log(`✅ Found ${totalExercises} exercises in database`);

    // Test 2: Check for required fields
    console.log('\n🔍 Test 2: Checking required fields...');
    let hasMissingFields = false;
    let hasMissingDetails = false;
    
    for (const doc of countSnapshot.docs) {
      const exercise = doc.data() as CatalogExercise;
      
      // Check required fields
      if (!exercise.name || !exercise.tier_1 || !exercise.tier_2 || !exercise.difficulty) {
        console.log(`❌ Missing required fields in: ${exercise.name || 'Unknown'}`);
        hasMissingFields = true;
      }
      
      // Check enhanced details
      if (!exercise.description || !exercise.setup || !exercise.execution) {
        console.log(`❌ Missing enhanced details in: ${exercise.name || 'Unknown'}`);
        hasMissingDetails = true;
      }
    }
    
    if (!hasMissingFields) console.log('✅ All exercises have required fields');
    if (!hasMissingDetails) console.log('✅ All exercises have enhanced details');

    // Test 3: Test filtering by tier_1
    console.log('\n🏷️  Test 3: Testing tier_1 filtering...');
    const tier1Values = ['Upper Body', 'Lower Body', 'Core', 'Cardio'];
    for (const tier1 of tier1Values) {
      const q = query(exercisesRef, where('tier_1', '==', tier1));
      const snapshot = await getDocs(q);
      console.log(`   ${tier1}: ${snapshot.size} exercises`);
    }

    // Test 4: Test filtering by difficulty
    console.log('\n🎯 Test 4: Testing difficulty filtering...');
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
    for (const difficulty of difficulties) {
      const q = query(exercisesRef, where('difficulty', '==', difficulty));
      const snapshot = await getDocs(q);
      console.log(`   ${difficulty}: ${snapshot.size} exercises`);
    }

    // Test 5: Test pagination
    console.log('\n📄 Test 5: Testing pagination...');
    const paginatedQuery = query(exercisesRef, orderBy('name'), limit(10));
    const paginatedSnapshot = await getDocs(paginatedQuery);
    console.log(`✅ Pagination test: ${paginatedSnapshot.size} exercises in first page`);

    // Test 6: Sample exercise details
    console.log('\n📋 Test 6: Sample exercise details...');
    if (countSnapshot.docs.length > 0) {
      const sampleDoc = countSnapshot.docs[0];
      const sampleExercise = sampleDoc.data() as CatalogExercise;
      console.log(`   Sample: ${sampleExercise.name}`);
      console.log(`   Tier 1: ${sampleExercise.tier_1}`);
      console.log(`   Tier 2: ${sampleExercise.tier_2}`);
      console.log(`   Difficulty: ${sampleExercise.difficulty}`);
      console.log(`   Description: ${sampleExercise.description.substring(0, 100)}...`);
      console.log(`   Setup steps: ${sampleExercise.setup.length}`);
      console.log(`   Execution steps: ${sampleExercise.execution.length}`);
    }

    // Summary
    console.log('\n🎉 Exercise Database Test Summary:');
    console.log(`   Total exercises: ${totalExercises}`);
    console.log(`   Required fields: ${hasMissingFields ? '❌ Issues found' : '✅ All good'}`);
    console.log(`   Enhanced details: ${hasMissingDetails ? '❌ Issues found' : '✅ All good'}`);
    
    if (totalExercises >= 133) {
      console.log('✅ SUCCESS: Database has 133+ exercises as expected');
    } else {
      console.log(`⚠️  WARNING: Expected 133+ exercises, found ${totalExercises}`);
    }

    if (!hasMissingFields && !hasMissingDetails && totalExercises >= 133) {
      console.log('\n🎉 ALL TESTS PASSED! Exercise database is ready.');
    } else {
      console.log('\n❌ Some tests failed. Check the issues above.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testExerciseDatabase();