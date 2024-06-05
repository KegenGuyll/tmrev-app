import { StyleSheet, View, Image, TouchableHighlight } from 'react-native';
import { TouchableRipple, Text, IconButton, Chip, Snackbar } from 'react-native-paper';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { FeedReviews } from '@/models/tmrev/feed';
import { MoviePosterImage } from '@/components/MoviePoster';
import { feedReviewRoute, profileRoute } from '@/constants/routes';
import { useVoteTmrevReviewMutation } from '@/redux/api/tmrev';

type FeedCardProps = {
	review: FeedReviews;
};

const FeedCard: React.FC<FeedCardProps> = ({ review }: FeedCardProps) => {
	const styles = makeStyle();
	const router = useRouter();

	const { currentUser } = auth();

	const [hasLiked, setHasLiked] = useState<boolean>(false);
	const [hasDisliked, setHasDisliked] = useState<boolean>(false);
	const [snackBarMessage, setSnackBarMessage] = useState<string | null>(null);

	useEffect(() => {
		setHasLiked(review.votes!.upVote.includes(currentUser!.uid));
		setHasDisliked(review.votes!.downVote.includes(currentUser!.uid));
	}, [review.votes]);

	const [voteReview] = useVoteTmrevReviewMutation();

	const handleUpVote = async () => {
		try {
			await voteReview({ reviewId: review._id, vote: true }).unwrap();
			setHasLiked(true);
			setHasDisliked(false);
		} catch (error) {
			setSnackBarMessage('Error has occurred');
		}
	};

	const handleDownVote = async () => {
		try {
			await voteReview({ reviewId: review._id, vote: false }).unwrap();
			setHasDisliked(true);
			setHasLiked(false);
		} catch (error) {
			setSnackBarMessage('Error has occurred');
		}
	};

	return (
		<>
			<TouchableRipple
				onPress={() => router.navigate(feedReviewRoute(review._id))}
				style={[styles.container, styles.flexColumn, { gap: 8 }]}
			>
				<>
					<TouchableHighlight
						onPress={() => router.navigate(profileRoute('home', review.userDetails.uuid))}
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
						<MoviePosterImage
							height={100}
							width={75}
							moviePoster={review.movieDetails.poster_path}
						/>
						<View style={[styles.flexColumn, { gap: 8 }]}>
							<View style={styles.flexRow}>
								<Chip icon="star">{review.averagedAdvancedScore}</Chip>
							</View>
							<Text style={{ flex: 1, flexWrap: 'wrap' }}>{review.notes}</Text>
						</View>
					</View>
					<View style={[styles.flexRow, { justifyContent: 'space-evenly', padding: 0 }]}>
						<IconButton
							onPress={handleUpVote}
							size={12}
							icon={hasLiked ? 'thumb-up' : 'thumb-up-outline'}
						/>
						<IconButton
							onPress={handleDownVote}
							size={12}
							icon={hasDisliked ? 'thumb-down' : 'thumb-down-outline'}
						/>
						<IconButton onPress={() => console.log('comment')} size={12} icon="comment" />
						<IconButton onPress={() => console.log('share')} size={12} icon="share" />
					</View>
				</>
			</TouchableRipple>
			<Snackbar visible={!!snackBarMessage} onDismiss={() => setSnackBarMessage(null)}>
				{snackBarMessage}
			</Snackbar>
		</>
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
