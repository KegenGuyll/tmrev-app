import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { Button, TextInput, useTheme, Text, IconButton } from 'react-native-paper';
import CustomBackground from '@/components/CustomBottomSheetBackground';
import { MoviePosterImage } from '@/components/MoviePoster';
import { MovieDetails } from '@/models/tmrev/review';
import formatDateYear from '@/utils/formatDateYear';

type EditRankPositionProps = {
	data: {
		position: number;
		details: MovieDetails | null;
	};
	updatePosition: (oldRank: number, newRank: number) => void;
	clearSelectedMovie: () => void;
	handleMoveUpInRank: (index: number) => void;
	handleMoveDownInRank: (index: number) => void;
	handleRemoveMovie: (index: number) => void;
	maxRank: number;
};

const { width } = Dimensions.get('screen');

const EditRankPosition: React.FC<EditRankPositionProps> = ({
	data,
	updatePosition,
	clearSelectedMovie,
	maxRank,
	handleMoveUpInRank,
	handleMoveDownInRank,
	handleRemoveMovie,
}: EditRankPositionProps) => {
	const currentPosition = useMemo(() => Number(data.position + 1), [data]);

	const [newPosition, setNewPosition] = useState<number>(currentPosition);
	const [editPosition, setEditPosition] = useState<boolean>(false);
	const bottomSheetEditRankRef = useRef<BottomSheetModal>(null);
	const customRankInputRef = useRef(null);
	const theme = useTheme();

	useEffect(() => {
		if (data && data.details) {
			bottomSheetEditRankRef.current?.present();
		}
	}, [data]);

	const handleSavePosition = () => {
		if (Number.isNaN(newPosition)) return;

		// newPosition but be positive and less than the total number of movies
		if (newPosition <= 0 || newPosition > maxRank + 1) return;

		if (data.position === newPosition) {
			bottomSheetEditRankRef.current?.dismiss();
		}

		if (editPosition && data && newPosition) {
			updatePosition(data.position, newPosition - 1);
			setEditPosition(false);
			clearSelectedMovie();
			bottomSheetEditRankRef.current?.dismiss();
		} else {
			setEditPosition(true);
			bottomSheetEditRankRef.current?.snapToPosition('75%');
		}
	};

	return (
		<BottomSheetModal
			onChange={(index) => {
				if (index === -1) {
					clearSelectedMovie();
				}
			}}
			snapPoints={['30%', '50%', '90%']}
			ref={bottomSheetEditRankRef}
			backgroundComponent={CustomBackground}
			// eslint-disable-next-line react-native/no-color-literals
			handleIndicatorStyle={{ backgroundColor: 'white' }}
		>
			<BottomSheetView style={{ padding: 8, gap: 12 }}>
				<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
					<MoviePosterImage
						moviePoster={data?.details?.poster_path}
						height={100}
						width={70}
						posterSize={342}
					/>
					<View>
						<View
							style={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								width: '100%',
								marginBottom: -10,
							}}
						>
							<View style={{ flexGrow: 1 }}>
								<Text variant="labelLarge">Current Position: {currentPosition}</Text>
							</View>
							<View style={{ display: 'flex', flexDirection: 'row', marginRight: 8 }}>
								<IconButton
									icon="plus"
									disabled={data.position === 0}
									onPress={() => handleMoveUpInRank(data.position)}
								/>
								<IconButton
									icon="minus"
									disabled={data.position >= maxRank}
									onPress={() => handleMoveDownInRank(data.position)}
								/>
							</View>
						</View>
						<Text numberOfLines={1} style={{ width: width - 80 }} variant="headlineSmall">
							{data?.details?.title}
						</Text>
						<Text variant="labelLarge">({formatDateYear(data?.details?.release_date)})</Text>
					</View>
				</View>
				{/* <Button
					disabled={data.position === 0}
					onPress={() => handleMoveUpInRank(data.position)}
					mode="outlined"
				>
					Move Up
				</Button>
				<Button
					disabled={data.position >= maxRank}
					onPress={() => handleMoveDownInRank(data.position)}
					mode="outlined"
				>
					Move Down
				</Button> */}
				{editPosition && (
					<View style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
						<TextInput
							ref={customRankInputRef}
							keyboardType="number-pad"
							mode="outlined"
							placeholder="Rank"
							label="Ranked Position"
							onChangeText={(text) => {
								setNewPosition(Number(text));
							}}
							defaultValue={currentPosition.toString()}
							onFocus={() => {
								bottomSheetEditRankRef.current?.snapToPosition('75%');
							}}
						/>
						<Text>Lowest Rank is {maxRank + 1}</Text>
					</View>
				)}
				<Button onPress={handleSavePosition} mode="outlined">
					{editPosition ? 'Save Position' : 'Enter Rank Position'}
				</Button>
				<Button
					onPress={() => {
						handleRemoveMovie(data.position);
						bottomSheetEditRankRef.current?.dismiss();
					}}
					compact
					mode="contained"
					buttonColor={theme.colors.errorContainer}
					textColor={theme.colors.onErrorContainer}
				>
					Remove
				</Button>
			</BottomSheetView>
		</BottomSheetModal>
	);
};

export default EditRankPosition;
