import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  arrayUnion, 
  orderBy, 
  limit, 
  startAfter,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { GroupDoc, ChallengeDoc, UserDoc, Post } from '../../types';
import { 
  Share2, 
  Settings, 
  Trophy, 
  Users, 
  MessageSquare, 
  Heart, 
  MoreHorizontal, 
  Activity,
  Send,
  Plus,
  ChevronLeft,
  AlertCircle,
  Lock,
  ChevronRight,
  Flame,
  UserPlus,
  Crown,
  Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GroupDetailScreenProps {
  user: UserDoc | null;
}

const GroupDetailScreen: React.FC<GroupDetailScreenProps> = ({ user }) => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'members' | 'leaderboard'>('feed');
  const [newPostContent, setNewPostContent] = useState('');
  
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch Group Data
  const { data: group, isLoading: loadingGroup, isError: groupError } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      if (!groupId) return null;
      const snap = await getDoc(doc(db, 'groups', groupId));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() } as GroupDoc;
    },
    enabled: !!groupId,
  });

  const isMember = user && group?.members?.includes(user.uid);

  // Fetch Member Details (for Members tab and leaderboard)
  const { data: memberDocs, isLoading: loadingMembers } = useQuery({
    queryKey: ['groupMembers', group?.members],
    queryFn: async () => {
      if (!group?.members || group.members.length === 0) return [];
      const uids = group.members.slice(0, 30); // Limit to top 30 for this view
      const q = query(collection(db, 'users'), where('uid', 'in', uids));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => d.data() as UserDoc);
      // Sort by XP for leaderboard
      return docs.sort((a, b) => (b.stats?.xp || 0) - (a.stats?.xp || 0));
    },
    enabled: !!group?.members && (activeTab === 'members' || activeTab === 'leaderboard'),
  });

  // Fetch Group Challenges
  const { data: challenges, isLoading: loadingChallenges } = useQuery({
    queryKey: ['groupChallenges', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const q = query(collection(db, 'challenges'), where('groupId', '==', groupId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChallengeDoc));
    },
    enabled: !!groupId && activeTab === 'challenges',
  });

  // Join Mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!user || !groupId) return;
      const groupRef = doc(db, 'groups', groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(user.uid)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['myGroups', user?.uid] });
    }
  });

  // Infinite Query for Group Feed
  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingFeed
  } = useInfiniteQuery({
    queryKey: ['groupFeed', groupId],
    queryFn: async ({ pageParam }) => {
      if (!groupId || !isMember) return { posts: [], lastDoc: null };
      let q = query(
        collection(db, 'posts'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      if (pageParam) {
        q = query(q, startAfter(pageParam));
      }

      const snap = await getDocs(q);
      const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
      const lastDoc = snap.docs[snap.docs.length - 1];

      return { posts, lastDoc };
    },
    initialPageParam: null as any,
    getNextPageParam: (lastPage) => lastPage.lastDoc || null,
    enabled: !!groupId && activeTab === 'feed' && !!group && isMember,
  });

  // Intersection Observer for pagination
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const postMutation = useMutation({
    mutationFn: async () => {
      if (!user || !groupId || !newPostContent.trim()) return;
      await addDoc(collection(db, 'posts'), {
        groupId,
        authorId: user.uid,
        authorName: user.displayName || 'Athlete',
        authorPhotoURL: user.photoURL || '',
        content: newPostContent,
        type: 'text',
        createdAt: serverTimestamp(),
        reactions: { '❤️': [] }
      });
    },
    onSuccess: () => {
      setNewPostContent('');
      queryClient.invalidateQueries({ queryKey: ['groupFeed', groupId] });
    }
  });

  if (loadingGroup) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">Syncing Tribe...</p>
    </div>
  );

  if (!group || groupError) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-8 text-center">
      <div className="size-24 bg-red-50 dark:bg-red-900/10 rounded-[32px] flex items-center justify-center text-red-500 mb-8 shadow-inner">
        <AlertCircle size={48} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Tribe Not Found</h2>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-xs mb-10 leading-relaxed">
        This group might have been removed or you may have entered an invalid URL.
      </p>
      <button onClick={() => navigate('/groups')} className="w-full max-w-xs h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
        Return to Groups
      </button>
    </div>
  );

  const posts = feedData?.pages.flatMap(page => page.posts) || [];

  return (
    <div className="pb-32 min-h-screen bg-background-light dark:bg-background-dark font-display">
      {/* Navbar */}
      <div className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-[#ead9cd] dark:border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/groups')} className="size-10 flex items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
            <ChevronLeft className="text-slate-900 dark:text-white" size={24} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-base font-black text-slate-900 dark:text-white truncate max-w-[180px] leading-tight tracking-tight">{group.name}</h2>
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{group.members.length} Members</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button className="size-10 flex items-center justify-center hover:bg-primary/10 rounded-full transition-colors text-slate-700 dark:text-slate-300">
            <Share2 size={20} />
          </button>
          <button className="size-10 flex items-center justify-center hover:bg-primary/10 rounded-full transition-colors text-slate-700 dark:text-slate-300">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col items-center px-6 pt-12 pb-10 text-center bg-white dark:bg-[#2d1f15] border-b border-[#ead9cd] dark:border-white/5 space-y-10">
        <div className="relative group">
          <div className="w-40 h-40 rounded-[56px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 rotate-2 bg-slate-100 dark:bg-slate-700 group-hover:rotate-0 transition-all duration-700">
            <img 
              src={group.imageUrl || 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800'} 
              className="w-full h-full object-cover scale-110" 
              alt={group.name} 
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary text-white w-12 h-12 rounded-[20px] flex items-center justify-center shadow-2xl border-4 border-white dark:border-[#2d1f15]">
             <span className="material-symbols-outlined !text-2xl font-black">verified</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{group.name}</h1>
          <p className="text-sm font-medium text-[#a16b45] max-w-sm mx-auto leading-relaxed">{group.description}</p>
        </div>

        <div className="w-full max-w-sm">
          {!isMember ? (
            <button 
              onClick={() => joinMutation.mutate()}
              disabled={joinMutation.isPending}
              className="w-full h-20 bg-primary text-white rounded-[32px] font-black text-xl shadow-2xl shadow-primary/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {joinMutation.isPending ? 'Joining...' : 'Join Tribe'}
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => navigate(`/create-challenge/${groupId}`)}
                className="flex-1 h-16 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Plus size={18} strokeWidth={3} />
                Challenge
              </button>
              <button className="size-16 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-slate-400">
                <UserPlus size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[64px] z-40 bg-white/95 dark:bg-[#2d1f15]/95 backdrop-blur-md border-b border-[#ead9cd] dark:border-white/5 shadow-sm">
        <div className="flex px-4 overflow-x-auto no-scrollbar">
          {(['feed', 'challenges', 'members', 'leaderboard'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-[100px] py-6 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative ${activeTab === tab ? 'text-primary' : 'text-[#a16b45] opacity-50'}`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-6 right-6 h-1 bg-primary rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'feed' && (
          <div className="space-y-8">
            {isMember ? (
              <>
                <div className="bg-white dark:bg-[#2d1f15] rounded-[40px] p-8 shadow-sm border border-slate-100 dark:border-white/5 space-y-6 animate-in slide-in-from-top duration-500">
                  <div className="flex items-center gap-4">
                    <div className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
                      <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} alt="" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Share a win with your tribe..."
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 ring-primary/20 outline-none text-slate-800 dark:text-white"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && postMutation.mutate()}
                    />
                    <button 
                      onClick={() => postMutation.mutate()}
                      disabled={postMutation.isPending || !newPostContent.trim()}
                      className="size-14 bg-primary text-white rounded-[20px] flex items-center justify-center shadow-2xl shadow-primary/20 active:scale-90 transition-transform disabled:opacity-50"
                    >
                      <Send size={20} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                {loadingFeed ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-44 w-full bg-white dark:bg-[#2d1f15] rounded-[40px] animate-pulse border border-slate-100 dark:border-white/5" />)}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-24 text-slate-400 space-y-6 animate-in fade-in duration-700">
                    <div className="size-28 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-40 shadow-inner">
                      <MessageSquare size={48} className="text-[#a16b45]" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-black text-lg text-slate-800 dark:text-white uppercase tracking-tight">The quiet before the storm</p>
                      <p className="text-xs font-medium text-[#a16b45] max-w-[240px] mx-auto leading-relaxed">No battle reports yet. Be the first to claim victory!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {posts.map(post => (
                       <div key={post.id} className="bg-white dark:bg-[#2d1f15] rounded-[48px] p-8 shadow-sm border border-slate-100 dark:border-white/5 space-y-6 animate-in fade-in duration-500">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-[20px] overflow-hidden border border-slate-200 dark:border-white/10 transition-transform">
                              <img src={post.authorPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`} alt="" />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 dark:text-white tracking-tight leading-none text-lg">{post.authorName}</h4>
                              <p className="text-[10px] font-black text-[#a16b45] uppercase tracking-widest mt-2">
                                {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                              </p>
                            </div>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-base">{post.content}</p>
                          <div className="pt-6 border-t border-slate-50 dark:border-white/5 flex items-center gap-8">
                             <button className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors">
                               <Heart size={20} />
                               <span className="text-xs font-black">{Object.values(post.reactions || {}).flat().length}</span>
                             </button>
                             <button className="flex items-center gap-2 text-slate-400">
                               <MessageSquare size={20} />
                               <span className="text-xs font-black">0</span>
                             </button>
                          </div>
                       </div>
                    ))}
                    <div ref={loadMoreRef} className="h-4" />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-[#2d1f15] rounded-[48px] border-2 border-dashed border-[#ead9cd] dark:border-white/10 p-10 space-y-8">
                <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Lock size={44} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Restricted Feed</h3>
                  <p className="text-sm font-medium text-[#a16b45] leading-relaxed max-w-xs mx-auto">
                    The tribe feed is reserved for members. Join this circle to see battle reports and motivate your teammates!
                  </p>
                </div>
                <button 
                  onClick={() => joinMutation.mutate()}
                  className="w-full h-18 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                >
                  Join Now to Unlock
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end px-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Battles</h3>
              <span className="text-primary text-[10px] font-black uppercase tracking-widest">{challenges?.length || 0} Total</span>
            </div>
            {loadingChallenges ? (
               <div className="space-y-4">
                 {[1, 2].map(i => <div key={i} className="h-40 bg-white dark:bg-white/5 rounded-3xl animate-pulse" />)}
               </div>
            ) : !challenges || challenges.length === 0 ? (
               <div className="py-20 text-center space-y-4 bg-white dark:bg-[#2d1f15] rounded-[48px] border-2 border-dashed border-[#ead9cd] dark:border-white/10">
                 <Trophy size={48} className="mx-auto text-slate-200" />
                 <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No challenges active</p>
               </div>
            ) : (
              <div className="space-y-4">
                {challenges.map(challenge => (
                  <div 
                    key={challenge.id}
                    onClick={() => navigate(`/leaderboard/${challenge.id}`)}
                    className="bg-white dark:bg-[#2d1f15] rounded-[40px] p-6 shadow-sm border border-slate-100 dark:border-white/5 flex gap-5 active:scale-[0.98] transition-all cursor-pointer group"
                  >
                    <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors overflow-hidden shrink-0">
                      {challenge.coverImageUrl ? (
                        <img src={challenge.coverImageUrl} className="size-full object-cover" alt="" />
                      ) : (
                        <Flame size={32} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="font-black text-slate-900 dark:text-white truncate uppercase tracking-tight text-lg leading-tight">{challenge.title}</h4>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1.5 flex items-center gap-2">
                        {challenge.type} • {challenge.participants?.length || 0} Joined
                      </p>
                    </div>
                    <div className="flex items-center">
                      <ChevronRight size={24} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end px-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">The Tribe</h3>
              <span className="text-primary text-[10px] font-black uppercase tracking-widest">{group.members.length} Members</span>
            </div>
            <div className="bg-white dark:bg-[#2d1f15] rounded-[48px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
              {loadingMembers ? (
                <div className="p-10 text-center animate-pulse text-slate-400">Loading members...</div>
              ) : (
                memberDocs?.map((member, i) => (
                  <div key={member.uid} className={`flex items-center gap-4 p-6 ${i !== memberDocs.length - 1 ? 'border-b border-slate-50 dark:border-white/5' : ''}`}>
                    <div className="size-14 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 shrink-0">
                      <img src={member.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.uid}`} alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-900 dark:text-white tracking-tight uppercase text-sm truncate">{member.fullName || member.displayName}</h4>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-0.5">Lv. {member.stats?.level || 1} • {member.stats?.xp || 0} XP</p>
                    </div>
                    {group.admins.includes(member.uid) && (
                      <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/20">Admin</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end px-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Hall of Fame</h3>
              <span className="text-primary text-[10px] font-black uppercase tracking-widest">Global XP</span>
            </div>
            
            {/* Top 3 Podium */}
            {memberDocs && memberDocs.length > 0 ? (
              <>
                <div className="flex items-end justify-center gap-2 pt-10 pb-8 px-2">
                  {memberDocs[1] && (
                    <div className="flex flex-col items-center flex-1 space-y-4 animate-in slide-in-from-bottom duration-500 delay-100">
                      <div className="size-20 rounded-3xl border-4 border-slate-200 overflow-hidden relative shadow-xl bg-slate-50">
                        <img src={memberDocs[1].photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberDocs[1].uid}`} className="size-full object-cover" alt="" />
                        <div className="absolute inset-0 flex items-end justify-center pb-1">
                          <span className="bg-slate-400 text-white text-[9px] font-black px-2 rounded-full border border-white">2nd</span>
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase truncate w-full text-center px-2">{memberDocs[1].displayName}</p>
                    </div>
                  )}
                  {memberDocs[0] && (
                    <div className="flex flex-col items-center flex-1 space-y-4 -translate-y-4 animate-in slide-in-from-bottom duration-700">
                      <div className="size-28 bg-primary p-1 rounded-[40px] shadow-2xl shadow-primary/30 relative">
                        <div className="size-full rounded-[36px] overflow-hidden border-4 border-white bg-slate-100">
                          <img src={memberDocs[0].photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberDocs[0].uid}`} className="size-full object-cover" alt="" />
                        </div>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-primary">
                          <Crown className="size-8 fill-primary" />
                        </div>
                      </div>
                      <p className="text-[12px] font-black text-primary uppercase tracking-widest truncate w-full text-center px-2">{memberDocs[0].displayName}</p>
                    </div>
                  )}
                  {memberDocs[2] && (
                    <div className="flex flex-col items-center flex-1 space-y-4 animate-in slide-in-from-bottom duration-500 delay-200">
                      <div className="size-20 rounded-3xl border-4 border-orange-200 overflow-hidden relative shadow-xl bg-orange-50">
                        <img src={memberDocs[2].photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberDocs[2].uid}`} className="size-full object-cover" alt="" />
                        <div className="absolute inset-0 flex items-end justify-center pb-1">
                          <span className="bg-orange-400 text-white text-[9px] font-black px-2 rounded-full border border-white">3rd</span>
                        </div>
                      </div>
                      <p className="text-[10px] font-black text-[#a16b45] uppercase truncate w-full text-center px-2">{memberDocs[2].displayName}</p>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-[#2d1f15] rounded-[48px] overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm">
                  {memberDocs.slice(3).map((member, i) => (
                    <div key={member.uid} className={`flex items-center gap-4 p-5 ${i !== memberDocs.length - 4 ? 'border-b border-slate-50 dark:border-white/5' : ''}`}>
                      <span className="w-8 text-xs font-black text-slate-300">#{i + 4}</span>
                      <div className="size-12 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                        <img src={member.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.uid}`} alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block font-black text-slate-800 dark:text-white uppercase text-sm tracking-tight truncate">{member.fullName || member.displayName}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Level {member.stats?.level || 1}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-primary text-sm">{(member.stats?.xp || 0).toLocaleString()}</span>
                        <span className="block text-[8px] font-black text-[#a16b45] uppercase tracking-widest">XP Points</span>
                      </div>
                    </div>
                  ))}
                  {memberDocs.length <= 3 && (
                    <div className="p-8 text-center text-slate-400 font-bold uppercase text-[10px]">End of Rankings</div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-20 text-center bg-white dark:bg-[#2d1f15] rounded-[48px] border-2 border-dashed border-[#ead9cd] dark:border-white/10">
                <Star size={48} className="mx-auto text-slate-200" />
                <p className="mt-4 text-slate-400 font-bold uppercase text-xs tracking-widest">No rankings yet</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default GroupDetailScreen;