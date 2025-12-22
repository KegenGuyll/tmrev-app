import { View, StyleSheet, RefreshControl } from 'react-native';
import { ActivityIndicator, Icon, Text, useTheme } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import React, { useCallback, useMemo, useState } from 'react';
import {
	useWatchedControllerFindByUserId,
	WatchedAggregated,
	WatchedControllerFindByUserIdParams,
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
				movieId={item.tmdbId}
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

	const [page, setPage] = useState(1);

	const query = useMemo<WatchedControllerFindByUserIdParams>(() => {
		return { pageNumber: page, pageSize, sortBy: 'watchedDate.desc' };
	}, [page]);

	const { data, isLoading, isFetching, refetch } = useWatchedControllerFindByUserId(userId, query, {
		query: { enabled: !!userId },
	});

	const incrementPage = useCallback(() => {
		if (!data) return;

		if (page >= (data.totalNumberOfPages || 0)) {
			return;
		}

		setPage(page + 1);
	}, [data, page]);

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		await refetch();
		setIsRefreshing(false);
	}, [setIsRefreshing, refetch]);

	const renderFooter = useCallback(() => {
		if (isLoading || isFetching) {
			return (
				<View>
					<ActivityIndicator />
				</View>
			);
		}

		return null;
	}, [isLoading, isFetching]);

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
				data={data.results || []}
				spacing={8}
				renderItem={({ item }) => <WatchedMovieItem item={item} from={from} />}
				keyExtractor={(item) => item._id}
				onEndReached={incrementPage}
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
