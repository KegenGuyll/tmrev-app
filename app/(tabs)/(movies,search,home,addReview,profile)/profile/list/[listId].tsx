/* eslint-disable react/no-unstable-nested-components */
import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { View, Alert, RefreshControl, StyleSheet } from 'react-native';
import { Divider, IconButton, Menu, Snackbar, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatGrid } from 'react-native-super-grid';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import useAuth from '@/hooks/useAuth';
import { FromLocation } from '@/models';
import {
	useCreateWatchListMutation,
	useDeleteWatchListMutation,
	useGetWatchListInsightsQuery,
	useUpdateWatchListMutation,
} from '@/redux/api/tmrev';
import { MovieDetails } from '@/models/tmrev/review';
import EditRankPosition from '@/features/listDetails/EditRankPosition';
import useDebounce from '@/hooks/useDebounce';
import { createListRoute, listDetailsRoute } from '@/constants/routes';
import { GetWatchListInsightsBody, GetWatchListMovie } from '@/models/tmrev/watchList';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { showSnackbar } from '@/redux/slice/globalSnackbar';
import ListHeaderComponent from '@/components/ListDetails/HeadComponent';
import ListGridItem from '@/components/ListDetails/GridItem';
import ListDetailItem from '@/components/ListDetails/ListItem';
import { MovieBuy } from '@/models/tmdb/movie/movieWatchProviders';
import WatchProviderItem from '@/components/ListDetails/WatchProviderItem';

type ListDetailsPageSearchParams = {
	listId: string;
	profileId: string;
	from: FromLocation;
};

type CachedData = {
	data: GetWatchListInsightsBody;
	date: Date;
};

type ListDisplays = 'grid' | 'list' | 'watchProvider';

