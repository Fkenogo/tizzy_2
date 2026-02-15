import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserDoc, GroupDoc } from '../../types';
import { useQuery } from '@tanstack/react-query';
// Fix: Use @firebase/firestore for named exports to resolve build errors
import { collection, query, where, getDocs, limit } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { MoreHorizontal, Search, Users, Trophy, Plus, Database, Compass, Ghost } from 'lucide-react';

interface GroupsScreenProps {
  user: UserDoc | null;
}

type GroupTab = 'my-groups' | 'discover' | 'invites';

const GroupsScreen: React.FC<GroupsScreenProps> = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<GroupTab>('my-groups');

  const { data: myGroups, isLoading: loadingMyGroups } = useQuery({
    queryKey: ['myGroups', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(collection(db, 'groups'), where('members', 'array-contains', user.uid));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupDoc));
    },
    enabled: !!user,
  });

  const { data: discoverGroups, isLoading: loadingDiscover } = useQuery({
    queryKey: ['discoverGroups', user?.uid],
    queryFn: async () => {
      // Find groups user is NOT in
      const q = query(collection(db, 'groups'), limit(10));
      const snap = await getDocs(q);
      const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupDoc));
      return all.filter(g => !g.members.includes(user?.uid || ''));
    },
    enabled: !!user && activeTab === 'discover',
  });

  const isLoading = activeTab === 'my-groups' ? loadingMyGroups : loadingDiscover;
  const groups = activeTab === 'my-groups' ? myGroups : discoverGroups;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-6 pt-6 pb-2 border-b border-primary/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined !text-2xl font-black">groups</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#1d130c] dark:text-white">Tribes</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/groups/create')}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all mr-1"
            >
              <Plus size={14} strokeWidth={3} />
              Start Tribe
            </button>
            <button className="p-2 rounded-full hover:bg-primary/10 transition-colors text-slate-700 dark:text-slate-300">
              <Search size={22} />
            </button>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex gap-8 px-1">
          {(['my-groups', 'discover', 'invites'] as GroupTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold capitalize transition-all relative ${
                activeTab === tab 
                  ? 'text-primary' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              {tab.replace('-', ' ')}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-5 py-6 space-y-6">
        {isLoading ? (
          Array(2).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#2d1e14] rounded-[32px] h-[350px] animate-pulse shadow-sm"></div>
          ))
        ) : !groups || groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center animate-in fade-in duration-700">
            <div className="size-24 bg-slate-100 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-slate-300 mb-8 shadow-inner">
               {activeTab === 'my-groups' ? <Ghost size={48} /> : <Compass size={48} />}
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {activeTab === 'my-groups' ? "No Tribes Joined" : "End of the World"}
            </h2>
            <p className="text-sm font-medium text-slate-500 max-w-[240px] leading-relaxed mb-10">
              {activeTab === 'my-groups' 
                ? "You haven't joined any groups yet. Browse the discovery tab or seed the database to get started." 
                : "We couldn't find any other tribes to join right now. Try refreshing later!"}
            </p>
            
            {activeTab === 'my-groups' && (
              <div className="flex flex-col gap-4 w-full max-w-[200px]">
                <button 
                  onClick={() => setActiveTab('discover')}
                  className="w-full bg-primary text-white h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  Discover Tribes
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full bg-white dark:bg-white/5 text-slate-400 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-slate-100 dark:border-white/10 flex items-center justify-center gap-2"
                >
                  <Database size={14} />
                  Seed Test Data
                </button>
              </div>
            )}
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`)}
              className="bg-white dark:bg-[#2d1e14] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-white/5 active:scale-[0.98] transition-all group cursor-pointer"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  alt={group.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src={group.imageUrl || `https://picsum.photos/seed/${group.id}/800/600`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">{group.name}</h2>
                  <button className="p-1 text-slate-300 hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal size={24} />
                  </button>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                  {group.description}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <Users size={16} className="text-slate-300" />
                      <span>{group.members.length.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest">
                      <Trophy size={16} className="text-primary/60" />
                      <span className="text-slate-400">Tribe {activeTab === 'discover' ? 'Found' : 'Active'}</span>
                    </div>
                  </div>
                  
                  <button className="bg-[#fff7ed] dark:bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm">
                    {activeTab === 'discover' ? 'View' : 'Open'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default GroupsScreen;