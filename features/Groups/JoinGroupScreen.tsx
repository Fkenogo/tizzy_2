import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Fix: Use @firebase/firestore for named exports as they are reported missing from 'firebase/firestore'
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { GroupDoc, UserDoc } from '../../types';
import { ChevronLeft, Rocket, CheckCircle, Info, Users, Trophy, Search, X } from 'lucide-react';

interface JoinGroupScreenProps {
  user: UserDoc | null;
}

const JoinGroupScreen: React.FC<JoinGroupScreenProps> = ({ user }) => {
  const { groupId } = useParams(); // This could be an ID or an Invite Code
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  // If a groupId/Code is in the URL, fetch it immediately
  const { data: fetchedGroup, isLoading: loadingGroup } = useQuery({
    queryKey: ['groupLookup', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      // 1. Try ID
      const snap = await getDoc(doc(db, 'groups', groupId));
      if (snap.exists()) return { id: snap.id, ...snap.data() } as GroupDoc;
      
      // 2. Try Code
      const q = query(collection(db, 'groups'), where('inviteCode', '==', groupId.toUpperCase()));
      const codeSnap = await getDocs(q);
      if (!codeSnap.empty) {
        // Fix: QuerySnapshot does not have an 'id' property. Use codeSnap.docs[0].id instead.
        return { id: codeSnap.docs[0].id, ...codeSnap.docs[0].data() } as GroupDoc;
      }
      return null;
    },
    enabled: !!groupId
  });

  // Local lookup for manual code input
  const [manualGroup, setManualGroup] = useState<GroupDoc | null>(null);

  const lookupCode = async (code: string) => {
    if (code.length < 5) {
      setManualGroup(null);
      setError('');
      return;
    }
    setSearching(true);
    setError('');
    try {
      const q = query(collection(db, 'groups'), where('inviteCode', '==', code.toUpperCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setManualGroup({ id: snap.docs[0].id, ...snap.docs[0].data() } as GroupDoc);
      } else {
        setManualGroup(null);
        setError('Tribe not found. Check the code and try again.');
      }
    } catch (err) {
      setError('Connection error. Try again.');
    } finally {
      setSearching(false);
    }
  };

  const groupToShow = fetchedGroup || manualGroup;

  const joinMutation = useMutation({
    mutationFn: async (targetGroupId: string) => {
      if (!user) throw new Error("Not authenticated");
      const groupRef = doc(db, 'groups', targetGroupId);
      const userRef = doc(db, 'users', user.uid);
      
      // Atomic update
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid)
      });
      await updateDoc(userRef, {
        activeGroupId: targetGroupId
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myGroups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables] });
      navigate(`/groups/${variables}`);
    },
    onError: () => {
      setError('Failed to join group. Please try again.');
    }
  });

  const handleJoin = () => {
    if (groupToShow) {
      joinMutation.mutate(groupToShow.id);
    }
  };

  const onCodeChange = (val: string) => {
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setManualCode(cleaned);
    if (cleaned.length >= 5) {
      lookupCode(cleaned);
    } else {
      setManualGroup(null);
      setError('');
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-primary/5 p-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2.5 rounded-full hover:bg-primary/10 transition-colors">
          <ChevronLeft size={24} className="text-slate-900 dark:text-white" />
        </button>
        <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">Join Group</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-6 py-10 space-y-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mb-6">
             <Search size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">Find Your Tribe</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Enter an invite code or follow a magic link to join an accountability circle.
          </p>
        </div>

        {/* Code Input Area */}
        <div className="space-y-6">
          <div className="relative">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-2 block mb-3">Invite Code</label>
            <div className="relative">
              <input
                type="text"
                className={`w-full h-24 text-4xl font-black tracking-[0.4em] uppercase text-center rounded-[32px] border-4 bg-white dark:bg-slate-800 dark:text-white transition-all outline-none shadow-xl ${
                  error ? 'border-red-500/50 ring-4 ring-red-500/10' : 
                  groupToShow ? 'border-green-500/50 ring-4 ring-green-500/10' : 
                  'border-primary/10 focus:border-primary focus:ring-4 focus:ring-primary/10'
                }`}
                placeholder="ABC-12"
                value={manualCode}
                onChange={(e) => onCodeChange(e.target.value)}
                maxLength={8}
                disabled={!!groupId}
              />
              {manualCode && !groupId && (
                <button 
                  onClick={() => { setManualCode(''); setManualGroup(null); setError(''); }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-2 bg-slate-100 dark:bg-white/10 rounded-full text-slate-400"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {searching && (
            <div className="flex items-center justify-center gap-3 py-4 animate-pulse">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Scanning records...</span>
            </div>
          )}

          {error && (
            <div className="p-5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[24px] flex items-center gap-4 text-red-500 animate-in zoom-in-95 duration-200">
              <Info size={20} strokeWidth={3} />
              <p className="text-xs font-black uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}

          {/* Group Preview Card */}
          {groupToShow && (
            <div className="bg-white dark:bg-slate-800 rounded-[40px] overflow-hidden shadow-2xl border-2 border-primary/20 animate-in slide-in-from-bottom duration-500">
              <div className="h-40 relative">
                <img 
                  src={groupToShow.imageUrl || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800'} 
                  className="w-full h-full object-cover" 
                  alt={groupToShow.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                   <div className="size-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Tribe Found</span>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{groupToShow.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mt-2 leading-relaxed">
                    {groupToShow.description}
                  </p>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl text-slate-400">
                      <Users size={16} />
                    </div>
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                      {groupToShow.members.length} Members
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/5 rounded-xl text-primary">
                      <Trophy size={16} />
                    </div>
                    <span className="text-xs font-black text-primary uppercase tracking-widest">
                      Active Circle
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="p-6 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-primary/5 sticky bottom-0">
        <button
          onClick={handleJoin}
          disabled={!groupToShow || joinMutation.isPending}
          className="w-full h-20 bg-primary text-white rounded-[32px] font-black text-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale group"
        >
          {joinMutation.isPending ? (
            <>
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Joining Tribe...</span>
            </>
          ) : (
            <>
              <span>{groupToShow ? `Join ${groupToShow.name}` : 'Awaiting Tribe Code'}</span>
              <Rocket size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default JoinGroupScreen;
