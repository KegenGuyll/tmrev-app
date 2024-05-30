import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { View, Alert } from 'react-native';
import { Button, Divider, IconButton, Menu, Surface, Text } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatGrid } from 'react-native-super-grid';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import { FromLocation } from '@/models';
import { useGetWatchListDetailsQuery, useUpdateWatchListMutation } from '@/redux/api/tmrev';
import { MovieDetails } from '@/models/tmrev/review';
import MoviePoster, { MoviePosterImage } from '@/components/MoviePoster';
import CustomBackground from '@/components/CustomBottomSheetBackground';
import EditRankPosition from '@/features/listDetails/EditRankPosition';
import { WatchList } from '@/models/tmrev';
import MultiLineInput from '@/components/Inputs/MultiLineInput';
import TextInput from '@/components/Inputs/TextInput';

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
	const bottomSheetEditDetailsRef = useRef<BottomSheetModal>(null);
	const bottomSheetEditRankRef = useRef<BottomSheetModal>(null);
	const [selectedMovie, setSelectedMovie] = useState<{
		position: number;
		details: MovieDetails | null;
	} | null>(null);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const navigation = useNavigation();
	const router = useRouter();
	const [hasSaved, setHasSaved] = useState(false);
	const [menuVisible, setMenuVisible] = useState(false);

	const { currentUser } = auth();

	const isCurrentUser = useMemo(() => currentUser?.uid === profileId, [currentUser, profileId]);

	const { data, isLoading } = useGetWatchListDetailsQuery({ listId: listId! }, { skip: !listId });

	const [updateWatchList] = useUpdateWatchListMutation();

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

	useEffect(() => {
		checkStorage();
	}, [data]);

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

	useEffect(() => {
		if (data?.body) {
			setTitle(data.body.title);
			setDescription(data.body.description);
		}
	}, [data]);

	useEffect(() => {
		if (data && data.success) {
			setRankedList([...data.body.movies]);
		}
	}, [data]);

	useEffect(() => {
		if (selectedMovie) {
			bottomSheetEditRankRef.current?.present();
		}
	}, [selectedMovie]);

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

	const handleSetRank = (oldRank: number, newRank: number) => {
		if (oldRank === newRank) return;

		const newRankedList = [...rankedList];
		const movedItem = newRankedList.splice(oldRank, 1)[0];
		newRankedList.splice(newRank, 0, movedItem);
		setRankedList(newRankedList);
	};

	const handleUpdateWatchList = async () => {
		if (!data) return;

		await updateWatchList({
			watchListId: listId!,
			title: title || data!.body.title,
			description: description || data!.body.description,
			public: data!.body.public,
			tags: data!.body.tags,
			movies: rankedList.map((movie, index) => ({ order: index, tmdbID: movie.id })),
		}).unwrap();

		setHasSaved(true);

		router.dismiss();
	};

	const handleOpenEditModal = () => {
		setMenuVisible(false);
		bottomSheetEditDetailsRef.current?.present();
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
								<>
									<Button compact onPress={handleUpdateWatchList}>
										Save
									</Button>
									<Menu
										contentStyle={{ padding: 0, margin: 0 }}
										visible={menuVisible}
										onDismiss={() => setMenuVisible(false)}
										anchor={
											<IconButton icon="dots-vertical" onPress={() => setMenuVisible(true)} />
										}
									>
										{display === 'grid' && (
											<Menu.Item onPress={handleDisplayChange} title="List View" />
										)}
										{display === 'list' && (
											<Menu.Item onPress={handleDisplayChange} title="Grid View" />
										)}
										<Divider />
										<Menu.Item onPress={handleOpenEditModal} title="Edit" />
									</Menu>
								</>
							)}
						</View>
					),
				}}
			/>
			{display === 'list' && (
				<FlatGrid
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
							onPress={() => {
								if (selectedMovie) {
									setSelectedMovie({ position: index, details: item });
								}
							}}
							onLongPress={() => setSelectedMovie({ position: index, details: item })}
						/>
					)}
					keyExtractor={(item) => `${item.id}`}
				/>
			)}
			<BottomSheetModal
				snapPoints={['95%']}
				ref={bottomSheetEditDetailsRef}
				backgroundComponent={CustomBackground}
				// eslint-disable-next-line react-native/no-color-literals
				handleIndicatorStyle={{ backgroundColor: 'white' }}
			>
				<BottomSheetView style={{ padding: 8, gap: 12 }}>
					<TextInput
						label="Title"
						placeholder="Title"
						value={title}
						onChangeText={(v) => setTitle(v)}
					/>
					<MultiLineInput
						label="Description"
						placeholder="Description"
						onChangeText={(v) => setDescription(v)}
						numberOfLines={8}
						value={description}
					/>
				</BottomSheetView>
			</BottomSheetModal>
			{selectedMovie && (
				<EditRankPosition
					data={selectedMovie}
					clearSelectedMovie={() => setSelectedMovie(null)}
					updatePosition={handleSetRank}
					maxRank={rankedList.length - 1}
					handleMoveDownInRank={handleMoveDownInRank}
					handleMoveUpInRank={handleMoveUpInRank}
				/>
			)}
		</>
	);
};

export default ListDetailsPage;
