import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Chip, IconButton, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, StyleSheet, Share, ScrollView, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useEffect } from 'react';
import {
	useGetMovieCreditsQuery,
	useGetMovieDetailsQuery,
	useGetMovieReleaseDatesQuery,
} from '@/redux/api/tmdb/movieApi';
import imageUrl from '@/utils/imageUrl';
import formatDateYear from '@/utils/formatDateYear';
import { formatRuntime, numberShortHand, roundWithMaxPrecision } from '@/utils/common';
import ISO3166_1 from '@/models/tmdb/ISO3166-1';
import ActorPlaceholderImage from '@/components/ActorPlacholderImage';
import { PosterPath } from '@/models';
import { useGetAllReviewsQuery } from '@/redux/api/tmrev';

type MovieDetailsParams = {
	movieId: string;
	from?: PosterPath;
};

const MovieDetails = () => {
	const slug: MovieDetailsParams = useLocalSearchParams();
	const router = useRouter();
	const { dismissAll } = useBottomSheetModal();
	const { data: movieReviews } = useGetAllReviewsQuery({ movie_id: Number(slug.movieId) });

	useEffect(() => {
		dismissAll();
	}, []);

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
							uri: imageUrl(movieData.backdrop_path as string),
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
							<Text>{movieReviews?.body.likes}</Text>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }}>
							<IconButton icon="thumb-down-outline" />
							<Text>{movieReviews?.body.dislikes}</Text>
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
						{movieReviews?.body.avgScore && (
							<Chip icon="star">
								<Text>{roundWithMaxPrecision(movieReviews?.body.avgScore?.totalScore, 1)}</Text>
							</Chip>
						)}
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
							<Text>REVIEW MOVIE</Text>
						</Button>
						<Button mode="outlined">
							<Text>ADD TO LIST</Text>
						</Button>
					</View>
					<Button
						onPress={() =>
							router.push(
								`/(tabs)/(${slug.from})/reviews/${slug.movieId}?from=${slug.from}&title=${movieData.title}` as any
							)
						}
						mode="outlined"
					>
						<Text>View All Reviews</Text>
					</Button>
					<View style={{ flexDirection: 'row', marginBottom: 8 }}>
						{movieCredits?.cast && (
							<FlatList
								horizontal
								showsHorizontalScrollIndicator={false}
								data={movieCredits?.cast}
								keyExtractor={(item) => item.id.toString()}
								renderItem={({ item }) => (
									<Link
										style={{ marginRight: 8 }}
										href={
											`/(tabs)/(${slug.from ?? 'movies'})/person/${item.id}?from=${slug.from}` as any
										}
									>
										<View
											style={{
												marginRight: 8,
												borderRadius: 4,
												gap: 8,
											}}
										>
											<ActorPlaceholderImage
												profile_url={item.profile_path}
												department={item.known_for_department}
												height={175}
												width={150}
											/>
											<Text variant="labelLarge">{item.name}</Text>
											<Text>{`${item.character || item.known_for_department}`}</Text>
										</View>
									</Link>
								)}
							/>
						)}
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
