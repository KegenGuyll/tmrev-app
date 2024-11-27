import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, View, VirtualizedList } from 'react-native';
import { ActivityIndicator, Searchbar, Snackbar } from 'react-native-paper';
import useAuth from '@/hooks/useAuth';
import useDebounce from '@/hooks/useDebounce';
import { GetUserWatchListPayload } from '@/models/tmrev/watchList';
import { useAddMovieToWatchListMutation, useGetUserWatchListsQuery } from '@/redux/api/tmrev';
import { FromLocation } from '@/models';
import MovieListItem from '@/components/MovieList/MovieListItem';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { showSnackbar } from '@/redux/slice/globalSnackbar';

const pageSize = 10;

type AddToListSearchParams = {
	movieId: string;
	from: FromLocation;
};

const AddToList = () => {
	const { movieId } = useLocalSearchParams<AddToListSearchParams>();
	const [searchValue, setSearchValue] = useState('');
	const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
	const [page, setPage] = useState(0);
	const [refreshing, setRefreshing] = useState(false);
	const router = useRouter();
	const dispatch = useAppDispatch();

	const { currentUser } = useAuth({});

	const debouncedSearchTerm = useDebounce(searchValue, 500);

	const query: GetUserWatchListPayload = useMemo(() => {
		if (!currentUser) return { pageNumber: page, pageSize, sort_by: 'updatedAt.desc' };

		if (debouncedSearchTerm) {
			setPage(0);
			return {
				pageNumber: 0,
				userId: currentUser?.uid,
				pageSize,
				textSearch: debouncedSearchTerm,
				sort_by: 'updatedAt.desc',
			};
		}

		return { pageNumber: page, userId: currentUser?.uid, pageSize, sort_by: 'updatedAt.desc' };
	}, [page, currentUser, debouncedSearchTerm]);

	const { data, isLoading, isFetching } = useGetUserWatchListsQuery(query, {
		skip: !currentUser,
	});

	const [addMovie] = useAddMovieToWatchListMutation();

	const incrementPage = useCallback(() => {
		if (page === data?.body.totalNumberOfPages) {
			return;
		}

		if (isLoading) return;

		setPage(page + 1);
	}, [data, page]);

	const handleRefresh = async () => {
		setRefreshing(true);
		setPage(0);
		setRefreshing(false);
	};

	const handleAddMovie = useCallback(
		async (watchListId: string) => {
			try {
				if (!movieId) return;

				await addMovie({
					data: {
						id: +movieId,
					},
					listId: watchListId,
				}).unwrap();

				dispatch(showSnackbar({ message: 'Successfully Added to List', type: 'success' }));
				router.dismiss();
			} catch (error: any) {
				setSnackbarMessage(error?.data?.error || 'Failed to add movie to list');
			}
		},
		[movieId, addMovie, router]
	);

	return (
		<>
			<Stack.Screen options={{ title: 'Add To List', headerRight: () => null }} />
			<View>
				{data && data.success && data.body && (
					<VirtualizedList
						ListHeaderComponent={
							<Searchbar
								onChangeText={(text) => setSearchValue(text)}
								value={searchValue}
								placeholder="Search for list..."
							/>
						}
						getItem={(d, index) => d[index]}
						getItemCount={() => data.body.watchlists.length + data.body.emptyWatchlists.length}
						refreshControl={
							<RefreshControl tintColor="white" refreshing={refreshing} onRefresh={handleRefresh} />
						}
						data={[...data.body.emptyWatchlists, ...data.body.watchlists]}
						contentContainerStyle={{ padding: 8 }}
						renderItem={({ item }) => (
							<MovieListItem
								touchableRippleStyle={{ marginTop: 8 }}
								onPress={() => handleAddMovie(item._id)}
								item={item}
							/>
						)}
						keyExtractor={(item) => item._id}
						onEndReached={incrementPage}
						ListFooterComponent={() => {
							if (isLoading || isFetching) {
								return (
									<View>
										<ActivityIndicator />
									</View>
								);
							}

							return null;
						}}
					/>
				)}
			</View>
			<Snackbar visible={!!snackbarMessage} onDismiss={() => setSnackbarMessage(null)}>
				{snackbarMessage}
			</Snackbar>
		</>
	);
};

export default AddToList;
