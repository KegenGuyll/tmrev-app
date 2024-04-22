/* eslint-disable react-native/no-color-literals */
import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Text, Button, Surface, Chip } from 'react-native-paper';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import imageUrl from '@/utils/imageUrl';
import { genreIdToName } from '@/utils/common';
import formatDateYear from '@/utils/formatDateYear';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { setVisibility } from '@/redux/slice/bottomSheet';

type MovieQuickActionsProps = {
	movie?: MovieGeneral;
};

const MovieQuickActions: React.FC<MovieQuickActionsProps> = ({ movie }: MovieQuickActionsProps) => {
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);
	const dispatch = useAppDispatch();

	const { visible } = useAppSelector((state) => state.bottomSheet);

	useEffect(() => {
		if (visible) {
			bottomSheetModalRef.current?.present();
		}
	}, [visible]);

	const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

	const handleBottomSheetChange = (index: number) => {
		if (index === -1) {
			dispatch(setVisibility(false));
		}
	};

	if (!movie || !visible) return null;

	return (
		<BottomSheetModal
			handleIndicatorStyle={{ backgroundColor: 'white' }}
			handleStyle={{ backgroundColor: '#121212' }}
			ref={bottomSheetModalRef}
			index={1}
			snapPoints={snapPoints}
			onChange={handleBottomSheetChange}
		>
			<BottomSheetView style={styles.contentContainer}>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'flex-start',
						gap: 8,
					}}
				>
					<Button icon="message-draw" mode="outlined">
						<Text>Review</Text>
					</Button>
					<Button icon="share" mode="outlined">
						<Text>Share</Text>
					</Button>
					<Button icon="plus" mode="outlined">
						<Text>WatchList</Text>
					</Button>
				</View>
				<View style={{ display: 'flex', flexDirection: 'row', gap: 16 }}>
					<Image
						style={styles.moviePoster}
						source={{ uri: imageUrl(movie.poster_path as string, 200) }}
					/>
					<Text variant="bodyMedium" style={{ flex: 1, flexWrap: 'wrap' }}>
						{movie.overview}
					</Text>
				</View>
				<Surface
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						borderRadius: 4,
						flexWrap: 'wrap',
						padding: 8,
						justifyContent: 'flex-start',
						gap: 8,
						width: '100%',
					}}
				>
					<Chip icon="calendar-blank-outline">
						<Text>{formatDateYear(movie.release_date)}</Text>
					</Chip>
					{movie.genre_ids.map((genreId) => (
						<Chip key={genreId}>
							<Text>{genreIdToName(genreId)}</Text>
						</Chip>
					))}
				</Surface>
			</BottomSheetView>
		</BottomSheetModal>
	);
};

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: '#121212',
		padding: 16,
		gap: 16,
	},
	moviePoster: {
		flexShrink: 0,
		width: 100,
		height: 150,
		borderRadius: 4,
		aspectRatio: 2 / 3,
	},
});

export default MovieQuickActions;
