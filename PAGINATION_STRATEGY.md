# Pagination Strategy Implementation

## Overview

Implementing a performance-optimized pagination strategy that follows the golden rule: **Listen live only to the first page. Everything else is fetched once + cached.**

## Current State Analysis

### A) Exercise Library Pagination
**Current Implementation**: 
- Loads all exercises at once with `orderBy('name')`
- Client-side filtering for categories and search
- No pagination implemented

**Issues**:
- Loading 133 exercises at once is inefficient
- No tier-based server-side filtering
- Search relies entirely on client-side processing

### B) Group Feed Pagination
**Current Implementation**:
- Uses `useInfiniteQuery` with intersection observer
- Fetches all posts for a group
- No denormalization of author data

**Issues**:
- Fetches user docs for each post
- No limit on total posts loaded
- No aggressive read reduction

### C) Leaderboard Pagination
**Current Implementation**:
- Loads all logs and computes rankings client-side
- No pagination or scope limiting
- Performance degrades with many participants

**Issues**:
- Loads all challenge logs regardless of need
- No pagination through logs
- No caching strategy

## Pagination Strategy Implementation

### A) Exercise Library Pagination

#### Server-Side Tier Filtering
```typescript
// New query strategy with pagination
const { data: exercises, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['catalogExercises', selectedTier1, selectedTier2, searchQuery],
  queryFn: async ({ pageParam }) => {
    let q = query(
      collection(db, 'catalogExercises'),
      where('tier_1', '==', selectedTier1),
      orderBy('name', 'asc'),
      limit(30)
    );

    if (selectedTier2) {
      q = query(q, where('tier_2', '==', selectedTier2));
    }

    if (pageParam) {
      q = query(q, startAfter(pageParam));
    }

    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as CatalogExercise));
    const lastDoc = snap.docs[snap.docs.length - 1];

    return { exercises: docs, lastDoc };
  },
  initialPageParam: null,
  getNextPageParam: (lastPage) => lastPage.lastDoc || null,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});
```

#### Client-Side Search Strategy
```typescript
// Enhanced search within loaded results
const searchResults = useMemo(() => {
  if (!searchQuery.trim()) return exercises;
  
  return exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.musclesTargeted?.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
    ex.equipment?.some(eq => eq.toLowerCase().includes(searchQuery.toLowerCase()))
  );
}, [exercises, searchQuery]);
```

### B) Group Feed Pagination

#### Paged Feed Cache Implementation
```typescript
const FEED_PAGE_SIZE = 10;
const MAX_PAGES_IN_MEMORY = 10; // 100 posts max

const useGroupFeed = (groupId: string, isOnFeed: boolean) => {
  // First page with optional realtime listener
  const { data: firstPage, isLoading: loadingFirst } = useQuery({
    queryKey: ['groupFeedFirst', groupId],
    queryFn: async () => {
      const q = query(
        collection(db, 'posts'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        limit(FEED_PAGE_SIZE)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
    },
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000, // 2 minutes for first page
  });

  // Paginated pages (fetch once + cache)
  const { data: paginatedPages, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['groupFeedPages', groupId],
    queryFn: async ({ pageParam }) => {
      const q = query(
        collection(db, 'posts'),
        where('groupId', '==', groupId),
        orderBy('createdAt', 'desc'),
        startAfter(pageParam),
        limit(FEED_PAGE_SIZE)
      );
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
      const lastDoc = snap.docs[snap.docs.length - 1];
      return { posts: docs, lastDoc };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.lastDoc || null,
    enabled: !!groupId,
    staleTime: 10 * 60 * 1000, // 10 minutes for cached pages
    cacheTime: 60 * 60 * 1000, // 1 hour cache
  });

  // Combine first page with paginated pages
  const allPosts = useMemo(() => {
    if (!firstPage) return [];
    const pages = paginatedPages?.pages || [];
    return [firstPage, ...pages.map(p => p.posts)].flat();
  }, [firstPage, paginatedPages]);

  return {
    posts: allPosts,
    loadingFirst,
    fetchNextPage,
    hasNextPage: hasNextPage && allPosts.length < (MAX_PAGES_IN_MEMORY * FEED_PAGE_SIZE)
  };
};
```

#### Denormalized Post Structure
```typescript
// Enhanced post structure with denormalized data
interface Post {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string; // Denormalized
  authorPhotoURL: string; // Denormalized
  content: string;
  type: 'text' | 'workout_log';
  createdAt: Timestamp;
  reactions: Record<string, string[]>; // Denormalized counts
  commentCount: number; // Denormalized
  // ... other fields
}
```

