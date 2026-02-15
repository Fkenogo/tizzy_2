import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDoc, ChallengeDoc, GroupDoc } from '../../types';
import { useQuery } from '@tanstack/react-query';
// Fix: Use @firebase/firestore for named exports to resolve build errors
import { doc, getDoc, collection, query, where, limit, getDocs } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { Bell, Clock } from 'lucide-react';

interface HomeScreenProps {
  user: UserDoc | null;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user }) => {
  const navigate = useNavigate();

  // 1. Find User's Primary Group
  const { data: userGroups } = useQuery({
    queryKey: ['myGroupsShort', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(collection(db, 'groups'), where('members', 'array-contains', user.uid), limit(1));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupDoc));
    },
    enabled: !!user,
  });

  const activeGroup = userGroups?.[0];

  const { data: activeChallenge } = useQuery({
    queryKey: ['activeChallenge', user?.activeChallengeId],
    queryFn: async () => {
      if (!user?.activeChallengeId) return null;
      const snap = await getDoc(doc(db, 'challenges', user.activeChallengeId));
      return snap.exists() ? { id: snap.id, ...snap.data() } as ChallengeDoc : null;
    },
    enabled: !!user?.activeChallengeId,
  });

  const liveUsers = [
    { name: 'Sarah', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { name: 'Mike', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
    { name: 'Elena', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
    { name: 'David', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
    { name: 'Chloe', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe' },
  ];

  const leaderboardPreview = [
    { rank: 1, name: 'Sarah Jenkins', value: '12.5k', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { rank: 2, name: 'Elena Gilbert', value: '10.2k', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
    { rank: 3, name: 'Marcus Chen', value: '9.8k', img: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
  ];

  return (
    <div className="pb-32 bg-background-light dark:bg-background-dark min-h-screen">
      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <div className="flex items-center gap-4">
          <div 
            className="size-14 rounded-full bg-cover bg-center border-2 border-primary/20 shadow-xl"
            style={{ backgroundImage: `url('${user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`}')` }}
          ></div>
          <div>
            <p className="text-sm text-primary font-black uppercase tracking-widest leading-none">Good morning,</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
              {user?.fullName?.split(' ')[0] || user?.displayName || 'Athlete'}
            </h1>
          </div>
        </div>
        <button className="size-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-sm text-slate-400">
          <Bell size={24} />
        </button>
      </header>

      <section className="mt-8 px-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Live in <span className="text-primary">{activeGroup?.name || 'Tiizi Global'}</span>
          </h2>
          <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
            Live
          </span>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
          {liveUsers.map((u, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[64px]">
              <div className="relative">
                <div className="size-16 rounded-full border-2 border-primary p-0.5 bg-white dark:bg-slate-800 shadow-md">
                  <img src={u.img} className="size-full rounded-full object-cover" alt={u.name} />
                </div>
                <div className="absolute top-0 right-0 size-3.5 bg-primary border-2 border-white dark:border-background-dark rounded-full"></div>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{u.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 px-6">
        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-5 uppercase tracking-widest opacity-80">Sunrise Step Challenge</h2>
        <div className="bg-white dark:bg-[#2d1e14] rounded-[40px] overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-white/5">
          <div 
            className="h-44 w-full bg-cover bg-center relative flex items-end p-6"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800")' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="relative z-10 text-white">
              <h3 className="font-black text-2xl tracking-tight leading-tight">Daily Sunrise Steps</h3>
              <p className="text-[10px] font-black opacity-80 uppercase tracking-widest mt-1">Ends in 24 days • 10k Daily Goal</p>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-10">
              <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Your Progress</span>
                <span className="text-xl font-black text-primary tracking-tighter">4,500 / 10,000</span>
              </div>
              <div className="w-full bg-slate-50 dark:bg-white/5 h-3.5 rounded-full overflow-hidden shadow-inner border border-slate-100 dark:border-white/5">
                <div className="bg-primary h-full rounded-full shadow-lg shadow-primary/20" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div className="space-y-4">
              {leaderboardPreview.map((item) => (
                <div key={item.rank} className="flex items-center gap-4">
                  <span className="w-6 text-sm font-black text-[#a16b45]">{item.rank}</span>
                  <div className="size-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                    <img src={item.img} className="size-full object-cover" alt="" />
                  </div>
                  <span className="flex-1 text-sm font-black text-slate-800 dark:text-slate-200 truncate tracking-tight">{item.name}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{item.value}</span>
                </div>
              ))}
              
              <div className="flex items-center gap-4 bg-primary/5 dark:bg-primary/10 p-5 rounded-[28px] border border-primary/20 -mx-2 shadow-sm">
                <span className="w-6 text-sm font-black text-primary">4</span>
                <div className="size-11 rounded-2xl border-2 border-primary overflow-hidden shadow-md">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} className="size-full object-cover" alt="" />
                </div>
                <span className="flex-1 text-sm font-black text-primary uppercase tracking-widest">You</span>
                <span className="text-sm font-black text-primary">4.5k</span>
              </div>
            </div>

            <button 
              onClick={() => navigate(`/leaderboard/challenge_birds_steps`)}
              className="w-full mt-10 py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-primary/30 active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em]"
            >
              View Full Leaderboard
            </button>
          </div>
        </div>
      </section>

      <section className="mt-12 px-6 pb-12">
        <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-5 uppercase tracking-widest opacity-80">Recent Activity</h2>
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#2d1e14] p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-white/5 flex gap-5 active:scale-[0.99] transition-all cursor-pointer">
            <div 
              className="size-14 rounded-2xl bg-cover bg-center shrink-0 shadow-lg border border-slate-100"
              style={{ backgroundImage: 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah")' }}
            ></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                <span className="font-black text-slate-900 dark:text-white">Sarah Jenkins</span> shared a victory in <span className="font-black text-primary">Early Birds Kenya</span>
              </p>
              <div className="flex items-center gap-2 mt-1">
                 <Clock size={12} className="text-[#a16b45]" />
                 <p className="text-[10px] font-black text-[#a16b45] uppercase tracking-widest opacity-70">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;