import { DetailScreen } from '@/src/components/DetailScreen';
import { getAnimeDetails } from '@/src/api';

export default function AnimeDetail() {
  return (
    <DetailScreen
      mediaType="anime"
      source="jikan"
      fetchDetails={getAnimeDetails}
    />
  );
}
