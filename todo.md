# Todo — MovieApp (Ionic + Angular)

Missing features to implement per todo.txt:

## 1. User registration
- Sign up form with: first name (nom), last name (prénom), age, and a photo taken via the device camera.
- Store the photo (Firebase Storage or local device storage).

## 2. Authentication
- Login / sign-in for registered users.
- Session management (stay logged in, logout).

## 3. Favorites playlist
- Each user can create their own playlist of favorite movies.
- Add/remove movies from favorites.
- View own favorites list.

## 4. Admin features
- Admin can add movies to the base database (beyond the TMDB starting list).
- Admin can disable (deactivate) a user account — not delete it.
- Distinguish admin users from regular users.

## 5. Data storage (Firebase or custom API)
- Store user profiles, favorites, movie list, and admin state in Firebase (Realtime Database or Firestore) or in a custom backend API.
- Persist data across app restarts.

## 6. Matching functionality (75% threshold)
- Let a user see which other users share the same preferences.
- Matching must not rely only on favorite movies — also consider:
  - favorite movie genres,
  - actors appearing in those movies,
  - release year of the movies,
  - and other relevant criteria.
- Compute a match percentage between two users' favorite lists.
- Only show matches where the correspondence rate exceeds 75%.

## Current state (already done)
- Home page lists popular movies from TMDB.
- Search movies by title.
- Login navigation via user icon in header.
- Loading spinner and error message with retry button.
