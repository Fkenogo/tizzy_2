import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Fix: Use @firebase/firestore for named exports to resolve build errors
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { ChallengeDoc, UserDoc, LogEntry } from '../../types';
import { ChevronLeft, Flame, Save, Info } from 'lucide-react';

interface LogWorkoutScreenProps {
  user: UserDoc | null;
}

const LogWorkoutScreen: React.FC<LogWorkoutScreenProps> = ({ user }) => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [entries, setEntries] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'challenges', challengeId!));
      return snap.exists() ? { id: snap.id, ...snap.data() } as ChallengeDoc : null;
    }
  });

  const logMutation = useMutation({
    mutationFn: async () => {
      if (!user || !challenge) return;
      const logEntries: LogEntry[] = challenge.activities.map(act => ({
        exerciseId: act.exerciseId,
        metricUnit: act.metricUnit,
        value: entries[act.exerciseId] || 0
      })).filter(e => e.value > 0);

      if (logEntries.length === 0) return;

      // 1. Save Log
      await addDoc(collection(db, `challenges/${challengeId}/logs`), {
        uid: user.uid,
        createdAt: serverTimestamp(),
        entries: logEntries,
        note
      });

      // 2. Create Feed Post (client-side trigger for v1)
      await addDoc(collection(db, 'posts'), {
        groupId: challenge.groupId,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
        content: `${user.displayName} logged a workout in ${challenge.title}!`,
        type: 'workout_log',
        createdAt: serverTimestamp(),
        reactions: {}
      });

      // 3. Update User Stats
      await updateDoc(doc(db, 'users', user.uid), {
        'stats.totalLogs': increment(1),
        'stats.xp': increment(50)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', challengeId] });
      navigate('/');
    }
  });

  const updateEntry = (exId: string, val: string) => {
    setEntries({ ...entries, [exId]: parseInt(val) || 0 });
  };

  if (isLoading) return <div className="p-12 text-center">Loading challenge...</div>;
  if (!challenge) return <div className="p-12 text-center">Challenge not found.</div>;

  return (
    <div className="p-6 pb-32 space-y-8 min-h-screen bg-white">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Log Workout</h1>
          <p className="text-sm font-bold text-primary-600">{challenge.title}</p>
        </div>
      </div>

      <div className="space-y-6">
        {challenge.activities.map(act => (
          <div key={act.exerciseId} className="bg-slate-50 rounded-[32px] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 text-lg">{act.exerciseName}</h3>
              <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400">
                <Flame size={14} className="text-primary-500" /> Target: {act.targetValue} {act.metricUnit}
              </div>
            </div>
            
            <div className="flex items-end gap-3">
              <input 
                type="number"
                placeholder="0"
                className="flex-1 bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-3xl text-center focus:ring-2 ring-primary-500 transition-all outline-none"
                value={entries[act.exerciseId] || ''}
                onChange={e => updateEntry(act.exerciseId, e.target.value)}
              />
              <span className="text-lg font-black text-slate-400 pb-4 uppercase tracking-wider">{act.metricUnit}</span>
            </div>
          </div>
        ))}

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 px-2">
            <Info size={14} /> Add a note (optional)
          </label>
          <textarea 
            className="w-full px-6 py-4 bg-slate-50 border-0 rounded-3xl h-32 resize-none"
            placeholder="How did it feel?"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-slate-50 z-40">
        <button 
          onClick={() => logMutation.mutate()}
          disabled={logMutation.isPending}
          className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-lg shadow-xl shadow-slate-900/30 flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-50"
        >
          <Save size={24} />
          {logMutation.isPending ? 'Logging...' : 'Finish Workout'}
        </button>
      </div>
    </div>
  );
};

export default LogWorkoutScreen;