import { db } from '../src/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Dummy data for testing
const dummyUsers = [
  {
    uid: 'user_001',
    displayName: 'Sarah Fitness',
    fullName: 'Sarah Johnson',
    email: 'sarah@example.com',
    birthday: '1990-05-15',
    weight: 65,
    height: 168,
    interests: ['Running', 'Yoga', 'HIIT'],
    goals: ['weight-loss', 'mental-health'],
    stats: { xp: 1250, level: 3, coins: 50, totalLogs: 15, streak: 7 },
    onboardingCompleted: true,
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp()
  },
  {
    uid: 'user_002', 
    displayName: 'Mike Gains',
    fullName: 'Michael Chen',
    email: 'mike@example.com',
    birthday: '1988-09-22',
    weight: 80,
    height: 180,
    interests: ['Weightlifting', 'Running', 'Cycling'],
    goals: ['build-muscle', 'accountability'],
    stats: { xp: 2100, level: 4, coins: 75, totalLogs: 25, streak: 12 },
    onboardingCompleted: true,
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp()
  },
  {
    uid: 'user_003',
    displayName: 'Emma Yoga',
    fullName: 'Emma Rodriguez',
    email: 'emma@example.com',
    birthday: '1992-03-08',
    weight: 58,
    height: 165,
    interests: ['Yoga', 'Pilates', 'Swimming'],
    goals: ['flexibility', 'mental-health'],
    stats: { xp: 800, level: 2, coins: 25, totalLogs: 8, streak: 3 },
    onboardingCompleted: true,
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp()
  },
  {
    uid: 'user_004',
    displayName: 'Alex Cardio',
    fullName: 'Alex Thompson',
    email: 'alex@example.com',
    birthday: '1985-11-30',
    weight: 75,
    height: 175,
    interests: ['Running', 'Cycling', 'HIIT'],
    goals: ['weight-loss', 'accountability'],
    stats: { xp: 1800, level: 3, coins: 60, totalLogs: 20, streak: 10 },
    onboardingCompleted: true,
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp()
  },
  {
    uid: 'user_005',
    displayName: 'Chris Strength',
    fullName: 'Chris Wilson',
    email: 'chris@example.com',
    birthday: '1995-07-14',
    weight: 85,
    height: 185,
    interests: ['Weightlifting', 'Hiking'],
    goals: ['build-muscle', 'weight-loss'],
    stats: { xp: 1500, level: 3, coins: 40, totalLogs: 12, streak: 5 },
    onboardingCompleted: true,
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp()
  }
];

const dummyGroups = [
  {
    name: 'Morning Runners Club',
    description: 'Early morning runs to start the day right! We meet every weekday at 6 AM.',
    privacy: 'public',
    memberCount: 15,
    members: ['user_001', 'user_002', 'user_004', 'user_005'],
    admins: ['user_001', 'user_002'],
    createdAt: serverTimestamp(),
    createdBy: 'user_001'
  },
  {
    name: 'Yoga & Mindfulness',
    description: 'Find your zen with weekly yoga sessions and mindfulness practices.',
    privacy: 'private',
    memberCount: 8,
    members: ['user_001', 'user_003', 'user_005'],
    admins: ['user_003'],
    createdAt: serverTimestamp(),
    createdBy: 'user_003'
  },
  {
    name: 'Gym Buddies',
    description: 'Lift together, grow together. All fitness levels welcome!',
    privacy: 'public',
    memberCount: 25,
    members: ['user_002', 'user_004', 'user_005'],
    admins: ['user_002'],
    createdAt: serverTimestamp(),
    createdBy: 'user_002'
  },
  {
    name: 'Weight Loss Warriors',
    description: 'Support group for those on their weight loss journey. Accountability and motivation!',
    privacy: 'private',
    memberCount: 12,
    members: ['user_001', 'user_003', 'user_004'],
    admins: ['user_001'],
    createdAt: serverTimestamp(),
    createdBy: 'user_001'
  }
];

const dummyChallenges = [
  {
    name: '30-Day Running Challenge',
    description: 'Run 5K every day for 30 days. Track your progress and earn rewards!',
    groupId: 'group_001', // Morning Runners Club
    activityType: 'running',
    targetValue: 150, // 30 days * 5K
    currentValue: 75,
    unit: 'km',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    participants: ['user_001', 'user_002', 'user_004'],
    progress: {
      'user_001': 25,
      'user_002': 30,
      'user_004': 20
    },
    createdAt: serverTimestamp(),
    createdBy: 'user_001'
  },
  {
    name: '7-Day Yoga Flow',
    description: 'Complete a 30-minute yoga session every day for a week.',
    groupId: 'group_002', // Yoga & Mindfulness
    activityType: 'yoga',
    targetValue: 210, // 7 days * 30 minutes
    currentValue: 120,
    unit: 'minutes',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-22'),
    participants: ['user_001', 'user_003'],
    progress: {
      'user_001': 90,
      'user_003': 30
    },
    createdAt: serverTimestamp(),
    createdBy: 'user_003'
  },
  {
    name: 'Push-up Progression',
    description: 'Increase your daily push-up count from 10 to 100 over 4 weeks.',
    groupId: 'group_003', // Gym Buddies
    activityType: 'push-ups',
    targetValue: 100,
    currentValue: 45,
    unit: 'reps',
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-02-07'),
    participants: ['user_002', 'user_005'],
    progress: {
      'user_002': 50,
      'user_005': 40
    },
    createdAt: serverTimestamp(),
    createdBy: 'user_002'
  }
];

