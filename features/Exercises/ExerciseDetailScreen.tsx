import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// Fix: Use @firebase/firestore for named exports to resolve build errors
import { doc, getDoc } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { CatalogExercise, UserDoc } from '../../types';
import { AlertTriangle, Edit, Shield, Lightbulb, Flag } from 'lucide-react';

interface ExerciseDetailScreenProps {
  user: UserDoc | null;
}

const ExerciseDetailScreen: React.FC<ExerciseDetailScreenProps> = ({ user }) => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();

  const { data: exercise, isLoading } = useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: async () => {
      if (!exerciseId) return null;
      const snap = await getDoc(doc(db, 'catalogExercises', exerciseId));
      return snap.exists() ? { id: snap.id, ...snap.data() } as CatalogExercise : null;
    }
  });

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-background-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Loading...</p>
      </div>
    </div>
  );

  if (!exercise) return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-background-dark p-6">
      <div className="text-center space-y-4">
        <span className="material-symbols-outlined text-6xl text-slate-200">search_off</span>
        <h2 className="text-xl font-bold">Exercise not found</h2>
        <button onClick={() => navigate('/exercises')} className="px-6 py-2 bg-primary text-white rounded-full font-bold">Return to Library</button>
      </div>
    </div>
  );

  // Calculate data completeness
  const totalFields = 15; // Total number of fields we check
  const populatedFields = [
    exercise.name,
    exercise.tier_1,
    exercise.tier_2,
    exercise.difficulty,
    exercise.metric?.type,
    exercise.description,
    exercise.setup?.length,
    exercise.execution?.length,
    exercise.breathing?.inhale,
    exercise.formCues?.length,
    exercise.commonMistakes?.length,
    exercise.safetyNotes?.length,
    exercise.recommendedVolume?.beginner
  ].filter(Boolean).length;

  const dataCompleteness = Math.round((populatedFields / totalFields) * 100);

  // Check for missing critical data
  const hasCriticalData = exercise.name && exercise.tier_2 && exercise.metric?.type;
  const hasInstructions = exercise.setup?.length > 0 && exercise.execution?.length > 0;
  const hasSafetyData = exercise.safetyNotes?.length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-background-dark">
      {/* Header Bar */}
      <header className="sticky top-0 left-0 right-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 shadow-sm active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Exercise Detail</h1>
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 shadow-sm active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </button>
        </div>
      </header>

      {/* Hero Image - Full Width */}
      <div className="px-6 pt-4">
        <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl shadow-primary/5 border-4 border-white dark:border-slate-800">
          <img 
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800" 
            className="w-full h-full object-cover" 
            alt={exercise.name} 
          />
        </div>
      </div>

      {/* Content - With Mobile Container */}
      <main className="mobile-container space-y-6 pb-32">
        {/* Title and Tags */}
        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {exercise.name}
          </h2>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-wider rounded-full">
              {exercise.tier_1}
            </span>
            <span className="px-3 py-1.5 bg-blue-500/10 text-blue-600 text-xs font-black uppercase tracking-wider rounded-full">
              {exercise.tier_2}
            </span>
            <span className="px-3 py-1.5 bg-green-500/10 text-green-600 text-xs font-black uppercase tracking-wider rounded-full">
              {exercise.difficulty}
            </span>
          </div>
        </div>

        {/* Data Completeness Indicator */}
        <div className="bg-orange-50 dark:bg-primary/5 rounded-3xl p-4 border border-orange-100 dark:border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-orange-900 dark:text-orange-400 uppercase tracking-widest">
              Data Completeness
            </span>
            <span className="text-xs font-black text-primary">87% complete</span>
          </div>
          <div className="w-full bg-white dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '87%' }}></div>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">
              Metric Type
            </span>
            <p className="text-xl font-black text-primary uppercase">
              {exercise.metric?.type || 'REPS'}
            </p>
            <span className="text-xs text-slate-500 font-bold">Unit: {exercise.metric?.unit || 'reps'}</span>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">
              Recommended
            </span>
            <p className="text-base font-black text-slate-900 dark:text-white">
              {exercise.recommendedVolume?.beginner || '10-15 reps'}
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-white/5 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">
            Description
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {exercise.description}
          </p>
        </div>

        {/* Setup Steps */}
        {exercise.setup && exercise.setup.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">accessibility_new</span>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Setup</h4>
            </div>
            <div className="p-6">
              <ol className="space-y-3">
                {exercise.setup.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Execution Steps */}
        {exercise.execution && exercise.execution.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">play_circle</span>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Execution</h4>
            </div>
            <div className="p-6">
              <ol className="space-y-3">
                {exercise.execution.map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}

        {/* Form Cues */}
        {exercise.formCues && exercise.formCues.length > 0 && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-500/20">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">lightbulb</span>
              <h4 className="font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-widest text-xs">
                Pro Cues
              </h4>
            </div>
            <ul className="space-y-3">
              {exercise.formCues.map((cue, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <span className="flex-1">{cue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Common Mistakes */}
        {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
          <div className="bg-rose-50 dark:bg-rose-500/10 rounded-3xl p-6 border border-rose-100 dark:border-rose-500/20">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-rose-600 dark:text-rose-400">report</span>
              <h4 className="font-black text-rose-900 dark:text-rose-100 uppercase tracking-widest text-xs">
                Common Mistakes
              </h4>
            </div>
            <ul className="space-y-3">
              {exercise.commonMistakes.map((mistake, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-rose-800 dark:text-rose-300 font-medium">
                  <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-lg flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                    cancel
                  </span>
                  <span className="flex-1">{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety Notes */}
        {exercise.safetyNotes && exercise.safetyNotes.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-3xl p-6 border border-amber-100 dark:border-amber-500/20">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                shield
              </span>
              <h4 className="font-black text-amber-900 dark:text-amber-100 uppercase tracking-widest text-xs">
                Safety First
              </h4>
            </div>
            <ul className="space-y-2">
              {exercise.safetyNotes.map((note, i) => (
                <li key={i} className="text-sm text-amber-800 dark:text-amber-400 font-bold leading-relaxed">
                  • {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-[480px] mx-auto px-6 py-6 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-100 dark:border-white/5">
          <button 
            onClick={() => navigate('/')} 
            className="w-full py-5 bg-primary text-white rounded-3xl font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined font-black">timer</span>
            START EXERCISE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailScreen;