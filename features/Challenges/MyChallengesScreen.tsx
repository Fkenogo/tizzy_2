
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, SlidersHorizontal, ArrowRight, Users, Clock, Plus, Rocket } from 'lucide-react';

const MyChallengesScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Sections data placeholders (TODO: Connect to Firestore)
  const popularChallenges = [
    {
      id: 'hiit-blast-30',
      title: '30-Day HIIT Blast',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400',
      joined: '1.2k',
      days: 30,
      tag: 'Trending'
    },
    {
      id: 'yoga-flex',
      title: 'Yoga Flexibility Flow',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400',
      joined: '850',
      days: 14,
      tag: 'Featured'
    }
  ];

  const startingSoon = [
    {
      id: 'morning-runners',
      title: "Morning Runner's Club",
      time: 'Starts in 4 hours',
      countdown: '4:23:12',
      image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: 'powerlifting',
      title: 'Powerlifting Essentials',
      time: 'Starts in 18 hours',
      countdown: '18:12:05',
      image: 'https://images.unsplash.com/photo-1541534741688-6078c64b5903?auto=format&fit=crop&q=80&w=200'
    }
  ];

  const recentlyViewed = [
    { id: 'eat-101', title: 'Healthy Eating 101', time: 'Last seen 2h ago', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=200' },
    { id: 'squat-master', title: 'Squat Masterclass', time: 'Last seen 5h ago', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200' },
    { id: 'mobility', title: 'Morning Mobility', time: 'Last seen 1d ago', image: 'https://images.unsplash.com/photo-1552196564-972b2c9f7272?auto=format&fit=crop&q=80&w=200' }
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-40">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-black tracking-tight text-[#1d130c] dark:text-white">Discovery</h1>
          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-primary/10 transition-colors relative">
              <span className="material-symbols-outlined text-2xl">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-background-dark"></span>
            </button>
            <button className="p-2 rounded-full hover:bg-primary/10 transition-colors">
              <span className="material-symbols-outlined text-2xl">tune</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">search</span>
          <input 
            className="w-full h-14 bg-white dark:bg-[#322319] border-none rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary shadow-sm text-sm font-medium" 
            placeholder="Search challenges..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <main className="space-y-8 pt-4">
        {/* Hero Banner */}
        <section className="px-6">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary to-[#ff9100] p-8 text-white shadow-xl shadow-primary/20">
            <div className="relative z-10 max-w-[65%] space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-90">Exercise Library</p>
              <h2 className="text-2xl font-black leading-tight tracking-tight">Master Your Form & Technique</h2>
              <button 
                onClick={() => navigate('/exercises')}
                className="bg-white text-primary px-5 py-3 rounded-2xl text-xs font-black shadow-lg flex items-center gap-2 uppercase tracking-widest active:scale-95 transition-transform"
              >
                View Library
                <ArrowRight size={16} strokeWidth={3} />
              </button>
            </div>
            {/* Decorative Icon */}
            <div className="absolute right-[-20px] bottom-[-40px] opacity-10 rotate-12">
              <span className="material-symbols-outlined text-[200px]">fitness_center</span>
            </div>
          </div>
        </section>

        {/* Popular Now */}
        <section>
          <div className="flex items-center justify-between px-6 mb-4">
            <h3 className="text-xl font-black flex items-center gap-2 tracking-tight">
              Popular Now
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            </h3>
            <button className="text-primary text-xs font-black uppercase tracking-widest">See all</button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar snap-x snap-mandatory pb-4">
            {popularChallenges.map(challenge => (
              <div 
                key={challenge.id} 
                className="min-w-[280px] snap-center bg-white dark:bg-[#322319] rounded-[32px] overflow-hidden shadow-sm border border-black/5 dark:border-white/5 active:scale-95 transition-transform"
              >
                <div 
                  className="h-40 bg-cover bg-center" 
                  style={{ backgroundImage: `url('${challenge.image}')` }}
                ></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-lg leading-tight tracking-tight">{challenge.title}</h4>
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">{challenge.tag}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1.5"><Users size={14} /> {challenge.joined} joined</span>
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {challenge.days} days</span>
                  </div>
                  <button className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-primary/20">Join Challenge</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Starting Soon */}
        <section className="px-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black tracking-tight">Starting Soon</h3>
            <button className="text-primary text-xs font-black uppercase tracking-widest">View calendar</button>
          </div>
          <div className="space-y-4">
            {startingSoon.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-[#322319] p-4 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm group active:scale-[0.98] transition-all">
                <div 
                  className="h-20 w-20 rounded-2xl bg-cover bg-center shrink-0 shadow-inner" 
                  style={{ backgroundImage: `url('${item.image}')` }}
                ></div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-base text-slate-800 dark:text-white truncate">{item.title}</h4>
                  <p className="text-xs font-bold text-slate-400 mt-1">{item.time}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black text-primary px-3 py-1 rounded-lg bg-primary/5 border border-primary/20 tracking-widest">
                      {item.countdown}
                    </span>
                  </div>
                </div>
                <button className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                  <Plus size={24} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Viewed */}
        <section className="pb-12">
          <div className="flex items-center justify-between px-6 mb-4">
            <h3 className="text-xl font-black tracking-tight">Recently Viewed</h3>
            <button className="text-primary text-xs font-black uppercase tracking-widest">Clear history</button>
          </div>
          <div className="flex gap-6 overflow-x-auto px-6 no-scrollbar">
            {recentlyViewed.map(item => (
              <div key={item.id} className="min-w-[140px] group cursor-pointer">
                <div 
                  className="aspect-square rounded-[24px] bg-cover bg-center mb-3 shadow-md relative overflow-hidden ring-4 ring-white dark:ring-[#322319] group-active:scale-95 transition-transform" 
                  style={{ backgroundImage: `url('${item.image}')` }}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white truncate leading-tight">{item.title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.time}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default MyChallengesScreen;
