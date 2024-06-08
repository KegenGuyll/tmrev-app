import { MD3Theme, useTheme, Text, Chip, Divider, Button } from 'react-native-paper';
import { StyleSheet, View, Image } from 'react-native';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import MoviePoster from '@/components/MoviePoster';
import { ReviewResponse } from '@/models/tmrev/movie';
import { useVoteTmrevReviewMutation } from '@/redux/api/tmrev';
import { feedReviewDetailsRoute } from '@/constants/routes';
import { formatDate } from '@/utils/common';
import { FromLocation } from '@/models';

type ReviewCardProps = {
	reviewData: ReviewResponse | undefined;
	displayMetaData?: boolean;
	numberOfComments?: number;
	from: FromLocation;
};

const ReviewCard: React.FC<ReviewCardProps> = ({
	reviewData,
	displayMetaData = true,
	numberOfComments = 0,
	from,
}: ReviewCardProps) => {
	const styles = makeStyles(useTheme());
	const router = useRouter();
	const [hasLiked, setHasLiked] = useState<boolean>(false);
	const [hasDisliked, setHasDisliked] = useState<boolean>(false);

	const [voteReview] = useVoteTmrevReviewMutation();

	const { currentUser } = auth();

	useEffect(() => {
		if (!reviewData || !reviewData?.body) return;

		setHasLiked(reviewData?.body.votes!.upVote.includes(currentUser!.uid));
		setHasDisliked(reviewData?.body.votes!.downVote.includes(currentUser!.uid));
	}, [reviewData]);

	const handleUpVote = async () => {
		if (!reviewData || !reviewData?.body) return;
		try {
			await voteReview({ reviewId: reviewData?.body._id, vote: true }).unwrap();
			setHasLiked(true);
			setHasDisliked(false);
		} catch (error) {
			console.error(error);
		}
	};

	const handleDownVote = async () => {
		if (!reviewData || !reviewData?.body) return;
		try {
			await voteReview({ reviewId: reviewData?.body._id, vote: false }).unwrap();
			setHasDisliked(true);
			setHasLiked(false);
		} catch (error) {
			console.error(error);
		}
	};

	const handleComment = () => {
		if (!reviewData || !reviewData?.body) return;

		router.navigate(feedReviewDetailsRoute(reviewData.body?._id, 'reviews', from));
	};

	if (!reviewData) return null;

	return (
		<View style={[styles.reviewContainer, styles.flexColumn, { gap: 16 }]}>
			<View style={[styles.flexRow, { alignItems: 'center', gap: 8 }]}>
				<Image
					source={{ uri: reviewData.body?.user.photoUrl }}
					height={50}
					width={50}
					style={{ borderRadius: 100 }}
				/>
				<View>
					<Text variant="labelLarge">
						{reviewData.body?.user.firstName} {reviewData.body?.user.lastName}
					</Text>
					<Text variant="labelSmall">
						{dayjs(formatDate(reviewData.body!.createdAt)).format('hh:mm A · MMM DD, YYYY')}
					</Text>
				</View>
			</View>
			<View style={[styles.flexColumn, { gap: 4 }]}>
				<View style={[styles.flexRow, { flexWrap: 'wrap' }]}>
					<View style={{ flexGrow: 1 }}>
						<Text variant="titleMedium">{reviewData.body?.title}</Text>
					</View>
					<Chip icon="star">{reviewData.body?.averagedAdvancedScore}</Chip>
				</View>
				<View style={[styles.flexRow, { gap: 8 }]}>
					<View>
						<MoviePoster
							height={100}
							moviePoster={reviewData.body?.movieDetails.poster_path}
							location="home"
							movieId={reviewData.body!.tmdbID}
						/>
					</View>
					<Text variant="bodyMedium" style={{ flex: 1, flexWrap: 'wrap' }}>
						{reviewData.body?.notes}
					</Text>
				</View>
			</View>
			{displayMetaData && (
				<View style={[styles.flexColumn, { gap: 4 }]}>
					<Divider />
					<View style={[styles.flexRow, { justifyContent: 'space-evenly', alignItems: 'center' }]}>
						<Button
							textColor="white"
							onPress={handleUpVote}
							icon={hasLiked ? 'thumb-up' : 'thumb-up-outline'}
						>
							{reviewData.body?.votes?.upVote.length}
						</Button>
						<Button
							textColor="white"
							onPress={handleDownVote}
							icon={hasDisliked ? 'thumb-down' : 'thumb-down-outline'}
						>
							{reviewData.body?.votes?.downVote.length}
						</Button>
						<Button
							onPress={handleComment}
							textColor="white"
							icon="comment-outline"
							style={styles.flexRow}
						>
							{numberOfComments}
						</Button>
						<Button textColor="white" onPress={() => console.log('share')} icon="share-outline">
							Share
						</Button>
					</View>
					<Divider />
				</View>
			)}
		</View>
	);
};

const makeStyles = ({ colors }: MD3Theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
		},
		reviewContainer: {
			padding: 16,
		},
		flexRow: {
			display: 'flex',
			flexDirection: 'row',
		},
		flexColumn: {
			display: 'flex',
			flexDirection: 'column',
		},
		keyboardContainer: {
			flex: 1,
			position: 'absolute',
			right: 0,
			left: 0,
		},
		inner: {
			paddingVertical: 12,
			paddingHorizontal: 8,
			flex: 1,
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			gap: 0,
			backgroundColor: colors.background,
			width: '100%',
		},
	});

export default ReviewCard;
