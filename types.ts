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

export type ChallengeStatus = "pending" | "active" | "completed" | "paused";
export type ChallengeType = "DAILY" | "WEEKLY" | "CUMULATIVE";

/**
 * Complete exercise catalog entry with all detailed information
 */
export interface CatalogExercise {
  id: string;                          // Firestore document ID
  name: string;                        // Exercise name (e.g., "Push-ups")
  tier_1: string;                      // Primary category (e.g., "Upper Body")
  tier_2: string;                      // Secondary category (e.g., "Strength")
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  musclesTargeted: string[];           // Muscle groups worked (e.g., ["Chest", "Triceps"])
  equipment: string[];                 // Equipment needed (e.g., ["None", "Mat"])
  trainingGoals: string[];             // Training goals (e.g., ["Strength", "Endurance"])
  
  // Metric configuration for tracking
  metric: {
    type: "reps" | "time" | "distance"; // How to measure (reps, time, distance)
    unit: "reps" | "seconds" | "minutes" | "km"; // Base unit for display
    allowCustomUnit: boolean;          // Whether users can customize units
    metricOptions?: Array<{           // Optional: additional metric choices
      type: "time" | "distance";
      unit: "minutes" | "km";
    }>;
  };
  
  // Detailed exercise information
  description: string;                 // Brief description of the exercise
  setup: string[];                     // Step-by-step setup instructions
  execution: string[];                 // Step-by-step execution instructions
  breathing: {                         // Breathing guidance
    inhale: string;                    // When to inhale
    exhale: string;                    // When to exhale
    pattern: string;                   // Overall breathing pattern
  };
  formCues: string[];                  // Key form cues for proper technique
  commonMistakes: string[];            // Common mistakes to avoid
  progressions: string[];              // Progression variations
  advancedVariations: string[];        // Advanced variations
  safetyNotes: string[];               // Safety considerations
  recommendedVolume: {                 // Recommended volume by level
    beginner: string;                  // e.g., "3 sets of 5-8 reps"
    intermediate: string;              // e.g., "3 sets of 8-12 reps"
    advanced: string;                  // e.g., "4 sets of 12-15 reps"
  };
  createdAt: Timestamp;                // When the exercise was added to catalog
}

/**
 * Legacy exercise format for backward compatibility
 */
export interface LegacyCatalogExercise {
  id: string;
  name: string;
  category: ExerciseCategory;          // Old single category field
  difficulty: number;                  // Old numeric difficulty (1-3)
  metricUnit: string;                  // Old simple metric unit
  tags: string[];                      // Old tags array
  equipment: string | string[];        // Old equipment format
  media?: {
    imageUrl?: string;
    videoUrl?: string;
  };
  description?: string;
  setup?: string[];
  execution?: string[];
  breathing?: {
    inhale: string;
    exhale: string;
    pattern: string;
  };
  formCues?: string[];
  commonMistakes?: string[];
  progressions?: string[];
  advancedVariations?: string[];
  safetyNotes?: string[];
  recommendedVolume?: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  createdAt?: Timestamp;
}

/**
 * Minimal exercise interface for basic display
 */
export interface BasicExercise {
  id: string;
  name: string;
  tier_1?: string;
  tier_2?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  metric?: {
    type: "reps" | "time" | "distance";
    unit: "reps" | "seconds" | "minutes" | "km";
  };
  description?: string;
  musclesTargeted?: string[];
  equipment?: string[];
  createdAt?: Timestamp;
}


export interface UserStats {
  totalWorkouts: number;
  totalSteps: number;
  totalDistance: number;
  totalCalories: number;
  totalActiveMinutes: number;
  longestStreak: number;
  currentStreak: number;
  lastWorkoutDate?: Timestamp;
  xp: number;
  level: number;
  coins: number;
  totalLogs: number;
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


export interface ChallengeActivity {
  activityId: string;                  // uuid or `${exerciseId}_${index}`
  order: number;                       // 1..n
  exerciseId: string;                  // references catalogExercises/{exerciseId}
  
