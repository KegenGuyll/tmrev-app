import { View, StyleSheet, RefreshControl } from 'react-native';
import { ActivityIndicator, Icon, Text, useTheme } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import React, { useCallback, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
	watchedControllerFindByUserId,
	WatchedAggregated,
	getWatchedControllerFindByUserIdQueryKey,
} from '@/api/tmrev-api-v2';
import { FromLocation } from '@/models';
import MoviePoster from './MoviePoster';

type WatchedMovieListProps = {
	userId?: string;
	from: FromLocation;
};

type WatchedMovieItemProps = {
	item: WatchedAggregated;
	from: FromLocation;
};

const WatchedMovieItem: React.FC<WatchedMovieItemProps> = ({
	item,
	from,
}: WatchedMovieItemProps) => {
	const theme = useTheme();
	return (
		<View style={{ position: 'relative' }}>
			<View
				style={{
					position: 'absolute',
					top: 8,
					right: 8,
					zIndex: 1,
					backgroundColor: theme.colors.background,
					borderRadius: 100,
					padding: 4,
				}}
			>
				{item.liked ? <Icon source="thumb-up" size={24} /> : <Icon source="thumb-down" size={24} />}
			</View>
			<MoviePoster
				movieId={item.tmdbID}
				moviePoster={item.movieDetails.poster_path}
				location={from}
			/>
		</View>
	);
};

const pageSize = 10;

const WatchedMovieList: React.FC<WatchedMovieListProps> = ({
	userId,
	from,
}: WatchedMovieListProps) => {
	if (!userId) return null;

	const [isRefreshing, setIsRefreshing] = useState(false);

	const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
		useInfiniteQuery({
			queryKey: getWatchedControllerFindByUserIdQueryKey(userId),
			queryFn: ({ pageParam = 1 }) =>
				watchedControllerFindByUserId(userId, {
					pageNumber: pageParam as number,
					pageSize,
					sortBy: 'watchedDate.desc',
				}),
			getNextPageParam: (lastPage) => {
				if (
					lastPage.pageNumber !== undefined &&
					lastPage.pageNumber < (lastPage.totalNumberOfPages || 0)
				) {
					return lastPage.pageNumber + 1;
				}
				return undefined;
			},
			initialPageParam: 1,
			enabled: !!userId,
		});

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		await refetch();
		setIsRefreshing(false);
	}, [refetch]);

	const renderFooter = useCallback(() => {
		if (isFetchingNextPage) {
			return (
				<View style={{ paddingVertical: 20 }}>
					<ActivityIndicator />
				</View>
			);
		}

		return null;
	}, [isFetchingNextPage]);

	const flatData = useMemo(() => {
		return data?.pages.flatMap((page) => page.results || []) || [];
	}, [data]);

	if (isLoading && !data) {
		return <Text>Loading...</Text>;
	}

	if (!data) return null;

	return (
		<View>
			<FlatGrid
				refreshControl={
					<RefreshControl tintColor="white" refreshing={isRefreshing} onRefresh={handleRefresh} />
				}
				itemDimension={100}
				style={styles.list}
				data={flatData}
				spacing={8}
				renderItem={({ item }) => <WatchedMovieItem item={item as WatchedAggregated} from={from} />}
				keyExtractor={(item) => item._id}
				onEndReached={() => {
					if (hasNextPage && !isFetchingNextPage) {
						fetchNextPage();
					}
				}}
				onEndReachedThreshold={0.5}
				ListFooterComponent={renderFooter}
			/>
		</View>
	);
};

export default WatchedMovieList;

const styles = StyleSheet.create({
	list: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		maxHeight: 'auto',
	},
});
