import { Timestamp } from '@firebase/firestore';

export type MetricUnit = "reps" | "seconds" | "minutes" | "hours" | "km" | "steps" | "sets";

export type ExerciseCategory = 
  | "Core & Planks" 
  | "Ab Exercises" 
  | "Lower Body" 
  | "Cardio & Dynamic" 
  | "Upper Body" 
  | "Mobility & Stretching" 
  | "New Additions" 
  | "Wellness Category" 
  | "Cardio"
  | "Core" 
  | "Mobility";

export interface CatalogExercise {
  id: string; // Doc ID must equal id
  name: string;
  category: ExerciseCategory;
  subCategory?: string;
  tags: string[];
  equipment: string[] | string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  difficulty: number; // 1-5
  metricUnit: MetricUnit;
  recommendedRange?: { min: number; max: number; label: string } | null;
  benefits: string;
  instructions: {
    setup: string;
    execution: string;
    cues: string[];
    commonMistakes: string[];
    breathing?: string;
    safety: string;
  };
  media: { imageUrl?: string; demo?: string };
  seededAt: Timestamp;
}

export interface UserStats {
  xp: number;
  level: number;
  coins: number;
  totalLogs: number;
  streak: number;
}

export interface UserDoc {
  uid: string;
  displayName?: string;
  fullName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
  activeGroupId?: string;
  activeChallengeId?: string;
  onboardingCompleted?: boolean;
  stats: UserStats;
  // New Onboarding Fields
  birthday?: string;
  weight?: number;
  height?: number;
  interests?: string[];
  goals?: string[];
  privacySettings?: {
    showStatsToGroups: boolean;
    showBirthdayToFriends: boolean;
    searchable: boolean;
  };
}

export interface GroupRules {
  visibility: "invite-only" | "private";
  allowMemberChallenges: boolean;
  requireChallengeApproval: boolean;
}

export interface GroupDoc {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: Timestamp;
  members: string[];
  admins: string[];
  rules: GroupRules;
  inviteCode: string;
  inviteLink: string; // "/join/{groupId}"
  lastActivityAt: Timestamp;
  status: "active" | "paused" | "inactive";
}

export type ChallengeStatus = "pending" | "active" | "completed";
export type ChallengeType = "DAILY" | "WEEKLY" | "CUMULATIVE";

export interface ChallengeActivity {
  exerciseId: string;
  exerciseName: string;
  category: string;
  metricUnit: string;
  targetValue: number;
  order: number;
}

export interface ChallengeDoc {
  id: string;
  groupId: string;
  createdBy: string;
  createdAt: Timestamp;
  status: ChallengeStatus;
  type: ChallengeType;
  title: string;
  description: string;
  coverImageUrl?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  participants: string[];
  challengeAdmins: string[];
  activities: ChallengeActivity[];
}

export interface LogEntry {
  exerciseId: string;
  metricUnit: string;
  value: number;
}

export interface ChallengeLog {
  id: string;
  uid: string;
  createdAt: Timestamp;
  entries: LogEntry[];
  note?: string;
}

export interface Post {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  type: "text" | "workout_log";
  logRef?: string;
  reactions: Record<string, string[]>; // emoji: uid[]
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  content: string;
  createdAt: Timestamp;
}

export interface Donation {
  id: string;
  uid: string;
  createdAt: Timestamp;
  amount: number;
  currency: "KES" | "USD";
  frequency: "one-time" | "monthly" | "annual";
  note?: string;
}