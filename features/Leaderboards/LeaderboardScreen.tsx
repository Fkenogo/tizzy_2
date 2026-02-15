import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
// Fix: Use @firebase/firestore for named exports to resolve build errors
import { doc, getDoc, collection, getDocs } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { ChallengeDoc, ChallengeLog, UserDoc } from '../../types';
import { ChevronLeft, Share2, Clock, Trophy, Target, Activity, Crown } from 'lucide-react';

interface LeaderboardEntry {
  uid: string;
  points: number;
  displayName: string;
  photoURL: string;
  rank: number;
  isTied: boolean;
}

const LeaderboardScreen: React.FC = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();

  // 1. Fetch Challenge Config
  const { data: challenge, isLoading: loadingChallenge } = useQuery<ChallengeDoc | null>({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'challenges', challengeId!));
      return snap.exists() ? { id: snap.id, ...snap.data() } as ChallengeDoc : null;
    }
  });

  // 2. Fetch All Logs for this challenge
  const { data: logs, isLoading: loadingLogs } = useQuery<ChallengeLog[]>({
    queryKey: ['challengeLogs', challengeId],
    queryFn: async () => {
      const snap = await getDocs(collection(db, `challenges/${challengeId}/logs`));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChallengeLog));
    },
    enabled: !!challengeId
  });

  // 3. Fetch User Profiles for participants
  // Explicitly defined types for the participants query to ensure robust indexing.
  const { data: participants, isLoading: loadingUsers } = useQuery<Record<string, UserDoc>>({
    queryKey: ['challengeUsers', challengeId, logs],
    queryFn: async () => {
      if (!logs) return {};
      
      // Explicitly typing uids as string[] to solve the "unknown" index error.
      const uids: string[] = Array.from(new Set(logs.map((l: ChallengeLog) => l.uid)));
      const userMap: Record<string, UserDoc> = {};
      
      for (const uid of uids) {
        const uSnap = await getDoc(doc(db, 'users', uid));
        if (uSnap.exists()) {
          userMap[uid] = uSnap.data() as UserDoc;
        }
      }
      return userMap;
    },
    enabled: !!logs
  });

  // 4. Calculate Ranks with Ties
  const leaderboardData = useMemo(() => {
    // Ensuring logs and participants are available for calculation
    if (!logs || !participants) return [];

    // Group points by UID
    const pointsMap: Record<string, number> = {};
    logs.forEach(log => {
      const totalForLog = log.entries.reduce((sum, entry) => sum + (entry.value || 0), 0);
      pointsMap[log.uid] = (pointsMap[log.uid] || 0) + totalForLog;
    });

    // Transform to entries
    const entries: LeaderboardEntry[] = Object.entries(pointsMap).map(([uid, points]) => ({
      uid,
      points,
      displayName: participants[uid]?.fullName || participants[uid]?.displayName || 'Anonymous',
      photoURL: participants[uid]?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`,
      rank: 0,
      isTied: false
    }));

    // Sort by points descending
    entries.sort((a, b) => b.points - a.points);

    // Apply ranking logic with tie handling
    for (let i = 0; i < entries.length; i++) {
      if (i > 0 && entries[i].points === entries[i - 1].points) {
        entries[i].rank = entries[i - 1].rank;
        entries[i].isTied = true;
        entries[i - 1].isTied = true;
      } else {
        entries[i].rank = i + 1;
      }
    }

    return entries;
  }, [logs, participants]);

  const top3 = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(3);

  if (loadingChallenge || loadingLogs || loadingUsers) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark gap-6">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-2xl shadow-primary/20"></div>
      <div className="text-center space-y-2">
        <p className="text-primary font-black uppercase tracking-[0.3em] text-xs animate-pulse">Syncing Leaderboard</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Calculating current standings...</p>
      </div>
    </div>
  );

  if (!challenge) return <div className="p-12 text-center font-bold text-[#a16b45]">Challenge not found.</div>;

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen pb-44 font-display overflow-x-hidden">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-background-dark/95 backdrop-blur-md border-b border-primary/10 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all active:scale-90">
            <ChevronLeft size={24} className="text-[#1d130c] dark:text-white" />
          </button>
          <div className="flex flex-col items-center flex-1">
            <h1 className="text-lg font-black leading-tight text-slate-900 dark:text-white uppercase tracking-tight">Arena Standings</h1>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">{challenge.title}</p>
          </div>
          <button className="size-10 flex items-center justify-center rounded-full hover:bg-primary/10 transition-all">
            <Share2 size={20} className="text-[#1d130c] dark:text-white" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto w-full pt-6">
        {/* Countdown */}
        <div className="px-6 py-3 flex items-center justify-center gap-2 bg-primary/5 dark:bg-primary/10 w-fit mx-auto rounded-full border border-primary/20 mb-8 animate-in fade-in duration-1000">
          <Clock size={16} strokeWidth={3} className="text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Stats • Updated Just Now</p>
        </div>

        {/* Podium Display (Handles Ties for Top 3) */}
        <div className="flex items-end justify-center gap-2 px-6 pb-12 pt-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.03] pointer-events-none">
             <Trophy size={300} strokeWidth={1} className="text-primary" />
          </div>

          {/* 2nd Place */}
          {top3[1] && (
            <div className="flex flex-col items-center flex-1 animate-in slide-in-from-bottom duration-700 delay-100">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-3xl border-4 border-slate-300 overflow-hidden shadow-xl ring-8 ring-slate-100 dark:ring-white/5 bg-white">
                  <img src={top3[1].photoURL} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-400 text-white size-8 rounded-xl flex items-center justify-center border-4 border-white dark:border-background-dark shadow-lg">
                  <span className="text-xs font-black">2</span>
                </div>
              </div>
              <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[80px]">{top3[1].displayName}</p>
              <p className="text-[10px] font-bold text-primary">{top3[1].points} pts</p>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div className="flex flex-col items-center flex-1 z-10 animate-in slide-in-from-bottom duration-1000">
              <div className="relative mb-6">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-primary animate-bounce">
                  <Crown size={32} fill="currentColor" />
                </div>
                <div className="w-28 h-28 rounded-[40px] border-4 border-primary overflow-hidden shadow-2xl ring-12 ring-primary/5 bg-white">
                  <img src={top3[0].photoURL} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-primary text-white size-10 rounded-2xl flex items-center justify-center border-4 border-white dark:border-background-dark shadow-xl">
                  <span className="text-sm font-black">1</span>
                </div>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate max-w-[100px]">{top3[0].displayName}</p>
              <p className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full mt-1">{top3[0].points} pts</p>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="flex flex-col items-center flex-1 animate-in slide-in-from-bottom duration-700 delay-200">
              <div className="relative mb-4">
                <div className="w-20 h-20 rounded-3xl border-4 border-orange-400/50 overflow-hidden shadow-xl ring-8 ring-slate-100 dark:ring-white/5 bg-white">
                  <img src={top3[2].photoURL} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-orange-400 text-white size-8 rounded-xl flex items-center justify-center border-4 border-white dark:border-background-dark shadow-lg">
                  <span className="text-xs font-black">3</span>
                </div>
              </div>
              <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[80px]">{top3[2].displayName}</p>
              <p className="text-[10px] font-bold text-primary">{top3[2].points} pts</p>
            </div>
          )}
        </div>

        {/* List of others */}
        <div className="px-6 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Rest of the Field</h3>
            <span className="text-[9px] font-bold text-slate-300">Total {leaderboardData.length} Athletes</span>
          </div>
          
          {others.map((entry) => (
            <div key={entry.uid} className="flex items-center gap-4 bg-white dark:bg-[#2d1f15] p-4 rounded-[28px] border border-slate-50 dark:border-white/5 shadow-sm">
              <span className="w-6 text-xs font-black text-[#a16b45]">{entry.rank}</span>
              <div className="size-12 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10 bg-slate-50">
                <img src={entry.photoURL} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-800 dark:text-white truncate tracking-tight">{entry.displayName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                   <Target size={10} className="text-slate-300" />
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Member</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 dark:text-white">{entry.points}</p>
                <p className="text-[9px] font-black text-primary uppercase tracking-widest">Points</p>
              </div>
            </div>
          ))}

          {leaderboardData.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <div className="size-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-30">
                <Activity size={32} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No battle reports logged yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LeaderboardScreen;