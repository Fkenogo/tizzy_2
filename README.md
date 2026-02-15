
# Tiizi - Group Workout Accountability

Tiizi turns individual fitness into a group activity. Join a group, accept a challenge, and crush your goals with friends.

## Setup Instructions

1.  **Clone the repository**
2.  **Install dependencies**: `npm install`
3.  **Environment Variables**: Create a `.env` file with the following:
    ```
    VITE_FIREBASE_API_KEY=your_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```
4.  **Firebase Setup**:
    *   Enable Anonymous Auth in Firebase Console.
    *   Create a Firestore database.
    *   Deploy `firestore.rules` and `storage.rules`.
5.  **Run Development Server**: `npm run dev`
6.  **Seed Exercises**: There is a helper in the Exercise Library screen for dev users to "Seed Mock Data" if the collection is empty.

## Data Model Highlights
- **Groups**: Central hub for challenges and social feed.
- **Challenges**: Time-bound activities with specific goals.
- **Logs**: User entries against challenge activities.
- **Feed**: Real-time social interaction with denormalized user data for performance.
