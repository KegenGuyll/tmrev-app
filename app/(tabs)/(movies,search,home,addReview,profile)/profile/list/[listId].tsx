/* eslint-disable react/no-unstable-nested-components */
import { Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { View, Alert, RefreshControl } from 'react-native';
import { Divider, IconButton, Menu, Snackbar, Surface, Text } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatGrid } from 'react-native-super-grid';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import { FromLocation } from '@/models';
import { useGetWatchListDetailsQuery, useUpdateWatchListMutation } from '@/redux/api/tmrev';
import { MovieDetails } from '@/models/tmrev/review';
import MoviePoster, { MoviePosterImage } from '@/components/MoviePoster';
import EditRankPosition from '@/features/listDetails/EditRankPosition';
import { WatchList } from '@/models/tmrev';
import EditListDetails from '@/features/listDetails/EditDetails';
import useDebounce from '@/hooks/useDebounce';
import AddMovieToListModal from '@/features/listDetails/AddMovieToCurrentListModal';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';

type ListDetailsPageSearchParams = {
	listId: string;
	profileId: string;
	from: FromLocation;
};

type ListMovieItemProps = {
	item: MovieDetails;
	index: number;
	handleMoveUpInRank: (index: number) => void;
	handleMoveDownInRank: (index: number) => void;
	canMoveUp: boolean;
	canMoveDown: boolean;
	isCurrentUser?: boolean;
};

type CachedData = {
	data: WatchList;
	date: Date;
};

const ListMovieItem: React.FC<ListMovieItemProps> = ({
	item,
	index,
	handleMoveDownInRank,
	handleMoveUpInRank,
	canMoveUp,
	canMoveDown,
	isCurrentUser,
}: ListMovieItemProps) => {
	return (
		<Surface style={{ padding: 8, borderRadius: 4 }}>
			<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 32 }}>
				<View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
					{isCurrentUser && (
						<IconButton
							disabled={canMoveUp}
							onPress={() => handleMoveUpInRank(index)}
							icon="arrow-up-thick"
						/>
					)}
					<Text variant="bodyLarge">{index + 1}</Text>
					{isCurrentUser && (
						<IconButton
							disabled={canMoveDown}
							onPress={() => handleMoveDownInRank(index)}
							icon="arrow-down-thick"
						/>
					)}
				</View>
				<View style={{ gap: 8 }}>
					<Text ellipsizeMode="tail" numberOfLines={1} style={{ width: 250 }} variant="labelLarge">
						{item.title}
					</Text>
					<MoviePosterImage moviePoster={item.poster_path} height={100} posterSize={154} />
				</View>
			</View>
		</Surface>
	);
};

