import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
	Button,
	Chip,
	SegmentedButtons,
	Snackbar,
	Surface,
	Text,
	TouchableRipple,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, StyleSheet, Share, ScrollView, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import auth from '@react-native-firebase/auth';
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
import MovieRadarChart from '@/components/MovieRadarChart';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import CreateMovieReviewModal from '@/components/CreateMovieReviewModal';
import { loginRoute, movieReviewsRoute, personDetailsRoute } from '@/constants/routes';
import WatchedMovie from '@/features/movieDetails/WatchedMovie';
import AddMovieToList from '@/features/movieDetails/addMovieToList';
import { addToListLoginPrompt, reviewLoginPrompt } from '@/constants/messages';

type MovieDetailsParams = {
	movieId: string;
	from?: PosterPath;
};

const MovieDetails = () => {
	const { movieId, from } = useLocalSearchParams<MovieDetailsParams>();
	const router = useRouter();
	const { dismissAll } = useBottomSheetModal();
	const { data: movieReviews } = useGetAllReviewsQuery({ movie_id: Number(movieId) });
	const [selectedMovie, setSelectedMovie] = useState<MovieGeneral | null>(null);
	const [showAddMovieToListModal, setShowAddMovieToListModal] = useState(false);
	const [showCreateReviewModal, setShowCreateReviewModal] = useState(false);
	const [snackBarMessage, setSnackBarMessage] = useState<string | null>(null);
	const [loginMessage, setLoginMessage] = useState<string | null>(null);
	const [activeSegment, setActiveSegment] = useState('review');

	const { currentUser } = auth();

	useEffect(() => {
		dismissAll();
	}, []);

	const {
		data: movieData,
		isFetching: movieDataIsFetching,
		isLoading: movieDataIsLoading,
	} = useGetMovieDetailsQuery({
		movie_id: Number(movieId),
		params: {},
	});

	const { data: movieReleaseDates } = useGetMovieReleaseDatesQuery({
		movie_id: Number(movieId),
	});

	const { data: movieCredits } = useGetMovieCreditsQuery({
		movie_id: Number(movieId),
		params: { language: 'en-US' },
	});

	useEffect(() => {
		if (movieData) {
			setSelectedMovie(movieData);
		}
	}, [movieData]);

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

	const handleReviewMovie = () => {
		if (!currentUser) {
			setLoginMessage(reviewLoginPrompt);
			return;
		}

		setShowCreateReviewModal(true);
	};

	const handleAddToList = () => {
		if (!currentUser) {
			setLoginMessage(addToListLoginPrompt);
			return;
		}

		setShowAddMovieToListModal(true);
	};

	const handleSegmentButtons = (value: string) => {
		switch (value) {
			case 'review':
				handleReviewMovie();
				break;
			case 'watched-movie':
				handleAddToList();
				break;
			case 'share':
				shareMovie();
				break;
			case 'watchlist':
				handleAddToList();
				break;
			default:
				break;
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
			<Stack.Screen
				options={{ headerShown: true, title: movieData.title, headerRight: () => null }}
			/>
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
					<SegmentedButtons
						value={activeSegment}
						onValueChange={handleSegmentButtons}
						buttons={[
							{
								value: 'review',
								label: 'Review',
								icon: 'message-draw',
							},
							{
								value: 'watched-movie',
								label: 'Watched',
								icon: 'eye',
							},
							// {
							// 	value: 'share',
							// 	label: 'Share',
							// 	icon: 'share',
							// },
							{
								value: 'watchlist',
								label: 'WatchList',
								icon: 'plus',
							},
						]}
					/>
					{/* <View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'flex-start',
							gap: 8,
						}}
					>
						<Button onPress={handleReviewMovie} icon="message-draw" mode="outlined">
							Review
						</Button>
						<Button onPress={shareMovie} icon="share" mode="outlined">
							Share
						</Button>
						<Button onPress={handleAddToList} icon="plus" mode="outlined">
							WatchList
						</Button>
					</View> */}
					{movieReviews && (
						<WatchedMovie
							movieId={Number(movieId!)}
							likes={movieReviews?.body.likes}
							dislikes={movieReviews?.body.dislikes}
							setLoginMessage={setLoginMessage}
						/>
					)}
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
						<Chip icon="calendar">{dayjs(movieData.release_date).format('MMMM D, YYYY')}</Chip>
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
						<Button onPress={handleReviewMovie} style={{ marginBottom: 8 }} mode="contained">
							REVIEW MOVIE
						</Button>
						<Button onPress={handleAddToList} mode="outlined">
							ADD TO LIST
						</Button>
					</View>
					<Button
						onPress={() =>
							router.navigate(movieReviewsRoute(from || 'movies', String(movieId), movieData.title))
						}
						mode="outlined"
					>
						View All Reviews
					</Button>
					<MovieRadarChart reviews={movieReviews?.body.reviews || []} />
					<View style={{ flexDirection: 'row', marginBottom: 8 }}>
						{movieCredits?.cast && (
							<FlatList
								contentContainerStyle={{ gap: 8, paddingBottom: 100 }}
								horizontal
								showsHorizontalScrollIndicator={false}
								data={movieCredits?.cast}
								keyExtractor={(item) => item.id.toString()}
								renderItem={({ item }) => (
									<TouchableRipple
										style={{}}
										onPress={() =>
											router.navigate(personDetailsRoute(from || 'movies', item.id.toString()))
										}
									>
										<View
											style={{
												borderRadius: 4,
											}}
										>
											<ActorPlaceholderImage
												profile_url={item.profile_path}
												department={item.known_for_department}
												height={175}
												width={150}
											/>
											<Text
												numberOfLines={1}
												style={{ width: 150 }}
												ellipsizeMode="tail"
												variant="labelLarge"
											>
												{item.name}
											</Text>
											<Text
												numberOfLines={1}
												style={{ width: 150 }}
												ellipsizeMode="tail"
											>{`${item.character || item.known_for_department}`}</Text>
										</View>
									</TouchableRipple>
								)}
							/>
						)}
					</View>
				</SafeAreaView>
			</ScrollView>
			<AddMovieToList
				visible={showAddMovieToListModal}
				selectedMovie={selectedMovie}
				onDismiss={() => setShowAddMovieToListModal(false)}
				onError={(error) =>
					setSnackBarMessage(error || 'An error occurred while adding movie to list')
				}
				onSuccess={() => setSnackBarMessage('Movie added to list')}
			/>
			<CreateMovieReviewModal
				visible={showCreateReviewModal}
				onDismiss={() => setShowCreateReviewModal(false)}
				selectedMovie={selectedMovie}
			/>
			{snackBarMessage && (
				<Snackbar
					action={{
						label: 'Dismiss',
						onPress: () => setSnackBarMessage(null),
					}}
					visible={snackBarMessage !== null}
					onDismiss={() => setSnackBarMessage(null)}
					duration={3000}
				>
					{snackBarMessage}
				</Snackbar>
			)}
			<Snackbar
				action={{
					label: 'Login',
					onPress: () => router.navigate(loginRoute()),
				}}
				visible={!!loginMessage}
				onDismiss={() => setLoginMessage(null)}
			>
				{loginMessage}
			</Snackbar>
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
