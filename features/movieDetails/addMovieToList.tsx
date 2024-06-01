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

type AddMovieToListProps = {
	visible: boolean;
	onDismiss: () => void;
	selectedMovie: MovieGeneral | null;
};

const pageSize = 10;

const AddMovieToList: React.FC<AddMovieToListProps> = ({
	visible,
	onDismiss,
	selectedMovie,
}: AddMovieToListProps) => {
	const bottomSheetModalAddMoviesRef = useRef<BottomSheetModal>(null);
	const [page, setPage] = useState(0);
	const [refreshing, setRefreshing] = useState(false);

	const { currentUser } = auth();

	const query = useMemo(() => {
		return { pageNumber: page, userId: currentUser!.uid, pageSize };
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

		setPage((prev) => prev + 1);
	}, [data, page]);

	const handleRefresh = async () => {
		setRefreshing(true);
		await refetch().unwrap();
		setRefreshing(false);
	};

	const handleAddMovie = useCallback(
		async (watchListId: string) => {
			if (!selectedMovie) return;

			await addMovie({
				data: {
					id: selectedMovie.id,
				},
				listId: watchListId,
			}).unwrap();

			onDismiss();
		},
		[selectedMovie]
	);

	return (
		<BottomSheetModal
			handleComponent={({ ...props }) => <TitledHandledComponent title="Add to List" {...props} />}
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
							<RefreshControl tintColor="white" refreshing={refreshing} onRefresh={handleRefresh} />
						}
						contentContainerStyle={{ height: '100%' }}
						itemDimension={400}
						spacing={8}
						data={data.body.watchlists}
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
	);
};

export default AddMovieToList;
