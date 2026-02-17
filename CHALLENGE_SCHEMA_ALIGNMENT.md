# Challenge Schema Alignment & Optimization

## Overview

Aligning the challenge schema to ensure it consumes the exercise library cleanly, following the key principle: **Challenge should store only what you need at runtime**.

## Current Issues Identified

### ❌ **Current Schema Problems**

1. **Metric Storage**: Currently stores `metricUnit: string` instead of clean enum
2. **Missing Snapshot Fields**: No exercise snapshots for performance
3. **Inconsistent Tier Usage**: Using `category` instead of structured `tier_1`/`tier_2`
4. **Missing Required Fields**: Missing `approvedBy`, `approvedAt`, `socialGood`
5. **Inconsistent Status Types**: Using custom status instead of standardized types

## ✅ **New Clean Schema Implementation**

### **ChallengeDoc Schema**

```typescript
type ChallengeDoc = {
  id: string;                          // same as docId, stored for convenience
  groupId: string;
  title: string;
  description?: string;                // <= 500 chars
  coverImageUrl?: string;
  type: "DAILY" | "WEEKLY" | "CUMULATIVE";
  status: "pending" | "active" | "completed" | "paused";
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
};
```

### **ChallengeActivity Schema**

```typescript
type MetricUnit = "reps" | "seconds" | "minutes" | "hours" | "km" | "steps" | "sets";

type ChallengeActivity = {
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
};
```

### **ChallengeLog Schema**

```typescript
type ChallengeLog = {
  uid: string;
  createdAt: Timestamp;
  
  // allow multi-activity logging in one action
  entries: Array<{
    activityId: string;                // matches challenge.activities.activityId
    exerciseId: string;
    metricUnit: MetricUnit;
    value: number;
  }>;
  
  note?: string;
  
  // optional: denormalize for feed
  actorName?: string;
  actorPhotoUrl?: string;
};
```

### **GroupPost Schema**

```typescript
type GroupPost = {
  createdAt: Timestamp;
  createdBy: string;
  authorName: string;
  authorPhotoUrl?: string;
  type: "text" | "workout";
  text?: string;
  workout?: {
    challengeId: string;
    challengeTitle: string;
    entriesSummary: string;            // "Logged 30 pushups + 60s plank"
  };
  counts: {
    comments: number;
    reactions: number;
  };
};
```

## 🔄 **Migration Strategy**

### **Phase 1: Update TypeScript Types**

1. **Update MetricUnit enum** to use clean values
2. **Add snapshot fields** to ChallengeActivity
3. **Standardize status types** across all challenge-related types
4. **Add missing optional fields** for future features

### **Phase 2: Update Challenge Creation**

1. **Extract snapshot data** from exercise catalog during challenge creation
2. **Use clean metricUnit enum** instead of string parsing
3. **Generate activityId** using `${exerciseId}_${index}` pattern
4. **Store tier_1/tier_2** directly from exercise catalog

### **Phase 3: Update Challenge Consumption**

1. **Use snapshot fields** for display instead of fetching exercise docs
2. **Maintain exerciseId** as canonical reference
3. **Update log creation** to use activityId instead of exerciseId
4. **Optimize feed posts** with denormalized challenge data

## 📊 **Performance Benefits**

### **Read Operation Reduction**
- **Challenge lists**: No need to fetch exercise docs for each activity
- **Activity display**: Snapshot fields eliminate extra reads
- **Log entries**: Direct activityId references reduce joins
- **Feed posts**: Denormalized data prevents multiple document fetches

### **Data Consistency**
- **Single source of truth**: exerciseId remains canonical
- **Historical accuracy**: Challenges preserve exercise state at creation time
- **Performance isolation**: UI performance not dependent on exercise catalog

### **Future-Proofing**
- **Clean enums**: Easy to extend metric units
- **Optional fields**: Ready for social good features
- **Structured tiers**: Better categorization and filtering

## 🛠 **Implementation Files**

### **Type Updates**
- `types.ts` - Update ChallengeActivity and ChallengeDoc interfaces
- `types.ts` - Add MetricUnit enum and GroupPost interface

### **Challenge Creation Updates**
- `features/Challenges/CreateChallengeWizard.tsx` - Use snapshot fields
- `features/Challenges/CreateChallengeWizard.tsx` - Clean metricUnit handling

### **Challenge Consumption Updates**
- `features/Challenges/MyChallengesScreen.tsx` - Use snapshot fields
- `features/Leaderboards/LeaderboardScreen.tsx` - Optimize data fetching
- `features/Groups/GroupDetailScreen.tsx` - Update feed post creation

## 🎯 **Key Principles Maintained**

### **✅ Single Source of Truth**
- `exerciseId` remains the canonical reference
- Snapshot fields are for performance only
- Historical challenge data preserved

### **✅ Clean Runtime Data**
- Only store what's needed at runtime
- No complex string parsing for metrics
- Structured data for better querying

### **✅ Performance Optimization**
- Minimize document reads in lists
- Use denormalization strategically
- Cache frequently accessed data

### **✅ Future Extensibility**
- Clean enums for easy extension
- Optional fields for new features
- Structured data for advanced filtering

## 📋 **Validation Rules**

### **Challenge Creation**
- `title`: 3-100 characters
- `description`: 5-500 characters
- `activities`: 1-3 activities maximum
- `startDate` < `endDate` (except for DAILY challenges)
- `metricUnit`: Must match exercise metric type

### **Activity Validation**
- `targetValue`: Positive number
- `metricUnit`: Must be valid enum value
- `exerciseId`: Must exist in catalogExercises
- `order`: Unique within challenge

### **Log Entry Validation**
- `activityId`: Must match challenge activity
- `metricUnit`: Must match activity metricUnit
- `value`: Positive number within reasonable bounds

## 🔄 **Backward Compatibility**

### **Migration Path**
1. **Phase 1**: Add new fields alongside existing ones
2. **Phase 2**: Update creation logic to populate new fields
3. **Phase 3**: Update consumption logic to use new fields
4. **Phase 4**: Clean up old fields (optional, can be kept for compatibility)

### **Data Migration**
- Existing challenges continue to work with current logic
- New challenges use optimized schema
- Gradual migration of consumption code
- No breaking changes to existing functionality

This schema alignment ensures clean, performant, and maintainable challenge management while preserving the exercise library integration.