  // snapshot fields to avoid extra reads in lists
  exerciseName: string;
  tier_1: string;                      // Core / Upper / Lower / Full Body
  tier_2: string;                      // Strength / Cardio / Mobility & Flexibility / etc
  metricUnit: MetricUnit;              // clean enum
  
  recommendedRange?: {                // optional snapshot for hint UI
    min: number;
    max: number;
    label: string;                     // "30–60 sec"
  };
  
  targetValue: number;                 // numeric goal for that metric
}

export interface ChallengeDoc {
  id: string;                          // same as docId, stored for convenience
  groupId: string;
  title: string;
  description?: string;                // <= 500 chars
  coverImageUrl?: string;
  type: ChallengeType;
  status: ChallengeStatus;
  createdBy: string;                   // uid
  createdAt: Timestamp;
  approvedBy?: string;                 // uid
  approvedAt?: Timestamp;
  startDate: Timestamp;
  endDate: Timestamp;                  // always required (simplifies everything)
  participants: string[];              // joined users
  challengeAdmins: string[];           // group admins snapshot at creation time
  activities: ChallengeActivity[];     // max 3 in v1
  
  // optional computed summary for UI (client maintained in v1)
  stats?: {
    totalLogs: number;
    lastLogAt?: Timestamp;
  };
  
