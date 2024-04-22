import { View, Image, StyleSheet, TouchableHighlight } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

import imageUrl from '@/utils/imageUrl';
import { PosterPath } from '@/models';

type MoviePosterProps = {
	movieId: number;
	moviePoster: string | null | undefined;
	height?: number;
	width?: number;
	location: PosterPath;
};

type MoviePosterStyleProps = {
	height?: number;
	width?: number;
};

const MoviePoster: React.FC<MoviePosterProps> = ({
	movieId,
	moviePoster,
	height,
	width,
	location,
}: MoviePosterProps) => {
	const router = useRouter();

	const moviePosterUrl = () => {
		if (moviePoster) {
			return (
				<Image
					style={styles({ height, width }).moviePoster}
					source={{ uri: imageUrl(moviePoster, 200) }}
				/>
			);
		}

		return (
			<Image
				style={styles({ height, width }).moviePoster}
				source={require('@/assets/images/movie-poster-placeholder.jpg')}
			/>
		);
	};

	return (
		<TouchableHighlight
			onPress={() => {
				router.push(`/(tabs)/(${location})/${movieId}?from=${location}`);
			}}
		>
			<View>{moviePosterUrl()}</View>
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
