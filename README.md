# MovieApp

A simple Ionic/Angular app that shows popular movies from [TMDB](https://www.themoviedb.org/), with user registration, login, profile photo upload (camera or gallery), and a profile dropdown with logout.

## Project structure

```
movieApp/
├── src/
│   ├── app/
│   │   ├── home/             # Home page (lists popular movies, profile dropdown with logout)
│   │   ├── pages/            # Login, register, movies and movie-detail pages
│   │   ├── services/         # TMDB, Auth, Firestore and Storage services
│   │   ├── models/           # Movie, MovieDetail and User data types
│   │   ├── app.component.ts     # Root component
│   │   └── app.routes.ts        # App routes
│   ├── assets/               # Images and icons
│   ├── environments/         # TMDB API keys and URLs, Firebase config
│   ├── index.html            # Main HTML file
│   ├── main.ts               # App entry point
│   └── styles/               # Global styles
├── angular.json              # Angular build config
├── package.json              # Dependencies and scripts
├── capacitor.config.ts       # Capacitor mobile config
└── README.md                 # This file
```

## How to run

### 1. Install dependencies

```bash
npm install
```

### 2. Run in the browser (development)

```bash
npm start
```

Then open http://localhost:8100

### 3. Build for production

```bash
npm run build
```

### 4. Run on Android

```bash
ionic cap run android -l --external
```

## Available commands

| Command | What it does |
|---------|--------------|
| `npm start` | Start the dev server |
| `npm run build` | Build for production |
| `npm run watch` | Build in watch mode (development) |
| `npm run test:unit` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Run lint and type checks |
| `npm run lint:fix` | Auto-fix lint and formatting issues |

## Features

- **Home page** — lists popular movies from TMDB with a search bar, loading spinner, and error message with retry button. Click any movie card to open its detail page.
- **Movie detail page** (`/movie/:id`) — shows full movie details: backdrop image, title, release date, runtime, vote average, genres, tagline, overview, budget, revenue and popularity.
- **User registration** — sign up with first name, last name, age, email and password. Optional profile photo.
- **Profile photo options** — two ways to pick a photo on register:
  1. **Take a Photo** — uses the device camera (`@capacitor/camera`).
  2. **Choose from Gallery** — opens the phone/PC gallery or file picker (`CameraSource.Photos`).
- **Authentication** — login with email and password. User session is stored with Firebase Auth; profile data stored in Firestore; photo stored in Firebase Storage.
- **Profile dropdown (header)** — when a user is connected, the header shows their profile image (or a default icon). Clicking it opens a dropdown/popover showing the user's name and a **Logout** button. Logging out clears the session and returns to the home page.
- **Loading spinner and error message** with retry button on movie load/search.

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/home` | HomePage | Popular movies list + search |
| `/login` | LoginPage | Sign in |
| `/register` | RegisterPage | Sign up with optional profile photo |
| `/movies` | MoviesPage | Movies page |
| `/movie/:id` | MovieDetailPage | Full details of a single movie |

## Services

- `TmdbService` — calls the TMDB API (popular, search, trending movies, movie details).
- `AuthService` — Firebase Auth (register/login/logout), current user, user profile via Firestore.
- `FirestoreService` — reads/writes user profiles in Firestore.
- `StorageService` — uploads profile photos to Firebase Storage.

## Models

- `Movie` — id, title, overview, poster_path, backdrop_path, release_date, vote_average.
- `MovieDetail` — extends `Movie` with genres, runtime, vote_count, tagline, status, popularity, budget, revenue, original_language, original_title, homepage, production_companies, production_countries, spoken_languages.
- `User` — uid, email, password, firstName, lastName, age, photoUrl, role, status, createdAt.

## What was fixed

1. **Movies not showing** — `src/main.ts` was missing `provideHttpClient()`, so the TMDB API call never ran. Added it to the bootstrap providers.
2. **Reload left page stuck** — Simplified the home component so `isLoading` always resets to `false` after the API call finishes (success or error), so movies display correctly on reload.
3. **User icon** — Added a `person-outline` icon button in the header that links to `/login`.
4. **Search bar** — Added an `ion-searchbar` bound to `searchQuery` so users can search movies.
5. **Header profile dropdown** — displays the connected user's photo; clicking it opens a popover with the user's name and a Logout button.
6. **Register photo picker** — added "Choose from Gallery" option alongside "Take a Photo".
7. **Movie detail page** — added `/movie/:id` route with `MovieDetailPage` showing full movie info (genres, runtime, tagline, overview, budget, revenue, popularity). Clicking any movie card on home navigates to the detail page.
