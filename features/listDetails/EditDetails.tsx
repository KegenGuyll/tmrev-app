/* eslint-disable react-native/no-color-literals */
/* eslint-disable react/no-unstable-nested-components */
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { View } from 'react-native';
import { TouchableRipple, Text, Badge } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import { useCallback, useEffect, useRef, useState } from 'react';
import TitledHandledComponent from '@/components/BottomSheetModal/TitledHandledComponent';
import CustomBackground from '@/components/CustomBottomSheetBackground';
import MultiLineInput from '@/components/Inputs/MultiLineInput';
import { MoviePosterImage } from '@/components/MoviePoster';
import TextInput from '@/components/Inputs/TextInput';
import { MovieDetails } from '@/models/tmrev/review';

type Values = 'title' | 'description' | 'movies';

type EditListDetailsProps = {
	visible: boolean;
	onDismiss: () => void;
	rankedList: MovieDetails[];
	title: string;
	description: string;
	updateValue: (key: Values, value: string | MovieDetails[]) => void;
	handleSave: (movies?: MovieDetails[]) => void;
};

const EditListDetails: React.FC<EditListDetailsProps> = ({
	rankedList,
	updateValue,
	title,
	description,
	handleSave,
	visible,
	onDismiss,
}: EditListDetailsProps) => {
	const bottomSheetEditDetailsRef = useRef<BottomSheetModal>(null);
	const [moviesToRemove, setMoviesToRemove] = useState<MovieDetails[]>([]);

	useEffect(() => {
		if (visible) {
			bottomSheetEditDetailsRef.current?.present();
		} else {
			bottomSheetEditDetailsRef.current?.dismiss();
		}
	}, [visible]);

	const isMovieSelected = useCallback(
		(movie: MovieDetails) => moviesToRemove.includes(movie),
		[moviesToRemove]
	);

	const addToRemoveList = useCallback(
		(movie: MovieDetails) => {
			setMoviesToRemove((prev) => {
				if (isMovieSelected(movie)) {
					return prev.filter((m) => m.id !== movie.id);
				}
				return [...prev, movie];
			});
		},
		[moviesToRemove, isMovieSelected]
	);

	const removeMovies = useCallback(() => {
		const newList = rankedList.filter((movie) => !moviesToRemove.includes(movie));

		return newList;
	}, [moviesToRemove, rankedList]);

	const handleOnPressSave = () => {
		bottomSheetEditDetailsRef.current?.dismiss();
		const newMovie = removeMovies();
		onDismiss();
		handleSave(newMovie);
		setMoviesToRemove([]);
	};

	return (
		<BottomSheetModal
			onChange={(index) => {
				if (index === -1) {
					onDismiss();
				}
			}}
			snapPoints={['95%']}
			ref={bottomSheetEditDetailsRef}
			backgroundComponent={CustomBackground}
			handleComponent={({ ...props }) => (
				<TitledHandledComponent
					{...props}
					title="Edit List Details"
					submitButton={{
						title: 'Save',
						onPress: handleOnPressSave,
					}}
					cancelButton={{
						title: 'Cancel',
						onPress: () => bottomSheetEditDetailsRef.current?.dismiss(),
					}}
				/>
			)}
			// eslint-disable-next-line react-native/no-color-literals
			handleIndicatorStyle={{ backgroundColor: 'white' }}
		>
			<BottomSheetScrollView style={{ padding: 8, gap: 12 }}>
				<View style={{ gap: 8, paddingHorizontal: 8 }}>
					<TextInput
						label="Title"
						placeholder="Title"
						value={title}
						onChangeText={(v) => updateValue('title', v)}
					/>
					<MultiLineInput
						label="Description"
						placeholder="Description"
						onChangeText={(v) => updateValue('description', v)}
						numberOfLines={8}
						value={description}
					/>
				</View>
				<View style={{ gap: 8, marginTop: 12 }}>
					<View style={{ paddingHorizontal: 8 }}>
						<View style={{ display: 'flex', flexDirection: 'row', gap: 4 }}>
							<Text variant="labelLarge">Movies</Text>
							<Badge>{moviesToRemove.length}</Badge>
						</View>
						<Text>Press movie poster to remove from list</Text>
					</View>
					<FlatGrid
						scrollEnabled={false}
						data={rankedList}
						itemDimension={70}
						renderItem={({ item, index }) => (
							<TouchableRipple onPress={() => addToRemoveList(item)}>
								<MoviePosterImage
									isSelected={isMovieSelected(item)}
									height={120}
									moviePoster={item.poster_path}
									rankedPosition={index + 1}
								/>
							</TouchableRipple>
						)}
						keyExtractor={(item) => `${item.id}`}
					/>
				</View>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};

export default EditListDetails;
