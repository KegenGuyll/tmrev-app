import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Divider, Snackbar, Switch, Text } from 'react-native-paper';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import dayjs from 'dayjs';
import { useQueryClient } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import { MoviePosterImage } from '@/components/MoviePoster';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import CustomBottomSheetBackground from '@/components/CustomBottomSheetBackground';
import formatDateYear from '@/utils/formatDateYear';
import RatingSliderList, { Ratings } from '@/components/AddReview/RatingSliderList';
import {
	getReviewControllerFindByTmdbIdQueryKey,
	getUserControllerFindOneQueryKey,
	useReviewControllerCreate,
	useReviewControllerUpdate,
} from '@/api/tmrev-api-v2/endpoints';
import { CreateReviewDtoClass, ReviewAggregated, UpdateReviewDtoClass } from '@/api/tmrev-api-v2';
import { movieDetailsRoute } from '@/constants/routes';
import TitledHandledComponent from './BottomSheetModal/TitledHandledComponent';
import TextInput from './Inputs/TextInput';
import MultiLineInput from './Inputs/MultiLineInput';
import { useGetMovieDetailsQuery } from '@/redux/api/tmdb/movieApi';

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
	reviewData?: ReviewAggregated;
};

// deprecated
const CreateMovieReviewModal: React.FC<CreateMovieReviewModalProps> = ({
	selectedMovie,
	visible,
	onDismiss,
	reviewData,
}: CreateMovieReviewModalProps) => {
	const router = useRouter();
	const [lastReview, setLastReview] = useState<MovieGeneral | null>(null);
	const [expanded, setExpanded] = useState(true);
	const [reviewedSuccess, setReviewedSuccess] = useState(false);
	const [title, setTitle] = useState('');
	const [isPublic, setIsPublic] = useState(true);
	const queryClient = useQueryClient();
	const { mutateAsync: createReview } = useReviewControllerCreate();
	const { mutateAsync: updateReview } = useReviewControllerUpdate();
	const { currentUser } = useAuth({});

	const bottomSheetModalRef = useRef<BottomSheetModal>(null);
	const [ratings, setRatings] = useState<Ratings>(defaultRatings);
	const [note, setNote] = useState('');
	const styles = makeStyles();

	const { data: movieData } = useGetMovieDetailsQuery(
		{ movie_id: reviewData?.tmdbID || 0, params: {} },
		{ skip: !!selectedMovie || !reviewData }
	);

	const selectedMovieData = useMemo(() => selectedMovie || movieData, [selectedMovie, movieData]);

	const handleSetRatings = (key: string, value: number) => {
		setRatings({ ...ratings, [key]: value });
	};

	const handleEditMode = useCallback(() => {
		if (!reviewData) return;

		setRatings({
			plot: reviewData.advancedScore?.plot || 0,
			theme: reviewData.advancedScore?.theme || 0,
			climax: reviewData.advancedScore?.climax || 0,
			ending: reviewData.advancedScore?.ending || 0,
			acting: reviewData.advancedScore?.acting || 0,
			characters: reviewData.advancedScore?.characters || 0,
			music: reviewData.advancedScore?.music || 0,
			cinematography: reviewData.advancedScore?.cinematography || 0,
			visuals: reviewData.advancedScore?.visuals || 0,
			personalScore: reviewData.advancedScore?.personalScore || 0,
		});

		setTitle(reviewData.title || '');
		setNote(reviewData.notes || '');
		setIsPublic(reviewData.public || true);
	}, [reviewData]);

	useEffect(() => {
		handleEditMode();
	}, [handleEditMode]);

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
			if (selectedMovieData) {
				const review: CreateReviewDtoClass | UpdateReviewDtoClass = {
					tmdbID: selectedMovieData.id,
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
					title: selectedMovieData.title,
					notes: note,
					public: isPublic,
				};

				if (reviewData) {
					await updateReview({ id: reviewData._id, data: review });
					await queryClient.invalidateQueries({
						queryKey: getReviewControllerFindByTmdbIdQueryKey(selectedMovieData.id),
					});
					await queryClient.invalidateQueries({
						queryKey: getUserControllerFindOneQueryKey(currentUser?.uid),
					});
				} else {
					await createReview({ data: review });
					await queryClient.invalidateQueries({
						queryKey: getReviewControllerFindByTmdbIdQueryKey(selectedMovieData.id),
					});
					await queryClient.invalidateQueries({
						queryKey: getUserControllerFindOneQueryKey(currentUser?.uid),
					});
				}

				setLastReview(selectedMovieData);

				handleBottomSheetDismiss();
				resetAllValues();

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
						title={reviewData ? 'Edit Review' : 'Add Review'}
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
				<KeyboardAvoidingView
					style={{ flex: 1 }}
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					keyboardVerticalOffset={0}
				>
					<BottomSheetScrollView
						automaticallyAdjustKeyboardInsets
						style={styles.bottomSheetContainer}
					>
						{selectedMovieData && (
							<View style={{ gap: 16 }}>
								<View
									style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}
								>
									<MoviePosterImage
										moviePoster={selectedMovieData.poster_path}
										height={100}
										width={50}
									/>
									<View
										style={{
											display: 'flex',
											flexDirection: 'row',
											alignItems: 'center',
											flexWrap: 'wrap',
										}}
									>
										<Text variant="titleMedium">{selectedMovieData.title}</Text>
										<Text variant="bodyMedium">
											{' '}
											{formatDateYear(selectedMovieData.release_date)}
										</Text>
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
									value={selectedMovieData.title || title}
									onChangeText={setTitle}
								/>
								<MultiLineInput
									value={note}
									onChangeText={setNote}
									numberOfLines={6}
									label="Review Notes"
								/>
								<Divider />
							</View>
						)}
					</BottomSheetScrollView>
				</KeyboardAvoidingView>
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
			marginBottom: 32,
		},
		customHandleStyle: {
			backgroundColor: 'white',
		},
	});
