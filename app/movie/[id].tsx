import { DetailScreen } from '@/src/components/DetailScreen';
import { getMovieDetails } from '@/src/api';

export default function MovieDetail() {
  return (
    <DetailScreen
      mediaType="movie"
      source="tmdb"
      fetchDetails={getMovieDetails}
    />
  );
}