const ListDetailsPage: React.FC = () => {
	const { listId, profileId, from } = useLocalSearchParams<ListDetailsPageSearchParams>();
	const [display, setDisplay] = useState<ListDisplays>('grid');
	const [rankedList, setRankedList] = useState<GetWatchListMovie[]>([]);
	const bottomSheetEditRankRef = useRef<BottomSheetModal>(null);
	const [selectedMovie, setSelectedMovie] = useState<{
		position: number;
		details: GetWatchListMovie | null;
	} | null>(null);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const navigation = useNavigation();
	const [hasSaved, setHasSaved] = useState(false);
	const [menuVisible, setMenuVisible] = useState(false);
	const [snackBarMessage, setSnackBarMessage] = useState('');
	const [isRefreshing, setIsRefreshing] = useState(false);
	const router = useRouter();
	const dispatch = useAppDispatch();

	const debounceRankedList = useDebounce(JSON.stringify(rankedList), 1500);

	const { currentUser, tmrevUser } = useAuth({});

	const isCurrentUser = useMemo(() => currentUser?.uid === profileId, [currentUser, profileId]);

	const { data, isLoading, refetch } = useGetWatchListInsightsQuery(
		{ listId: listId!, region: tmrevUser?.countryCode },
		{ skip: !listId }
	);

	const availableFlatrates = useMemo(() => {
		const flatrates: Record<string, MovieBuy> = {};

		rankedList.forEach((movie) => {
			movie.watchProviders?.flatrate?.forEach((provider) => {
				if (!flatrates[provider.provider_id]) {
					flatrates[provider.provider_id] = provider;
				}
			});
		});

		flatrates['0'] = {
			provider_name: 'Not Available',
			logo_path: '',
			provider_id: 0,
			display_priority: 0,
		};

		return flatrates;
	}, [rankedList]);

	const moviesByStreamingPlatform = useMemo(() => {
		const platformMap: { [key: string]: GetWatchListMovie[] } = {};

		rankedList.forEach((movie) => {
			if (!movie.watchProviders?.flatrate) {
				if (!platformMap['0']) {
					platformMap['0'] = [];
				}
				platformMap['0'].push(movie);
			} else {
				movie.watchProviders?.flatrate?.forEach((provider) => {
					if (!platformMap[provider.provider_id]) {
						platformMap[provider.provider_id] = [];
					}
					platformMap[provider.provider_id].push(movie);
				});
			}
		});

		return platformMap;
	}, [rankedList]);

	const itemDimension = useCallback(() => {
		if (display === 'grid') {
			return 70;
		}

		if (display === 'list') {
			return 400;
		}

		if (display === 'watchProvider') {
			return 400;
		}

		return 70;
	}, [display]);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await refetch().unwrap();
		setIsRefreshing(false);
	};

	const [updateWatchList] = useUpdateWatchListMutation();
	const [createWatchList] = useCreateWatchListMutation();
	const [deleteWatchList] = useDeleteWatchListMutation();

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

	const handleLoadStoredData = (cachedData: GetWatchListInsightsBody) => {
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
			setMenuVisible(false);
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

			setSnackBarMessage(`Saved ${title || data!.body.title}`);
		},
		[data, description, listId, rankedList, title, updateWatchList]
	);

	// clone watchlist
	const handleCloneWatchList = async () => {
		if (!data) return;

		try {
			const response = await createWatchList({
				title: title || data!.body.title,
				description: description || data!.body.description,
				public: data!.body.public,
				tags: data!.body.tags,
				movies: rankedList.map((movie, index) => ({ order: index, tmdbID: movie.id })),
			}).unwrap();

			setMenuVisible(false);

			dispatch(
				showSnackbar({
					message: `Successfully Cloned ${title || data!.body.title}`,
					type: 'success',
				})
			);

			router.push(listDetailsRoute(from || 'profile', response._id, currentUser?.uid || ''));
		} catch (error) {
			dispatch(
				showSnackbar({ message: `Error Cloning ${title || data!.body.title}`, type: 'error' })
			);
		}
	};

	const handleDeleteWatchList = async () => {
		if (!data) return;

		setMenuVisible(false);
		await deleteWatchList(data.body._id).unwrap();
		navigation.goBack();
	};

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
		router.push(createListRoute(from || 'profile', '', listId));
	};

	const handleOpenAddMovies = () => {
		setMenuVisible(false);
		router.push(createListRoute(from || 'profile', '', listId));
	};

	const handleLongPress = (item: GetWatchListMovie) => {
		if (!isCurrentUser) return;

		setSelectedMovie({ position: rankedList.indexOf(item), details: item });
	};

	const handleDisplayChange = (newDisplay: ListDisplays) => {
		setMenuVisible(false);
		setDisplay(newDisplay);
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
							}}
						>
							<Menu
								contentStyle={{ padding: 0, margin: 0 }}
								visible={menuVisible}
								onDismiss={() => setMenuVisible(false)}
								anchor={<IconButton icon="dots-vertical" onPress={() => setMenuVisible(true)} />}
							>
								<Menu.Item
									disabled={display === 'list'}
									leadingIcon="view-list"
									onPress={() => handleDisplayChange('list')}
									title="List View"
								/>
								<Menu.Item
									disabled={display === 'grid'}
									leadingIcon="view-grid"
									onPress={() => handleDisplayChange('grid')}
									title="Grid View"
								/>
								<Menu.Item
									disabled={display === 'watchProvider'}
									leadingIcon="television"
									onPress={() => handleDisplayChange('watchProvider')}
									title="Where to Watch"
								/>
								{isCurrentUser && (
									<>
										<Divider />
										<Menu.Item
											leadingIcon="plus"
											onPress={handleOpenAddMovies}
											title="Add Movies"
										/>
										<Menu.Item leadingIcon="pencil" onPress={handleOpenEditModal} title="Edit" />
										<Menu.Item
											leadingIcon="content-save"
											onPress={() => handleUpdateWatchList()}
											title="Save"
										/>
										<Menu.Item
											leadingIcon="delete"
											onPress={() => {
												setMenuVisible(false);
												Alert.alert('Delete List', 'Are you sure you want to delete this list?', [
													{
														text: 'Cancel',
														style: 'cancel',
													},
													{
														text: 'Delete',
														style: 'destructive',
														onPress: handleDeleteWatchList,
													},
												]);
											}}
											title="Delete"
										/>
									</>
								)}
								<Divider />
								<Menu.Item
									onPress={handleCloneWatchList}
									leadingIcon="content-copy"
									title="Clone List"
								/>
							</Menu>
						</View>
					),
				}}
			/>
			<FlatGrid
				ListHeaderComponentStyle={styles.backgroundImageContainer}
				ListHeaderComponent={
					<ListHeaderComponent
						title={title || data.body.title}
						backdropPath={data.body.movies[0].backdrop_path}
						averageAdvancedScore={data.body.averageAdvancedScore}
						completionPercentage={data.body.completionPercentage}
						description={description}
						totalBudget={data.body.totalBudget}
						totalRuntime={data.body.totalRuntime}
						username={tmrevUser?.username || ''}
					/>
				}
				refreshControl={
					<RefreshControl tintColor="white" refreshing={isRefreshing} onRefresh={handleRefresh} />
				}
				data={rankedList}
				itemDimension={itemDimension()}
				contentContainerStyle={{ paddingBottom: selectedMovie ? 200 : 0 }}
				renderItem={({ item, index }) => {
					if (display === 'grid') {
						return (
							<ListGridItem
								item={item}
								index={index}
								from={from!}
								selectedMovie={selectedMovie}
								setSelectedMovie={setSelectedMovie}
								handleLongPress={handleLongPress}
							/>
						);
					}

					if (display === 'list') {
						return (
							<ListDetailItem
								isCurrentUser={isCurrentUser}
								canMoveUp={index === 0}
								canMoveDown={index === rankedList.length - 1}
								handleMoveDownInRank={handleMoveDownInRank}
								handleMoveUpInRank={handleMoveUpInRank}
								item={item}
								index={index}
							/>
						);
					}

					if (display === 'watchProvider' && index === 0) {
						return (
							<WatchProviderItem
								from={from!}
								link={item.watchProviders?.link}
								availableFlatrates={availableFlatrates}
								items={moviesByStreamingPlatform}
							/>
						);
					}

					return null;
				}}
				keyExtractor={(item) => `${item.id}`}
			/>

			{selectedMovie && (
				<EditRankPosition
					data={selectedMovie as any}
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

const styles = StyleSheet.create({
	backgroundImageContainer: {
		width: '100%',
		height: 400,
		position: 'relative',
		marginBottom: 32,
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

export default ListDetailsPage;
