import {
	View,
	Image,
	StyleSheet,
	TouchableHighlight,
	ImageStyle,
	StyleProp,
	GestureResponderEvent,
} from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

import { Text, useTheme } from 'react-native-paper';
import imageUrl from '@/utils/imageUrl';
import { FromLocation } from '@/models';
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
	rankedPosition?: number;
	onLongPress?: ((event: GestureResponderEvent) => void) | undefined;
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
	rankedPosition?: number;
};

type RankedNumberOverlayProps = {
	children: React.ReactNode;
	rankedPosition: number;
};

const RankedNumberOverlay: React.FC<RankedNumberOverlayProps> = ({
	children,
	rankedPosition,
}: RankedNumberOverlayProps) => {
	const theme = useTheme();
	return (
		<View style={{ position: 'relative' }}>
			<View
				style={{
					position: 'absolute',
					display: 'flex',
					alignItems: 'center',
					bottom: -8,
					right: 0,
					left: 0,
					zIndex: 999,
					justifyContent: 'center',
					margin: 'auto',
				}}
			>
				<View
					style={{
						backgroundColor: theme.colors.background,
						borderRadius: 100,
						paddingVertical: 2,
						paddingHorizontal: 4,
						width: 32,
						height: 32,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Text style={{ color: theme.colors.onBackground }} variant="labelLarge">
						{rankedPosition}
					</Text>
				</View>
			</View>
			{children}
		</View>
	);
};

export const MoviePosterImage: React.FC<MoviePosterImageProps> = ({
	moviePoster,
	height,
	width,
	style,
	isSelected,
	posterSize = 342,
	rankedPosition,
}: MoviePosterImageProps) => {
	const styles = makeStyles({ height, width });

	if (rankedPosition && moviePoster) {
		return (
			<RankedNumberOverlay rankedPosition={rankedPosition}>
				<Image
					style={[styles.moviePoster, style, isSelected && styles.selected]}
					source={{ uri: imageUrl(moviePoster, posterSize) }}
				/>
			</RankedNumberOverlay>
		);
	}

	if (moviePoster) {
		return (
			<Image
				style={[styles.moviePoster, style, isSelected && styles.selected]}
				source={{ uri: imageUrl(moviePoster, posterSize) }}
			/>
		);
	}

	if (rankedPosition) {
		return (
			<RankedNumberOverlay rankedPosition={rankedPosition}>
				<Image
					style={[styles.moviePoster, style, isSelected && styles.selected]}
					source={require('@/assets/images/movie-poster-placeholder.jpg')}
				/>
			</RankedNumberOverlay>
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
	rankedPosition,
	onLongPress,
}: MoviePosterProps) => {
	const router = useRouter();

	if (!clickable) {
		return (
			<View>
				<MoviePosterImage
					isSelected={isSelected}
					moviePoster={moviePoster}
					height={height}
					width={width}
					rankedPosition={rankedPosition}
				/>
			</View>
		);
	}

	return (
		<TouchableHighlight
			onLongPress={onLongPress}
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
					rankedPosition={rankedPosition}
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
