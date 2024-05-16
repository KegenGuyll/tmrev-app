import { Chip, Surface, Text, TouchableRipple } from 'react-native-paper';
import { DimensionValue, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { TmrevReview } from '@/models/tmrev';
import MoviePoster from './MoviePoster';
import { FromLocation } from '@/models';
import { movieDetailsRoute } from '@/constants/routes';

type MovieReviewCardProps = {
	review: TmrevReview;
	from: FromLocation;
	containerStyle?: StyleProp<ViewStyle>;
	titleEllipsizeSettings?: {
		numberOflines: number;
		ellipsizeMode: 'head' | 'middle' | 'tail' | 'clip';
		width: DimensionValue | undefined;
	};
	onPress?: () => void;
};

const MovieReviewCard: React.FC<MovieReviewCardProps> = ({
	review,
	from,
	containerStyle,
	titleEllipsizeSettings,
	onPress,
}: MovieReviewCardProps) => {
	const router = useRouter();

	const handleOnPress = () => {
		if (onPress) {
			onPress();
			return;
		}

		router.push(movieDetailsRoute(from, review.tmdbID));
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
						<Chip icon="star">{review.averagedAdvancedScore}</Chip>
					</View>
				</View>

				<View style={{ display: 'flex', flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
					<MoviePoster
						height={100}
						width={200}
						movieId={review.tmdbID}
						moviePoster={review.moviePoster}
						clickable={false}
						location="movies"
					/>
					<Text style={{ flex: 1, flexWrap: 'wrap' }}>{review.notes}</Text>
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
