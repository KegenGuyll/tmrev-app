import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
	Button,
	Chip,
	Snackbar,
	Surface,
	Text,
	TouchableRipple,
	useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	View,
	Image,
	StyleSheet,
	Share,
	ScrollView,
	FlatList,
	TouchableHighlight,
	RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
	useGetMovieCollectionQuery,
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
import {
	useCreateWatchListMutation,
	useGetAllReviewsQuery,
	useGetReviewsByMovieIdQuery,
} from '@/redux/api/tmrev';
import MovieRadarChart from '@/components/MovieRadarChart';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import {
	addToListRoute,
	listDetailsRoute,
	loginRoute,
	movieReviewsRoute,
	personDetailsRoute,
	reviewFunctionRoute,
} from '@/constants/routes';
import WatchedMovie from '@/features/movieDetails/WatchedMovie';
import AddMovieToList from '@/features/movieDetails/addMovieToList';
import {
	addToListLoginPrompt,
	createListFromMovieLoginPrompt,
	reviewLoginPrompt,
} from '@/constants/messages';
import useAuth from '@/hooks/useAuth';
import MovieHorizontalGrid from '@/components/MovieHorizontalGrid';
import { MovieCollectionPart } from '@/models/tmdb/movie/movieCollection';

type MovieDetailsParams = {
	movieId: string;
	from?: PosterPath;
};

const sortByReleaseDate = (a: MovieCollectionPart, b: MovieCollectionPart) => {
	if (a.release_date < b.release_date) return -1;
	if (a.release_date > b.release_date) return 1;
	return 0;
};

