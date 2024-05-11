import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Divider, Switch, Text } from 'react-native-paper';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MoviePosterImage } from '@/components/MoviePoster';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import CustomBottomSheetBackground from '@/components/CustomBottomSheetBackground';
import formatDateYear from '@/utils/formatDateYear';
import RatingSliderList, { Ratings } from '@/components/AddReview/RatingSliderList';
import ReviewNote from '@/components/AddReview/ReviewNote';
import { useAddTmrevReviewMutation } from '@/redux/api/tmrev';
import { CreateTmrevReviewQuery } from '@/models/tmrev';

const defaultRatings: Ratings = {
	plot: 5,
	theme: 5,
	climax: 5,
	ending: 5,
	acting: 5,
	characters: 5,
	music: 5,
	cinematography: 5,
	visuals: 5,
	personalScore: 5,
};

const snapPoints = ['95%'];

type CreateMovieReviewModalProps = {
	selectedMovie: MovieGeneral | null;
	setSelectedMovie: React.Dispatch<React.SetStateAction<MovieGeneral | null>>;
};

const CreateMovieReviewModal: React.FC<CreateMovieReviewModalProps> = ({
	selectedMovie,
	setSelectedMovie,
}: CreateMovieReviewModalProps) => {
	const router = useRouter();
	const [isPrivate, setIsPrivate] = useState(false);
	const [createReview] = useAddTmrevReviewMutation();
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);
	const [ratings, setRatings] = useState<Ratings>(defaultRatings);
	const [note, setNote] = useState('');
	const styles = makeStyles();

	const handleSetRatings = (key: string, value: number) => {
		setRatings({ ...ratings, [key]: value });
	};

	const handleClearRatings = () => {
		setRatings(defaultRatings);
	};

	useEffect(() => {
		if (selectedMovie) {
			bottomSheetModalRef.current?.present();
		}
	}, [selectedMovie]);

	const handleBottomSheetDismiss = () => {
		setSelectedMovie(null);
		bottomSheetModalRef.current?.dismiss();
	};

	const handleCreateMovieReview = async () => {
		try {
			if (selectedMovie) {
				const review: CreateTmrevReviewQuery = {
					tmdbID: selectedMovie.id,
					advancedScore: {
						plot: ratings.plot,
						theme: ratings.theme,
						climax: ratings.climax,
						ending: ratings.ending,
						acting: ratings.acting,
						characters: ratings.characters,
						music: ratings.music,
						cinematography: ratings.cinematography,
						visuals: ratings.visuals,
						personalScore: ratings.personalScore,
					},
					reviewedDate: new Date().toISOString(),
					title: selectedMovie.title,
					moviePoster: selectedMovie.poster_path || '',
					notes: note,
					public: !isPrivate,
					release_date: selectedMovie.release_date,
				};
				await createReview(review).unwrap();

				handleBottomSheetDismiss();
				setNote('');
				handleClearRatings();
				router.push(`/(tabs)/(addReview)/${selectedMovie.id}?from=addReview`);
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<BottomSheetModal
			handleIndicatorStyle={styles.customHandleStyle}
			backgroundComponent={CustomBottomSheetBackground}
			snapPoints={snapPoints}
			ref={bottomSheetModalRef}
			onChange={(index) => {
				if (index === -1) setSelectedMovie(null);
			}}
		>
			<BottomSheetScrollView style={styles.bottomSheetContainer}>
				{selectedMovie && (
					<View style={{ gap: 16, marginBottom: 32 }}>
						<View
							style={{
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<Button onPress={handleBottomSheetDismiss}>Cancel</Button>
							<Text variant="titleMedium">Add Review</Text>
							<Button onPress={handleCreateMovieReview}>Save</Button>
						</View>
						<Divider />
						<View style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
							<MoviePosterImage moviePoster={selectedMovie.poster_path} height={100} width={50} />
							<View
								style={{
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'center',
									flexWrap: 'wrap',
								}}
							>
								<Text variant="titleMedium">{selectedMovie.title}</Text>
								<Text variant="bodyMedium"> {formatDateYear(selectedMovie.release_date)}</Text>
							</View>
						</View>
						<Divider />
						<View
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'flex-start',
								gap: 4,
							}}
						>
							<Text variant="labelLarge">{!isPrivate ? 'Public' : 'Private'} Review</Text>
							<Switch value={isPrivate} onValueChange={() => setIsPrivate(!isPrivate)} />
						</View>
						<RatingSliderList
							resetRatings={handleClearRatings}
							ratings={ratings}
							setRatings={handleSetRatings}
						/>
						<ReviewNote note={note} setNote={setNote} />
						<Divider />
						<Button mode="outlined" onPress={handleBottomSheetDismiss}>
							Cancel
						</Button>
						<Button mode="contained" onPress={handleCreateMovieReview}>
							Save
						</Button>
					</View>
				)}
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};

export default CreateMovieReviewModal;

const makeStyles = () =>
	StyleSheet.create({
		container: {
			flex: 1,
		},
		list: {
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'wrap',
		},
		bottomSheetContainer: {
			flex: 1,
			display: 'flex',
			flexDirection: 'column',
			padding: 16,
			gap: 32,
		},
		customHandleStyle: {
			backgroundColor: 'white',
		},
	});
