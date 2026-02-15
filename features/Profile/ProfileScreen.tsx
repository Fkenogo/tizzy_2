
import React, { useState } from 'react';
import { UserDoc } from '../../types';
// Added missing Rocket import
import { LogOut, ChevronRight, Settings, Users, Heart, MessageSquare, Info, Shield, HelpCircle, Database, AlertTriangle, Rocket } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { format } from 'date-fns';
import { seedDummyData } from '../../scripts/seedDummyData';
import { wipeAllData } from '../../scripts/wipeAllData';

interface ProfileScreenProps {
  user: UserDoc | null;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const [seeding, setSeeding] = useState(false);

  if (!user) return <div className="p-12 text-center font-bold text-slate-500 uppercase tracking-widest">Syncing Profile...</div>;

  const handleSeedData = async () => {
    if (confirm("This will populate your database with test users, groups, and challenges. Continue?")) {
      setSeeding(true);
      try {
        await seedDummyData(user.uid);
        alert("Database seeded successfully! Refreshing app...");
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Seeding failed. Check console.");
      } finally {
        setSeeding(false);
      }
    }
  };

  const handleWipeData = async () => {
    if (confirm("WARNING: This will delete ALL data in your project (except catalog). Are you sure?")) {
      setSeeding(true);
      try {
        await wipeAllData(false);
        alert("Database wiped. Refreshing...");
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Wipe failed.");
      } finally {
        setSeeding(false);
      }
    }
  };

  return (
    <div className="pb-32 bg-background-light dark:bg-background-dark min-h-screen">
      {/* Profile Header */}
      <header className="flex flex-col items-center pt-10 pb-8 px-6 bg-white dark:bg-[#2d1f15] rounded-b-[40px] shadow-sm">
        <div className="relative">
          <div className="w-28 h-28 rounded-full border-4 border-primary/20 shadow-xl overflow-hidden bg-slate-100">
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
              className="w-full h-full object-cover" 
              alt={user.fullName} 
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 border-4 border-white dark:border-[#2d1f15] flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined !text-sm font-black">workspace_premium</span>
          </div>
        </div>
        <div className="mt-5 text-center space-y-1">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{user.fullName || user.displayName}</h1>
          <p className="text-primary font-black text-sm uppercase tracking-widest flex items-center justify-center gap-1.5">
            Level {user.stats.level} • {user.stats.streak} Day Streak 🔥
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            Member since {user.createdAt ? format(user.createdAt.toDate(), 'MMMM yyyy') : 'April 2023'}
          </p>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8">
        {/* Recent Activity */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Activity</h3>
            <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="bg-white dark:bg-[#2d1f15] rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-white/5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <span className="material-symbols-outlined !text-2xl">fitness_center</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">Completed Yoga Flow</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">45 minutes • 240 kcal</p>
              </div>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">2h ago</span>
            </div>
            <div className="h-px bg-slate-50 dark:bg-white/5"></div>
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center text-green-600 shadow-inner">
                <span className="material-symbols-outlined !text-2xl">group_add</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-slate-800 dark:text-white leading-tight">Joined Marathon Group</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Local Runners Community</p>
              </div>
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Yesterday</span>
            </div>
          </div>
        </section>

        {/* Support Tiizi Hero Card */}
        <section className="bg-primary rounded-[32px] p-8 text-white shadow-2xl shadow-primary/40 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 opacity-10">
            <span className="material-symbols-outlined !text-[120px]">volunteer_activism</span>
          </div>
          <div className="relative z-10 space-y-6">
            <div>
              <h3 className="text-xl font-black tracking-tight mb-1 uppercase">Support Tiizi</h3>
              <p className="text-white/80 text-xs font-medium leading-relaxed">Help us reach our community growth goal!</p>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>$7,500 raised</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden shadow-inner">
                <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest opacity-70">
                <span>Goal: $10,000</span>
                <span>24 days left</span>
              </div>
            </div>
            <button className="w-full bg-white text-primary font-black py-4 rounded-2xl text-sm shadow-xl active:scale-95 transition-transform uppercase tracking-widest">
              Donate Now
            </button>
          </div>
        </section>

        {/* Developer Tools (Test Data) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <Database size={18} className="text-primary" />
             <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Developer Tools</h3>
          </div>
          <div className="bg-white dark:bg-[#2d1f15] rounded-[32px] p-8 border-2 border-dashed border-primary/20 space-y-4">
            <button 
              onClick={handleSeedData}
              disabled={seeding}
              className="w-full bg-primary/10 text-primary border border-primary/20 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              <Rocket size={18} />
              {seeding ? 'Syncing...' : 'Seed Test Environment'}
            </button>
            <button 
              onClick={handleWipeData}
              disabled={seeding}
              className="w-full bg-red-500/5 text-red-500 border border-red-500/20 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              <AlertTriangle size={18} />
              Wipe Test Data
            </button>
          </div>
        </section>

        {/* Quick Link Tiles */}
        <section className="grid grid-cols-2 gap-4">
          <button className="bg-white dark:bg-[#2d1f15] p-6 rounded-[32px] shadow-sm text-left flex flex-col gap-4 border border-slate-100 dark:border-white/5 active:scale-95 transition-all group">
            <div className="size-12 rounded-2xl bg-orange-100 dark:bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Heart size={24} fill="currentColor" />
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">Favorites</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">12 saved</p>
            </div>
          </button>
          <button className="bg-white dark:bg-[#2d1f15] p-6 rounded-[32px] shadow-sm text-left flex flex-col gap-4 border border-slate-100 dark:border-white/5 active:scale-95 transition-all group">
            <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-inner">
              <Users size={24} />
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">Settings</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage 3 groups</p>
            </div>
          </button>
        </section>

        {/* Utility List */}
        <section className="bg-white dark:bg-[#2d1f15] rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-white/5">
          <button className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/5 group">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                <Settings size={20} />
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Account Settings</span>
            </div>
            <ChevronRight size={20} className="text-slate-300" />
          </button>
          <button className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/5 group">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                <HelpCircle size={20} />
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Help & Feedback</span>
            </div>
            <ChevronRight size={20} className="text-slate-300" />
          </button>
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center justify-between p-6 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center text-red-500">
                <LogOut size={20} />
              </div>
              <span className="text-sm font-black text-red-500 uppercase tracking-tight">Logout</span>
            </div>
          </button>
        </section>
      </main>
    </div>
  );
};

export default ProfileScreen;
