import { db } from '../lib/firebase';
// Fix: Use @firebase/firestore for named exports to resolve build errors
import { collection, getDocs, deleteDoc, doc } from '@firebase/firestore';

export const wipeAllData = async (wipeExercises = false) => {
  const collections = ['groups', 'challenges', 'posts', 'donations', 'users'];
  if (wipeExercises) collections.push('catalogExercises');

  console.log(`Wiping collections: ${collections.join(', ')}...`);

  for (const collName of collections) {
    const snap = await getDocs(collection(db, collName));
    const deletePromises = snap.docs.map(d => deleteDoc(doc(db, collName, d.id)));
    await Promise.all(deletePromises);
    console.log(`Cleared: ${collName}`);
  }

  console.log('Wipe complete!');
};