import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// Fix: Use @firebase/firestore for named exports as they are reported missing from 'firebase/firestore'
import { collection, getDocs, query, orderBy } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { CatalogExercise, ExerciseCategory } from '../../types';
import { Database, X, Filter, Check, RotateCcw } from 'lucide-react';
import { seedExercises } from '../../scripts/seedCatalogExercises';

const categories: { label: string; value: ExerciseCategory | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Core & Planks', value: 'Core & Planks' },
  { label: 'Ab Exercises', value: 'Ab Exercises' },
  { label: 'Lower Body', value: 'Lower Body' },
  { label: 'Cardio & Dynamic', value: 'Cardio & Dynamic' },
  { label: 'Upper Body', value: 'Upper Body' },
  { label: 'Mobility', value: 'Mobility & Stretching' },
  { label: 'Wellness', value: 'Wellness Category' },
];

const ExerciseLibraryScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Advanced Filters
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);

  const { data: exercises, isLoading, refetch } = useQuery({
    queryKey: ['catalogExercises'],
    queryFn: async () => {
      const q = query(collection(db, 'catalogExercises'), orderBy('name'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CatalogExercise));
    }
  });

  // Extract unique tags and equipment from available data
  const availableFilters = useMemo(() => {
    if (!exercises) return { tags: [], equipment: [] };
    const tags = new Set<string>();
    const equipment = new Set<string>();

    exercises.forEach(ex => {
      ex.tags?.forEach(t => tags.add(t));
      if (Array.isArray(ex.equipment)) {
        ex.equipment.forEach(e => equipment.add(e));
      } else if (ex.equipment) {
        equipment.add(ex.equipment);
      }
    });

    return {
      tags: Array.from(tags).sort(),
      equipment: Array.from(equipment).sort()
    };
  }, [exercises]);

  const filteredExercises = exercises?.filter(ex => {
    const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 || 
                        selectedTags.some(tag => ex.tags?.includes(tag));
    
    const exEquipment = Array.isArray(ex.equipment) ? ex.equipment : [ex.equipment];
    const matchesEquipment = selectedEquipment.length === 0 || 
                             selectedEquipment.some(eq => exEquipment.includes(eq));

    return matchesCategory && matchesSearch && matchesTags && matchesEquipment;
  });

  const handleSeed = async () => {
    if (confirm("Seed full production exercise catalog into Firestore?")) {
      await seedExercises();
      refetch();
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const toggleEquipment = (eq: string) => {
    setSelectedEquipment(prev => prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]);
  };

  const resetFilters = () => {
    setSelectedTags([]);
    setSelectedEquipment([]);
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const activeFiltersCount = selectedTags.length + selectedEquipment.length + (selectedCategory !== 'All' ? 1 : 0);

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display">
      {/* Header Section */}
      <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-6 pb-2 border-b border-primary/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-gray-700 dark:text-gray-200">arrow_back</span>
            </button>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Exercise Library</h1>
          </div>
          <div className="flex gap-2">
             <button onClick={handleSeed} title="Seed Catalog" className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm text-primary hover:bg-primary/5 transition-colors">
               <Database size={18} />
             </button>
             <button 
              onClick={() => setIsFilterOpen(true)}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm active:scale-90 transition-transform ${activeFiltersCount > 0 ? 'text-primary' : 'text-slate-400'}`}
             >
               <span className="material-symbols-outlined">tune</span>
               {activeFiltersCount > 0 && (
                 <span className="absolute -top-1 -right-1 size-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                   {activeFiltersCount}
                 </span>
               )}
             </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="flex w-full items-center rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-slate-100 dark:border-gray-700 h-12 px-4 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <span className="material-symbols-outlined text-slate-400 mr-2">search</span>
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 font-bold" 
              placeholder="Search 20+ exercises..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-300 hover:text-slate-500">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Category Chips - Keep for Quick Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {categories.map(cat => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.value as any)}
              className={`flex h-9 shrink-0 items-center justify-center rounded-full px-5 text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                selectedCategory === cat.value 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                : 'bg-white dark:bg-gray-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Exercise List */}
      <main className="px-4 py-4 space-y-4 pb-40">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="h-28 bg-white dark:bg-gray-800 rounded-[28px] animate-pulse shadow-sm"></div>)
        ) : filteredExercises?.length === 0 ? (
          <div className="text-center py-24 text-slate-400 space-y-4">
            <div className="size-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-30">
              <span className="material-symbols-outlined !text-4xl">search_off</span>
            </div>
            <p className="font-black uppercase tracking-widest text-sm">No matches found</p>
            <button onClick={resetFilters} className="text-primary font-black uppercase text-xs tracking-[0.2em] border-b-2 border-primary/20 pb-0.5">Clear all filters</button>
          </div>
        ) : (
          filteredExercises?.map(ex => (
            <div 
              key={ex.id}
              onClick={() => navigate(`/exercises/${ex.id}`)}
              className="group flex items-center gap-4 bg-white dark:bg-gray-800 p-3 rounded-[28px] shadow-sm border border-slate-100 dark:border-gray-700 transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
            >
              <div className="shrink-0">
                <div 
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-2xl w-24 h-24 bg-slate-50 dark:bg-gray-700 shadow-inner overflow-hidden border border-slate-50 dark:border-gray-600" 
                  style={{ backgroundImage: `url(${ex.media?.imageUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=200'})` }}
                ></div>
              </div>
              <div className="flex flex-1 flex-col justify-between h-24 py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-slate-900 dark:text-gray-100 text-lg font-black leading-tight line-clamp-1 tracking-tight">{ex.name}</h3>
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-90">{ex.category}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); /* TODO: Fav Logic */ }} className="text-slate-200 dark:text-gray-700 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined leading-none text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>favorite</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 mt-auto">
                   <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-black tracking-widest uppercase border border-slate-100 dark:border-gray-600">
                    {ex.metricUnit}
                  </span>
                  {ex.difficulty && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-900/10 text-orange-600 text-[10px] font-black tracking-widest uppercase border border-orange-100 dark:border-orange-900/20">
                      LVL {ex.difficulty}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Filter Bottom Sheet */}
      {isFilterOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsFilterOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[70] bg-white dark:bg-[#23170f] rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[90vh]">
            <div className="sticky top-0 p-6 flex items-center justify-between border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#23170f] rounded-t-[40px] z-10">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">tune</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Filters</h3>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={resetFilters} className="text-slate-400 hover:text-primary transition-colors">
                  <RotateCcw size={20} />
                </button>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar">
              {/* Category Section in Sheet */}
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                   <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Target Area</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.label}
                      onClick={() => setSelectedCategory(cat.value as any)}
                      className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${
                        selectedCategory === cat.value 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                        : 'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-white/5'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Tags Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Training Style</span>
                   <span className="text-[10px] font-bold text-slate-400">{selectedTags.length} selected</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {availableFilters.tags.map(tag => {
                    const isActive = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`p-4 rounded-2xl flex items-center justify-between border-2 transition-all text-left ${
                          isActive 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-slate-100 dark:border-white/5 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-widest truncate">{tag}</span>
                        {isActive ? (
                          <div className="size-5 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                            <Check size={12} strokeWidth={4} />
                          </div>
                        ) : (
                          <div className="size-5 rounded-full border-2 border-slate-200 dark:border-white/10 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Equipment Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">Equipment Needed</span>
                   <span className="text-[10px] font-bold text-slate-400">{selectedEquipment.length} selected</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableFilters.equipment.map(eq => {
                    const isActive = selectedEquipment.includes(eq);
                    return (
                      <button
                        key={eq}
                        onClick={() => toggleEquipment(eq)}
                        className={`px-5 py-3 rounded-2xl flex items-center gap-3 border-2 transition-all ${
                          isActive 
                          ? 'border-primary bg-primary text-white' 
                          : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="text-xs font-black uppercase tracking-widest">{eq}</span>
                        {isActive && <X size={14} className="opacity-60" />}
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 rounded-b-[40px]">
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full h-16 bg-primary text-white rounded-[24px] font-black text-lg shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                Apply Filters
                <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full">{filteredExercises?.length || 0} Results</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExerciseLibraryScreen;