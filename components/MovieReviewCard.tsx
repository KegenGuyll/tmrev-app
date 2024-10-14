import { Chip, Surface, Text, TouchableRipple } from 'react-native-paper';
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { TmrevReview } from '@/models/tmrev';
import MoviePoster from './MoviePoster';
import { FromLocation } from '@/models';
import { feedReviewRoute } from '@/constants/routes';
import { formatRuntime, numberShortHand } from '@/utils/common';

type EllipsizeSettings = {
	numberOflines: number;
	ellipsizeMode: 'head' | 'middle' | 'tail' | 'clip';
	width: DimensionValue | undefined;
};

export type MovieReviewDisplayChip = 'averagedAdvancedScore' | 'budget' | 'reviewDate' | 'runtime';

type MovieReviewCardProps = {
	review: TmrevReview;
	from: FromLocation;
	containerStyle?: StyleProp<ViewStyle>;
	titleEllipsizeSettings?: EllipsizeSettings;
	notesEllipsizeSettings?: EllipsizeSettings;
	onPress?: () => void;
	displayedChip?: MovieReviewDisplayChip;
};

const MovieReviewCard: React.FC<MovieReviewCardProps> = ({
	review,
	from,
	containerStyle,
	titleEllipsizeSettings,
	notesEllipsizeSettings,
	onPress,
	displayedChip = 'averagedAdvancedScore',
}: MovieReviewCardProps) => {
	const router = useRouter();

	const handleOnPress = () => {
		if (onPress) {
			onPress();
			return;
		}

		router.navigate(feedReviewRoute(review._id, 'reviews', from));
	};

	return (
		<TouchableRipple style={[styles.container, containerStyle]} onPress={handleOnPress}>
			<Surface style={styles.surface}>
				<View
					style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}
				>
					<View style={{ flexGrow: 1 }}>
						{titleEllipsizeSettings ? (
							<Text
								ellipsizeMode={titleEllipsizeSettings.ellipsizeMode}
								numberOfLines={titleEllipsizeSettings.numberOflines}
								style={{ width: titleEllipsizeSettings.width }}
								variant="titleMedium"
							>
								{review.title}
							</Text>
						) : (
							<Text variant="titleMedium">{review.title}</Text>
						)}
					</View>

					<View style={{ display: 'flex', flexDirection: 'row' }}>
						{displayedChip === 'averagedAdvancedScore' && (
							<Chip icon="star">{review.averagedAdvancedScore}</Chip>
						)}
						{displayedChip === 'budget' && (
							<Chip icon="cash">{numberShortHand(review.movieDetails.budget || 0)}</Chip>
						)}
						{displayedChip === 'reviewDate' && review.reviewedDate && (
							<Chip icon="calendar-blank">{dayjs(review.reviewedDate).format('M/DD/YY')}</Chip>
						)}
						{displayedChip === 'runtime' && (
							<Chip icon="clock-time-four-outline">
								{formatRuntime(review.movieDetails.runtime)}
							</Chip>
						)}
					</View>
				</View>

				<View style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
					<MoviePoster
						height={100}
						width={200}
						movieId={review.tmdbID}
						moviePoster={review.movieDetails.poster_path}
						clickable={false}
						location="movies"
					/>
					{notesEllipsizeSettings ? (
						<Text
							ellipsizeMode={notesEllipsizeSettings.ellipsizeMode}
							numberOfLines={notesEllipsizeSettings.numberOflines}
							style={{ flex: 1, flexWrap: 'wrap', width: notesEllipsizeSettings.width }}
						>
							{review.notes}
						</Text>
					) : (
						<Text style={{ flex: 1, flexWrap: 'wrap' }}>{review.notes}</Text>
					)}
				</View>
			</Surface>
		</TouchableRipple>
	);
};

const styles = StyleSheet.create({
	container: {
		width: '100%',
		height: '100%',
	},
	surface: {
		padding: 8,
		borderRadius: 4,
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
		width: '100%',
		height: '100%',
	},
	list: {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
});

export default MovieReviewCard;
