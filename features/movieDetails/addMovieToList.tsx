/* eslint-disable react-native/no-color-literals */
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { FlatGrid } from 'react-native-super-grid';
import { RefreshControl, View } from 'react-native';
import { useAddMovieToWatchListMutation, useGetUserWatchListsQuery } from '@/redux/api/tmrev';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import CustomBackground from '@/components/CustomBottomSheetBackground';
import MovieListItem from '@/components/MovieList/MovieListItem';
import TitledHandledComponent from '@/components/BottomSheetModal/TitledHandledComponent';
import CreateWatchListModal from '@/components/CreateWatchListModal';

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
	const [openCreateModal, setOpenCreateModal] = useState(false);
	const bottomSheetModalAddMoviesRef = useRef<BottomSheetModal>(null);
	const [page, setPage] = useState(0);
	const [refreshing, setRefreshing] = useState(false);

	const { currentUser } = auth();

	const query = useMemo(() => {
		if (!currentUser) return { pageNumber: page, pageSize };

		return { pageNumber: page, userId: currentUser?.uid, pageSize };
	}, [page, currentUser]);

	const { data, isLoading, refetch, isFetching } = useGetUserWatchListsQuery(query, {
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
		await refetch().unwrap();
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
				<BottomSheetView>
					{data && data.success && data.body && (
						<FlatGrid
							refreshControl={
								<RefreshControl
									tintColor="white"
									refreshing={refreshing}
									onRefresh={handleRefresh}
								/>
							}
							itemDimension={400}
							spacing={8}
							data={[...data.body.emptyWatchlists, ...data.body.watchlists]}
							renderItem={({ item }) => (
								<MovieListItem onPress={() => handleAddMovie(item._id)} item={item} />
							)}
							keyExtractor={(item) => item._id}
							onEndReachedThreshold={1}
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
				</BottomSheetView>
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
