import React, { useState, useEffect } from 'react';
// Fix: Use @firebase/firestore for named exports to resolve build errors
import { collection, query, orderBy, limit, onSnapshot, getDocs, startAfter } from '@firebase/firestore';
import { db } from '../../lib/firebase';
import { UserDoc, Post } from '../../types';
import { MessageSquare, Heart, Share2, MoreHorizontal, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeedScreenProps {
  user: UserDoc | null;
}

const FeedScreen: React.FC<FeedScreenProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Real-time listener for the first page
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetchedPosts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(fetchedPosts);
      setLastDoc(snap.docs[snap.docs.length - 1]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(10));
    const snap = await getDocs(q);
    const morePosts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    setPosts(prev => [...prev, ...morePosts]);
    setLastDoc(snap.docs[snap.docs.length - 1]);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-[32px] p-6 h-64 animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 pb-20 space-y-6">
      <div className="space-y-1">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-widest">Community</h2>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Activity</h1>
      </div>

      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
            <p>No activity yet. Start a challenge to see posts!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-[#2d1e14] rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-white/5 space-y-4">
              {/* Post Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden ring-2 ring-slate-50 dark:ring-white/5">
                    <img src={post.authorPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`} alt="" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">{post.authorName}</h4>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-slate-400"><MoreHorizontal size={20} /></button>
              </div>

              {/* Post Content */}
              <div className="space-y-3">
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{post.content}</p>
                
                {/* Achievement logic would go here if defined in data model */}
              </div>

              {/* Post Actions */}
              <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-slate-500 group">
                    <div className="p-2 rounded-full group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                      <Heart size={20} />
                    </div>
                    <span className="text-sm font-bold">
                      {Object.values(post.reactions || {}).flat().length}
                    </span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 group">
                    <div className="p-2 rounded-full group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <MessageSquare size={20} />
                    </div>
                    <span className="text-sm font-bold">0</span>
                  </button>
                </div>
                <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}

        {lastDoc && (
          <button 
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full py-4 text-slate-500 font-bold hover:text-primary transition-colors disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load older posts'}
          </button>
        )}
      </div>
    </div>
  );
};

export default FeedScreen;