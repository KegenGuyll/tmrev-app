import { View, Image, StyleSheet, TouchableHighlight } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';

import imageUrl from '@/utils/imageUrl';

type MoviePosterProps = {
	movie: MovieGeneral;
	height?: number;
	width?: number;
};

type MoviePosterStyleProps = {
	height?: number;
	width?: number;
};

const MoviePoster: React.FC<MoviePosterProps> = ({ movie, height, width }: MoviePosterProps) => {
	const router = useRouter();

	return (
		<TouchableHighlight
			onPress={() => {
				router.push(`/(tabs)/movies/${movie.id}`);
			}}
		>
			<View>
				<Image
					style={styles({ height, width }).moviePoster}
					source={{ uri: imageUrl(movie.poster_path as string, 200) }}
				/>
			</View>
		</TouchableHighlight>
	);
};

export default MoviePoster;

const styles = ({ height = 175, width = 100 }: MoviePosterStyleProps) =>
	StyleSheet.create({
		moviePoster: {
			width: width ?? 100,
			height: height ?? 250,
			borderRadius: 4,
			aspectRatio: 2 / 3,
		},
		previewModal: {
			backgroundColor: '#121212',
			height: '85%',
			borderRadius: 4,
		},
	});
