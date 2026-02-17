import { db } from '../src/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Hardcoded onboarding data from OnboardingScreen.tsx
const exerciseInterests = ["Running", "Weightlifting", "Yoga", "HIIT", "Cycling", "Swimming", "Pilates", "Hiking"];

const wellnessGoals = [
  { id: 'weight-loss', title: 'Weight Loss', desc: 'Focus on calorie deficit and fat burning', icon: 'monitor_weight' },
  { id: 'build-muscle', title: 'Build Muscle', desc: 'Hypertrophy and strength training focus', icon: 'exercise' },
  { id: 'flexibility', title: 'Improve Flexibility', desc: 'Stretching and mobility routine', icon: 'self_improvement' },
  { id: 'mental-health', title: 'Mental Health & Stress Relief', desc: 'Mindful movement and regular activity', icon: 'psychology' },
  { id: 'accountability', title: 'Accountability & Routine', desc: 'Build consistent daily habits', icon: 'group' },
];

async function seedOnboardingData() {
  console.log('🚀 Starting Onboarding Data Seeding...');
  
  try {
    // Seed Exercise Interests
    console.log('Seeding exercise interests...');
    for (const interest of exerciseInterests) {
      await addDoc(collection(db, 'onboardingData', 'exerciseInterests', 'items'), {
        name: interest,
        createdAt: serverTimestamp()
      });
      console.log(`✅ Seeded interest: ${interest}`);
    }

    // Seed Wellness Goals
    console.log('Seeding wellness goals...');
    for (const goal of wellnessGoals) {
      await addDoc(collection(db, 'onboardingData', 'wellnessGoals', 'items'), {
        id: goal.id,
        title: goal.title,
        desc: goal.desc,
        icon: goal.icon,
        createdAt: serverTimestamp()
      });
      console.log(`✅ Seeded goal: ${goal.title}`);
    }

    console.log('🎉 Onboarding data seeding completed successfully!');
    console.log(`📊 Total interests: ${exerciseInterests.length}, Total goals: ${wellnessGoals.length}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run the seeding script
seedOnboardingData();