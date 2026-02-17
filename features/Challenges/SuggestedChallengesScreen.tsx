import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, Rocket } from 'lucide-react';

const SuggestedChallengesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | 'All'>('All');
  const [selectedDuration, setSelectedDuration] = useState<string | 'All'>('All');

  // Filter options
  const difficultyOptions = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const durationOptions = ['All', '7 days', '14 days', '21 days', '30 days', '45 days', '60 days'];

  // Suggested Challenges data
  const suggestedChallenges = [
    {
      id: 'beginner-starter',
      title: 'Beginner Fitness Starter',
      description: 'Perfect for those new to fitness. Build strength and endurance gradually with guided workouts and proper form instruction.',
      duration: '30 days',
      difficulty: 'Beginner',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600',
      color: 'from-emerald-500 to-emerald-600',
      workoutsPerWeek: '3-4',
      focus: 'Full Body',
      equipment: 'Bodyweight'
    },
    {
      id: 'weight-loss',
      title: 'Weight Loss Challenge',
      description: 'Burn fat and build lean muscle with this comprehensive program combining cardio, strength training, and nutrition guidance.',
      duration: '45 days',
      difficulty: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600',
      color: 'from-blue-500 to-blue-600',
      workoutsPerWeek: '5-6',
      focus: 'Cardio + Strength',
      equipment: 'Dumbbells, Cardio'
    },
    {
      id: 'strength-builder',
      title: 'Strength Builder',
      description: 'Build serious strength with progressive overload principles. Focus on compound movements and proper recovery.',
      duration: '60 days',
      difficulty: 'Advanced',
      image: 'https://images.unsplash.com/photo-1541534741688-6078c64b5903?auto=format&fit=crop&q=80&w=600',
      color: 'from-purple-500 to-purple-600',
      workoutsPerWeek: '4-5',
      focus: 'Strength Training',
      equipment: 'Barbell, Weights'
    },
    {
      id: 'flexibility',
      title: 'Flexibility & Mobility',
      description: 'Improve range of motion and reduce injury risk with daily mobility work, stretching, and yoga-inspired movements.',
      duration: '21 days',
      difficulty: 'All Levels',
      image: 'https://images.unsplash.com/photo-1552196564-972b2c9f7272?auto=format&fit=crop&q=80&w=600',
      color: 'from-orange-500 to-orange-600',
      workoutsPerWeek: 'Daily',
      focus: 'Mobility',
      equipment: 'Mat, Bands'
    },
    {
      id: 'cardio-endurance',
      title: 'Cardio Endurance',
      description: 'Boost your cardiovascular health and stamina with progressive cardio workouts that build endurance over time.',
      duration: '30 days',
      difficulty: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&q=80&w=600',
      color: 'from-red-500 to-red-600',
      workoutsPerWeek: '4-5',
      focus: 'Cardio',
      equipment: 'None/Optional'
    },
    {
      id: 'core-strength',
      title: 'Core Strength & Stability',
      description: 'Develop a strong, stable core with progressive exercises that improve posture and athletic performance.',
      duration: '28 days',
      difficulty: 'Beginner',
      image: 'https://images.unsplash.com/photo-1571019613991-5104ed47d06b?auto=format&fit=crop&q=80&w=600',
      color: 'from-teal-500 to-teal-600',
      workoutsPerWeek: '4-5',
      focus: 'Core',
      equipment: 'Mat, Bands'
    },
    {
      id: 'upper-body',
      title: 'Upper Body Power',
      description: 'Build upper body strength and definition with focused workouts targeting chest, back, shoulders, and arms.',
      duration: '35 days',
      difficulty: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600',
      color: 'from-indigo-500 to-indigo-600',
      workoutsPerWeek: '3-4',
      focus: 'Upper Body',
      equipment: 'Dumbbells, Pull-up Bar'
    },
    {
      id: 'lower-body',
      title: 'Lower Body Blast',
      description: 'Sculpt and strengthen your legs with progressive lower body workouts that build power and endurance.',
      duration: '42 days',
      difficulty: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600',
      color: 'from-pink-500 to-pink-600',
      workoutsPerWeek: '3-4',
      focus: 'Lower Body',
      equipment: 'Dumbbells, Bands'
    }
  ];

  // Filter challenges
  const filteredChallenges = suggestedChallenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'All' || challenge.difficulty === selectedDifficulty;
    const matchesDuration = selectedDuration === 'All' || challenge.duration === selectedDuration;
    
    return matchesSearch && matchesDifficulty && matchesDuration;
  });

  const handleChallengeClick = (challengeId: string) => {
    navigate(`/suggested-challenges/${challengeId}`);
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md mobile-container pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 shadow-sm active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Suggested Challenges</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pre-designed programs for your fitness goals</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Rocket size={24} />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group mb-4">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">search</span>
          <input 
            className="w-full h-12 bg-white dark:bg-[#322319] border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary shadow-sm text-sm font-medium" 
            placeholder="Search challenges..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">Difficulty</label>
            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="w-full h-10 bg-white dark:bg-[#322319] border-none rounded-lg px-3 text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              {difficultyOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">Duration</label>
            <select 
              value={selectedDuration} 
              onChange={(e) => setSelectedDuration(e.target.value as any)}
              className="w-full h-10 bg-white dark:bg-[#322319] border-none rounded-lg px-3 text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              {durationOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Stats */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {filteredChallenges.length} {filteredChallenges.length === 1 ? 'challenge' : 'challenges'} found
          </span>
          {(selectedDifficulty !== 'All' || selectedDuration !== 'All' || searchQuery) && (
            <button 
              onClick={() => {
                setSelectedDifficulty('All');
                setSelectedDuration('All');
                setSearchQuery('');
              }}
              className="text-primary text-xs font-black uppercase tracking-widest"
            >
              Clear filters
            </button>
          )}
        </div>
      </header>

      <main className="mobile-container space-y-6 pb-24">
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="size-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Rocket size={32} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">No challenges found</h3>
            <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search terms</p>
            <button 
              onClick={() => {
                setSelectedDifficulty('All');
                setSelectedDuration('All');
                setSearchQuery('');
              }}
              className="text-primary font-black uppercase text-xs tracking-widest border-b-2 border-primary/20 pb-0.5"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredChallenges.map(challenge => (
              <div 
                key={challenge.id} 
                className="bg-white dark:bg-[#322319] rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 active:scale-[0.99] transition-all cursor-pointer"
                onClick={() => handleChallengeClick(challenge.id)}
              >
                <div className="relative">
                  <div 
                    className="h-48 bg-cover bg-center" 
                    style={{ backgroundImage: `url('${challenge.image}')` }}
                  ></div>
                  <div className={`absolute inset-0 bg-gradient-to-t ${challenge.color} opacity-40`}></div>
                  <div className="absolute top-4 left-4">
                    <span className="text-xs font-black text-white uppercase tracking-widest bg-black/30 px-2 py-1 rounded-full">
                      {challenge.difficulty}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className="text-xs font-black text-white uppercase tracking-widest bg-black/30 px-2 py-1 rounded-full">
                      {challenge.duration}
                    </span>
                    <span className="text-xs font-black text-white uppercase tracking-widest bg-black/30 px-2 py-1 rounded-full">
                      {challenge.workoutsPerWeek}x/week
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-black text-xl leading-tight text-slate-900 dark:text-white">
                      {challenge.title}
                    </h4>
                    <button className="bg-primary text-white px-4 py-2 rounded-full text-xs font-black shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                      Quick Start
                    </button>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {challenge.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
                        {challenge.focus}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>dumbbell</span>
                        {challenge.equipment}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                        Pre-designed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SuggestedChallengesScreen;