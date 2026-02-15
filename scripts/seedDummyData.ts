
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp, 
  Timestamp, 
  addDoc
} from 'firebase/firestore';
import { seedExercises } from './seedCatalogExercises';

export const seedDummyData = async (currentUserId: string) => {
  console.log('🚀 Starting Full Tiizi Seeding Operation...');
  
  // 1. Ensure exercise catalog is seeded
  await seedExercises();

  // 2. Create mock users
  const mockUsers = [
    {
      uid: 'user_mike_123',
      displayName: 'Mike',
      fullName: 'Mike Ross',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      stats: { xp: 2450, level: 12, coins: 450, totalLogs: 42, streak: 5 },
      interests: ['Weightlifting', 'HIIT'],
      onboardingCompleted: true
    },
    {
      uid: 'user_sarah_456',
      displayName: 'Sarah',
      fullName: 'Sarah Jenkins',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      stats: { xp: 1800, level: 8, coins: 200, totalLogs: 28, streak: 14 },
      interests: ['Yoga', 'Running'],
      onboardingCompleted: true
    },
    {
      uid: 'user_elena_789',
      displayName: 'Elena',
      fullName: 'Elena Gilbert',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
      stats: { xp: 3200, level: 15, coins: 600, totalLogs: 55, streak: 21 },
      interests: ['Cardio', 'Mobility'],
      onboardingCompleted: true
    }
  ];

  for (const u of mockUsers) {
    await setDoc(doc(db, 'users', u.uid), {
      ...u,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
    });
  }

  // 3. Create Groups (Tribes)
  const groups = [
    {
      id: 'early_birds_kenya',
      name: 'Early Birds Kenya',
      description: 'The sunrise squad. We meet at Karura Forest and online every morning at 5:30 AM.',
      imageUrl: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&q=80&w=800',
      createdBy: 'user_sarah_456',
      members: [currentUserId, 'user_mike_123', 'user_sarah_456', 'user_elena_789'],
      admins: ['user_sarah_456'],
      inviteCode: 'BIRDS25',
      status: 'active',
      rules: { visibility: 'invite-only', allowMemberChallenges: true, requireChallengeApproval: false }
    },
    {
      id: 'group_iron_elite',
      name: 'Iron Elite',
      description: 'The premier destination for heavy lifters and high-intensity enthusiasts.',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
      createdBy: 'user_mike_123',
      members: [currentUserId, 'user_mike_123'],
      admins: ['user_mike_123'],
      inviteCode: 'IRON99',
      status: 'active',
      rules: { visibility: 'invite-only', allowMemberChallenges: true, requireChallengeApproval: false }
    },
    {
      id: 'mindful_kilimani',
      name: 'Mindful Kilimani',
      description: 'Mental health and light physical activity in the heart of Kilimani.',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
      createdBy: 'user_elena_789',
      members: ['user_elena_789', 'user_sarah_456'],
      admins: ['user_elena_789'],
      inviteCode: 'ZEN2024',
      status: 'active',
      rules: { visibility: 'invite-only', allowMemberChallenges: true, requireChallengeApproval: false }
    }
  ];

  for (const g of groups) {
    await setDoc(doc(db, 'groups', g.id), {
      ...g,
      createdAt: serverTimestamp(),
      lastActivityAt: serverTimestamp(),
    });
  }

  // 4. Create Challenges
  const now = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(now.getDate() + 30);

  const challenges = [
    {
      id: 'challenge_birds_steps',
      groupId: 'early_birds_kenya',
      title: 'Sunrise Step Master',
      description: 'Hit 10k steps before 9 AM. Let\'s win the morning!',
      type: 'DAILY',
      status: 'active',
      startDate: Timestamp.fromDate(now),
      endDate: Timestamp.fromDate(thirtyDaysLater),
      activities: [{
        exerciseId: 'walking',
        exerciseName: 'Walking',
        category: 'Cardio',
        metricUnit: 'steps',
        targetValue: 10000,
        order: 0
      }],
      participants: [currentUserId, 'user_mike_123', 'user_sarah_456', 'user_elena_789'],
      challengeAdmins: ['user_sarah_456'],
      createdBy: 'user_sarah_456'
    }
  ];

  for (const c of challenges) {
    await setDoc(doc(db, 'challenges', c.id), {
      ...c,
      createdAt: serverTimestamp(),
    });
  }

  // 5. Create Sample Logs for Leaderboard Testing
  const logs = [
    // Sarah (Rank 1)
    {
      challengeId: 'challenge_birds_steps',
      uid: 'user_sarah_456',
      entries: [{ exerciseId: 'walking', metricUnit: 'steps', value: 12500 }]
    },
    // Elena (Rank 2)
    {
      challengeId: 'challenge_birds_steps',
      uid: 'user_elena_789',
      entries: [{ exerciseId: 'walking', metricUnit: 'steps', value: 10200 }]
    },
    // Mike (Rank 3)
    {
      challengeId: 'challenge_birds_steps',
      uid: 'user_mike_123',
      entries: [{ exerciseId: 'walking', metricUnit: 'steps', value: 9800 }]
    },
    // Current User (Rank 4)
    {
      challengeId: 'challenge_birds_steps',
      uid: currentUserId,
      entries: [{ exerciseId: 'walking', metricUnit: 'steps', value: 4500 }]
    }
  ];

  for (const l of logs) {
    await addDoc(collection(db, `challenges/${l.challengeId}/logs`), {
      ...l,
      createdAt: serverTimestamp(),
    });
  }

  // 6. Create Feed Posts
  const posts = [
    {
      groupId: 'early_birds_kenya',
      authorId: 'user_sarah_456',
      authorName: 'Sarah Jenkins',
      authorPhotoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      content: 'Early Birds! The sun is up and I just cleared 12k steps. Who is with me? 🌅',
      type: 'text',
      reactions: { '❤️': [currentUserId, 'user_mike_123'] },
      createdAt: serverTimestamp()
    }
  ];

  for (const p of posts) {
    await addDoc(collection(db, 'posts'), p);
  }

  console.log('✅ Seeding Complete! live data migrated.');
  return true;
};
