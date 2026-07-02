import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserRating, MediaType, SourceType } from '../api/types';

interface RatingsState {
  ratings: UserRating[];
  isLoading: boolean;
  addRating: (
    mediaId: number,
    mediaType: MediaType,
    source: SourceType,
    title: string,
    posterPath: string | null,
    overview: string,
    rating: number,
    review: string | null,
  ) => void;
  updateRating: (id: string, rating: number, review: string | null) => void;
  removeRating: (id: string) => void;
  getRatingForMedia: (mediaId: number, mediaType: MediaType) => UserRating | undefined;
  clearAll: () => void;
}

export const useRatingsStore = create<RatingsState>()(
  persist(
    (set, get) => ({
      ratings: [],
      isLoading: false,

      addRating: (mediaId, mediaType, source, title, posterPath, overview, rating, review) => {
        const existing = get().ratings.find(
          (r) => r.mediaId === mediaId && r.mediaType === mediaType,
        );
        if (existing) {
          set((state) => ({
            ratings: state.ratings.map((r) =>
              r.id === existing.id
                ? { ...r, rating, review, updatedAt: new Date().toISOString() }
                : r,
            ),
          }));
          return;
        }

        const newRating: UserRating = {
          id: `${mediaType}-${mediaId}-${Date.now()}`,
          mediaId,
          mediaType,
          source,
          title,
          posterPath,
          overview,
          rating,
          review,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ ratings: [newRating, ...state.ratings] }));
      },

      updateRating: (id, rating, review) => {
        set((state) => ({
          ratings: state.ratings.map((r) =>
            r.id === id ? { ...r, rating, review, updatedAt: new Date().toISOString() } : r,
          ),
        }));
      },

      removeRating: (id) => {
        set((state) => ({ ratings: state.ratings.filter((r) => r.id !== id) }));
      },

      getRatingForMedia: (mediaId, mediaType) => {
        return get().ratings.find((r) => r.mediaId === mediaId && r.mediaType === mediaType);
      },

      clearAll: () => set({ ratings: [] }),
    }),
    {
      name: 'streamtime-ratings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
