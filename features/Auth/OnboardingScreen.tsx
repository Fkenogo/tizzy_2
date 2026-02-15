import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserDoc } from '../../types';
import { ChevronRight, Camera, CheckCircle } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';

interface OnboardingScreenProps {
  user: UserDoc | null;
}

const exerciseInterests = ["Running", "Weightlifting", "Yoga", "HIIT", "Cycling", "Swimming", "Pilates", "Hiking"];
const wellnessGoals = [
  { id: 'weight-loss', title: 'Weight Loss', desc: 'Focus on calorie deficit and fat burning', icon: 'monitor_weight' },
  { id: 'build-muscle', title: 'Build Muscle', desc: 'Hypertrophy and strength training focus', icon: 'exercise' },
  { id: 'flexibility', title: 'Improve Flexibility', desc: 'Stretching and mobility routine', icon: 'self_improvement' },
  { id: 'mental-health', title: 'Mental Health & Stress Relief', desc: 'Mindful movement and regular activity', icon: 'psychology' },
  { id: 'accountability', title: 'Accountability & Routine', desc: 'Build consistent daily habits', icon: 'group' },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ user }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [weight, setWeight] = useState(user?.weight || 70);
  const [height, setHeight] = useState(user?.height || 175);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState({
    showStatsToGroups: true,
    showBirthdayToFriends: true,
    searchable: true
  });

  const handleFinish = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fullName,
        displayName: fullName ? fullName.split(' ')[0] : user.displayName,
        birthday,
        weight,
        height,
        interests: selectedInterests,
        goals: selectedGoals,
        privacySettings: privacy,
        onboardingCompleted: true,
        lastActiveAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to finish onboarding:", error);
      alert("Error saving profile.");
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        onboardingCompleted: true,
        lastActiveAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
      setIsSubmitting(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => prev.includes(goalId) ? prev.filter(g => g !== goalId) : [...prev, goalId]);
  };

  const progress = (step / 3) * 100;

  const getSafeFormattedDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, 'MMM d') : '-';
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-[#1d130c] dark:text-[#f8f7f5] overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center p-4 pb-2 justify-between">
        <button 
          onClick={() => step > 1 && setStep(step - 1)} 
          className={`text-[#1d130c] dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-[#1d130c] dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
          {step === 3 ? 'Privacy & Community' : step === 2 ? 'Your Interests' : `Step ${step} of 3`}
        </h2>
      </header>

      {/* Progress Bar */}
      <div className="flex flex-col gap-2 px-6 py-2">
        <div className="flex justify-between items-center mb-1">
          <p className="text-[#1d130c] dark:text-white text-sm font-semibold">{step === 3 ? 'Final Touches' : 'Onboarding Progress'}</p>
          <p className="text-primary text-xs font-bold">{step === 3 ? 'Step 3 of 3' : `${Math.round(progress)}%`}</p>
        </div>
        <div className="h-2 w-full rounded-full bg-primary/20">
          <div className="h-2 rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4">
        {step === 1 && (
          <div className="px-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="text-center py-6">
              <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
              <p className="text-[#a16b45] dark:text-stone-400 text-sm">Personalize your accountability journey.</p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="size-32 rounded-full border-4 border-white dark:border-stone-800 shadow-lg overflow-hidden bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-stone-300 text-6xl">person</span>
                </div>
                <button className="absolute bottom-1 right-1 size-10 bg-primary text-white rounded-full flex items-center justify-center border-4 border-background-light dark:border-background-dark shadow-md">
                  <Camera size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold px-1">Full Name</label>
                <input 
                  className="w-full h-14 px-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-lg font-medium outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold px-1">Birthday</label>
                <input 
                  type="date"
                  className="w-full h-14 px-5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-lg font-medium outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold px-1">Weight</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="w-full h-14 pl-5 pr-12 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-lg font-medium outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      value={weight}
                      onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-stone-400 bg-stone-50 dark:bg-stone-700 px-2 py-1 rounded tracking-widest">kg</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold px-1">Height</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="w-full h-14 pl-5 pr-12 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-lg font-medium outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-stone-400 bg-stone-50 dark:bg-stone-700 px-2 py-1 rounded tracking-widest">cm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="px-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="py-6">
              <h1 className="text-3xl font-bold mb-3 tracking-tight">What moves you?</h1>
              <p className="text-base opacity-80 leading-relaxed">Select interests to find your tribe.</p>
            </div>

            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">fitness_center</span>
                <h3 className="text-xl font-bold">Interests</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {exerciseInterests.map(interest => (
                  <button 
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all border-2 ${
                      selectedInterests.includes(interest) 
                      ? 'bg-primary text-white border-primary shadow-lg' 
                      : 'bg-white dark:bg-white/5 border-primary/10 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span>{interest}</span>
                    {selectedInterests.includes(interest) && <CheckCircle size={14} />}
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">emoji_events</span>
                <h3 className="text-xl font-bold">Wellness Goals</h3>
              </div>
              <div className="grid gap-4">
                {wellnessGoals.map(goal => (
                  <div 
                    key={goal.id} 
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                      selectedGoals.includes(goal.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-primary/10 bg-white dark:bg-white/5'
                    }`}
                  >
                    <div className={`size-12 rounded-lg flex items-center justify-center shrink-0 ${
                      selectedGoals.includes(goal.id) ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      <span className="material-symbols-outlined">{goal.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold">{goal.title}</h4>
                      <p className="text-xs opacity-70 mt-0.5">{goal.desc}</p>
                    </div>
                    {selectedGoals.includes(goal.id) && (
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {step === 3 && (
          <div className="px-6 animate-in fade-in slide-in-from-right duration-300 pb-20">
            <div className="py-6">
              <h1 className="text-2xl font-bold mb-1 tracking-tight">Final Touches</h1>
              <p className="text-[#a16b45] dark:text-gray-400 text-sm leading-relaxed">Control how you appear to others.</p>
            </div>

            <div className="space-y-4">
              {[
                { id: 'showStatsToGroups', label: 'Show stats to groups', desc: 'Visible only to teammates' },
                { id: 'showBirthdayToFriends', label: 'Show birthday to friends', desc: 'Celebrate milestones' },
                { id: 'searchable', label: 'Publicly searchable', desc: 'Allow friends to find you' },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-white/5">
                  <div className="flex-1 pr-4">
                    <p className="text-base font-bold text-slate-800 dark:text-white leading-tight">{item.label}</p>
                    <p className="text-[10px] text-[#a16b45] mt-1 font-medium">{item.desc}</p>
                  </div>
                  <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full bg-slate-200 dark:bg-white/10 p-0.5 transition-colors has-[:checked]:bg-primary">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={(privacy as any)[item.id]} 
                      onChange={() => setPrivacy(prev => ({ ...prev, [item.id]: !(prev as any)[item.id] }))}
                    />
                    <div className="h-full aspect-square rounded-full bg-white shadow-md transition-all translate-x-0 peer-checked:translate-x-5"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <div className="bg-white dark:bg-[#2d1f15] rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full border-4 border-primary/10 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden mb-4">
                  <span className="material-symbols-outlined text-slate-300 text-4xl">person</span>
                </div>
                <h4 className="text-xl font-black">{fullName || "Tiizi Athlete"}</h4>
                <p className="text-[10px] text-[#a16b45] font-black uppercase tracking-[0.2em] mb-6">@{fullName ? fullName.toLowerCase().replace(/\s+/g, '_') : 'athlete'}</p>
                
                <div className="grid grid-cols-3 gap-4 w-full border-t border-slate-50 dark:border-white/5 pt-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#a16b45] uppercase font-black tracking-widest">Height</span>
                    <span className="text-sm font-bold">{height} cm</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#a16b45] uppercase font-black tracking-widest">Weight</span>
                    <span className="text-sm font-bold">{weight} kg</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#a16b45] uppercase font-black tracking-widest">Birth</span>
                    <span className="text-sm font-bold">{getSafeFormattedDate(birthday)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light/95 dark:via-background-dark/95 to-transparent z-50">
        <div className="flex flex-col gap-3">
          <div className="flex gap-4">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="flex-1 h-16 rounded-2xl border-2 border-primary/20 text-primary font-black uppercase tracking-widest active:scale-95">
                Back
              </button>
            )}
            <button 
              onClick={() => step < 3 ? setStep(step + 1) : handleFinish()}
              disabled={isSubmitting || (step === 1 && !fullName)}
              className={`${step > 1 ? 'flex-[2]' : 'w-full'} h-16 bg-primary text-white rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50`}
            >
              {isSubmitting ? 'Syncing...' : step === 3 ? 'Finish' : 'Next'}
              <ChevronRight size={24} />
            </button>
          </div>
          {step === 1 && (
            <button onClick={handleSkip} disabled={isSubmitting} className="text-center py-2 text-sm font-bold text-slate-400 hover:text-primary uppercase tracking-widest">
              Skip for now
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default OnboardingScreen;