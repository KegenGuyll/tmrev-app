import { View, Image, StyleSheet, TouchableHighlight, ImageStyle, StyleProp } from 'react-native';
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
	isSelected?: boolean;
	onPress?: () => void;
};

type MoviePosterStyleProps = {
	height?: number;
	width?: number;
};

type MoviePosterImageSize = 92 | 154 | 185 | 342 | 500 | 780 | 'original';

type MoviePosterImageProps = {
	moviePoster: string | null | undefined;
	height?: number;
	width?: number;
	style?: StyleProp<ImageStyle>;
	isSelected?: boolean;
	posterSize?: MoviePosterImageSize;
};

export const MoviePosterImage: React.FC<MoviePosterImageProps> = ({
	moviePoster,
	height,
	width,
	style,
	isSelected,
	posterSize = 342,
}: MoviePosterImageProps) => {
	const styles = makeStyles({ height, width });

	if (moviePoster) {
		return (
			<Image
				style={[styles.moviePoster, style, isSelected && styles.selected]}
				source={{ uri: imageUrl(moviePoster, posterSize) }}
			/>
		);
	}

	return (
		<Image
			style={[styles.moviePoster, style, isSelected && styles.selected]}
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
	isSelected,
	onPress,
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
				<MoviePosterImage
					isSelected={isSelected}
					moviePoster={moviePoster}
					height={height}
					width={width}
				/>
			</View>
		);
	}

	return (
		<TouchableHighlight
			onLongPress={handleLongPress}
			onPress={() => {
				if (onPress) {
					onPress();
				} else {
					router.navigate(movieDetailsRoute(location, movieId));
				}
			}}
		>
			<View>
				<MoviePosterImage
					isSelected={isSelected}
					moviePoster={moviePoster}
					height={height}
					width={width}
				/>
			</View>
		</TouchableHighlight>
	);
};

export default MoviePoster;

const makeStyles = ({ height = 175, width = 100 }: MoviePosterStyleProps) =>
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
		selected: {
			borderColor: 'red',
			borderWidth: 2,
		},
	});
