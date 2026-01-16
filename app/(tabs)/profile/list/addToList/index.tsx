import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, View, VirtualizedList } from 'react-native';
import { ActivityIndicator, Searchbar, Snackbar } from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import useDebounce from '@/hooks/useDebounce';
import { FromLocation } from '@/models';
import MovieListItem from '@/components/MovieList/MovieListItem';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { showSnackbar } from '@/redux/slice/globalSnackbar';
import {
	getWatchListControllerFindOneQueryKey,
	getWatchListControllerGetUserWatchListsQueryKey,
	useWatchListControllerGetUserWatchLists,
	useWatchListControllerUpdate,
} from '@/api/tmrev-api-v2/endpoints';
import { WatchListControllerGetUserWatchListsParams } from '@/api/tmrev-api-v2/schemas/watchListControllerGetUserWatchListsParams';
import { WatchlistAggregated } from '@/api/tmrev-api-v2/schemas';

const pageSize = 10;

type AddToListSearchParams = {
	movieId: string;
	from: FromLocation;
};

const AddToList = () => {
	const { movieId } = useLocalSearchParams<AddToListSearchParams>();
	const [searchValue, setSearchValue] = useState('');
	const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [refreshing, setRefreshing] = useState(false);
	const router = useRouter();
	const dispatch = useAppDispatch();
	const queryClient = useQueryClient();

	const { currentUser } = useAuth({});

	const debouncedSearchTerm = useDebounce(searchValue, 500);

	const query = useMemo(() => {
		if (!currentUser) return undefined;

		const params: WatchListControllerGetUserWatchListsParams = {
			pageNumber: page,
			pageSize,
			sortBy: 'updatedAt.desc',
		};

		if (debouncedSearchTerm) {
			params.textSearch = debouncedSearchTerm;
			params.pageNumber = 1;
		}

		return params;
	}, [page, currentUser, debouncedSearchTerm]);

	const { data, isLoading, isFetching, refetch } = useWatchListControllerGetUserWatchLists(
		currentUser?.uid || '',
		query,
		{
			query: {
				enabled: !!currentUser,
			},
		}
	);

	const { mutateAsync: updateWatchList } = useWatchListControllerUpdate();

	const incrementPage = useCallback(() => {
		if (data?.totalNumberOfPages && page >= data.totalNumberOfPages) {
			return;
		}

		if (isLoading || isFetching) return;

		setPage((prev) => prev + 1);
	}, [data, page, isLoading, isFetching]);

	const handleRefresh = async () => {
		setRefreshing(true);
		setPage(1);
		await refetch();
		setRefreshing(false);
	};

	const handleAddMovie = useCallback(
		async (watchListId: string) => {
			try {
				if (!movieId) return;

				// We need to find the list to get current movies
				const listToUpdate = data?.results?.find((l) => l._id === watchListId);
				// If not in current page, we might need to fetch it. But let's assume user picks from visible lists.
				// If the list is not in the current data (unlikely if they clicked it), we would fail.
				// The UI shows lists from `data`, so it should be there.

				if (!listToUpdate) {
					// Fallback: This shouldn't happen if UI logic is correct
					throw new Error('List not found');
				}

				const currentMovies = listToUpdate.movies || [];
				// Check if movie already exists
				if (currentMovies.some((m: any) => m.tmdbID === +movieId)) {
					dispatch(showSnackbar({ message: 'Movie already in list', type: 'error' }));
					return;
				}

				const newMovies = [
					...currentMovies.map((m: any, index: number) => ({
						tmdbID: Number(m.tmdbID || m.id), // Handle potential difference in Watchlist/Movie model
						order: index,
					})),
					{
						tmdbID: Number(movieId),
						order: currentMovies.length,
					},
				];

				await updateWatchList({
					id: watchListId,
					data: {
						movies: newMovies,
					},
				});

				dispatch(showSnackbar({ message: 'Successfully Added to List', type: 'success' }));
				router.dismiss();

				// Invalidate the specific list detail query
				queryClient.invalidateQueries({
					queryKey: getWatchListControllerFindOneQueryKey(watchListId),
				});
				if (currentUser) {
					queryClient.invalidateQueries({
						queryKey: getWatchListControllerGetUserWatchListsQueryKey(currentUser.uid),
					});
				}
			} catch (error: any) {
				setSnackbarMessage(error?.response?.data?.error || 'Failed to add movie to list');
			}
		},
		[movieId, updateWatchList, router, dispatch, data, queryClient, currentUser]
	);

	// Combine data for list is no longer needed since we use data.results directly

	const listData = useMemo(() => {
		return data?.results || [];
	}, [data]);

	return (
		<>
			<Stack.Screen
				options={{
					headerTitle: 'Add to List',
					headerLargeTitle: true,
				}}
			/>
			<View style={{ flex: 1 }}>
				<Searchbar
					placeholder="Search for list"
					onChangeText={setSearchValue}
					value={searchValue}
					style={{ margin: 16 }}
				/>
				{data ? (
					<VirtualizedList
						data={listData}
						renderItem={({ item }: { item: WatchlistAggregated }) => (
							<MovieListItem
								onPress={() => handleAddMovie(item._id)}
								item={item}
								touchableRippleStyle={{ paddingHorizontal: 16, marginVertical: 4 }}
							/>
						)}
						keyExtractor={(item: WatchlistAggregated) => item._id}
						getItemCount={(items) => items.length}
						getItem={(items, index) => items[index]}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
						onEndReached={incrementPage}
						ListFooterComponent={<ListFooter isLoading={isLoading || isFetching} />}
					/>
				) : (
					<ActivityIndicator />
				)}
			</View>
			<Snackbar
				visible={!!snackbarMessage}
				onDismiss={() => setSnackbarMessage(null)}
				action={{
					label: 'Close',
					onPress: () => {
						setSnackbarMessage(null);
					},
				}}
			>
				{snackbarMessage}
			</Snackbar>
		</>
	);
};

const ListFooter = ({ isLoading }: { isLoading: boolean }) => {
	if (isLoading) {
		return <ActivityIndicator />;
	}
	return null;
};

export default AddToList;
