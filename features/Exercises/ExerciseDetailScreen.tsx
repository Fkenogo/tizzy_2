import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// Fix: Use @firebase/firestore for named exports to resolve build errors
import { doc, getDoc } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { CatalogExercise, UserDoc } from '../../types';

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

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32">
      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 shadow-sm active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Exercise Detail</h1>
        <button className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 shadow-sm active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
        </button>
      </header>

      {/* Hero Image */}
      <div className="pt-20 px-4">
        <div className="relative w-full aspect-video rounded-[32px] overflow-hidden shadow-2xl shadow-primary/5 border-4 border-white dark:border-slate-800">
          <img 
            src={exercise.media?.imageUrl || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800'} 
            className="w-full h-full object-cover" 
            alt={exercise.name} 
          />
        </div>
      </div>

      <main className="p-6 space-y-8">
        {/* Title and Category */}
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{exercise.name}</h2>
          <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
            {exercise.category}
          </span>
        </div>

        {/* Benefits Card */}
        <div className="bg-orange-50 dark:bg-primary/5 rounded-[24px] p-6 border border-orange-100 dark:border-primary/10 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
             <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <div className="space-y-1">
             <h4 className="text-sm font-black text-primary uppercase tracking-widest">Benefits</h4>
             <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
               {exercise.benefits}
             </p>
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metric Unit</span>
            <p className="text-xl font-black text-primary uppercase">{exercise.metricUnit}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended</span>
            <p className="text-lg font-black text-slate-900 dark:text-white whitespace-nowrap">
              {exercise.recommendedRange?.label || 'Varies'}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
             <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
             <h3 className="text-xl font-black text-slate-900 dark:text-white">Instructions</h3>
          </div>

          {/* Setup Section */}
          <div className="bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-xl">accessibility_new</span>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Setup</h4>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{exercise.instructions.setup}</p>
            </div>
          </div>

          {/* Execution Section */}
          <div className="bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-xl">play_circle</span>
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Execution</h4>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{exercise.instructions.execution}</p>
            </div>
          </div>

          {/* Cues Section */}
          <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-[24px] p-6 border border-emerald-100 dark:border-emerald-500/20 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">lightbulb</span>
              <h4 className="font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-widest text-xs">Pro Cues</h4>
            </div>
            <ul className="space-y-3">
              {exercise.instructions.cues.map((cue, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-emerald-800 dark:text-emerald-300 font-medium">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {cue}
                </li>
              ))}
            </ul>
          </div>

          {/* Mistakes Section */}
          <div className="bg-rose-50 dark:bg-rose-500/10 rounded-[24px] p-6 border border-rose-100 dark:border-rose-500/20 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-rose-600 dark:text-rose-400">report</span>
              <h4 className="font-black text-rose-900 dark:text-rose-100 uppercase tracking-widest text-xs">Common Mistakes</h4>
            </div>
            <ul className="space-y-3">
              {exercise.instructions.commonMistakes.map((mistake, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-rose-800 dark:text-rose-300 font-medium">
                  <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                  {mistake}
                </li>
              ))}
            </ul>
          </div>

          {/* Safety Section */}
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-[24px] p-6 border border-amber-100 dark:border-amber-500/20 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-amber-600 shadow-sm flex-shrink-0 border border-amber-100 dark:border-amber-500/10">
               <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
            <div className="space-y-1">
               <h4 className="text-sm font-black text-amber-900 dark:text-amber-100 uppercase tracking-widest">Safety First</h4>
               <p className="text-sm text-amber-800 dark:text-amber-400 font-bold leading-relaxed">
                 {exercise.instructions.safety}
               </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-100 dark:border-white/5 z-50">
        <button 
          onClick={() => navigate('/')} 
          className="w-full py-5 bg-primary text-white rounded-[24px] font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined font-black">timer</span>
          START EXERCISE
        </button>
      </div>
    </div>
  );
};

export default ExerciseDetailScreen;