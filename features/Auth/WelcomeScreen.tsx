
import React, { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const WelcomeScreen: React.FC = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleStart = async () => {
    setIsSigningIn(true);
    try {
      await signInAnonymously(auth);
      // App.tsx onAuthStateChanged will handle the transition once signed in
    } catch (error: any) {
      console.error("Auth failed:", error);
      alert("Something went wrong during sign in. Please try again.");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-[#1d130c] dark:text-[#f8f7f5]">
      {/* Top App Bar */}
      <div className="flex items-center p-4 pb-2 justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-1.5 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">fitness_center</span>
          </div>
          <span className="text-xl font-extrabold tracking-tighter text-[#1d130c] dark:text-[#f8f7f5]">Tiizi</span>
        </div>
        <div className="text-[#1d130c] dark:text-[#f8f7f5] flex size-12 shrink-0 items-center justify-end">
          <span className="material-symbols-outlined text-2xl">info</span>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="px-4 py-3">
        <div className="w-full relative overflow-hidden rounded-[40px] h-[45vh] shadow-xl shadow-primary/10">
          <div 
            className="absolute inset-0 bg-center bg-no-repeat bg-cover" 
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800")' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-grow px-8 pt-10 pb-12 items-center text-center">
        <h1 className="tracking-tight text-[38px] font-black leading-[1.1] pb-4">
          Your Workouts,<br/>
          <span className="text-primary">Their Accountability.</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed max-w-sm pb-10">
          Join groups, run challenges, and level up your fitness journey with friends.
        </p>

        {/* CTA Container */}
        <div className="w-full max-w-sm space-y-6">
          <button 
            onClick={handleStart}
            disabled={isSigningIn}
            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-[24px] h-16 px-5 bg-primary text-white text-lg font-black leading-normal tracking-wide shadow-2xl shadow-primary/30 transition-transform active:scale-95 disabled:opacity-70"
          >
            {isSigningIn ? 'Syncing...' : 'Get Started'}
          </button>

          {/* Social proof */}
          <div className="flex justify-center items-center gap-3 pt-2">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <img 
                  key={i}
                  alt="User" 
                  className="w-9 h-9 rounded-full border-2 border-white dark:border-background-dark shadow-sm" 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=welcome${i}`} 
                />
              ))}
            </div>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Joined by 10k+ athletes</span>
          </div>
        </div>

        <div className="flex-grow"></div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest px-4 leading-relaxed">
            By continuing, you agree to our <br/>
            <span className="underline cursor-pointer hover:text-primary transition-colors">Terms of Service</span> and <span className="underline cursor-pointer hover:text-primary transition-colors">Privacy Policy</span>.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default WelcomeScreen;