  // optional for "Support a cause" later (keep but off in v1 if you want)
  socialGood?: {
    enabled: boolean;
    causeName?: string;
    causeDescription?: string;
    targetAmount?: number;
    phone?: string;
  };
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

/**
 * Normalizes any exercise document from Firestore to a proper CatalogExercise
 * Handles both new detailed format and legacy format with fallbacks
 */
export function normalizeCatalogExercise(doc: any): CatalogExercise {
  // Handle legacy format conversion
  if (doc.category && doc.difficulty && doc.metricUnit) {
    return {
      id: doc.id || doc.name?.toLowerCase().replace(/\s+/g, '-'),
      name: doc.name || 'Unknown Exercise',
      tier_1: doc.category || 'General',
      tier_2: doc.category || 'General',
      difficulty: convertLegacyDifficulty(doc.difficulty),
      musclesTargeted: Array.isArray(doc.tags) ? doc.tags : [],
      equipment: Array.isArray(doc.equipment) ? doc.equipment : (typeof doc.equipment === 'string' ? [doc.equipment] : []),
      trainingGoals: Array.isArray(doc.tags) ? doc.tags : [],
      metric: {
        type: convertLegacyMetricType(doc.metricUnit),
        unit: convertLegacyMetricUnit(doc.metricUnit),
        allowCustomUnit: true,
      },
      description: doc.description || `Basic ${doc.name || 'exercise'} description`,
      setup: doc.setup || ['Stand in starting position'],
      execution: doc.execution || ['Perform the exercise movement'],
      breathing: {
        inhale: doc.breathing?.inhale || 'Inhale during eccentric phase',
        exhale: doc.breathing?.exhale || 'Exhale during concentric phase',
        pattern: doc.breathing?.pattern || 'Controlled breathing throughout',
      },
      formCues: doc.formCues || ['Maintain proper form'],
      commonMistakes: doc.commonMistakes || ['Avoid common mistakes'],
      progressions: doc.progressions || ['Progress to harder variations'],
      advancedVariations: doc.advancedVariations || ['Try advanced versions'],
      safetyNotes: doc.safetyNotes || ['Use proper technique'],
      recommendedVolume: {
        beginner: doc.recommendedVolume?.beginner || '2-3 sets of 8-12 reps',
        intermediate: doc.recommendedVolume?.intermediate || '3-4 sets of 8-12 reps',
        advanced: doc.recommendedVolume?.advanced || '4-5 sets of 6-10 reps',
      },
      createdAt: doc.createdAt || new Date(),
    };
  }

  // Handle basic exercise format
  if (doc.name && doc.tier_1 && doc.tier_2) {
    return {
      id: doc.id || doc.name.toLowerCase().replace(/\s+/g, '-'),
      name: doc.name,
      tier_1: doc.tier_1,
      tier_2: doc.tier_2,
      difficulty: doc.difficulty || "Beginner",
      musclesTargeted: doc.musclesTargeted || [],
      equipment: doc.equipment || [],
      trainingGoals: doc.trainingGoals || [],
      metric: doc.metric || {
        type: "reps",
        unit: "reps",
        allowCustomUnit: true,
      },
      description: doc.description || `${doc.name} exercise`,
      setup: doc.setup || ['Setup instructions'],
      execution: doc.execution || ['Execution instructions'],
      breathing: doc.breathing || {
        inhale: 'Inhale during eccentric phase',
        exhale: 'Exhale during concentric phase',
        pattern: 'Controlled breathing throughout',
      },
      formCues: doc.formCues || ['Maintain proper form'],
      commonMistakes: doc.commonMistakes || ['Avoid common mistakes'],
      progressions: doc.progressions || ['Progress to harder variations'],
      advancedVariations: doc.advancedVariations || ['Try advanced versions'],
      safetyNotes: doc.safetyNotes || ['Use proper technique'],
      recommendedVolume: doc.recommendedVolume || {
        beginner: '2-3 sets of 8-12 reps',
        intermediate: '3-4 sets of 8-12 reps',
        advanced: '4-5 sets of 6-10 reps',
      },
      createdAt: doc.createdAt || new Date(),
    };
  }

  // Fallback for minimal data
  return {
    id: doc.id || 'unknown-exercise',
    name: doc.name || 'Unknown Exercise',
    tier_1: doc.tier_1 || 'General',
    tier_2: doc.tier_2 || 'General',
    difficulty: "Beginner",
    musclesTargeted: [],
    equipment: [],
    trainingGoals: [],
    metric: {
      type: "reps",
      unit: "reps",
      allowCustomUnit: true,
    },
    description: doc.description || 'Exercise description not available',
    setup: ['Stand in starting position'],
    execution: ['Perform the exercise movement'],
    breathing: {
      inhale: 'Inhale during eccentric phase',
      exhale: 'Exhale during concentric phase',
      pattern: 'Controlled breathing throughout',
    },
    formCues: ['Maintain proper form'],
    commonMistakes: ['Avoid common mistakes'],
    progressions: ['Progress to harder variations'],
    advancedVariations: ['Try advanced versions'],
    safetyNotes: ['Use proper technique'],
    recommendedVolume: {
      beginner: '2-3 sets of 8-12 reps',
      intermediate: '3-4 sets of 8-12 reps',
      advanced: '4-5 sets of 6-10 reps',
    },
    createdAt: doc.createdAt || new Date(),
  };
}

/**
 * Converts legacy numeric difficulty to new enum format
 */
function convertLegacyDifficulty(difficulty: number): "Beginner" | "Intermediate" | "Advanced" {
  if (difficulty >= 3) return "Advanced";
  if (difficulty >= 2) return "Intermediate";
  return "Beginner";
}

/**
 * Converts legacy metric unit to new type format
 */
function convertLegacyMetricType(metricUnit: string): "reps" | "time" | "distance" {
  const unit = metricUnit.toLowerCase();
  if (unit.includes('sec') || unit.includes('min') || unit.includes('hour')) return "time";
  if (unit.includes('km') || unit.includes('mile') || unit.includes('m')) return "distance";
  return "reps";
}

/**
 * Converts legacy metric unit to new unit format
 */
function convertLegacyMetricUnit(metricUnit: string): "reps" | "seconds" | "minutes" | "km" {
  const unit = metricUnit.toLowerCase();
  if (unit.includes('sec')) return "seconds";
  if (unit.includes('min')) return "minutes";
  if (unit.includes('hour')) return "minutes"; // Convert hours to minutes for consistency
  if (unit.includes('km') || unit.includes('mile') || unit.includes('m')) return "km";
  return "reps";
}
