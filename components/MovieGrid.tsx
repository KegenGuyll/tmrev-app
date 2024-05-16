import React from 'react';
import { FlatGrid } from 'react-native-super-grid';
import { Text, StyleSheet } from 'react-native';
import { TouchableRipple } from 'react-native-paper';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import MoviePoster from '@/components/MoviePoster';
import { FromLocation } from '@/models';

type MovieGridProps = {
	movies: MovieGeneral[];
	isLoading: boolean;
	onEndReached: () => void;
	onEndReachedThreshold: number;
	posterPath: FromLocation;
	onPress?: (item: MovieGeneral) => void;
};

const MovieGrid: React.FC<MovieGridProps> = ({
	movies,
	isLoading,
	onEndReached,
	onEndReachedThreshold,
	posterPath,
	onPress,
}: MovieGridProps) => {
	return (
		<>
			{isLoading && <Text>Loading...</Text>}
			{movies && (
				<FlatGrid
					itemDimension={100}
					style={styles.list}
					data={movies}
					spacing={8}
					renderItem={({ item }) => {
						if (onPress) {
							return (
								<TouchableRipple onPress={() => onPress(item)}>
									<MoviePoster
										clickable={false}
										movieId={item.id}
										moviePoster={item.poster_path}
										location={posterPath}
									/>
								</TouchableRipple>
							);
						}

						return (
							<MoviePoster movieId={item.id} moviePoster={item.poster_path} location={posterPath} />
						);
					}}
					keyExtractor={(item, i) => `${item.id}-${i}`}
					onEndReached={onEndReached}
					onEndReachedThreshold={onEndReachedThreshold}
				/>
			)}
		</>
	);
};

export default MovieGrid;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	list: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
});
