import { View, Image, StyleSheet, TouchableHighlight } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

import imageUrl from '@/utils/imageUrl';
import { FromLocation } from '@/models';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setMoviePosterQuickActionData, setVisibility } from '@/redux/slice/bottomSheet';
import { movieDetailsRoute } from '@/constants/routes';

type MoviePosterProps = {
	movieId: number;
	moviePoster: string | null | undefined;
	height?: number;
	width?: number;
	clickable?: boolean;
	location: FromLocation;
};

type MoviePosterStyleProps = {
	height?: number;
	width?: number;
};

type MoviePosterImageProps = {
	moviePoster: string | null | undefined;
	height?: number;
	width?: number;
	style?: any;
};

export const MoviePosterImage: React.FC<MoviePosterImageProps> = ({
	moviePoster,
	height,
	width,
	style,
}: MoviePosterImageProps) => {
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
			style={{ ...styles({ height, width }).moviePoster, ...style }}
			source={require('@/assets/images/movie-poster-placeholder.jpg')}
		/>
	);
};

const MoviePoster: React.FC<MoviePosterProps> = ({
	movieId,
	moviePoster,
	height,
	width,
	location,
	clickable = true,
}: MoviePosterProps) => {
	const router = useRouter();
	const dispatch = useAppDispatch();

	const handleLongPress = () => {
		dispatch(setVisibility(true));
		dispatch(setMoviePosterQuickActionData({ movieId, moviePoster }));
	};

	if (!clickable) {
		return (
			<View>
				<MoviePosterImage moviePoster={moviePoster} height={height} width={width} />
			</View>
		);
	}

	return (
		<TouchableHighlight
			onLongPress={handleLongPress}
			onPress={() => {
				router.push(movieDetailsRoute(location, movieId));
			}}
		>
			<View>
				<MoviePosterImage moviePoster={moviePoster} height={height} width={width} />
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
			borderWidth: 1,
			borderColor: 'grey',
			flexShrink: 0,
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
