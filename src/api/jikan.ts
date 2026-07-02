import axios from 'axios';
import type { MediaItem, MediaDetails } from './types';

const BASE_URL = 'https://api.jikan.moe/v4';

const jikanClient = axios.create({
  baseURL: BASE_URL,
});

interface JikanAnime {
  mal_id: number;
  title: string;
  title_english?: string;
  synopsis: string | null;
  images: {
    jpg: {
      image_url: string | null;
      large_image_url: string | null;
    };
  };
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  year?: number | null;
  aired?: {
    from?: string;
    to?: string;
  };
  genres?: { mal_id: number; name: string }[];
  status?: string;
  episodes?: number | null;
  duration?: string;
  rating?: string;
  type?: string;
  studios?: { mal_id: number; name: string }[];
}

function mapJikanItem(anime: JikanAnime): MediaItem {
  return {
    id: anime.mal_id,
    mediaType: 'anime',
    source: 'jikan',
    title: anime.title_english ?? anime.title,
    overview: anime.synopsis ?? '',
    posterPath: anime.images.jpg.large_image_url ?? anime.images.jpg.image_url,
    backdropPath: anime.images.jpg.large_image_url,
    releaseDate: anime.aired?.from ?? anime.year?.toString(),
    voteAverage: anime.score ?? 0,
    genreIds: anime.genres?.map((g) => g.mal_id),
  };
}

function mapJikanDetails(anime: JikanAnime): MediaDetails {
  return {
    id: anime.mal_id,
    mediaType: 'anime',
    source: 'jikan',
    title: anime.title_english ?? anime.title,
    overview: anime.synopsis ?? '',
    posterPath: anime.images.jpg.large_image_url ?? anime.images.jpg.image_url,
    backdropPath: anime.images.jpg.large_image_url,
    releaseDate: anime.aired?.from ?? anime.year?.toString(),
    voteAverage: anime.score ?? 0,
    genres: anime.genres?.map((g) => ({ id: g.mal_id, name: g.name })) ?? [],
    status: anime.status,
  };
}

export async function getTopAnime(page = 1): Promise<{ items: MediaItem[]; hasMore: boolean }> {
  const { data } = await jikanClient.get('/top/anime', { params: { page } });
  return {
    items: data.data.map((item: JikanAnime) => mapJikanItem(item)),
    hasMore: data.pagination?.has_next_page ?? false,
  };
}

export async function searchAnime(query: string): Promise<MediaItem[]> {
  const { data } = await jikanClient.get('/anime', { params: { q: query, order_by: 'popularity', sort: 'asc' } });
  return data.data.map((item: JikanAnime) => mapJikanItem(item));
}

export async function getAnimeDetails(id: number): Promise<MediaDetails> {
  const { data } = await jikanClient.get(`/anime/${id}/full`);
  return mapJikanDetails(data.data);
}
