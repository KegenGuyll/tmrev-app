/* eslint-disable react-native/no-color-literals */
import {
	BottomSheetHandleProps,
	BottomSheetModal,
	BottomSheetVirtualizedList,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Searchbar } from 'react-native-paper';
import { RefreshControl, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import {
	getWatchListControllerFindOneQueryKey,
	getWatchListControllerGetUserWatchListsQueryKey,
	useWatchListControllerGetUserWatchLists,
	useWatchListControllerUpdate,
} from '@/api/tmrev-api-v2/endpoints';
import { WatchListControllerGetUserWatchListsParams } from '@/api/tmrev-api-v2/schemas/watchListControllerGetUserWatchListsParams';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import CustomBackground from '@/components/CustomBottomSheetBackground';
import MovieListItem from '@/components/MovieList/MovieListItem';
import TitledHandledComponent from '@/components/BottomSheetModal/TitledHandledComponent';
import CreateWatchListModal from '@/components/CreateWatchListModal';
import useDebounce from '@/hooks/useDebounce';

type AddMovieToListProps = {
	visible: boolean;
	onDismiss: () => void;
	onSuccess?: () => void;
	onError?: (message?: string) => void;
	selectedMovie: MovieGeneral | null;
};

const pageSize = 10;

const AddMovieToList: React.FC<AddMovieToListProps> = ({
	visible,
	onDismiss,
	selectedMovie,
	onSuccess,
	onError,
}: AddMovieToListProps) => {
	const [movies, setMovies] = useState<MovieGeneral[]>([]);
	const [searchValue, setSearchValue] = useState('');
	const [openCreateModal, setOpenCreateModal] = useState(false);
	const bottomSheetModalAddMoviesRef = useRef<BottomSheetModal>(null);
	const [page, setPage] = useState(1);
	const [refreshing, setRefreshing] = useState(false);
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

	useEffect(() => {
		if (visible) {
			bottomSheetModalAddMoviesRef.current?.present();
		} else {
			bottomSheetModalAddMoviesRef.current?.dismiss();
		}
	}, [visible]);

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
				if (!selectedMovie) return;

				const listToUpdate = data?.results?.find((l) => l._id === watchListId);

				if (!listToUpdate) {
					throw new Error('List not found');
				}

				const currentMovies = listToUpdate.movies || [];
				if (
					currentMovies.some((m: any) => {
						const id = Number(m.tmdbID || m.id);
						return id === selectedMovie.id;
					})
				) {
					if (onError) onError('Movie already in list');
					return;
				}

				const newMovies = [
					...currentMovies.map((m: any, index: number) => ({
						tmdbID: Number(m.tmdbID || m.id),
						order: index,
					})),
					{
						tmdbID: Number(selectedMovie.id),
						order: currentMovies.length,
					},
				];

				await updateWatchList({
					id: watchListId,
					data: {
						movies: newMovies,
					},
				});

				// Invalidate the specific list detail query
				queryClient.invalidateQueries({
					queryKey: getWatchListControllerFindOneQueryKey(watchListId),
				});
				if (currentUser) {
					queryClient.invalidateQueries({
						queryKey: getWatchListControllerGetUserWatchListsQueryKey(currentUser.uid),
					});
				}

				if (onSuccess) {
					onSuccess();
				}
			} catch (error: any) {
				if (onError) {
					onError(error.response?.data?.error || 'An error occurred while adding movie to list');
				}
			} finally {
				onDismiss();
			}
		},
		[selectedMovie, data, updateWatchList, queryClient, currentUser, onError, onSuccess, onDismiss]
	);

	const renderHandleComponent = useCallback(
		(props: BottomSheetHandleProps) => (
			<TitledHandledComponent
				cancelButton={{ title: 'Cancel', onPress: onDismiss }}
				submitButton={{ title: 'Create List', onPress: () => setOpenCreateModal(true) }}
				title="Add to List"
				{...props}
			/>
		),
		[onDismiss]
	);

	return (
		<>
			<BottomSheetModal
				stackBehavior="push"
				handleComponent={renderHandleComponent}
				handleIndicatorStyle={{ backgroundColor: 'white' }}
				backgroundComponent={CustomBackground}
				ref={bottomSheetModalAddMoviesRef}
				snapPoints={['95%']}
				onChange={(index) => {
					if (index === -1) {
						onDismiss();
					}
				}}
			>
				{data && (
					<BottomSheetVirtualizedList
						ListHeaderComponent={
							<Searchbar
								onChangeText={(text) => {
									setSearchValue(text);
									setPage(1);
								}}
								value={searchValue}
								placeholder="Search for list..."
							/>
						}
						getItem={(d, index) => d[index]}
						getItemCount={() => data.results?.length || 0}
						refreshControl={
							<RefreshControl tintColor="white" refreshing={refreshing} onRefresh={handleRefresh} />
						}
						data={data.results || []}
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
						ListFooterComponent={<ListFooter isLoading={isLoading || isFetching} />}
					/>
				)}
			</BottomSheetModal>
			<CreateWatchListModal
				open={openCreateModal}
				handleClose={() => setOpenCreateModal(false)}
				movies={movies}
				setMovies={setMovies}
				onSuccess={() => setOpenCreateModal(false)}
			/>
		</>
	);
};

const ListFooter = ({ isLoading }: { isLoading: boolean }) => {
	if (isLoading) {
		return (
			<View>
				<ActivityIndicator />
			</View>
		);
	}

	return null;
};

export default AddMovieToList;
