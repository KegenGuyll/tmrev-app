import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Divider, Snackbar, Switch, Text } from 'react-native-paper';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import { MoviePosterImage } from '@/components/MoviePoster';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import CustomBottomSheetBackground from '@/components/CustomBottomSheetBackground';
import formatDateYear from '@/utils/formatDateYear';
import RatingSliderList, { Ratings } from '@/components/AddReview/RatingSliderList';
import { useAddTmrevReviewMutation } from '@/redux/api/tmrev';
import { CreateTmrevReviewQuery } from '@/models/tmrev';
import { movieDetailsRoute } from '@/constants/routes';
import TitledHandledComponent from './BottomSheetModal/TitledHandledComponent';
import TextInput from './Inputs/TextInput';
import MultiLineInput from './Inputs/MultiLineInput';

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
	visible: boolean;
	onDismiss: () => void;
	selectedMovie: MovieGeneral | null;
};

const CreateMovieReviewModal: React.FC<CreateMovieReviewModalProps> = ({
	selectedMovie,
	visible,
	onDismiss,
}: CreateMovieReviewModalProps) => {
	const router = useRouter();
	const [lastReview, setLastReview] = useState<MovieGeneral | null>(null);
	const [expanded, setExpanded] = useState(true);
	const [reviewedSuccess, setReviewedSuccess] = useState(false);
	const [title, setTitle] = useState('');
	const [isPublic, setIsPublic] = useState(true);
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

	const resetAllValues = () => {
		handleClearRatings();
		setNote('');
		setIsPublic(true);
	};

	useEffect(() => {
		if (visible) {
			bottomSheetModalRef.current?.present();
		} else {
			bottomSheetModalRef.current?.dismiss();
		}
	}, [visible]);

	const handleBottomSheetDismiss = () => {
		bottomSheetModalRef.current?.dismiss();
		onDismiss();
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
					reviewedDate: dayjs(new Date()).format('YYYY-MM-DD'),
					title: selectedMovie.title,
					notes: note,
					public: isPublic,
				};
				await createReview(review).unwrap();

				setLastReview(selectedMovie);

				handleBottomSheetDismiss();
				setNote('');
				handleClearRatings();

				setReviewedSuccess(true);
			}
		} catch (error) {
			console.log(error);
			setReviewedSuccess(false);
		}
	};

	return (
		<>
			<BottomSheetModal
				handleComponent={({ ...props }) => (
					<TitledHandledComponent
						{...props}
						title="Add Review"
						cancelButton={{
							title: 'Cancel',
							onPress: handleBottomSheetDismiss,
						}}
						submitButton={{
							title: 'Save',
							onPress: handleCreateMovieReview,
						}}
					/>
				)}
				handleIndicatorStyle={styles.customHandleStyle}
				backgroundComponent={CustomBottomSheetBackground}
				snapPoints={snapPoints}
				ref={bottomSheetModalRef}
				onChange={(index) => {
					if (index === -1) onDismiss();
				}}
			>
				<BottomSheetScrollView style={styles.bottomSheetContainer}>
					{selectedMovie && (
						<View style={{ gap: 16, marginBottom: 32 }}>
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
								<Text variant="labelLarge">Public Review</Text>
								<Switch value={isPublic} onValueChange={() => setIsPublic(!isPublic)} />
							</View>
							<RatingSliderList
								expanded={expanded}
								setExpanded={setExpanded}
								resetRatings={handleClearRatings}
								ratings={ratings}
								setRatings={handleSetRatings}
							/>
							<TextInput
								label="Title"
								placeholder="Review Title"
								value={selectedMovie.title || title}
								onChangeText={setTitle}
							/>
							<MultiLineInput
								onFocus={() => setExpanded(false)}
								value={note}
								onChangeText={setNote}
								numberOfLines={6}
								label="Review Notes"
							/>
							<Divider />
						</View>
					)}
				</BottomSheetScrollView>
			</BottomSheetModal>
			<Snackbar
				visible={!!lastReview && reviewedSuccess}
				onDismiss={() => {
					setReviewedSuccess(false);
					setLastReview(null);
				}}
				duration={3000}
				action={{
					label: 'View',
					onPress: () => {
						router.navigate(movieDetailsRoute('addReview', lastReview!.id.toString()));
					},
				}}
			>
				{`${lastReview?.title} Reviewed Successfully`}
			</Snackbar>
		</>
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
