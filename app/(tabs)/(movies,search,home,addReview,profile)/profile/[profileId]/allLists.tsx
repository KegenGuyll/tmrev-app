import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, View } from 'react-native';
import { IconButton, Text, ActivityIndicator, Searchbar } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import useAuth from '@/hooks/useAuth';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import CreateWatchListModal from '@/components/CreateWatchListModal';
import { useGetUserWatchListsQuery } from '@/redux/api/tmrev';
import { FromLocation } from '@/models';
import MovieListItem from '@/components/MovieList/MovieListItem';
import { GetUserWatchListPayload } from '@/models/tmrev/watchList';
import useDebounce from '@/hooks/useDebounce';

type AllListsSearchParams = {
	profileId: string;
	from: FromLocation;
};

const pageSize = 10;

const AllListsPage: React.FC = () => {
	const { profileId, from } = useLocalSearchParams<AllListsSearchParams>();
	const [page, setPage] = useState(0);
	const [searchValue, setSearchValue] = useState('');

	const debouncedSearchTerm = useDebounce(searchValue, 500);

	const query: GetUserWatchListPayload = useMemo(() => {
		return {
			pageNumber: page,
			userId: profileId,
			pageSize,
			sort_by: 'updatedAt.desc',
			textSearch: debouncedSearchTerm,
		};
	}, [page, profileId, debouncedSearchTerm]);

	const [refreshing, setRefreshing] = useState(false);
	const [movies, setMovies] = useState<MovieGeneral[]>([]);
	const [openCreateModal, setOpenCreateModal] = useState(false);

	const { data, isLoading, isFetching } = useGetUserWatchListsQuery(query, {
		skip: !profileId,
	});

	const { currentUser } = useAuth({});

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
				ListHeaderComponent={
					<View style={{ marginTop: 8 }}>
						<Searchbar
							onChangeText={(text) => setSearchValue(text)}
							value={searchValue}
							placeholder="Search for list..."
						/>
					</View>
				}
				refreshControl={
					<RefreshControl tintColor="white" refreshing={refreshing} onRefresh={handleRefresh} />
				}
				spacing={0}
				itemDimension={400}
				data={[...data.body.watchlists, ...data.body.emptyWatchlists]}
				renderItem={({ item }) => (
					<MovieListItem
						touchableRippleStyle={{ marginTop: 8 }}
						item={item}
						profileId={profileId!}
						from={from!}
					/>
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
