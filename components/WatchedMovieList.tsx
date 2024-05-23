import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Icon, Text, useTheme } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import React, { useCallback, useMemo, useState } from 'react';
import { useGetWatchedQuery } from '@/redux/api/tmrev';
import { FromLocation } from '@/models';
import MoviePoster from './MoviePoster';
import { Watched } from '@/models/tmrev/watched';

type WatchedMovieListProps = {
	userId?: string;
	from: FromLocation;
};

type WatchedMovieItemProps = {
	item: Watched;
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

const pageSize = 20;

const WatchedMovieList: React.FC<WatchedMovieListProps> = ({
	userId,
	from,
}: WatchedMovieListProps) => {
	if (!userId) return null;

	const [page, setPage] = useState(0);

	const query = useMemo(() => {
		return { pageNumber: page, pageSize };
	}, [page]);

	const { data, isLoading, isFetching } = useGetWatchedQuery({ userId, query }, { skip: !userId });

	const incrementPage = useCallback(() => {
		if (page === data?.body.totalNumberOfPages) {
			return;
		}

		if (isLoading) return;

		setPage((prev) => prev + 1);
	}, [data]);

	if (isLoading && !data) {
		return <Text>Loading...</Text>;
	}

	if (!data) return null;

	return (
		<View>
			<FlatGrid
				itemDimension={100}
				style={styles.list}
				data={data.body.watched}
				spacing={8}
				renderItem={({ item }) => <WatchedMovieItem item={item} from={from} />}
				keyExtractor={(item) => item._id}
				onEndReached={incrementPage}
				onEndReachedThreshold={1}
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
