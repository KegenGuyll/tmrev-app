import { QueryClient } from '@tanstack/react-query';
import { WatchlistAggregatedDetail } from '@/api/tmrev-api-v2';

const invalidateWatchListDetails = (queryClient: QueryClient, movieId: number) => {
	queryClient.invalidateQueries({
		predicate: (query) => {
			const [key] = query.queryKey;
			if (typeof key !== 'string') return false;

			// Handle individual list details
			if (key.startsWith('/watch-list/')) {
				const data: WatchlistAggregatedDetail | undefined = queryClient.getQueryData(
					query.queryKey
				);

				if (!data) return false;

				// Check if this specific list object contains the movieId
				const foundMovieInList = data?.movies?.some((m) => m.id === movieId);
				return foundMovieInList;
			}

			return false;
		},
	});
};

export default invalidateWatchListDetails;