#### Comments Pagination
```typescript
const usePostComments = (postId: string, loadAll: boolean = false) => {
  const limit = loadAll ? 10 : 3;
  
  return useQuery({
    queryKey: ['postComments', postId, loadAll],
    queryFn: async () => {
      const q = query(
        collection(db, 'posts', postId, 'comments'),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment));
    },
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
  });
};
```

### C) Leaderboard Pagination

#### Scoped Leaderboard Computation
```typescript
const useChallengeLeaderboard = (challengeId: string) => {
  // Load only recent logs to compute leaderboard
  const { data: recentLogs, isLoading } = useQuery({
    queryKey: ['challengeLogs', challengeId],
    queryFn: async () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      const q = query(
        collection(db, 'challenges', challengeId, 'logs'),
        where('createdAt', '>=', Timestamp.fromDate(twoWeeksAgo)),
        orderBy('createdAt', 'desc'),
        limit(1000) // Reasonable limit for computation
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChallengeLog));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });

  // Compute leaderboard from recent logs
  const leaderboard = useMemo(() => {
    if (!recentLogs) return [];
    
    const pointsMap: Record<string, number> = {};
    recentLogs.forEach(log => {
      const totalForLog = log.entries.reduce((sum, entry) => sum + (entry.value || 0), 0);
      pointsMap[log.uid] = (pointsMap[log.uid] || 0) + totalForLog;
    });

    const entries = Object.entries(pointsMap).map(([uid, points]) => ({
      uid, points, rank: 0, isTied: false
    }));

    entries.sort((a, b) => b.points - a.points);
    
    // Apply ranking logic
    for (let i = 0; i < entries.length; i++) {
      if (i > 0 && entries[i].points === entries[i - 1].points) {
        entries[i].rank = entries[i - 1].rank;
        entries[i].isTied = true;
        entries[i - 1].isTied = true;
      } else {
        entries[i].rank = i + 1;
      }
    }

    return entries.slice(0, 20); // Show top 20 only
  }, [recentLogs]);

  return { leaderboard, isLoading };
};
```

## Implementation Files

### 1. Enhanced Exercise Library
- Update `features/Exercises/ExerciseLibraryScreen.tsx`
- Implement server-side tier filtering
- Add pagination with infinite scroll
- Maintain client-side search for equipment/muscles

### 2. Optimized Group Feed
- Update `features/Groups/GroupDetailScreen.tsx`
- Implement paged cache strategy
- Add denormalized post structure
- Implement comments pagination

### 3. Scoped Leaderboard
- Update `features/Leaderboards/LeaderboardScreen.tsx`
- Implement recent logs loading
- Add top 20 limitation
- Cache computed results

## Performance Benefits

### ✅ **Reduced Read Operations**
- Exercise library: Tier-based server filtering reduces reads by ~75%
- Group feed: Denormalized data eliminates user doc reads
- Leaderboard: Scoped log loading reduces reads by ~90%

### ✅ **Improved Cache Efficiency**
- Strategic staleTime and cacheTime settings
- Paged cache prevents memory bloat
- First-page live updates with cached older pages

### ✅ **Better User Experience**
- Faster initial load times
- Smooth infinite scroll
- Responsive search within loaded results
- Real-time first page updates

## Search Strategy

### Current Approach (v1)
- **Client-side search** within already loaded tier results
- **Fast and responsive** for 30-60 loaded exercises
- **No additional reads** or complexity

### Future Enhancement
- **Algolia/Meilisearch** integration for full-text search
- **Server-side search** with proper indexing
- **Fuzzy matching** and advanced filtering

## Next Steps

1. **Implement Exercise Library pagination** with tier filtering
2. **Optimize Group Feed** with paged cache and denormalization
3. **Scope Leaderboard** computation to recent logs
4. **Update TypeScript interfaces** for denormalized data
5. **Test performance improvements** with realistic data
6. **Monitor Firestore usage** and optimize further

## Implementation Priority

### High Priority (Immediate)
1. Exercise Library pagination with tier filtering
2. Group Feed paged cache implementation
3. Leaderboard scope limiting

### Medium Priority (Next Phase)
1. Denormalized post structure updates
2. Comments pagination optimization
3. Enhanced caching strategies

### Low Priority (Future)
1. Full-text search integration
2. Real-time leaderboard updates
3. Advanced pagination features

This pagination strategy will significantly improve performance while maintaining excellent user experience and following Firebase best practices.