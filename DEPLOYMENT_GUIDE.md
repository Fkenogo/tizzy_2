# Tiizi MVP Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the Tiizi fitness accountability PWA to production.

## Prerequisites

### Required Tools
- Node.js (v18 or higher)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Firebase Project Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - Authentication (Anonymous auth)
   - Firestore Database (with security rules)
   - Storage
   - Hosting

## Backend Setup

### 1. Configure Firebase Security Rules
Copy the rules from `firestore.rules` to your Firebase project:
```bash
firebase deploy --rules firestore.rules
```

### 2. Configure Storage Rules
Copy the rules from `storage.rules` to your Firebase project:
```bash
firebase deploy --storage-rules storage.rules
```

### 3. Seed Backend Data
Run the seeding scripts to populate your Firestore database:

#### Seed Exercise Catalog
```bash
cd scripts
npx tsx seedExerciseCatalog.ts
```

#### Seed Onboarding Data
```bash
cd scripts
npx tsx seedOnboardingData.ts
```

**Note**: You may need to install `tsx` globally: `npm install -g tsx`

### 4. Environment Configuration
The Firebase configuration is already included in `src/config/firebase.ts` with the project credentials.

## Frontend Build & Deployment

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Application
```bash
npm run build
```

### 3. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

## Development Setup

### Local Development
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Testing Backend Scripts Locally
To test the seeding scripts locally, you'll need to set up Firebase environment variables:

1. Create a `.env.local` file in the root directory
2. Add your Firebase project credentials:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Database Structure

### Collections
- `users` - User profiles and statistics
- `groups` - Community groups ("tribes")
- `challenges` - Group challenges with activities
- `catalogExercises` - Comprehensive exercise library (100+ exercises)
- `posts` - Social feed posts
- `onboardingData/exerciseInterests/items` - User interests
- `onboardingData/wellnessGoals/items` - User wellness goals

### Key Features
- **Exercise Catalog**: Professional-grade exercise database with detailed instructions
- **Group Management**: Create, join, and manage fitness communities
- **Challenge System**: Multi-activity challenges with progress tracking
- **Social Features**: Posts, reactions, and community interaction
- **Workout Logging**: Comprehensive activity tracking and statistics

## Security Considerations

### Firestore Rules
- Anonymous authentication required for all operations
- Users can only modify their own data
- Group members can access group-specific data
- Challenge participants can log activities

### Data Validation
- Input validation on all forms
- Server-side validation in Firestore rules
- Sanitization of user-generated content

## Performance Optimizations

### Frontend
- TanStack Query for efficient data fetching and caching
- Virtualization for long lists (can be enhanced)
- Image optimization and lazy loading (can be enhanced)

### Backend
- Firestore indexing for efficient queries
- Proper data structure for real-time updates
- Efficient query patterns

## Troubleshooting

### Common Issues

1. **TypeScript Errors**
   - Ensure all dependencies are installed
   - Check Node.js version compatibility
   - Verify TypeScript configuration

2. **Firebase Connection Issues**
   - Check Firebase project configuration
   - Verify internet connection
   - Ensure Firebase services are enabled

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for TypeScript compilation errors
   - Verify all imports are correct

### Debugging
- Use browser developer tools for frontend issues
- Check Firebase console for backend errors
- Monitor network requests for API issues

## Production Checklist

- [ ] Firebase project created and configured
- [ ] Security rules deployed
- [ ] Backend data seeded
- [ ] Application built successfully
- [ ] Hosting deployed
- [ ] SSL certificate configured (automatic with Firebase)
- [ ] Custom domain configured (optional)
- [ ] Performance monitoring enabled
- [ ] Error tracking configured

## Support

For issues or questions:
1. Check the Firebase documentation
2. Review the code comments and README files
3. Test with the development server before deploying
4. Monitor Firebase console for real-time issues

## File Locations

### Key Configuration Files
- `src/config/firebase.ts` - Firebase configuration
- `firestore.rules` - Database security rules
- `storage.rules` - Storage security rules
- `tsconfig.json` - TypeScript configuration

### Backend Scripts
- `scripts/seedExerciseCatalog.ts` - Exercise catalog seeding
- `scripts/seedOnboardingData.ts` - Onboarding data seeding
- `scripts/catalogExercises_seed_v2.json` - Exercise engine data

### Frontend Components
- `features/` - Feature-based components
- `components/` - Reusable UI components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and Firebase integration

## Next Steps

1. **Enhance Security**: Review and tighten security rules based on usage patterns
2. **Performance**: Implement additional optimizations as user base grows
3. **Features**: Add new features based on user feedback
4. **Testing**: Implement comprehensive testing suite
5. **Monitoring**: Set up performance and error monitoring

This MVP is ready for production deployment and provides a solid foundation for a fitness accountability platform.