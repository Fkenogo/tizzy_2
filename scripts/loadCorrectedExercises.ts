import { db } from './firebase.ts';
import { collection, writeBatch, doc, Timestamp } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Get current directory in ESM
const __dirname = path.dirname(new URL(import.meta.url).pathname);

interface CorrectedDataStructure {
  collection: string;
  schemaVersion: string;
  totalExercises: number;
  documents: any[];
}

async function loadCorrectedExercises() {
  console.log('🚀 Loading CORRECTED exercises...');
  
  // Load JSON data using fs.readFileSync
  const jsonPath = path.join(__dirname, 'catalogExercises_CORRECTED.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const data = jsonData as CorrectedDataStructure;
  console.log(`� Total to load: ${data.totalExercises}`);
  console.log(`�📋 Schema version: ${data.schemaVersion}`);
  
  const batchSize = 500; // Firestore limit
  const batches: any[] = [];
  let batch = writeBatch(db);
  let count = 0;
  let totalProcessed = 0;
  
  for (const exercise of data.documents) {
    const docRef = doc(db, 'catalogExercises', exercise.id);
    
    // Add document with timestamp
    batch.set(docRef, {
      ...exercise,
      createdAt: Timestamp.now()
    });
    
    count++;
    totalProcessed++;
    
    // Create new batch every 500 docs
    if (count === batchSize) {
      batches.push(batch);
      batch = writeBatch(db);
      count = 0;
      console.log(`   Prepared batch ${batches.length} (${totalProcessed} exercises)...`);
    }
  }
  
  // Add remaining documents
  if (count > 0) {
    batches.push(batch);
  }
  
  console.log(`\n⚡ Executing ${batches.length} batch(es)...`);
  
  // Execute all batches in parallel
  await Promise.all(batches.map((b, index) => {
    console.log(`   Committing batch ${index + 1}/${batches.length}...`);
    return b.commit();
  }));
  
  console.log(`\n✅ SUCCESS! Loaded ${data.totalExercises} exercises!`);
  console.log(`📊 Schema: ${data.schemaVersion}`);
}

// Run the function
loadCorrectedExercises()
  .then(() => {
    console.log('\n🎉 Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error loading exercises:', error);
    process.exit(1);
  });