import { DetailScreen } from '@/src/components/DetailScreen';
import { getTvDetails } from '@/src/api';

export default function TvDetail() {
  return (
    <DetailScreen
      mediaType="tv"
      source="tmdb"
      fetchDetails={getTvDetails}
    />
  );
}
