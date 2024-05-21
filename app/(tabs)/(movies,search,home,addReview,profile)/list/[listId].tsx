import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button, IconButton, Surface, Text, TextInput } from 'react-native-paper';
import auth from '@react-native-firebase/auth';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatGrid } from 'react-native-super-grid';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { FromLocation } from '@/models';
import { useGetWatchListDetailsQuery, useUpdateWatchListMutation } from '@/redux/api/tmrev';
import { MovieDetails } from '@/models/tmrev/review';
import { MoviePosterImage } from '@/components/MoviePoster';
import CustomBackground from '@/components/CustomBottomSheetBackground';

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
	const { listId, profileId } = useLocalSearchParams<ListDetailsPageSearchParams>();
	const [rankedList, setRankedList] = useState<MovieDetails[]>([]);
	const bottomSheetEditDetailsRef = useRef<BottomSheetModal>(null);
	const router = useRouter();

	const { currentUser } = auth();

	const isCurrentUser = useMemo(() => currentUser?.uid === profileId, [currentUser, profileId]);

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');

	const { data, isLoading } = useGetWatchListDetailsQuery({ listId: listId! }, { skip: !listId });

	const [updateWatchList] = useUpdateWatchListMutation();

	useEffect(() => {
		if (data) {
			setRankedList([...data.body.movies]);
		}
	}, [data]);

	useEffect(() => {
		if (data) {
			setTitle(data.body.title);
			setDescription(data.body.description);
		}
	}, [data]);

	const handleMoveUpInRank = (index: number) => {
		if (index === 0) return;

		const newRankedList = [...rankedList];
		const temp = newRankedList[index];
		newRankedList[index] = newRankedList[index - 1];
		newRankedList[index - 1] = temp;

		setRankedList(newRankedList);
	};

	const handleMoveDownInRank = (index: number) => {
		if (index === rankedList.length - 1) return;

		const newRankedList = [...rankedList];
		const temp = newRankedList[index];
		newRankedList[index] = newRankedList[index + 1];
		newRankedList[index + 1] = temp;

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
			movies: rankedList,
		}).unwrap();

		router.dismiss();
	};

	const handleOpenModal = () => {
		bottomSheetEditDetailsRef.current?.present();
	};

	if (isLoading || !data) {
		return <Text>Loading...</Text>;
	}

	return (
		<>
			<Stack.Screen
				options={{
					title: data.body.title,
					headerRight: () => (
						<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
							{isCurrentUser && (
								<>
									<IconButton onPress={handleOpenModal} icon="pencil" size={24} />
									<Button onPress={handleUpdateWatchList}>Save</Button>
								</>
							)}
						</View>
					),
				}}
			/>
			<FlatGrid
				data={rankedList}
				itemDimension={200}
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
			<BottomSheetModal
				snapPoints={['95%']}
				ref={bottomSheetEditDetailsRef}
				backgroundComponent={CustomBackground}
			>
				<BottomSheetView style={{ padding: 8, gap: 12 }}>
					<TextInput placeholder="Title" value={title} onChangeText={(v) => setTitle(v)} />
					<TextInput
						placeholder="Description"
						multiline
						onChangeText={(v) => setDescription(v)}
						numberOfLines={8}
						value={description}
					/>
				</BottomSheetView>
			</BottomSheetModal>
		</>
	);
};

export default ListDetailsPage;
