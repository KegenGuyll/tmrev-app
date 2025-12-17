import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import {
	FlatList,
	Platform,
	RefreshControl,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { Chip, Surface, Text } from 'react-native-paper';
import ImageView from '@techvox/react-native-image-viewing';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useAuth from '@/hooks/useAuth';
import {
	useGetPersonImagesQuery,
	useGetPersonMostPopularMoviesQuery,
	useGetPersonQuery,
} from '@/redux/api/tmdb/peopleApi';
import ActorPlaceholderImage from '@/components/ActorPlacholderImage';
import { PosterPath } from '@/models';
import imageUrl from '@/utils/imageUrl';
import MovieHorizontalGrid from '@/components/MovieHorizontalGrid';
import { useReviewControllerFindByActorId } from '@/api/tmrev-api-v2';

type PersonDetailsParams = {
	personId: string;
	from?: PosterPath;
};

type ImageList = {
	uri: string;
	filename: string;
	mimetype: string;
};

const PersonDetails: React.FC = () => {
	const slug = useLocalSearchParams() as PersonDetailsParams;
	const [isImageViewVisible, setIsImageViewVisible] = React.useState(false);
	const [imageIndex, setImageIndex] = React.useState(0);
	const [images, setImages] = React.useState<ImageList[]>([]);
	const {
		data: personData,
		isFetching: isPersonFetching,
		isLoading: isPersonLoading,
		refetch: refetchPerson,
	} = useGetPersonQuery({ personId: Number(slug.personId) });
	const [isRefreshing, setIsRefreshing] = React.useState(false);

	const { currentUser } = useAuth({});

	const { data: reviewData, refetch: reviewRefresh } = useReviewControllerFindByActorId(
		currentUser?.uid ?? '',
		Number(slug.personId),
		{
			query: {
				enabled: !!currentUser,
			},
		}
	);

	const { data: personMovieData, refetch: personMovieRefresh } = useGetPersonMostPopularMoviesQuery(
		{
			personId: Number(slug.personId),
		}
	);

	const { data: personImages, refetch: personImagesRefresh } = useGetPersonImagesQuery({
		personId: Number(slug.personId),
	});

	const onRefresh = async () => {
		setIsRefreshing(true);
		await Promise.all([
			refetchPerson(),
			reviewRefresh(),
			personMovieRefresh(),
			personImagesRefresh(),
		]);
		setIsRefreshing(false);
	};

	useEffect(() => {
		const imageList: ImageList[] = [];

		if (personImages) {
			personImages.profiles.forEach((profile) => {
				imageList.push({
					uri: imageUrl(profile.file_path),
					filename: `${profile.file_path}.png`,
					mimetype: 'image/png',
				});
			});
		}

		setImages(imageList);
	}, [personImages]);

	const handleImagePress = (index: number) => {
		setImageIndex(index);
		setIsImageViewVisible(true);
	};

	if (isPersonFetching || isPersonLoading || !personData) {
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
				options={{ headerShown: true, title: personData?.name, headerRight: () => null }}
			/>
			<ScrollView
				refreshControl={
					<RefreshControl refreshing={isRefreshing} tintColor="white" onRefresh={onRefresh} />
				}
				contentContainerStyle={{
					display: 'flex',
					flexDirection: 'column',
					gap: 16,
					paddingVertical: 16,
				}}
			>
				<Surface style={styles.actorOverviewContainer}>
					<ActorPlaceholderImage
						profile_url={personData.profile_path}
						department={personData.known_for_department}
						height={150}
						width={100}
					/>
					<Text style={styles.textWrap} variant="bodySmall">
						{personData.biography}
					</Text>
				</Surface>
				{currentUser && reviewData && reviewData?.results && (
					<View style={{ gap: 8 }}>
						<Text variant="headlineMedium">Reviewed Movies</Text>
						<MovieHorizontalGrid
							data={
								reviewData.results?.map((m) => ({
									uniqueId: m._id,
									movieId: m.tmdbID,
									moviePoster: m.movieDetails.poster_path,
									overlayComponent: (
										<Chip style={{ position: 'absolute', bottom: 4, right: 4 }} icon="star">
											{m.averagedAdvancedScore}
										</Chip>
									),
								})) || []
							}
							posterSelectionLocation={slug.from ?? 'movies'}
							posterHeight={150}
						/>
					</View>
				)}
				<View style={{ gap: 8 }}>
					<Text variant="headlineMedium">Popular Movies</Text>
					<MovieHorizontalGrid
						data={
							personMovieData?.map((m) => ({
								uniqueId: m.id.toString(),
								movieId: m.id,
								moviePoster: m.poster_path,
							})) || []
						}
						posterSelectionLocation={slug.from ?? 'movies'}
						posterHeight={150}
					/>
				</View>
				{Platform.OS !== 'ios' && (
					<View style={{ gap: 8 }}>
						<Text variant="headlineMedium">Media</Text>
						{personImages && (
							<FlatList
								data={personImages.profiles}
								keyExtractor={(item) => item.file_path}
								renderItem={({ item, index }) => (
									<View
										style={{
											marginRight: 8,
											borderRadius: 4,
											gap: 8,
										}}
									>
										<TouchableOpacity onPress={() => handleImagePress(index)}>
											<ActorPlaceholderImage
												profile_url={item.file_path}
												department="Acting"
												height={135}
												width={100}
											/>
										</TouchableOpacity>
									</View>
								)}
								horizontal
								showsHorizontalScrollIndicator={false}
							/>
						)}
					</View>
				)}
			</ScrollView>
			<ImageView
				webViewSupportedMimeTypes={['image/jpeg', 'image/png']}
				ShareIcon={(<Icon name="share" color="white" size={18} />) as any}
				onRequestClose={() => setIsImageViewVisible(false)}
				images={images}
				imageIndex={imageIndex}
				visible={isImageViewVisible}
			/>
		</>
	);
};

const styles = StyleSheet.create({
	actorOverviewContainer: {
		display: 'flex',
		flexDirection: 'row',
		gap: 8,
		padding: 8,
		borderRadius: 4,
		maxHeight: 166,
	},
	textWrap: {
		flex: 1,
		flexWrap: 'wrap',
	},
});

export default PersonDetails;
