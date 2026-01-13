import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { RefreshControl, View } from 'react-native';
import { IconButton, ActivityIndicator, Searchbar } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import useAuth from '@/hooks/useAuth';
import { FromLocation } from '@/models';
import MovieListItem from '@/components/MovieList/MovieListItem';
import useDebounce from '@/hooks/useDebounce';
import { createListRoute } from '@/constants/routes';
import {
	useWatchListControllerGetUserWatchLists,
	WatchlistAggregated,
	WatchListControllerGetUserWatchListsParams,
} from '@/api/tmrev-api-v2';

type AllListsSearchParams = {
	profileId: string;
	from: FromLocation;
};

const pageSize = 20;

// Extract header right component to avoid inline component definition
const CreateListButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
	<View style={{ display: 'flex', flexDirection: 'row' }}>
		<IconButton onPress={onPress} icon="plus" size={24} />
	</View>
);

// Extract footer component to avoid inline component definition
const ListFooter: React.FC<{ isLoading: boolean; isFetching: boolean }> = ({
	isLoading,
	isFetching,
}) => {
	if (isLoading || isFetching) {
		return (
			<View>
				<ActivityIndicator />
			</View>
		);
	}
	return null;
};

const AllListsPage: React.FC = () => {
	const [fullData, setFullData] = useState<WatchlistAggregated[]>([]);
	const { profileId, from } = useLocalSearchParams<AllListsSearchParams>();
	const [page, setPage] = useState(1);
	const [searchValue, setSearchValue] = useState('');

	const debouncedSearchTerm = useDebounce(searchValue, 500);

	const query: WatchListControllerGetUserWatchListsParams = useMemo(() => {
		return {
			pageNumber: page,
			userId: profileId,
			pageSize,
			sortBy: 'updatedAt.desc',
			textSearch: debouncedSearchTerm,
		};
	}, [page, profileId, debouncedSearchTerm]);

	const [refreshing, setRefreshing] = useState(false);

	const { data, isLoading, isFetching, refetch } = useWatchListControllerGetUserWatchLists(
		profileId!,
		query,
		{
			query: {
				enabled: !!profileId,
			},
		}
	);

	const { currentUser } = useAuth({});

	const isCurrentUser = useMemo(() => currentUser?.uid === profileId, [currentUser, profileId]);

	// Reset fullData when search term changes
	useEffect(() => {
		setFullData([]);
		setPage(1);
	}, [debouncedSearchTerm]);

	// Update fullData when new data arrives
	useEffect(() => {
		if (data?.results) {
			if (page === 1) {
				// Replace data on first page or after search
				setFullData(data.results);
			} else {
				// Append data for subsequent pages
				setFullData((prev) => {
					const existingIds = new Set(prev.map((item) => item._id));
					const newItems = (data.results || []).filter((item) => !existingIds.has(item._id));
					return [...prev, ...newItems];
				});
			}
		}
	}, [data, page]);

	const handleRefresh = async () => {
		setRefreshing(true);
		setFullData([]);
		setPage(1);
		await refetch();
		setRefreshing(false);
	};

	const loadNextPage = useCallback(() => {
		if (!isFetching && data && data.totalNumberOfPages && page < data.totalNumberOfPages) {
			setPage((prevPage) => prevPage + 1);
		}
	}, [data, page, isFetching]);

	const handleOpenBottomSheet = () => {
		router.push(createListRoute(from!));
	};

	const headerRight = useCallback(() => {
		return isCurrentUser ? <CreateListButton onPress={handleOpenBottomSheet} /> : null;
	}, [isCurrentUser, from]);

	return (
		<>
			<Stack.Screen
				options={{
					title: 'All Lists',
					headerRight,
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
				data={fullData}
				renderItem={({ item }) => (
					<MovieListItem
						touchableRippleStyle={{ marginTop: 8 }}
						item={item}
						profileId={profileId!}
						from={from!}
					/>
				)}
				keyExtractor={(item) => item._id}
				onEndReachedThreshold={0.5}
				onEndReached={loadNextPage}
				ListFooterComponent={<ListFooter isLoading={isLoading} isFetching={isFetching} />}
			/>
		</>
	);
};

export default AllListsPage;
