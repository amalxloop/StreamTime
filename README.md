# StreamTime
<img width="1511" height="142" alt="Screenshot 2026-07-02 at 22-09-24 " src="https://github.com/user-attachments/assets/24123426-1833-4c4b-a8af-1ee66370db97" />

Cross-platform app to rate and review your favorite movies, TV shows, and anime.

Local-first. No account, no server, no data leaving your device unless you choose to import or export.

## Features

- **Browse** — trending movies, TV shows, and anime on the home screen
- **Search** — unified search across all categories with tabbed results
- **Details** — synopsis, genres, runtime, ratings, and backdrop
- **Rate & Review** — 1-10 scale with optional written review
- **Persist** — all ratings saved locally via AsyncStorage
- **Theme** — light/dark toggle, persisted preference
- **Categories** — "See All" links for full-list browsing with infinite scroll
- **Import** — import ratings from Letterboxd

## Stack

- React Native (Expo) + TypeScript
- Expo Router for file-based navigation
- Zustand + AsyncStorage for state and offline persistence
- TMDB API for movie/TV metadata, Jikan API for anime
- Expo Image, Ionicons

## Status

v1.0.0, first tagged release. Core features above are working. Web build runs via `npx expo start --web`, mobile through Expo Go, and EAS production builds are queued.

Tests and CI are scaffolded (Jest, ESLint, Prettier, GitHub Actions) but no test suite is written yet.

## Roadmap

- Advanced filtering (genre, year, etc.)
- Social features (sharing, friend lists)
- Watch analytics and a recommendation engine
- Import from IMDb, Rotten Tomatoes
- Optional cloud backup, opt-in only — local storage stays the default
