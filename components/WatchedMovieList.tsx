import { View, StyleSheet } from 'react-native';
import { Icon, Text, useTheme } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import React from 'react';
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

const WatchedMovieList: React.FC<WatchedMovieListProps> = ({
	userId,
	from,
}: WatchedMovieListProps) => {
	if (!userId) return null;

	const { data, isLoading } = useGetWatchedQuery(userId, { skip: !userId });

	if (isLoading && !data) {
		return <Text>Loading...</Text>;
	}

	if (!data) return null;

	return (
		<View>
			<FlatGrid
				itemDimension={100}
				style={styles.list}
				data={data.body}
				spacing={8}
				renderItem={({ item }) => <WatchedMovieItem item={item} from={from} />}
				keyExtractor={(item) => item._id}
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
