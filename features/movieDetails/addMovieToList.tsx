/* eslint-disable react-native/no-color-literals */
import { BottomSheetModal, BottomSheetVirtualizedList } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Searchbar } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { RefreshControl, View } from 'react-native';
import { useAddMovieToWatchListMutation, useGetUserWatchListsQuery } from '@/redux/api/tmrev';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import CustomBackground from '@/components/CustomBottomSheetBackground';
import MovieListItem from '@/components/MovieList/MovieListItem';
import TitledHandledComponent from '@/components/BottomSheetModal/TitledHandledComponent';
import CreateWatchListModal from '@/components/CreateWatchListModal';
import { GetUserWatchListPayload } from '@/models/tmrev/watchList';
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
	const [page, setPage] = useState(0);
	const [refreshing, setRefreshing] = useState(false);

	const { currentUser } = auth();

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

	useEffect(() => {
		if (visible) {
			bottomSheetModalAddMoviesRef.current?.present();
		} else {
			bottomSheetModalAddMoviesRef.current?.dismiss();
		}
	}, [visible]);

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
				if (!selectedMovie) return;

				await addMovie({
					data: {
						id: selectedMovie.id,
					},
					listId: watchListId,
				}).unwrap();

				if (onSuccess) {
					onSuccess();
				}
			} catch (error: any) {
				if (onError) {
					onError(
						(error.data && error.data.error) || 'An error occurred while adding movie to list'
					);
				}
			} finally {
				onDismiss();
			}
		},
		[selectedMovie]
	);

	return (
		<>
			<BottomSheetModal
				stackBehavior="push"
				handleComponent={({ ...props }) => (
					<TitledHandledComponent
						cancelButton={{ title: 'Cancel', onPress: onDismiss }}
						submitButton={{ title: 'Create List', onPress: () => setOpenCreateModal(true) }}
						title="Add to List"
						{...props}
					/>
				)}
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
				{data && data.success && data.body && (
					<BottomSheetVirtualizedList
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

export default AddMovieToList;
