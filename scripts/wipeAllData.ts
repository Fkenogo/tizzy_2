import { db } from '../src/config/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

async function wipeAllData() {
  console.log('🧹 Starting complete data wipe...');
  
  try {
    // Collections to wipe
    const collections = [
      'users',
      'groups', 
      'challenges',
      'posts',
      'catalogExercises',
      'onboardingData'
    ];

    for (const collectionName of collections) {
      console.log(`🗑️  Wiping ${collectionName}...`);
      const snap = await getDocs(collection(db, collectionName));
      let count = 0;
      
      for (const docSnap of snap.docs) {
        await deleteDoc(doc(db, collectionName, docSnap.id));
        count++;
      }
      
      console.log(`✅ Wiped ${count} documents from ${collectionName}`);
    }

    console.log('🎉 All data wiped successfully!');
    
  } catch (error) {
    console.error('❌ Wipe failed:', error);
    throw error;
  }
}

// Run the wipe script
wipeAllData();