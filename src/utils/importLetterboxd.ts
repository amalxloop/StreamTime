import Papa from 'papaparse';
import { searchMovies } from '../api/tmdb';
import type { UserRating } from '../api/types';

interface LetterboxdRow {
  Date: string;
  Name: string;
  Year: string;
  Rating: string;
  Review: string;
  URL: string;
}

export interface ImportProgress {
  total: number;
  matched: number;
  failed: number;
  current: string;
}

export interface ImportResult {
  ratings: Omit<UserRating, 'id' | 'createdAt' | 'updatedAt'>[];
  failed: { title: string; reason: string }[];
}

function letterboxdRatingToFive(letterboxdRating: string): number {
  const parsed = parseFloat(letterboxdRating);
  if (isNaN(parsed)) return 0;
  const rounded = Math.round(parsed);
  return Math.max(1, Math.min(5, rounded));
}

export function parseLetterboxdCsv(
  csvContent: string,
): LetterboxdRow[] {
  const result = Papa.parse<LetterboxdRow>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return result.data.filter((row) => row.Name && row.Rating);
}

export async function matchToTMDB(
  name: string,
  year: string,
  progressCallback?: (title: string) => void,
): Promise<{ id: number; title: string; posterPath: string | null; overview: string } | null> {
  try {
    progressCallback?.(name);
    const query = year ? `${name} ${year}` : name;
    const results = await searchMovies(query);
    if (results.length === 0) return null;

    const exactMatch = results.find((r) => {
      const releaseYear = r.releaseDate?.substring(0, 4);
      return (
        r.title.toLowerCase() === name.toLowerCase() &&
        (!year || releaseYear === year)
      );
    });
    if (exactMatch) {
      return {
        id: exactMatch.id,
        title: exactMatch.title,
        posterPath: exactMatch.posterPath,
        overview: exactMatch.overview,
      };
    }

    const result = results[0];
    return {
      id: result.id,
      title: result.title,
      posterPath: result.posterPath,
      overview: result.overview,
    };
  } catch {
    return null;
  }
}

export async function importLetterboxdCsv(
  csvContent: string,
  onProgress?: (progress: ImportProgress) => void,
): Promise<ImportResult> {
  const rows = parseLetterboxdCsv(csvContent);
  const total = rows.length;
  const ratings: ImportResult['ratings'] = [];
  const failed: ImportResult['failed'] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const current = `${row.Name} (${row.Year})`;

    onProgress?.({
      total,
      matched: ratings.length,
      failed: failed.length,
      current,
    });

    const matched = await matchToTMDB(row.Name, row.Year, () => {});
    if (!matched) {
      failed.push({ title: current, reason: 'No TMDB match found' });
      continue;
    }

    ratings.push({
      mediaId: matched.id,
      mediaType: 'movie',
      source: 'tmdb',
      title: matched.title,
      posterPath: matched.posterPath,
      overview: matched.overview,
      rating: letterboxdRatingToFive(row.Rating),
      review: row.Review?.trim() || null,
    });
  }

  return { ratings, failed };
}
