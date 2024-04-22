import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import ImageView from '@techvox/react-native-image-viewing';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
	useGetPersonImagesQuery,
	useGetPersonMostPopularMoviesQuery,
	useGetPersonQuery,
} from '@/redux/api/tmdb/peopleApi';
import ActorPlaceholderImage from '@/components/ActorPlacholderImage';
import MoviePoster from '@/components/MoviePoster';
import { PosterPath } from '@/models';
import imageUrl from '@/utils/imageUrl';

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
	} = useGetPersonQuery({ personId: Number(slug.personId) });

	const { data: personMovieData } = useGetPersonMostPopularMoviesQuery({
		personId: Number(slug.personId),
	});

	const { data: personImages } = useGetPersonImagesQuery({
		personId: Number(slug.personId),
	});

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
			<Stack.Screen options={{ headerShown: true, title: personData?.name }} />
			<SafeAreaView style={{ gap: 16 }}>
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
				<View style={{ gap: 8 }}>
					<Text variant="headlineLarge">Popular Movies</Text>
					<FlatList
						data={personMovieData}
						keyExtractor={(item) => item.id.toString()}
						renderItem={({ item }) => (
							<View
								style={{
									marginRight: 8,
									borderRadius: 4,
									gap: 8,
								}}
							>
								<MoviePoster
									height={175}
									width={150}
									movieId={item.id}
									moviePoster={item.poster_path}
									location={slug.from ?? 'movies'}
								/>
							</View>
						)}
						horizontal
						showsHorizontalScrollIndicator={false}
					/>
				</View>
				<View style={{ gap: 8 }}>
					<Text variant="headlineLarge">Media</Text>
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
											height={175}
											width={150}
										/>
									</TouchableOpacity>
								</View>
							)}
							horizontal
							showsHorizontalScrollIndicator={false}
						/>
					)}
				</View>
			</SafeAreaView>
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
