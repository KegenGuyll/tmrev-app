import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button, Divider, Switch, Text, useTheme } from 'react-native-paper';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { capitalize } from '@/utils/common';
import { useGetMovieDetailsQuery } from '@/redux/api/tmdb/movieApi';
import RatingSliderList, { Ratings } from '@/components/AddReview/RatingSliderList';
import MultiLineInput from '@/components/Inputs/MultiLineInput';
import { MoviePosterImage } from '@/components/MoviePoster';
import formatDateYear from '@/utils/formatDateYear';
import {
	useAddTmrevReviewMutation,
	useGetSingleReviewQuery,
	useUpdateTmrevReviewMutation,
} from '@/redux/api/tmrev';
import TextInput from '@/components/Inputs/TextInput';
import { CreateTmrevReviewQuery } from '@/models/tmrev/review';
import DatePicker from '@/components/Date/DatePicker';

type CreateReviewSearchParams = {
	movieId: string;
	content: 'edit' | 'create';
	from: string;
	reviewId: string;
};

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

const CreateReview = () => {
	const { movieId, content, reviewId } = useLocalSearchParams<CreateReviewSearchParams>();
	const router = useRouter();
	const [expanded, setExpanded] = useState(true);
	const [title, setTitle] = useState('');
	const [isPublic, setIsPublic] = useState(true);
	const [reviewDate, setReviewDate] = useState(dayjs(new Date()).format('YYYY-MM-DD'));
	const [updateReviewDate, setUpdateReviewDate] = useState(false);
	const [createReview] = useAddTmrevReviewMutation();
	const [updateReview] = useUpdateTmrevReviewMutation();
	const [ratings, setRatings] = useState<Ratings>(defaultRatings);
	const [note, setNote] = useState('');
	const theme = useTheme();

	const { data: movieData } = useGetMovieDetailsQuery({
		movie_id: Number(movieId) || 0,
		params: {},
	});

	const { data: reviewData } = useGetSingleReviewQuery(
		{ reviewId: reviewId || '' },
		{ skip: content !== 'edit' || !reviewId }
	);

	const selectedMovieData = useMemo(() => movieData, [movieData]);

	const handleEditMode = useCallback(() => {
		if (!reviewData) return;

		setRatings({
			plot: reviewData.body?.advancedScore?.plot || 0,
			theme: reviewData.body?.advancedScore?.theme || 0,
			climax: reviewData.body?.advancedScore?.climax || 0,
			ending: reviewData.body?.advancedScore?.ending || 0,
			acting: reviewData.body?.advancedScore?.acting || 0,
			characters: reviewData.body?.advancedScore?.characters || 0,
			music: reviewData.body?.advancedScore?.music || 0,
			cinematography: reviewData.body?.advancedScore?.cinematography || 0,
			visuals: reviewData.body?.advancedScore?.visuals || 0,
			personalScore: reviewData.body?.advancedScore?.personalScore || 0,
		});

		setTitle(reviewData.body?.title || '');
		setNote(reviewData.body?.notes || '');
		setIsPublic(reviewData.body?.public || true);
		setReviewDate(dayjs(reviewData.body?.reviewedDate).format('YYYY-MM-DD'));
	}, [reviewData]);

	useEffect(() => {
		handleEditMode();
	}, [handleEditMode]);

	const handleClearRatings = () => {
		setRatings(defaultRatings);
	};

	const handleSetRatings = (key: string, value: number) => {
		setRatings({ ...ratings, [key]: value });
	};

	const handleCreateMovieReview = async () => {
		try {
			if (selectedMovieData) {
				const review: CreateTmrevReviewQuery = {
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
					reviewedDate: dayjs(reviewDate).format('YYYY-MM-DD'),
					title: selectedMovieData.title,
					notes: note,
					public: isPublic,
				};

				if (content === 'edit') {
					await updateReview(review).unwrap();
				} else {
					await createReview(review).unwrap();
				}

				resetAllValues();

				router.dismiss();
			}
		} catch (error) {
			console.log(error);
		}
	};

	const resetAllValues = () => {
		handleClearRatings();
		setNote('');
		setIsPublic(true);
	};

	return (
		<>
			<Stack.Screen
				options={{ title: `${capitalize(content || '')} Review`, headerRight: () => null }}
			/>
			<KeyboardAwareScrollView style={{ backgroundColor: theme.colors.background }}>
				{selectedMovieData && (
					<View
						style={{
							gap: 8,
							padding: 16,
						}}
					>
						<View style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
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
								<Text variant="bodyMedium"> {formatDateYear(selectedMovieData.release_date)}</Text>
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
						<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
							<View style={{ flexGrow: 1 }}>
								<Text variant="labelLarge">Review Date</Text>
								<Text variant="bodyMedium">{dayjs(reviewDate).format('MMMM DD, YYYY')}</Text>
							</View>
							<Button compact mode="contained-tonal" onPress={() => setUpdateReviewDate(true)}>
								Change Date
							</Button>
							<DatePicker
								onDateChange={(d) => setReviewDate(dayjs(d).format('YYYY-MM-DD'))}
								date={reviewDate}
								visible={updateReviewDate}
								onDismiss={() => setUpdateReviewDate(false)}
							/>
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
						<Button onPress={handleCreateMovieReview} mode="contained">
							Save
						</Button>
					</View>
				)}
			</KeyboardAwareScrollView>
		</>
	);
};

export default CreateReview;
