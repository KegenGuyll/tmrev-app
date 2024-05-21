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
	bottomPadding?: number;
	selectedMovieIds?: number[];
	itemSpacing?: number;
	itemDimension?: number;
	imageHeight?: number;
	imageWidth?: number;
};

const MovieGrid: React.FC<MovieGridProps> = ({
	movies,
	isLoading,
	onEndReached,
	onEndReachedThreshold,
	posterPath,
	onPress,
	bottomPadding,
	selectedMovieIds,
	itemSpacing = 8,
	itemDimension = 100,
	imageHeight,
	imageWidth,
}: MovieGridProps) => {
	return (
		<>
			{isLoading && <Text>Loading...</Text>}
			{movies && (
				<FlatGrid
					itemDimension={itemDimension}
					style={styles.list}
					data={movies}
					spacing={itemSpacing}
					contentContainerStyle={{ paddingBottom: bottomPadding }}
					renderItem={({ item }) => {
						if (onPress) {
							return (
								<TouchableRipple onPress={() => onPress(item)}>
									<MoviePoster
										height={imageHeight}
										width={imageWidth}
										clickable={false}
										movieId={item.id}
										moviePoster={item.poster_path}
										location={posterPath}
										isSelected={selectedMovieIds?.includes(item.id)}
									/>
								</TouchableRipple>
							);
						}

						return (
							<MoviePoster
								height={imageHeight}
								width={imageWidth}
								isSelected={selectedMovieIds?.includes(item.id)}
								movieId={item.id}
								moviePoster={item.poster_path}
								location={posterPath}
							/>
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
