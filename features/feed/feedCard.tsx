import { StyleSheet, View, Image, TouchableHighlight } from 'react-native';
import { TouchableRipple, Text, Chip, Snackbar, Button } from 'react-native-paper';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { FeedReviews } from '@/models/tmrev/feed';
import MoviePoster from '@/components/MoviePoster';
import {
	FeedReviewContentTypes,
	feedReviewDetailsRoute,
	feedReviewRoute,
	profileRoute,
} from '@/constants/routes';
import { useVoteTmrevReviewMutation } from '@/redux/api/tmrev';
import { formatDate } from '@/utils/common';
import { FromLocation } from '@/models';

type FeedCardProps = {
	review: FeedReviews;
	// eslint-disable-next-line react/no-unused-prop-types
	contentType: FeedReviewContentTypes;
	from: FromLocation;
};

const FeedCard: React.FC<FeedCardProps> = ({ review, from }: FeedCardProps) => {
	const styles = makeStyle();
	const router = useRouter();

	const { currentUser } = auth();

	const [hasLiked, setHasLiked] = useState<boolean>(false);
	const [hasDisliked, setHasDisliked] = useState<boolean>(false);
	const [snackBarMessage, setSnackBarMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!currentUser || !review.votes) return;

		setHasLiked(review.votes.upVote.includes(currentUser.uid));
		setHasDisliked(review.votes.downVote.includes(currentUser.uid));
	}, [review.votes, currentUser]);

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
				onPress={() => router.navigate(feedReviewRoute(review._id, 'reviews', from))}
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
								<Text variant="labelSmall">
									{dayjs(formatDate(review.createdAt)).format('hh:mm A · MMM DD, YYYY')}
								</Text>
							</View>
						</>
					</TouchableHighlight>
					<View style={[styles.flexRow, { flexWrap: 'wrap' }]}>
						<View style={{ flexGrow: 1 }}>
							<Text variant="titleMedium">{review.title}</Text>
						</View>
						<Chip icon="star">{review.averagedAdvancedScore}</Chip>
					</View>
					<View style={[styles.flexRow, { gap: 8, alignItems: 'stretch' }]}>
						<MoviePoster
							height={100}
							width={75}
							moviePoster={review.movieDetails.poster_path}
							movieId={review.tmdbID}
							location="home"
						/>
						<View style={[styles.flexColumn, { gap: 8 }]}>
							<Text variant="bodyMedium" style={{ flex: 1, flexWrap: 'wrap' }}>
								{review.notes}
							</Text>
						</View>
					</View>
					<View style={[styles.flexRow, { justifyContent: 'space-evenly', padding: 0 }]}>
						<Button
							textColor="white"
							onPress={handleUpVote}
							icon={hasLiked ? 'thumb-up' : 'thumb-up-outline'}
						>
							{review.votes!.upVote.length}
						</Button>
						<Button
							textColor="white"
							onPress={handleDownVote}
							icon={hasDisliked ? 'thumb-down' : 'thumb-down-outline'}
						>
							{review.votes!.downVote.length}
						</Button>
						<Button
							textColor="white"
							onPress={() => router.navigate(feedReviewDetailsRoute(review._id, 'reviews', from))}
							icon="comment-outline"
						>
							{review.replies}
						</Button>
						<Button textColor="white" onPress={() => console.log('share')} icon="share-outline">
							Share
						</Button>
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
