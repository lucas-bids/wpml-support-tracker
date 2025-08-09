# Ticket Pace

Minimalist React + Firebase app to track WPML tickets and pace vs. a monthly goal.

Tech: React (Vite), Firebase Web SDK v10 (Auth + Firestore), react-router-dom, simple CSS.

## Setup

1) Install deps

```bash
pnpm i # or npm i / yarn
```

2) Create `.env.local` from `.env.example` and fill with your Firebase config

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

3) Firestore rules (owner-only)

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /months/{monthId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /tickets/{ticketId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Deploy with:

```bash
firebase deploy --only firestore:rules
```

4) Run locally

First, start the Firebase emulator:
```bash
firebase emulators:start
```

Then, in another terminal, start the development server:
```bash
pnpm dev # or npm run dev / yarn dev
```

App opens at `http://localhost:5173`.

## Data model

Under `users/{uid}`:

- `months/{yyyy-mm}`: `{ monthlyGoal:number, extraTaskHours:number, daysOff:string[] }`
- `tickets/{id}`: `{ url, type:"chat"|"forum", createdAt, dateKey:"yyyy-mm-dd", monthKey:"yyyy-mm", source:"manual", normalized }`

## Features (MVP)

- Sign-in (Google or Anonymous)
- Dashboard with month selector, quick add, today's list (delete), month stats, month settings
- Dedupe on add: same normalized URL for same date

## TODO V1

- Edit ticket
- Per-day view
- Exports

