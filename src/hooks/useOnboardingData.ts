import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ExerciseInterest {
  id: string;
  name: string;
  createdAt: any;
}

export interface WellnessGoal {
  id: string;
  title: string;
  desc: string;
  icon: string;
  createdAt: any;
}

export const useOnboardingData = () => {
  const {
    data: exerciseInterests,
    isLoading: loadingInterests,
    error: interestsError
  } = useQuery({
    queryKey: ['onboardingData', 'exerciseInterests'],
    queryFn: async () => {
      const q = query(collection(db, 'onboardingData', 'exerciseInterests', 'items'), orderBy('name'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExerciseInterest));
    }
  });

  const {
    data: wellnessGoals,
    isLoading: loadingGoals,
    error: goalsError
  } = useQuery({
    queryKey: ['onboardingData', 'wellnessGoals'],
    queryFn: async () => {
      const q = query(collection(db, 'onboardingData', 'wellnessGoals', 'items'), orderBy('title'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WellnessGoal));
    }
  });

  return {
    exerciseInterests: exerciseInterests || [],
    wellnessGoals: wellnessGoals || [],
    loading: loadingInterests || loadingGoals,
    error: interestsError || goalsError
  };
};