import { db } from '../lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot } from '@firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

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
  createdAt: any; // Firestore Timestamp
}

/**
 * Backup script for catalogExercises collection
 * Exports all documents to backups/ folder with timestamp and document count
 */
async function backupCatalogExercises() {
  console.log('Starting Firestore backup for catalogExercises...');
  
  try {
    // Create backups directory if it doesn't exist
    const backupsDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
      console.log(`Created backups directory: ${backupsDir}`);
    }

    // Get current timestamp for backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `catalogExercises-backup-${timestamp}.json`;
    const backupFilePath = path.join(backupsDir, backupFileName);

    console.log('Fetching catalogExercises documents from Firestore...');
    
    // Get all documents from catalogExercises collection
    const exercisesCollection = collection(db, 'catalogExercises');
    const snapshot = await getDocs(exercisesCollection);
    
    console.log(`Found ${snapshot.size} documents in catalogExercises collection`);

    // Convert documents to array of exercise objects
    const exercises: CatalogExercise[] = [];
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      exercises.push({
        id: doc.id,
        name: data.name || '',
        tier_1: data.tier_1 || '',
        tier_2: data.tier_2 || '',
        difficulty: data.difficulty || "Beginner",
        musclesTargeted: data.musclesTargeted || [],
        equipment: data.equipment || [],
        trainingGoals: data.trainingGoals || [],
        metric: data.metric || {
          type: "reps",
          unit: "reps",
          allowCustomUnit: true
        },
        description: data.description || '',
        setup: data.setup || [],
        execution: data.execution || [],
        breathing: data.breathing || {
          inhale: '',
          exhale: '',
          pattern: ''
        },
        formCues: data.formCues || [],
        commonMistakes: data.commonMistakes || [],
        progressions: data.progressions || [],
        advancedVariations: data.advancedVariations || [],
        safetyNotes: data.safetyNotes || [],
        recommendedVolume: data.recommendedVolume || {
          beginner: '',
          intermediate: '',
          advanced: ''
        },
        createdAt: data.createdAt
      });
    });

    // Create backup metadata
    const backupData = {
      metadata: {
        timestamp: new Date().toISOString(),
        collection: 'catalogExercises',
        documentCount: exercises.length,
        backupType: 'full-export'
      },
      exercises: exercises
    };

    // Write backup file
    console.log(`Writing backup to: ${backupFilePath}`);
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));
    
    // Verify backup was created successfully
    if (fs.existsSync(backupFilePath)) {
      const stats = fs.statSync(backupFilePath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      
      console.log('✅ Backup created successfully!');
      console.log(`📁 File: ${backupFileName}`);
      console.log(`📊 Documents: ${exercises.length}`);
      console.log(`📏 Size: ${fileSizeKB} KB`);
      console.log(`⏰ Timestamp: ${backupData.metadata.timestamp}`);
      console.log(`📍 Location: ${backupFilePath}`);
      
      return {
        success: true,
        filePath: backupFilePath,
        documentCount: exercises.length,
        timestamp: backupData.metadata.timestamp
      };
    } else {
      throw new Error('Backup file was not created successfully');
    }

  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

// Run the backup if this script is executed directly
if (require.main === module) {
  backupCatalogExercises()
    .then((result) => {
      console.log('\n🎉 Backup completed successfully!');
      console.log(`Backup file: ${result.filePath}`);
      console.log(`Documents backed up: ${result.documentCount}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Backup failed with error:', error);
      process.exit(1);
    });
}

export { backupCatalogExercises };