import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { RefreshControl, View } from 'react-native';
import { IconButton, Text, ActivityIndicator } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import CreateWatchListModal from '@/components/CreateWatchListModal';
import { useGetUserWatchListsQuery } from '@/redux/api/tmrev';
import { FromLocation } from '@/models';
import MovieListItem from '@/components/MovieList/MovieListItem';

type AllListsSearchParams = {
	profileId: string;
	from: FromLocation;
};

const pageSize = 10;

const AllListsPage: React.FC = () => {
	const { profileId, from } = useLocalSearchParams<AllListsSearchParams>();
	const [page, setPage] = useState(0);

	const query = useMemo(() => {
		return { pageNumber: page, userId: profileId, pageSize };
	}, [page, profileId]);

	const [refreshing, setRefreshing] = useState(false);
	const [movies, setMovies] = useState<MovieGeneral[]>([]);
	const [openCreateModal, setOpenCreateModal] = useState(false);

	const { data, isLoading, isFetching } = useGetUserWatchListsQuery(query, {
		skip: !profileId,
	});

	const { currentUser } = auth();

	const isCurrentUser = useMemo(() => currentUser?.uid === profileId, [currentUser, profileId]);

	const handleRefresh = async () => {
		setRefreshing(true);
		setPage(0);
		setRefreshing(false);
	};

	const incrementPage = useCallback(() => {
		if (page === data?.body.totalNumberOfPages) {
			return;
		}

		setPage(page + 1);
	}, [data, page]);

	const handleOpenBottomSheet = () => {
		setOpenCreateModal(true);
	};

	if (isLoading || !data) {
		return <Text>Loading...</Text>;
	}

	return (
		<>
			<Stack.Screen
				options={{
					title: 'All Lists',
					headerRight: () => {
						if (isCurrentUser) {
							return (
								<View style={{ display: 'flex', flexDirection: 'row' }}>
									<IconButton onPress={handleOpenBottomSheet} icon="plus" size={24} />
								</View>
							);
						}

						return null;
					},
				}}
			/>
			<FlatGrid
				refreshControl={
					<RefreshControl tintColor="white" refreshing={refreshing} onRefresh={handleRefresh} />
				}
				itemDimension={400}
				spacing={8}
				data={[...data.body.watchlists, ...data.body.emptyWatchlists]}
				renderItem={({ item }) => <MovieListItem item={item} profileId={profileId!} from={from!} />}
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
			<CreateWatchListModal
				handleClose={() => setOpenCreateModal(false)}
				open={openCreateModal}
				movies={movies}
				setMovies={setMovies}
			/>
		</>
	);
};

export default AllListsPage;
