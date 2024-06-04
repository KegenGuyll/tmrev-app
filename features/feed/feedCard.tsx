import { StyleSheet, View, Image, TouchableHighlight } from 'react-native';
import { TouchableRipple, Text, IconButton, Chip } from 'react-native-paper';
import dayjs from 'dayjs';
import { FeedReviews } from '@/models/tmrev/feed';
import { MoviePosterImage } from '@/components/MoviePoster';

type FeedCardProps = {
	review: FeedReviews;
};

const FeedCard: React.FC<FeedCardProps> = ({ review }: FeedCardProps) => {
	const styles = makeStyle();

	return (
		<TouchableRipple
			onPress={() => console.log('card pressed')}
			style={[styles.container, styles.flexColumn, { gap: 8 }]}
		>
			<>
				<TouchableHighlight
					onPress={() => console.log('goto profile')}
					style={[styles.flexRow, { gap: 8, alignItems: 'center' }]}
				>
					<>
						<Image
							source={{ uri: review.userDetails.photoUrl }}
							style={{ width: 50, height: 50, borderRadius: 100 }}
						/>
						<View style={styles.flexColumn}>
							<Text variant="labelLarge">
								{review.userDetails.firstName} {review.userDetails.lastName}
							</Text>
							<Text>{dayjs(review.createdAt).format('MMMM DD YYYY')}</Text>
						</View>
					</>
				</TouchableHighlight>
				<View style={[styles.flexRow, { gap: 8, alignItems: 'stretch' }]}>
					<MoviePosterImage height={100} width={75} moviePoster={review.movieDetails.poster_path} />
					<View style={[styles.flexColumn, { gap: 8 }]}>
						<View style={styles.flexRow}>
							<Chip icon="star">{review.averagedAdvancedScore}</Chip>
						</View>
						<Text style={{ flex: 1, flexWrap: 'wrap' }}>{review.notes}</Text>
					</View>
				</View>
				<View style={[styles.flexRow, { justifyContent: 'space-evenly', padding: 0 }]}>
					<IconButton onPress={() => console.log('like')} size={12} icon="thumb-up" />
					<IconButton onPress={() => console.log('dislike')} size={12} icon="thumb-down" />
					<IconButton onPress={() => console.log('comment')} size={12} icon="comment" />
					<IconButton onPress={() => console.log('share')} size={12} icon="share" />
				</View>
			</>
		</TouchableRipple>
	);
};

const makeStyle = () =>
	StyleSheet.create({
		container: {
			flex: 1,
			paddingHorizontal: 8,
			paddingTop: 8,
		},
		flexRow: {
			display: 'flex',
			flexDirection: 'row',
		},
		flexColumn: {
			flex: 1,
			display: 'flex',
			flexDirection: 'column',
		},
	});

export default FeedCard;
