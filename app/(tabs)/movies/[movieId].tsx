import { Stack, useLocalSearchParams } from 'expo-router';
import { Button, Chip, IconButton, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, StyleSheet, Share, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
	useGetMovieCreditsQuery,
	useGetMovieDetailsQuery,
	useGetMovieReleaseDatesQuery,
} from '@/redux/api/tmdb/movieApi';
import imageUrl from '@/utils/imageUrl';
import formatDateYear from '@/utils/formatDateYear';
import { formatRuntime, numberShortHand } from '@/utils/common';
import ISO3166_1 from '@/models/tmdb/ISO3166-1';

type MovieDetailsParams = {
	movieId: string;
};

const MovieDetails = () => {
	const slug: MovieDetailsParams = useLocalSearchParams();

	const {
		data: movieData,
		isFetching: movieDataIsFetching,
		isLoading: movieDataIsLoading,
	} = useGetMovieDetailsQuery({
		movie_id: Number(slug.movieId),
		params: {
			append_to_response: 'cast',
		},
	});

	const { data: movieReleaseDates } = useGetMovieReleaseDatesQuery({
		movie_id: Number(slug.movieId),
	});

	const { data: movieCredits } = useGetMovieCreditsQuery({
		movie_id: Number(slug.movieId),
		params: { language: 'en-US' },
	});

	const shareMovie = async () => {
		try {
			if (!movieData) return;
			await Share.share({
				title: movieData.title,
				message: `Check out ${movieData.title} on Movie App!`,
				url: `https://www.themoviedb.org/movie/${movieData.id}`,
			});
		} catch (error) {
			console.error(error);
		}
	};

	if (movieDataIsFetching || movieDataIsLoading || !movieData) {
		return (
			<>
				<Stack.Screen options={{ headerShown: true }} />
				<SafeAreaView>
					<Text>Loading...</Text>
				</SafeAreaView>
			</>
		);
	}

	return (
		<>
			<Stack.Screen options={{ headerShown: true, title: movieData.title }} />
			<ScrollView>
				<View style={styles.backgroundImageContainer}>
					<Image
						style={styles.backgroundImage}
						source={{
							uri: imageUrl(movieData.backdrop_path),
						}}
					/>
					<LinearGradient
						colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
						style={styles.backgroundImageOverlay}
					/>
				</View>
				<SafeAreaView style={{ gap: 16 }}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							flexWrap: 'wrap',
						}}
					>
						<Text style={{ marginRight: 8 }} variant="headlineLarge">
							{movieData.title}
						</Text>
						<Text variant="headlineSmall">{`(${formatDateYear(movieData.release_date)})`}</Text>
					</View>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'flex-start',
							gap: 8,
						}}
					>
						<Button icon="message-draw" mode="outlined">
							<Text>Review</Text>
						</Button>
						<Button onPress={shareMovie} icon="share" mode="outlined">
							<Text>Share</Text>
						</Button>
						<Button icon="plus" mode="outlined">
							<Text>WatchList</Text>
						</Button>
					</View>
					<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
							<IconButton icon="thumb-up-outline" />
							<Text>0</Text>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
							<IconButton icon="thumb-down-outline" />
							<Text>0</Text>
						</View>
					</View>
					<Surface
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							borderRadius: 4,
							flexWrap: 'wrap',
							padding: 8,
							justifyContent: 'flex-start',
							gap: 8,
						}}
					>
						{movieData.budget ? (
							<Chip icon="cash">
								<Text>{numberShortHand(movieData.budget)}</Text>
							</Chip>
						) : null}
						<Chip icon="clock-time-four-outline">
							<Text>{formatRuntime(movieData.runtime)}</Text>
						</Chip>
						{movieReleaseDates &&
							movieReleaseDates.results.find(
								(dataResults) => dataResults.iso_3166_1 === ISO3166_1.UNITED_STATES
							)?.release_dates[0].certification && (
								<Chip icon="television">
									<Text>
										{
											movieReleaseDates.results.find(
												(dataResults) => dataResults.iso_3166_1 === ISO3166_1.UNITED_STATES
											)?.release_dates[0].certification
										}
									</Text>
								</Chip>
							)}
					</Surface>
					<Surface
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							borderRadius: 4,
							flexWrap: 'wrap',
							padding: 8,
						}}
					>
						<Text variant="bodyMedium">{movieData.overview}</Text>
					</Surface>
					<View style={{ marginBottom: 8 }}>
						<Button style={{ marginBottom: 8 }} mode="contained">
							<Text style={{ color: 'black' }}>REVIEW MOVIE</Text>
						</Button>
						<Button mode="outlined">
							<Text>ADD TO LIST</Text>
						</Button>
					</View>
					<View style={{ flexDirection: 'row', marginBottom: 8 }}>
						<ScrollView
							style={{
								display: 'flex',
								flexDirection: 'row',
								gap: 10,
							}}
							horizontal
							showsHorizontalScrollIndicator
						>
							{movieCredits?.cast.map((cast) => (
								<View
									key={cast.id}
									style={{
										height: 300,
										width: 135,
										marginRight: 8,
										borderRadius: 4,
									}}
								>
									<Image
										style={{
											width: '100%',
											height: 275,
											borderRadius: 4,
											maxHeight: 150,
										}}
										source={{
											uri: imageUrl(cast.profile_path, 300),
										}}
									/>
									<Text variant="labelLarge">{cast.name}</Text>
									<Text>{`(${cast.character})`}</Text>
								</View>
							))}
						</ScrollView>
					</View>
				</SafeAreaView>
			</ScrollView>
		</>
	);
};

const styles = StyleSheet.create({
	backgroundImageContainer: {
		width: '100%',
		height: 400,
		position: 'relative',
	},
	backgroundImage: {
		width: '100%',
		height: 400,
		zIndex: 1,
	},
	backgroundImageOverlay: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		height: '100%',
		zIndex: 999,
	},
});

export default MovieDetails;
