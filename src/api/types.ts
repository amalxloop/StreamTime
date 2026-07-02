export type MediaType = 'movie' | 'tv' | 'anime';
export type SourceType = 'tmdb' | 'jikan';

export interface MediaItem {
  id: number;
  mediaType: MediaType;
  source: SourceType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate?: string;
  voteAverage: number;
  genreIds?: number[];
}

export interface MediaDetails {
  id: number;
  mediaType: MediaType;
  source: SourceType;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate?: string;
  voteAverage: number;
  genres: { id: number; name: string }[];
  tagline?: string;
  runtime?: number | null;
  status?: string;
}

export interface UserRating {
  id: string;
  mediaId: number;
  mediaType: MediaType;
  source: SourceType;
  title: string;
  posterPath: string | null;
  overview: string;
  rating: number;
  review: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult {
  items: MediaItem[];
  totalResults: number;
}
