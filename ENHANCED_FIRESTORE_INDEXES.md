# Enhanced Firestore Indexes Documentation

This document explains the purpose and usage of each index in `firestore.indexes.json`.

## Exercise Library Indexes

### 1. Tier 1 + Tier 2 + Name Index
```json
{
  "collectionGroup": "catalogExercises",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "tier_1", "order": "ASCENDING" },
    { "fieldPath": "tier_2", "order": "ASCENDING" },
    { "fieldPath": "name", "order": "ASCENDING" }
  ]
}
```
**Purpose**: Used for filtered library view when users select both a body region (tier_1) and a focus area (tier_2). Enables efficient sorting by exercise name within the filtered results.

**Query Example**: 
```javascript
query(collection(db, 'catalogExercises'), 
  where('tier_1', '==', 'Core'),
  where('tier_2', '==', 'Strength'),
  orderBy('name'))
```

### 2. Tier 1 + Difficulty + Name Index
```json
{
  "collectionGroup": "catalogExercises",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "tier_1", "order": "ASCENDING" },
    { "fieldPath": "difficulty", "order": "ASCENDING" },
    { "fieldPath": "name", "order": "ASCENDING" }
  ]
}
```
**Purpose**: Used for difficulty filtering within a specific body region. Allows users to filter exercises by both body region and difficulty level, then sort alphabetically.

**Query Example**:
```javascript
query(collection(db, 'catalogExercises'),
  where('tier_1', '==', 'Upper Body'),
  where('difficulty', '==', 'Beginner'),
  orderBy('name'))
```

### 3. Tier 2 + Difficulty + Name Index
```json
{
  "collectionGroup": "catalogExercises",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "tier_2", "order": "ASCENDING" },
    { "fieldPath": "difficulty", "order": "ASCENDING" },
    { "fieldPath": "name", "order": "ASCENDING" }
  ]
}
```
**Purpose**: Used for focus area + difficulty filtering. Enables filtering by specific training focus (like "Strength" or "Cardio") combined with difficulty level.

**Query Example**:
```javascript
query(collection(db, 'catalogExercises'),
  where('tier_2', '==', 'Cardio'),
  where('difficulty', '==', 'Intermediate'),
  orderBy('name'))
```

### 4. Muscles Targeted + Name Index
```json
{
  "collectionGroup": "catalogExercises",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "musclesTargeted", "arrayConfig": "CONTAINS" },
    { "fieldPath": "name", "order": "ASCENDING" }
  ]
}
```
**Purpose**: Used for muscle group filtering. Allows users to find exercises that target specific muscle groups (e.g., "Chest", "Legs", "Core").

**Query Example**:
```javascript
query(collection(db, 'catalogExercises'),
  where('musclesTargeted', 'array-contains', 'Chest'),
  orderBy('name'))
```

### 5. Equipment + Name Index
```json
{
  "collectionGroup": "catalogExercises",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "equipment", "arrayConfig": "CONTAINS" },
    { "fieldPath": "name", "order": "ASCENDING" }
  ]
}
```
**Purpose**: Used for equipment filtering. Enables users to find exercises that require specific equipment (e.g., "Dumbbells", "Resistance Bands", "None").

**Query Example**:
```javascript
query(collection(db, 'catalogExercises'),
  where('equipment', 'array-contains', 'Dumbbells'),
  orderBy('name'))
```

### 6. Training Goals + Name Index
```json
{
  "collectionGroup": "catalogExercises",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "trainingGoals", "arrayConfig": "CONTAINS" },
    { "fieldPath": "name", "order": "ASCENDING" }
  ]
}
```
**Purpose**: Used for training goal filtering. Allows users to find exercises that align with specific training objectives (e.g., "Strength", "Endurance", "Flexibility").

**Query Example**:
```javascript
query(collection(db, 'catalogExercises'),
  where('trainingGoals', 'array-contains', 'Strength'),
  orderBy('name'))
```

### 7. Metric Type + Name Index
```json
{
  "collectionGroup": "catalogExercises",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "metric.type", "order": "ASCENDING" },
    { "fieldPath": "name", "order": "ASCENDING" }
  ]
}
```
**Purpose**: Used for metric type filtering. Enables users to find exercises based on the type of measurement (e.g., "reps", "time", "distance").

**Query Example**:
```javascript
query(collection(db, 'catalogExercises'),
  where('metric.type', '==', 'time'),
  orderBy('name'))
```

