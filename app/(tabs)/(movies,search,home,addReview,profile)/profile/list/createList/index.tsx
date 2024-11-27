import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Badge, Button, Divider, Searchbar, Switch, Text, useTheme } from 'react-native-paper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { FlatGrid } from 'react-native-super-grid';
import TextInput from '@/components/Inputs/TextInput';
import MultiLineInput from '@/components/Inputs/MultiLineInput';
import {
	useCreateWatchListMutation,
	useGetWatchListDetailsQuery,
	useUpdateWatchListMutation,
} from '@/redux/api/tmrev';
import { listDetailsRoute } from '@/constants/routes';
import { FromLocation } from '@/models';
import { useFindMoviesQuery } from '@/redux/api/tmdb/searchApi';
import useDebounce from '@/hooks/useDebounce';
import MoviePoster from '@/components/MoviePoster';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import MovieHorizontalGrid from '@/components/MovieHorizontalGrid';
import { useGetManyMovieDetailsQuery } from '@/redux/api/tmdb/movieApi';
import { WatchList } from '@/models/tmrev';

type CreateListSearchParams = {
	from: FromLocation;
	movieIds: string; // ids separate by comma
	listId?: string;
};

const CreateList = () => {
	const { movieIds, from, listId } = useLocalSearchParams<CreateListSearchParams>();
	const [createWatchList] = useCreateWatchListMutation();
	const [updateWatchList] = useUpdateWatchListMutation();
	const theme = useTheme();
	const router = useRouter();

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [publicList, setPublicList] = useState(true);
	const [searchQuery, setSearchQuery] = React.useState('');
	const [selectedMovies, setSelectedMovies] = useState<MovieGeneral[]>([]);
	const [isUpdating, setIsUpdating] = useState(false);

	const { data: listData } = useGetWatchListDetailsQuery({ listId: listId! }, { skip: !listId });

	useEffect(() => {
		if (!listId) return;

		setIsUpdating(true);
	}, [listId]);

	const debouncedSearchTerm = useDebounce(searchQuery, 500);

	const splitMovieIds = useMemo(() => {
		return movieIds?.split(',').map((id) => Number(id));
	}, [movieIds]);

	const { data: movieData } = useFindMoviesQuery({
		query: debouncedSearchTerm,
	});

	// bulk movie details query
	const { data: selectedMoviesData } = useGetManyMovieDetailsQuery(splitMovieIds || [], {
		skip: !splitMovieIds,
	});

	// Add or remove movies from selection
	const handleAddMoviesToSelection = (movies: MovieGeneral[]) => {
		if (!movies.length) return;

		const newSelectedMovies = [...selectedMovies];
		movies.forEach((movie) => {
			if (newSelectedMovies.some((selectedMovie) => selectedMovie.id === movie.id)) {
				const index = newSelectedMovies.findIndex((selectedMovie) => selectedMovie.id === movie.id);
				newSelectedMovies.splice(index, 1);
			} else {
				newSelectedMovies.push(movie);
			}
		});
		setSelectedMovies(newSelectedMovies);
	};

	useEffect(() => {
		if (!listData) return;

		setTitle(listData.body.title);
		setDescription(listData.body.description);
		setPublicList(listData.body.public);

		handleAddMoviesToSelection(listData.body.movies as MovieGeneral[]);
	}, [listData]);

	// Add selected movies to selection, from movieId in params
	useEffect(() => {
		if (!selectedMoviesData) return;

		handleAddMoviesToSelection(selectedMoviesData);
	}, [selectedMoviesData]);

	const handleCreateWatchList = async () => {
		if (!title) return;

		let response: WatchList | undefined;

		try {
			if (!isUpdating) {
				response = await createWatchList({
					title,
					description,
					public: publicList,
					tags: [],
					movies:
						selectedMovies?.map((movie, index) => ({
							order: index,
							tmdbID: movie.id,
						})) || [],
				}).unwrap();
			} else {
				await updateWatchList({
					watchListId: listId!,
					title,
					description,
					public: publicList,
					tags: [],
					movies:
						selectedMovies?.map((movie, index) => ({
							order: index,
							tmdbID: movie.id,
						})) || [],
				}).unwrap();

				router.dismiss();
			}

			if (response) {
				router.replace(listDetailsRoute(from || 'profile', response._id, response.userId));
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			<Stack.Screen
				options={{
					title: isUpdating ? 'Update List' : 'Create List',
					headerRight: () => {
						return null;
					},
				}}
			/>
			<KeyboardAwareScrollView style={{ backgroundColor: theme.colors.background }}>
				<View style={{ padding: 16, gap: 16 }}>
					<View
						style={{
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'flex-start',
							alignContent: 'flex-start',
							gap: 4,
							paddingVertical: 8,
							paddingHorizontal: 8,
						}}
					>
						<Text variant="labelLarge">Public</Text>
						<Switch
							style={{ alignSelf: 'flex-start' }}
							value={publicList}
							onChange={() => setPublicList(!publicList)}
						/>
					</View>
					<TextInput
						onChangeText={(text) => setTitle(text)}
						placeholder="Add list name..."
						label="List Name"
						value={title}
					/>
					<MultiLineInput
						onChangeText={(text) => setDescription(text)}
						placeholder="Add list description..."
						label="List Description"
						value={description}
						numberOfLines={5}
					/>
					{selectedMovies.length > 0 && (
						<View
							style={{
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<Text variant="labelLarge" style={{ flex: 1, width: 'auto' }}>
								Selected Movies
							</Text>
							<Badge>{selectedMovies.length}</Badge>
						</View>
					)}
					<MovieHorizontalGrid
						data={
							selectedMovies.map((movie) => ({
								uniqueId: String(movie.id),
								movieId: movie.id,
								moviePoster: movie.poster_path,
								onPress: () => handleAddMoviesToSelection([movie]),
							})) || []
						}
						posterSelectionLocation="profile"
						posterHeight={100}
					/>
					<Button onPress={handleCreateWatchList} mode="contained">
						Save
					</Button>
					<Divider />
					<FlatGrid
						scrollEnabled={false}
						itemDimension={75}
						ListHeaderComponentStyle={{ paddingVertical: 12 }}
						ListHeaderComponent={
							<Searchbar
								style={{ width: '100%', flexGrow: 1 }}
								placeholder="Search Movies to Add..."
								value={searchQuery}
								onChangeText={(t) => setSearchQuery(t)}
							/>
						}
						data={movieData?.results ?? []}
						renderItem={({ item }) => (
							<View>
								<MoviePoster
									movieId={item.id}
									onPress={() => handleAddMoviesToSelection([item])}
									moviePoster={item.poster_path}
									location="profile"
									height={125}
									width={75}
									isSelected={selectedMovies.some((selectedMovie) => selectedMovie.id === item.id)}
								/>
							</View>
						)}
					/>
				</View>
			</KeyboardAwareScrollView>
		</>
	);
};

export default CreateList;
