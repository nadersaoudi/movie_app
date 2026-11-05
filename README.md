# MovieApp

A simple Ionic/Angular app that shows popular movies from [TMDB](https://www.themoviedb.org/).

## Project structure

```
movieApp/
├── src/
│   ├── app/
│   │   ├── home/             # Home page (lists popular movies)
│   │   ├── pages/            # Login, register and movies pages
│   │   ├── services/
│   │   │   └── tmdb.service.ts  # Calls the TMDB API
│   │   ├── models/
│   │   │   └── movie.model.ts   # Movie data types
│   │   ├── app.component.ts     # Root component
│   │   └── app.routes.ts        # App routes
│   ├── assets/               # Images and icons
│   ├── environments/         # TMDB API keys and URLs
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
| `npm run test:unit` | Run unit tests |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Run lint and type checks |

## Features

- Home page lists popular movies from TMDB
- Search movies by title using the search bar
- User icon (person-outline) in the top-right header navigates to `/login`
- Loading spinner and error message with retry button

## What was fixed

1. **Movies not showing** — `src/main.ts` was missing `provideHttpClient()`, so the TMDB API call never ran. Added it to the bootstrap providers.
2. **Reload left page stuck** — Simplified the home component so `isLoading` always resets to `false` after the API call finishes (success or error), so movies display correctly on reload.
3. **User icon** — Added a `person-outline` icon button in the header that links to `/login`.
4. **Search bar** — Added an `ion-searchbar` bound to `searchQuery` so users can search movies.
