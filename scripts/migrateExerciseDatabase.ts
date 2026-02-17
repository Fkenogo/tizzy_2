import { db } from '../src/config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// Import the new exercise database
import exerciseDatabase from './exercise_database.json';

interface ExerciseDocument {
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
  createdAt: Timestamp;
}

// Template for exercise descriptions and details
const exerciseTemplates = {
  description: "A {tier_2} exercise targeting {muscles} for {difficulty} level fitness enthusiasts.",
  setup: [
    "Start in a stable position with proper alignment",
    "Engage your core and maintain neutral spine",
    "Ensure your feet are positioned correctly"
  ],
  execution: [
    "Perform the movement with controlled tempo",
    "Focus on proper form over speed",
    "Complete the full range of motion"
  ],
  breathing: {
    inhale: "Inhale during the easier phase of the movement",
    exhale: "Exhale during the exertion phase",
    pattern: "Maintain steady, rhythmic breathing"
  },
  formCues: [
    "Keep your core engaged throughout",
    "Maintain proper spinal alignment",
    "Move with control and intention"
  ],
  commonMistakes: [
    "Using momentum instead of muscle control",
    "Holding breath during exertion",
    "Compromising form for more repetitions"
  ],
  progressions: [
    "Start with bodyweight variations",
    "Focus on perfect form before adding intensity",
    "Gradually increase difficulty as you improve"
  ],
  advancedVariations: [
    "Add external resistance or instability",
    "Increase time under tension",
    "Combine with other movements"
  ],
  safetyNotes: [
    "Stop if you feel sharp pain",
    "Warm up properly before starting",
    "Listen to your body's signals"
  ],
  recommendedVolume: {
    beginner: "2-3 sets of 8-12 reps or 20-30 seconds",
    intermediate: "3-4 sets of 12-15 reps or 30-45 seconds",
    advanced: "4-5 sets of 15-20 reps or 45-60 seconds"
  }
};

function normalizeMetric(metricString: string): ExerciseDocument['metric'] {
  const metricStringLower = metricString.toLowerCase();
  
  if (metricStringLower.includes('reps')) {
    return {
      type: 'reps',
      unit: 'reps',
      allowCustomUnit: false
    };
  } else if (metricStringLower.includes('time (seconds)')) {
    return {
      type: 'time',
      unit: 'seconds',
      allowCustomUnit: false
    };
  } else if (metricStringLower.includes('time (minutes)')) {
    return {
      type: 'time',
      unit: 'minutes',
      allowCustomUnit: false
    };
  } else if (metricStringLower.includes('time or distance')) {
    return {
      type: 'time',
      unit: 'minutes',
      allowCustomUnit: false,
      metricOptions: [
        { type: 'time', unit: 'minutes' },
        { type: 'distance', unit: 'km' }
      ]
    };
  } else {
    // Default fallback
    return {
      type: 'reps',
      unit: 'reps',
      allowCustomUnit: false
    };
  }
}

function generateExerciseDetails(exercise: any): {
  description: string;
  setup: string[];
  execution: string[];
  breathing: any;
  formCues: string[];
  commonMistakes: string[];
  progressions: string[];
  advancedVariations: string[];
  safetyNotes: string[];
  recommendedVolume: any;
} {
  const muscles = exercise.tags.muscles_targeted.join(', ');
  const difficulty = exercise.tags.difficulty_level;
  
  return {
    description: exerciseTemplates.description
      .replace('{tier_2}', exercise.tier_2.toLowerCase())
      .replace('{muscles}', muscles)
      .replace('{difficulty}', difficulty.toLowerCase()),
    setup: exerciseTemplates.setup,
    execution: exerciseTemplates.execution,
    breathing: exerciseTemplates.breathing,
    formCues: exerciseTemplates.formCues,
    commonMistakes: exerciseTemplates.commonMistakes,
    progressions: exerciseTemplates.progressions,
    advancedVariations: exerciseTemplates.advancedVariations,
    safetyNotes: exerciseTemplates.safetyNotes,
    recommendedVolume: exerciseTemplates.recommendedVolume
  };
}

async function migrateExerciseDatabase() {
  console.log('🚀 Starting Exercise Database Migration...');
  
  try {
    if (!exerciseDatabase.exercises || !Array.isArray(exerciseDatabase.exercises)) {
      throw new Error('Invalid exercise database format: missing exercises array');
    }

    console.log(`Found ${exerciseDatabase.exercises.length} exercises to migrate...`);

    // Track statistics
    const stats = {
      total: exerciseDatabase.exercises.length,
      migrated: 0,
      skipped: 0,
      errors: 0,
      duplicates: 0
    };

    // Track processed exercise names to detect duplicates
    const processedNames = new Set<string>();

    // Process each exercise
    for (const exercise of exerciseDatabase.exercises) {
      try {
        // Check for duplicates
        if (processedNames.has(exercise.name)) {
          console.log(`⚠️  Skipping duplicate: ${exercise.name}`);
          stats.duplicates++;
          stats.skipped++;
          continue;
        }
        processedNames.add(exercise.name);

        // Generate slug-based ID
        const slugId = exercise.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');

        // Normalize metric structure
        const metric = normalizeMetric(exercise.tags.metric);

        // Generate detailed exercise information
        const details = generateExerciseDetails(exercise);

        // Prepare the document data
        const exerciseDoc: ExerciseDocument = {
          id: slugId,
          name: exercise.name,
          tier_1: exercise.tier_1,
          tier_2: exercise.tier_2,
          difficulty: exercise.tags.difficulty_level as "Beginner" | "Intermediate" | "Advanced",
          musclesTargeted: exercise.tags.muscles_targeted,
          equipment: exercise.tags.equipment,
          trainingGoals: exercise.tags.training_goals,
          metric: metric,
          description: details.description,
          setup: details.setup,
          execution: details.execution,
          breathing: details.breathing,
          formCues: details.formCues,
          commonMistakes: details.commonMistakes,
          progressions: details.progressions,
          advancedVariations: details.advancedVariations,
          safetyNotes: details.safetyNotes,
          recommendedVolume: details.recommendedVolume,
          createdAt: Timestamp.now()
        };

        // Add to Firestore
        await addDoc(collection(db, 'catalogExercises'), exerciseDoc);
        console.log(`✅ Migrated: ${exercise.name} (${exercise.tier_1} → ${exercise.tier_2})`);
        stats.migrated++;
        
      } catch (exerciseError) {
        console.error(`❌ Failed to migrate exercise ${exercise.name}:`, exerciseError);
        stats.errors++;
      }
    }

    console.log('\n🎉 Exercise database migration completed!');
    console.log('📊 Migration Summary:');
    console.log(`   Total exercises: ${stats.total}`);
    console.log(`   Successfully migrated: ${stats.migrated}`);
    console.log(`   Duplicates skipped: ${stats.duplicates}`);
    console.log(`   Errors: ${stats.errors}`);
    console.log(`   Total in Firestore: ${stats.migrated}`);
    
    if (stats.errors > 0) {
      console.log(`\n⚠️  ${stats.errors} exercises failed to migrate. Check the logs above for details.`);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
migrateExerciseDatabase();