const dummyPosts = [
  {
    content: 'Just completed my first 10K run! 🎉 Feeling amazing and ready for more challenges.',
    authorId: 'user_001',
    groupId: 'group_001',
    likes: ['user_002', 'user_004'],
    comments: [
      {
        authorId: 'user_002',
        content: 'That\'s awesome! Keep it up!',
        createdAt: new Date()
      }
    ],
    createdAt: serverTimestamp(),
    activityLog: {
      type: 'running',
      value: 10,
      unit: 'km',
      date: new Date('2024-01-15')
    }
  },
  {
    content: 'Struggling with motivation today. Any tips for staying consistent?',
    authorId: 'user_003',
    groupId: 'group_002',
    likes: ['user_001'],
    comments: [
      {
        authorId: 'user_001',
        content: 'Try setting small, achievable goals and celebrating each win!',
        createdAt: new Date()
      }
    ],
    createdAt: serverTimestamp()
  },
  {
    content: 'Hit a new personal best on bench press! 85kg for 8 reps. 💪',
    authorId: 'user_002',
    groupId: 'group_003',
    likes: ['user_005'],
    comments: [
      {
        authorId: 'user_005',
        content: 'That\'s incredible! What\'s your training split?',
        createdAt: new Date()
      }
    ],
    createdAt: serverTimestamp(),
    activityLog: {
      type: 'weightlifting',
      value: 85,
      unit: 'kg',
      date: new Date('2024-01-16')
    }
  }
];

const dummyOnboardingData = {
  exerciseInterests: [
    "Running", "Weightlifting", "Yoga", "HIIT", "Cycling", "Swimming", "Pilates", "Hiking",
    "Dancing", "Boxing", "Rowing", "Skating", "Climbing", "Martial Arts", "CrossFit"
  ],
  wellnessGoals: [
    { id: 'weight-loss', title: 'Weight Loss', desc: 'Focus on calorie deficit and fat burning', icon: 'monitor_weight' },
    { id: 'build-muscle', title: 'Build Muscle', desc: 'Hypertrophy and strength training focus', icon: 'exercise' },
    { id: 'flexibility', title: 'Improve Flexibility', desc: 'Stretching and mobility routine', icon: 'self_improvement' },
    { id: 'mental-health', title: 'Mental Health & Stress Relief', desc: 'Mindful movement and regular activity', icon: 'psychology' },
    { id: 'accountability', title: 'Accountability & Routine', desc: 'Build consistent daily habits', icon: 'group' },
    { id: 'endurance', title: 'Improve Endurance', desc: 'Cardiovascular fitness and stamina', icon: 'run_circle' },
    { id: 'strength', title: 'Increase Strength', desc: 'Functional strength and power', icon: 'fitness_center' },
    { id: 'balance', title: 'Better Balance', desc: 'Core stability and coordination', icon: 'accessibility_new' }
  ]
};

async function generateDummyData() {
  console.log('🚀 Starting dummy data generation...');
  
  try {
    // 1. Seed onboarding data
    console.log('📝 Seeding onboarding data...');
    for (const interest of dummyOnboardingData.exerciseInterests) {
      await addDoc(collection(db, 'onboardingData', 'exerciseInterests', 'items'), {
        name: interest,
        createdAt: serverTimestamp()
      });
    }
    
    for (const goal of dummyOnboardingData.wellnessGoals) {
      await addDoc(collection(db, 'onboardingData', 'wellnessGoals', 'items'), {
        id: goal.id,
        title: goal.title,
        desc: goal.desc,
        icon: goal.icon,
        createdAt: serverTimestamp()
      });
    }
    console.log('✅ Onboarding data seeded');

    // 2. Create users
    console.log('👥 Creating dummy users...');
    const userRefs = [];
    for (const user of dummyUsers) {
      const docRef = await addDoc(collection(db, 'users'), user);
      userRefs.push({ ...user, ref: docRef });
      console.log(`✅ Created user: ${user.displayName}`);
    }

    // 3. Create groups
    console.log('🏠 Creating dummy groups...');
    const groupRefs = [];
    for (const group of dummyGroups) {
      const docRef = await addDoc(collection(db, 'groups'), group);
      groupRefs.push({ ...group, ref: docRef });
      console.log(`✅ Created group: ${group.name}`);
    }

    // 4. Create challenges
    console.log('🏆 Creating dummy challenges...');
    for (const challenge of dummyChallenges) {
      await addDoc(collection(db, 'challenges'), challenge);
      console.log(`✅ Created challenge: ${challenge.name}`);
    }

    // 5. Create posts
    console.log('💬 Creating dummy posts...');
    for (const post of dummyPosts) {
      await addDoc(collection(db, 'posts'), post);
      console.log(`✅ Created post by ${post.authorId}`);
    }

    console.log('🎉 Dummy data generation completed successfully!');
    console.log(`📊 Created: ${dummyUsers.length} users, ${dummyGroups.length} groups, ${dummyChallenges.length} challenges, ${dummyPosts.length} posts`);
    
  } catch (error) {
    console.error('❌ Dummy data generation failed:', error);
    throw error;
  }
}

// Run the dummy data generation script
generateDummyData();