const ListDetailsPage: React.FC = () => {
	const { listId, profileId, from } = useLocalSearchParams<ListDetailsPageSearchParams>();
	const [display, setDisplay] = useState<'grid' | 'list'>('grid');
	const [rankedList, setRankedList] = useState<MovieDetails[]>([]);
	const bottomSheetEditRankRef = useRef<BottomSheetModal>(null);
	const [selectedMovie, setSelectedMovie] = useState<{
		position: number;
		details: MovieDetails | null;
	} | null>(null);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const navigation = useNavigation();
	const [hasSaved, setHasSaved] = useState(false);
	const [menuVisible, setMenuVisible] = useState(false);
	const [snackBarMessage, setSnackBarMessage] = useState('');
	const [editDetails, setEditDetails] = useState(false);
	const [addMovie, setAddMovie] = useState(false);
	const [newMovies, setNewMovies] = useState<MovieGeneral[]>([]);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const debounceRankedList = useDebounce(JSON.stringify(rankedList), 2500);

	const { currentUser } = auth();

	const isCurrentUser = useMemo(() => currentUser?.uid === profileId, [currentUser, profileId]);

	const { data, isLoading, refetch } = useGetWatchListDetailsQuery(
		{ listId: listId! },
		{ skip: !listId }
	);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await refetch().unwrap();
		setIsRefreshing(false);
	};

	const [updateWatchList] = useUpdateWatchListMutation();

	useEffect(() => {
		if (newMovies.length) {
			const formatNewMovies: MovieDetails[] = newMovies.map((movie) => ({
				id: movie.id,
				title: movie.title,
				poster_path: movie.poster_path,
				backdrop_path: movie.backdrop_path,
				budget: movie.budget,
				genres: movie.genres,
				imdb_id: movie.imdb_id,
				original_language: movie.original_language,
				release_date: movie.release_date,
				revenue: movie.revenue,
				runtime: movie.runtime,
			}));

			const newList = [...rankedList, ...formatNewMovies];

			// remove any duplicate ids
			const uniqueMovies = newList.filter(
				(movie, index, self) => index === self.findIndex((m) => m.id === movie.id)
			);

			setRankedList([...uniqueMovies]);
		}
	}, [newMovies]);

	// check if there is any unsaved data in storage
	const checkStorage = useCallback(async () => {
		if (!data) return;
		try {
			const storedData = await AsyncStorage.getItem(data!.body._id);

			if (!storedData) return;

			const parsedData: CachedData = JSON.parse(storedData);

			Alert.alert(
				'Unsaved Changes found!',
				`Would you like to load your last known data? ${dayjs(parsedData.date).format('MM/DD/YYYY hh:mm a')}`,
				[
					{
						text: 'Cancel',
						onPress: async () => {
							await AsyncStorage.removeItem(data!.body._id);
						},
						style: 'cancel',
					},
					{
						text: 'OK',
						onPress: async () => {
							handleLoadStoredData(parsedData.data);
							await AsyncStorage.removeItem(data!.body._id);
						},
					},
				]
			);
		} catch (error) {
			console.error(error);
		}
	}, [data]);

	const handleLoadStoredData = (cachedData: WatchList) => {
		if (cachedData) {
			setTitle(cachedData.title);
			setDescription(cachedData.description);
			setRankedList([...cachedData.movies]);
		}
	};

	// check for unsaved changes on unmount
	useEffect(() => {
		checkStorage();
	}, [data]);

	// check if there are unsaved changes
	const hasUnsavedChanges = useMemo(() => {
		if (!listId) return false;

		// Check if the title or description has changed
		if (title !== data?.body.title || description !== data?.body.description) {
			return true;
		}

		// Check if the order of the movies has changed
		if (rankedList.length !== data?.body.movies.length) {
			return true;
		}

		// eslint-disable-next-line no-plusplus
		for (let i = 0; i < rankedList.length; i++) {
			if (rankedList[i].id !== data?.body.movies[i].id) {
				return true;
			}
		}

		return false;
	}, [rankedList, title, description]);

	// handle unsaved changes
	useEffect(
		() =>
			navigation.addListener('beforeRemove', async () => {
				if (hasUnsavedChanges && data && !hasSaved) {
					await AsyncStorage.setItem(
						data.body._id,
						JSON.stringify({
							data: {
								...data.body,
								title,
								description,
								movies: rankedList,
							},
							date: new Date(),
						})
					);
				}
			}),
		[navigation, hasUnsavedChanges, rankedList, data, hasSaved, title, description]
	);

	// update ranked list if data is fetched
	useEffect(() => {
		if (data && data.success) {
			setRankedList([...data.body.movies]);
		}
	}, [data]);

	// open bottom sheet if a movie is selected
	useEffect(() => {
		if (selectedMovie) {
			bottomSheetEditRankRef.current?.present();
		}
	}, [selectedMovie]);

	// update title and description if they are empty
	useEffect(() => {
		if (data && data.success) {
			if (title === '') {
				setTitle(data.body.title);
			}
			if (description === '') {
				setDescription(data.body.description);
			}
		}
	}, [data]);

	// handle moving movies up and down in rank
	const handleMoveUpInRank = (index: number) => {
		const newRankedList = [...rankedList];
		const temp = newRankedList[index];
		newRankedList[index] = newRankedList[index - 1];
		newRankedList[index - 1] = temp;

		setSelectedMovie((prev) => {
			if (!prev) return null;

			return { position: prev!.position - 1, details: prev!.details };
		});

		setRankedList(newRankedList);
	};

	const handleMoveDownInRank = (index: number) => {
		if (index === rankedList.length - 1) return;

		const newRankedList = [...rankedList];
		const temp = newRankedList[index];
		newRankedList[index] = newRankedList[index + 1];
		newRankedList[index + 1] = temp;

		setSelectedMovie((prev) => {
			if (!prev) return null;

			return { position: prev!.position + 1, details: prev!.details };
		});

		setRankedList(newRankedList);
	};

	// remove a movie from the list
	const handleRemoveMovie = (index: number) => {
		const movie = rankedList[index];

		const newRankedList = [...rankedList];
		newRankedList.splice(index, 1);
		setRankedList(newRankedList);

		setSnackBarMessage(`${movie.title} has been removed from the list`);
	};

	// set the rank of a movie
	const handleSetRank = (oldRank: number, newRank: number) => {
		if (oldRank === newRank) return;

		const newRankedList = [...rankedList];
		const movedItem = newRankedList.splice(oldRank, 1)[0];
		newRankedList.splice(newRank, 0, movedItem);
		setRankedList(newRankedList);
	};

	// update watchlist
	const handleUpdateWatchList = useCallback(
		async (movies?: MovieDetails[]) => {
			if (!data) return;

			const formattedMovies = () => {
				if (movies) {
					return movies.map((movie, index) => ({ order: index, tmdbID: movie.id }));
				}

				return rankedList.map((movie, index) => ({ order: index, tmdbID: movie.id }));
			};

			await updateWatchList({
				watchListId: listId!,
				title: title || data!.body.title,
				description: description || data!.body.description,
				public: data!.body.public,
				tags: data!.body.tags,
				movies: formattedMovies(),
			}).unwrap();

			setHasSaved(true);

			setSnackBarMessage(`saved`);
		},
		[data, description, listId, rankedList, title, updateWatchList]
	);

	// update watchlist if there are any position changes
	useEffect(() => {
		if (debounceRankedList) {
			const parsedData: MovieDetails[] = JSON.parse(debounceRankedList);
			if (parsedData.length && hasUnsavedChanges) {
				handleUpdateWatchList(parsedData);
			}
		}
	}, [debounceRankedList]);

	const handleOpenEditModal = () => {
		setMenuVisible(false);
		setEditDetails(true);
	};

	const handleOpenAddMovies = () => {
		setMenuVisible(false);
		setAddMovie(true);
	};

	const updateValues = (
		key: 'title' | 'description' | 'movies',
		value: string | MovieDetails[]
	) => {
		if (key === 'title') {
			setTitle(value as string);
		} else if (key === 'description') {
			setDescription(value as string);
		} else {
			setRankedList(value as MovieDetails[]);
		}
	};

	const handleLongPress = (item: MovieDetails) => {
		if (!isCurrentUser) return;

		setSelectedMovie({ position: rankedList.indexOf(item), details: item });
	};

	const handleDisplayChange = () => {
		setMenuVisible(false);
		setDisplay((prev) => (prev === 'grid' ? 'list' : 'grid'));
	};

	if (isLoading || !data) {
		return <Text>Loading...</Text>;
	}

	if (!data.success) {
		return <Text>{(data as any).error as string}</Text>;
	}

	return (
		<>
			<Stack.Screen
				options={{
					title: title || data.body.title,
					headerRight: () => (
						<View
							style={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								paddingBottom: 100,
							}}
						>
							{isCurrentUser && (
								<Menu
									contentStyle={{ padding: 0, margin: 0 }}
									visible={menuVisible}
									onDismiss={() => setMenuVisible(false)}
									anchor={<IconButton icon="dots-vertical" onPress={() => setMenuVisible(true)} />}
								>
									{display === 'grid' && (
										<Menu.Item
											leadingIcon="view-list"
											onPress={handleDisplayChange}
											title="List View"
										/>
									)}
									{display === 'list' && (
										<Menu.Item
											leadingIcon="view-grid"
											onPress={handleDisplayChange}
											title="Grid View"
										/>
									)}
									<Divider />
									<Menu.Item leadingIcon="plus" onPress={handleOpenAddMovies} title="Add Movies" />
									<Menu.Item leadingIcon="pencil" onPress={handleOpenEditModal} title="Edit" />
									<Menu.Item
										leadingIcon="content-save"
										onPress={() => handleUpdateWatchList()}
										title="Save"
									/>
								</Menu>
							)}
						</View>
					),
				}}
			/>
			{display === 'list' && (
				<FlatGrid
					refreshControl={
						<RefreshControl tintColor="white" refreshing={isRefreshing} onRefresh={handleRefresh} />
					}
					data={rankedList}
					itemDimension={400}
					renderItem={({ item, index }) => (
						<ListMovieItem
							isCurrentUser={isCurrentUser}
							canMoveUp={index === 0}
							canMoveDown={index === rankedList.length - 1}
							handleMoveDownInRank={handleMoveDownInRank}
							handleMoveUpInRank={handleMoveUpInRank}
							item={item}
							index={index}
						/>
					)}
					keyExtractor={(item, index) => `${item.id}-${index}`}
				/>
			)}
			{display === 'grid' && (
				<FlatGrid
					refreshControl={
						<RefreshControl tintColor="white" refreshing={isRefreshing} onRefresh={handleRefresh} />
					}
					data={rankedList}
					itemDimension={70}
					contentContainerStyle={{ paddingBottom: selectedMovie ? 200 : 0 }}
					renderItem={({ item, index }) => (
						<MoviePoster
							height={120}
							movieId={item.id}
							location={from!}
							moviePoster={item.poster_path}
							rankedPosition={index + 1}
							onPress={
								selectedMovie
									? () => setSelectedMovie({ position: index, details: item })
									: undefined
							}
							onLongPress={() => handleLongPress(item)}
						/>
					)}
					keyExtractor={(item) => `${item.id}`}
				/>
			)}
			<AddMovieToListModal
				visible={addMovie}
				onDismiss={() => setAddMovie(false)}
				setMovies={setNewMovies}
			/>
			<EditListDetails
				visible={editDetails}
				onDismiss={() => setEditDetails(false)}
				updateValue={updateValues}
				rankedList={rankedList}
				title={title}
				description={description}
				handleSave={handleUpdateWatchList}
			/>
			{selectedMovie && (
				<EditRankPosition
					data={selectedMovie}
					clearSelectedMovie={() => setSelectedMovie(null)}
					updatePosition={handleSetRank}
					maxRank={rankedList.length - 1}
					handleMoveDownInRank={handleMoveDownInRank}
					handleMoveUpInRank={handleMoveUpInRank}
					handleRemoveMovie={handleRemoveMovie}
				/>
			)}
			<Snackbar
				action={{
					label: 'Dismiss',
					onPress: () => setSnackBarMessage(''),
				}}
				visible={!!snackBarMessage}
				onDismiss={() => setSnackBarMessage('')}
			>
				{snackBarMessage}
			</Snackbar>
		</>
	);
};

export default ListDetailsPage;