const MovieDetails = () => {
	const { movieId, from } = useLocalSearchParams<MovieDetailsParams>();
	const router = useRouter();
	const theme = useTheme();
	const { dismissAll } = useBottomSheetModal();
	const { data: movieReviews } = useGetAllReviewsQuery({ movie_id: Number(movieId) });
	const [selectedMovie, setSelectedMovie] = useState<MovieGeneral | null>(null);
	const [showAddMovieToListModal, setShowAddMovieToListModal] = useState(false);
	const [snackBarMessage, setSnackBarMessage] = useState<string | null>(null);
	const [loginMessage, setLoginMessage] = useState<string | null>(null);
	const [successfulListClone, setSuccessfulListClone] = useState<string | null>(null);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const [createWatchList] = useCreateWatchListMutation();

	const { currentUser } = useAuth({});

	useEffect(() => {
		dismissAll();
	}, []);

	const {
		data: movieData,
		refetch: movieDataRefetch,
		isFetching: movieDataIsFetching,
		isLoading: movieDataIsLoading,
	} = useGetMovieDetailsQuery({
		movie_id: Number(movieId),
		params: {
			append_to_response: 'collection',
		},
	});

	const { data: movieCollection, refetch: movieCollectionRefetch } = useGetMovieCollectionQuery(
		movieData?.belongs_to_collection?.id || 0,
		{
			skip: !movieData?.belongs_to_collection?.id,
		}
	);

	const { data: movieReviewsData, refetch: movieReviewsRefetch } = useGetReviewsByMovieIdQuery({
		movieId: Number(movieId),
		query: {
			pageNumber: 0,
			pageSize: 1,
			sort_by: 'createdAt.desc',
		},
	});

	const { data: movieReleaseDates, refetch: movieReleaseDatesRefetch } =
		useGetMovieReleaseDatesQuery({
			movie_id: Number(movieId),
		});

	const { data: movieCredits, refetch: movieCreditsRefetch } = useGetMovieCreditsQuery({
		movie_id: Number(movieId),
		params: { language: 'en-US' },
	});

	const onRefresh = async () => {
		setIsRefreshing(true);
		await Promise.all([
			movieDataRefetch(),
			movieCollectionRefetch(),
			movieReviewsRefetch(),
			movieReleaseDatesRefetch(),
			movieCreditsRefetch(),
		]);
		setIsRefreshing(false);
	};

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

		router.navigate(reviewFunctionRoute(from || 'addReview', Number(movieId), 'create'));
	};

	const handleCreateList = async () => {
		if (!currentUser) {
			setLoginMessage(createListFromMovieLoginPrompt);
			return;
		}

		if (!movieCollection) return;

		const response = await createWatchList({
			description: movieCollection.overview || '',
			title: movieCollection.name || '',
			public: true,
			tags: [],
			movies: movieCollection.parts
				.filter((m) => m.release_date)
				.sort(sortByReleaseDate)
				.map((m, i) => ({
					order: i,
					tmdbID: m.id,
				})),
		}).unwrap();

		setSuccessfulListClone(response._id);
	};

	const handleAddToList = () => {
		if (!currentUser) {
			setLoginMessage(addToListLoginPrompt);
			return;
		}

		if (!movieId) return;

		router.push(addToListRoute(from || 'movies', movieId));
	};

	if (movieDataIsFetching || movieDataIsLoading || !movieData || !movieReviewsData) {
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
			<ScrollView
				refreshControl={
					<RefreshControl tintColor="white" refreshing={isRefreshing} onRefresh={onRefresh} />
				}
			>
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
						<Button onPress={handleReviewMovie} icon="message-draw" mode="outlined">
							Review
						</Button>
						<Button onPress={shareMovie} icon="share" mode="outlined">
							Share
						</Button>
						<Button onPress={handleAddToList} icon="plus" mode="outlined">
							WatchList
						</Button>
					</View>
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
							gap: 4,
						}}
					>
						<Text variant="labelLarge">Overview</Text>
						<Text variant="bodyMedium">{movieData.overview}</Text>
					</Surface>
					<Surface style={{ padding: 8, borderRadius: 4 }}>
						<View
							style={{
								paddingBottom: 8,
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								gap: 4,
							}}
						>
							{movieReviewsData?.body.totalCount > 0 ? (
								<>
									<Text variant="labelLarge">Reviews</Text>
									<Text variant="bodyMedium">
										{numberShortHand(movieReviewsData?.body.totalCount)}
									</Text>
								</>
							) : (
								<Text variant="labelLarge">Be the first to review!</Text>
							)}
						</View>
						{movieReviewsData?.body.reviews.map((review) => (
							<TouchableOpacity
								key={review._id}
								onPress={() =>
									router.navigate(
										movieReviewsRoute(from || 'movies', String(movieId), movieData.title)
									)
								}
							>
								<View
									style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}
								>
									<View>
										<Image
											style={{ width: 50, height: 50, borderRadius: 100 }}
											source={{ uri: review.profile?.photoUrl }}
										/>
									</View>
									<View style={{ flex: 1 }}>
										<View
											style={{
												display: 'flex',
												flexDirection: 'row',
												alignItems: 'center',
												flexWrap: 'wrap',
											}}
										>
											<Text style={{ flexGrow: 1 }} variant="titleSmall">
												{review.title}
											</Text>
											{review.averagedAdvancedScore && (
												<Chip icon="star">
													<Text>{roundWithMaxPrecision(review.averagedAdvancedScore, 1)}</Text>
												</Chip>
											)}
										</View>
										{review.notes && <Text variant="bodyMedium">{review.notes}</Text>}
									</View>
								</View>
								{/* 
								commented out because I'm not sure how to make these look good
								<View
									style={{
										display: 'flex',
										flexDirection: 'row',
										gap: 16,
										marginTop: 12,
										justifyContent: 'flex-end',
										opacity: 0.5,
									}}
								>
									<View
										style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}
									>
										<Icon source="thumb-up" size={20} />
										<Text>{review.votes?.upVote}</Text>
									</View>
									<View
										style={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}
									>
										<Icon source="thumb-down" size={20} />
										<Text>{review.votes?.downVote}</Text>
									</View>
								</View> */}
							</TouchableOpacity>
						))}
						{movieReviewsData?.body.totalCount === 0 && currentUser && (
							<View style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
								<Image
									style={{ width: 50, height: 50, borderRadius: 100 }}
									source={{
										uri: currentUser.photoURL || require('@/assets/images/actor-placeholder.jpg'),
									}}
								/>
								<TouchableHighlight
									onPress={handleReviewMovie}
									style={{ width: '100%', flex: 1, borderRadius: 4 }}
								>
									<View
										// eslint-disable-next-line react-native/no-color-literals
										style={{
											padding: 8,
											backgroundColor: 'rgba(255, 255, 255, 0.1)',
											borderRadius: 4,
										}}
									>
										<Text style={{ color: theme.colors.onBackground }}>Leave a review</Text>
									</View>
								</TouchableHighlight>
							</View>
						)}
					</Surface>
					{/* <View style={{ marginBottom: 8 }}>
						<Button onPress={handleReviewMovie} style={{ marginBottom: 8 }} mode="contained">
							REVIEW MOVIE
						</Button>
						<Button onPress={handleAddToList} mode="outlined">
							ADD TO LIST
						</Button>
					</View> */}
					{!!movieReviews?.body.reviews.length && (
						<MovieRadarChart reviews={movieReviews?.body.reviews || []} />
					)}
					{movieCollection && (
						<View style={{ flex: 1, gap: 4 }}>
							<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
								<Text style={{ flexGrow: 1 }} variant="labelLarge">
									{movieCollection.name}
								</Text>
								<Button onPress={handleCreateList} icon="plus" mode="text">
									Create List
								</Button>
							</View>
							<MovieHorizontalGrid
								data={[...movieCollection.parts]
									.filter((m) => m.release_date)
									.sort(sortByReleaseDate)
									.map((m) => ({
										uniqueId: m.id.toString(),
										movieId: m.id,
										moviePoster: m.poster_path,
									}))}
								selectedMovieId={Number(movieId)}
								posterHeight={150}
								posterSelectionLocation={from || 'movies'}
							/>
						</View>
					)}

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
			{successfulListClone && (
				<Snackbar
					action={{
						label: 'View',
						onPress: () =>
							router.navigate(
								listDetailsRoute(from || 'movies', successfulListClone, currentUser!.uid)
							),
					}}
					visible={!!successfulListClone}
					onDismiss={() => setSuccessfulListClone(null)}
				>
					Successfully Create List
				</Snackbar>
			)}
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
