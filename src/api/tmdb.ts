import axios from 'axios';
import type { MediaItem, MediaDetails } from './types';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = 'a222e5eda9654d1c6974da834e756c12';

const tmdbClient = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY },
});

interface TMDBMedia {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  tagline?: string;
  runtime?: number | null;
  episode_run_time?: number[];
  status?: string;
  media_type?: string;
}

function mapTMDBItem(item: TMDBMedia, mediaType: 'movie' | 'tv'): MediaItem {
  return {
    id: item.id,
    mediaType,
    source: 'tmdb',
    title: item.title ?? item.name ?? 'Unknown',
    overview: item.overview ?? '',
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    releaseDate: item.release_date ?? item.first_air_date,
    voteAverage: item.vote_average,
    genreIds: item.genre_ids,
  };
}

function mapTMDBDetails(item: TMDBMedia, mediaType: 'movie' | 'tv'): MediaDetails {
  return {
    id: item.id,
    mediaType,
    source: 'tmdb',
    title: item.title ?? item.name ?? 'Unknown',
    overview: item.overview ?? '',
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    releaseDate: item.release_date ?? item.first_air_date,
    voteAverage: item.vote_average,
    genres: item.genres ?? [],
    tagline: item.tagline,
    runtime: mediaType === 'movie' ? item.runtime : (item.episode_run_time?.[0] ?? null),
    status: item.status,
  };
}

interface PaginatedResult {
  items: MediaItem[];
  totalPages: number;
  hasMore: boolean;
}

export async function getTrendingMovies(page = 1): Promise<PaginatedResult> {
  const { data } = await tmdbClient.get('/trending/movie/week', { params: { page } });
  return {
    items: data.results.map((item: TMDBMedia) => mapTMDBItem(item, 'movie')),
    totalPages: data.total_pages,
    hasMore: page < data.total_pages,
  };
}

export async function getTrendingTv(page = 1): Promise<PaginatedResult> {
  const { data } = await tmdbClient.get('/trending/tv/week', { params: { page } });
  return {
    items: data.results.map((item: TMDBMedia) => mapTMDBItem(item, 'tv')),
    totalPages: data.total_pages,
    hasMore: page < data.total_pages,
  };
}

export async function searchMulti(query: string): Promise<MediaItem[]> {
  const { data } = await tmdbClient.get('/search/multi', { params: { query } });
  return data.results
    .filter((item: TMDBMedia) => item.media_type === 'movie' || item.media_type === 'tv')
    .map((item: TMDBMedia) => mapTMDBItem(item, item.media_type as 'movie' | 'tv'));
}

export async function searchMovies(query: string): Promise<MediaItem[]> {
  const { data } = await tmdbClient.get('/search/movie', { params: { query } });
  return data.results.map((item: TMDBMedia) => mapTMDBItem(item, 'movie'));
}

export async function searchTv(query: string): Promise<MediaItem[]> {
  const { data } = await tmdbClient.get('/search/tv', { params: { query } });
  return data.results.map((item: TMDBMedia) => mapTMDBItem(item, 'tv'));
}

export async function getMovieDetails(id: number): Promise<MediaDetails> {
  const { data } = await tmdbClient.get(`/movie/${id}`);
  return mapTMDBDetails(data, 'movie');
}

export async function getTvDetails(id: number): Promise<MediaDetails> {
  const { data } = await tmdbClient.get(`/tv/${id}`);
  return mapTMDBDetails(data, 'tv');
}
