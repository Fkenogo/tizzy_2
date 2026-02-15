import { db } from '../lib/firebase';
// Fix: Use @firebase/firestore for named exports to resolve build errors
import { doc, setDoc, serverTimestamp } from '@firebase/firestore';
import { CatalogExercise, ExerciseCategory, MetricUnit } from '../types';

const exerciseCatalog: any[] = [
  {
    "id": "abdominal-crunches",
    "name": "Abdominal Crunches",
    "category": "Core",
    "subCategory": "Abs",
    "tags": ["Abs", "Obliques", "Bodyweight"],
    "benefits": "Strengthens the rectus abdominis and improves core stability. Helps support posture and spinal alignment.",
    "primaryMuscles": ["Rectus Abdominis"],
    "secondaryMuscles": ["Obliques", "Hip Flexors"],
    "equipment": "None",
    "metricUnit": "reps",
    "recommendedRange": { "min": 10, "max": 20, "label": "10-20 reps" },
    "setup": "Lie flat on your back with knees bent and feet planted on the floor. Extend arms forward toward knees.",
    "execution": "Engage your core. Lift your upper body slightly off the floor without pulling your neck. Pause briefly at the top. Lower slowly with control.",
    "safetyNotes": "Do not pull your neck forward. Keep movements controlled. Stop if you feel sharp lower back pain.",
    "difficulty": 1,
    "media": {
      "imageUrl": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800",
      "demo": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800"
    }
  },
  {
    "id": "plank-hold",
    "name": "Plank",
    "category": "Core",
    "subCategory": "Stability",
    "tags": ["Core", "Stability", "Bodyweight"],
    "benefits": "Builds full core stability and strengthens shoulders and lower back. Improves posture and endurance.",
    "primaryMuscles": ["Transverse Abdominis"],
    "secondaryMuscles": ["Shoulders", "Glutes", "Lower Back"],
    "equipment": "None",
    "metricUnit": "seconds",
    "recommendedRange": { "min": 30, "max": 90, "label": "30-90 sec" },
    "setup": "Place forearms on the ground with elbows under shoulders. Extend legs back and balance on toes.",
    "execution": "Keep body in a straight line from head to heels. Engage core and glutes. Hold position without sagging hips.",
    "safetyNotes": "Avoid arching or dropping hips. Stop if lower back pain develops.",
    "difficulty": 2,
    "media": {
      "imageUrl": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
      "demo": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
    }
  },
  {
    "id": "push-ups",
    "name": "Push-Ups",
    "category": "Upper Body",
    "subCategory": "Chest",
    "tags": ["Chest", "Triceps", "Bodyweight"],
    "benefits": "Builds upper body strength and muscular endurance. Engages chest, shoulders, and triceps.",
    "primaryMuscles": ["Pectorals"],
    "secondaryMuscles": ["Triceps", "Anterior Deltoids"],
    "equipment": "None",
    "metricUnit": "reps",
    "recommendedRange": { "min": 8, "max": 20, "label": "8-20 reps" },
    "setup": "Place hands slightly wider than shoulder width. Extend legs back into a high plank position.",
    "execution": "Lower chest toward floor while keeping body straight. Push back up until arms are extended.",
    "safetyNotes": "Do not flare elbows excessively. Keep core tight to avoid lower back strain.",
    "difficulty": 2,
    "media": {
      "imageUrl": "https://images.unsplash.com/photo-1598971639058-aba71844bc1b?auto=format&fit=crop&q=80&w=800",
      "demo": "https://images.unsplash.com/photo-1598971639058-aba71844bc1b?auto=format&fit=crop&q=80&w=800"
    }
  },
  {
    "id": "bodyweight-squats",
    "name": "Bodyweight Squats",
    "category": "Lower Body",
    "subCategory": "Legs",
    "tags": ["Quads", "Glutes", "Bodyweight"],
    "benefits": "Strengthens lower body muscles and improves mobility in hips and knees.",
    "primaryMuscles": ["Quadriceps"],
    "secondaryMuscles": ["Glutes", "Hamstrings"],
    "equipment": "None",
    "metricUnit": "reps",
    "recommendedRange": { "min": 12, "max": 25, "label": "12-25 reps" },
    "setup": "Stand with feet shoulder-width apart. Keep chest upright.",
    "execution": "Push hips back and bend knees to lower into a squat. Keep knees aligned with toes. Return to standing.",
    "safetyNotes": "Do not allow knees to collapse inward. Maintain neutral spine.",
    "difficulty": 2,
    "media": {
      "imageUrl": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800",
      "demo": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800"
    }
  },
  {
    "id": "jump-rope",
    "name": "Jump Rope",
    "category": "Cardio",
    "subCategory": "Endurance",
    "tags": ["Cardio", "Endurance", "Conditioning"],
    "benefits": "Improves cardiovascular endurance, coordination, and agility.",
    "primaryMuscles": ["Calves"],
    "secondaryMuscles": ["Shoulders", "Core"],
    "equipment": ["Jump Rope"],
    "metricUnit": "minutes",
    "recommendedRange": { "min": 3, "max": 15, "label": "3-15 min" },
    "setup": "Hold rope handles and stand upright.",
    "execution": "Swing rope overhead and jump lightly as it passes under feet. Maintain rhythm and controlled breathing.",
    "safetyNotes": "Land softly on balls of feet. Avoid excessive impact on hard surfaces.",
    "difficulty": 3,
    "media": {
      "imageUrl": "https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800",
      "demo": "https://images.unsplash.com/photo-1544033527-b192daee1f5b?auto=format&fit=crop&q=80&w=800"
    }
  }
];

export const seedExercises = async () => {
  console.log('Seeding catalogExercises with full library...');
  for (const ex of exerciseCatalog) {
    const exRef = doc(db, 'catalogExercises', ex.id);
    
    // Normalize MetricUnit for safety
    let metricUnit: MetricUnit = ex.metricUnit;
    if (ex.metricUnit === 'sec') metricUnit = 'seconds';
    if (ex.metricUnit === 'min') metricUnit = 'minutes';

    await setDoc(exRef, {
      id: ex.id,
      name: ex.name,
      category: ex.category as ExerciseCategory,
      subCategory: ex.subCategory || "",
      tags: ex.tags || [],
      primaryMuscles: ex.primaryMuscles || [],
      secondaryMuscles: ex.secondaryMuscles || [],
      equipment: Array.isArray(ex.equipment) ? ex.equipment : [ex.equipment || "None"],
      difficulty: ex.difficulty || 1,
      metricUnit: metricUnit,
      recommendedRange: ex.recommendedRange || null,
      benefits: ex.benefits || "Builds strength and improves technique.",
      instructions: {
        setup: ex.setup || "Start with neutral spine.",
        execution: ex.execution || "Perform with control.",
        cues: ex.cues || [],
        commonMistakes: ex.commonMistakes || [],
        breathing: ex.breathing || "Breathe naturally.",
        safety: ex.safetyNotes || ex.safety || "Stop if you feel pain."
      },
      media: ex.media || {},
      seededAt: serverTimestamp()
    });
    console.log(`Seeded: ${ex.name}`);
  }
  return true;
};