### 8. Comprehensive Filtering Index (Tier 1 + Tier 2 + Difficulty + Name)
```json
{
  "collectionGroup": "catalogExercises",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "tier_1", "order": "ASCENDING" },
    { "fieldPath": "tier_2", "order": "ASCENDING" },
    { "fieldPath": "difficulty", "order": "ASCENDING" },
    { "fieldPath": "name", "order": "ASCENDING" }
  ]
}
```
**Purpose**: Used for comprehensive filtering when users apply multiple filters simultaneously. Supports complex queries with body region, focus area, and difficulty level all specified.

**Query Example**:
```javascript
query(collection(db, 'catalogExercises'),
  where('tier_1', '==', 'Lower Body'),
  where('tier_2', '==', 'Strength'),
  where('difficulty', '==', 'Advanced'),
  orderBy('name'))
```

### 9. Basic Tier 1 + Name Index
```json
{
  "collectionGroup": "catalogExercises",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "tier_1", "order": "ASCENDING" },
    { "fieldPath": "name", "order": "ASCENDING" }
  ]
}
```
**Purpose**: Used for basic body region filtering with alphabetical sorting. The most commonly used index for simple category browsing.

**Query Example**:
```javascript
query(collection(db, 'catalogExercises'),
  where('tier_1', '==', 'Upper Body'),
  orderBy('name'))
```

## Group Management Indexes

### 10. Group Members + Last Activity Index
```json
{
  "collectionGroup": "groups",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "members", "arrayConfig": "CONTAINS" },
    { "fieldPath": "lastActivityAt", "order": "DESCENDING" }
  ]
}
```
**Purpose**: Used for group feed pagination and member activity tracking. Enables efficient loading of groups a user belongs to, sorted by most recent activity.

**Query Example**:
```javascript
query(collection(db, 'groups'),
  where('members', 'array-contains', userId),
  orderBy('lastActivityAt', 'desc'))
```

## Challenge Management Indexes

### 11. Challenge Group + Creation Date Index
```json
{
  "collectionGroup": "challenges",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "groupId", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```
**Purpose**: Used for loading challenges within a specific group, sorted by creation date (newest first).

**Query Example**:
```javascript
query(collection(db, 'challenges'),
  where('groupId', '==', groupId),
  orderBy('createdAt', 'desc'))
```

### 12. Challenge Group + Status + Creation Date Index
```json
{
  "collectionGroup": "challenges",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "groupId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```
**Purpose**: Used for loading challenges by group and status (e.g., "active", "completed"), sorted by creation date.

**Query Example**:
```javascript
query(collection(db, 'challenges'),
  where('groupId', '==', groupId),
  where('status', '==', 'active'),
  orderBy('createdAt', 'desc'))
```

## Activity Tracking Indexes

### 13. User Logs + Creation Date Index
```json
{
  "collectionGroup": "logs",
  "queryScope": "COLLECTION_GROUP",
  "fields": [
    { "fieldPath": "uid", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```
**Purpose**: Used for loading a user's activity logs across all groups, sorted by creation date (newest first).

**Query Example**:
```javascript
query(collectionGroup(db, 'logs'),
  where('uid', '==', userId),
  orderBy('createdAt', 'desc'))
```

### 14. Post Type + Creation Date Index
```json
{
  "collectionGroup": "posts",
  "queryScope": "COLLECTION_GROUP",
  "fields": [
    { "fieldPath": "type", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```
**Purpose**: Used for loading posts by type (e.g., "challenge", "general") across all groups, sorted by creation date.

**Query Example**:
```javascript
query(collectionGroup(db, 'posts'),
  where('type', '==', 'challenge'),
  orderBy('createdAt', 'desc'))
```

## Performance Benefits

These indexes provide:

1. **Fast Query Performance**: All composite queries complete in milliseconds
2. **Efficient Pagination**: Support for cursor-based pagination with `startAfter()`
3. **Complex Filtering**: Enable multi-criteria filtering without performance degradation
4. **Scalability**: Handle large datasets (1000+ exercises) efficiently
5. **User Experience**: Provide instant response times for library browsing and filtering

## Index Management

- **Creation Time**: New indexes can take 10-20 minutes to build in Firebase
- **Storage Cost**: Each index consumes additional storage (minimal for this application)
- **Write Performance**: Indexes slightly slow down write operations (acceptable trade-off for read performance)
- **Monitoring**: Use Firebase Console to monitor index usage and performance

## Deployment

To deploy these indexes to Firebase:

```bash
firebase deploy --only firestore:indexes
```

This will create all the necessary indexes for optimal application performance.