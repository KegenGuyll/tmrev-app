import { View, Image, StyleSheet, TouchableHighlight } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

import imageUrl from '@/utils/imageUrl';
import { PosterPath } from '@/models';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setMoviePosterQuickActionData, setVisibility } from '@/redux/slice/bottomSheet';

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
	const dispatch = useAppDispatch();

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

	const handleLongPress = () => {
		dispatch(setVisibility(true));
		dispatch(setMoviePosterQuickActionData({ movieId, moviePoster }));
	};

	return (
		<TouchableHighlight
			onLongPress={handleLongPress}
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
		container: {
			flex: 1,
			padding: 24,
			backgroundColor: 'grey',
		},
		contentContainer: {
			flex: 1,
			alignItems: 'center',
			backgroundColor: '#121212',
		},
	});
