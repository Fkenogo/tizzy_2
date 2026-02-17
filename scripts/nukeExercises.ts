import { db } from './firebase.ts';
import { collection, getDocs, writeBatch } from 'firebase/firestore';

async function nukeExercises() {
  console.log('💣 NUKING catalogExercises collection...');
  
  const collectionRef = collection(db, 'catalogExercises');
  const snapshot = await getDocs(collectionRef);
  
  console.log(`Found ${snapshot.size} documents to delete`);
  
  // Batch delete (500 at a time - Firestore limit)
  const batchSize = 500;
  const batches: any[] = [];
  let batch = writeBatch(db);
  let count = 0;
  
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
    
    if (count === batchSize) {
      batches.push(batch);
      batch = writeBatch(db);
      count = 0;
    }
  });
  
  if (count > 0) {
    batches.push(batch);
  }
  
  // Execute all batches
  console.log(`Executing ${batches.length} batch(es)...`);
  await Promise.all(batches.map(b => b.commit()));
  
  console.log('✅ Collection NUKED!');
}

nukeExercises();