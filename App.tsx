import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { UserDoc } from './types';

// Components
import LayoutShell from './components/Layout/LayoutShell';

// Auth Screens
import WelcomeScreen from './features/Auth/WelcomeScreen';
import OnboardingScreen from './features/Auth/OnboardingScreen';

// Main Screens
import HomeScreen from './features/Home/HomeScreen';
import GroupsScreen from './features/Groups/GroupsScreen';
import CreateGroupScreen from './features/Groups/CreateGroupScreen';
import GroupDetailScreen from './features/Groups/GroupDetailScreen';
import ProfileScreen from './features/Profile/ProfileScreen';
import ExerciseLibraryScreen from './features/Exercises/ExerciseLibraryScreen';
import ExerciseDetailScreen from './features/Exercises/ExerciseDetailScreen';
import CreateChallengeForm from './features/Challenges/CreateChallengeForm';
import LogWorkoutScreen from './features/Challenges/LogWorkoutScreen';
import LeaderboardScreen from './features/Leaderboards/LeaderboardScreen';
import JoinGroupScreen from './features/Groups/JoinGroupScreen';
import MyChallengesScreen from './features/Challenges/MyChallengesScreen';
import SuggestedChallengesScreen from './features/Challenges/SuggestedChallengesScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 15,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const [user, setUser] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'users', fbUser.uid);
      unsubscribeDoc = onSnapshot(userRef, async (snap) => {
        if (snap.exists()) {
          setUser(snap.data() as UserDoc);
          } else {
          const newUser: UserDoc = {
            uid: fbUser.uid,
            displayName: `Tiizi User ${fbUser.uid.slice(0, 4)}`,
            createdAt: serverTimestamp() as any,
            lastActiveAt: serverTimestamp() as any,
            stats: { 
              totalWorkouts: 0,
              totalSteps: 0,
              totalDistance: 0,
              totalCalories: 0,
              totalActiveMinutes: 0,
              longestStreak: 0,
              currentStreak: 0,
              xp: 0,
              level: 1,
              coins: 0,
              totalLogs: 0
            },
            onboardingCompleted: false
          };
          try {
            await setDoc(userRef, newUser);
          } catch (err: any) {
            console.error("Error creating user profile:", err);
          }
        }
        setLoading(false);
      }, (err) => {
        console.error("User stream error:", err);
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-primary tracking-tighter">Tiizi</h1>
            <p className="text-[10px] font-bold text-slate-400 animate-pulse uppercase tracking-[0.2em] mt-2">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <LayoutShell user={user}>
          {!user ? (
            <Routes>
              <Route path="/welcome" element={<WelcomeScreen />} />
              <Route path="*" element={<Navigate to="/welcome" replace />} />
            </Routes>
          ) : !user.onboardingCompleted ? (
            <Routes>
              <Route path="/onboarding" element={<OnboardingScreen user={user} />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<HomeScreen user={user} />} />
              <Route path="/groups" element={<GroupsScreen user={user} />} />
              <Route path="/groups/create" element={<CreateGroupScreen user={user} />} />
              <Route path="/groups/:groupId" element={<GroupDetailScreen user={user} />} />
              <Route path="/join" element={<JoinGroupScreen user={user} />} />
              <Route path="/join/:groupId" element={<JoinGroupScreen user={user} />} />
              <Route path="/challenges" element={<MyChallengesScreen />} />
              <Route path="/suggested-challenges" element={<SuggestedChallengesScreen />} />
              <Route path="/profile" element={<ProfileScreen user={user} />} />
              <Route path="/exercises" element={<ExerciseLibraryScreen />} />
              <Route path="/exercises/:exerciseId" element={<ExerciseDetailScreen user={user} />} />
              <Route path="/create-challenge/:groupId" element={<CreateChallengeForm user={user} />} />
              <Route path="/log/:challengeId" element={<LogWorkoutScreen user={user} />} />
              <Route path="/leaderboard/:challengeId" element={<LeaderboardScreen />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </LayoutShell>
      </Router>
    </QueryClientProvider>
  );
};

export default App;