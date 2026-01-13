import {
	MD3Theme,
	useTheme,
	Text,
	Chip,
	Divider,
	Button,
	TouchableRipple,
	Menu,
	IconButton,
} from 'react-native-paper';
import { StyleSheet, View, Image } from 'react-native';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import useAuth from '@/hooks/useAuth';
import useReviewMutations from '@/hooks/useReviewMutations';
import MoviePoster from '@/components/MoviePoster';
import { ReviewAggregated } from '@/api/tmrev-api-v2';
import { feedReviewDetailsRoute, profileRoute, reviewFunctionRoute } from '@/constants/routes';
import { formatDate } from '@/utils/common';
import { FromLocation } from '@/models';
import BarChart from '@/components/CustomCharts/BarChart';
import { commentLoginPrompt, dislikeLoginPrompt, likeLoginPrompt } from '@/constants/messages';

type ReviewCardProps = {
	reviewData: ReviewAggregated | undefined;
	displayMetaData?: boolean;
	numberOfComments?: number;
	from: FromLocation;
	setLoginMessage?: (message: string | null) => void;
};

const ReviewCard: React.FC<ReviewCardProps> = ({
	reviewData,
	displayMetaData = true,
	numberOfComments = 0,
	from,
	setLoginMessage,
}: ReviewCardProps) => {
	const styles = makeStyles(useTheme());
	const router = useRouter();
	const [hasLiked, setHasLiked] = useState<boolean>(false);
	const [hasDisliked, setHasDisliked] = useState<boolean>(false);
	const [showMenu, setShowMenu] = useState<boolean>(false);
	const [showFullReview, setShowFullReview] = useState<boolean>(true);

	const theme = useTheme();

	const fullReviewData = useMemo(() => {
		if (!reviewData || !reviewData.advancedScore) return [];

		return [
			{
				label: 'Plot',
				value: reviewData.advancedScore.plot,
			},
			{
				label: 'Theme',
				value: reviewData.advancedScore.theme,
			},
			{
				label: 'Climax',
				value: reviewData.advancedScore.climax,
			},
			{
				label: 'Ending',
				value: reviewData.advancedScore.ending,
			},
			{
				label: 'Acting',
				value: reviewData.advancedScore.acting,
			},
			{
				label: 'Characters',
				value: reviewData.advancedScore.characters,
			},
			{
				label: 'Music',
				value: reviewData.advancedScore.music,
			},
			{
				label: 'Cinematography',
				value: reviewData.advancedScore.cinematography,
			},
			{
				label: 'Visuals',
				value: reviewData.advancedScore.visuals,
			},
			{
				label: 'Personal Score',
				value: reviewData.advancedScore.personalScore,
			},
		];
	}, [reviewData]);

	const { voteUp, removeUp, voteDown, removeDown, isVotingUp, isVotingDown } = useReviewMutations();

	const { currentUser } = useAuth({});

	useEffect(() => {
		if (!reviewData || !currentUser) return;

		setHasLiked(reviewData.votes?.upVote.includes(currentUser.uid));
		setHasDisliked(reviewData.votes?.downVote.includes(currentUser.uid));
	}, [reviewData, currentUser]);

	const handleUpVote = async () => {
		if (!reviewData || !currentUser) {
			if (setLoginMessage) {
				setLoginMessage(likeLoginPrompt);
			}
			return;
		}

		// Store previous state for rollback
		const previousLiked = hasLiked;
		const previousDisliked = hasDisliked;

		try {
			// If already upvoted, remove the upvote (unvote)
			if (hasLiked) {
				// Optimistic update
				setHasLiked(false);
				await removeUp({ reviewId: reviewData._id });
			} else {
				// If currently downvoted, remove downvote first
				if (hasDisliked) {
					setHasDisliked(false);
					await removeDown({ reviewId: reviewData._id });
				}
				// Optimistic update then add upvote
				setHasLiked(true);
				await voteUp({ reviewId: reviewData._id });
			}
		} catch (error) {
			// Rollback on error
			setHasLiked(previousLiked);
			setHasDisliked(previousDisliked);
		}
	};

	const handleDownVote = async () => {
		if (!reviewData || !currentUser) {
			if (setLoginMessage) {
				setLoginMessage(dislikeLoginPrompt);
			}
			return;
		}

		// Store previous state for rollback
		const previousLiked = hasLiked;
		const previousDisliked = hasDisliked;

		try {
			// If already downvoted, remove the downvote (unvote)
			if (hasDisliked) {
				// Optimistic update
				setHasDisliked(false);
				await removeDown({ reviewId: reviewData._id });
			} else {
				// If currently upvoted, remove upvote first
				if (hasLiked) {
					setHasLiked(false);
					await removeUp({ reviewId: reviewData._id });
				}
				// Optimistic update then add downvote
				setHasDisliked(true);
				await voteDown({ reviewId: reviewData._id });
			}
		} catch (error) {
			// Rollback on error
			setHasLiked(previousLiked);
			setHasDisliked(previousDisliked);
		}
	};

	const handleComment = () => {
		if (!reviewData || !currentUser) {
			if (setLoginMessage) {
				setLoginMessage(commentLoginPrompt);
			}
			return;
		}

		router.navigate(feedReviewDetailsRoute(reviewData._id, 'reviews', from));
	};

	const handleShowFullReview = () => {
		setShowFullReview(!showFullReview);
		setShowMenu(false);
	};

	const handleEditMode = () => {
		router.navigate(reviewFunctionRoute(from, reviewData?.tmdbID || 0, 'edit', reviewData?._id));
		setShowMenu(false);
	};

	if (!reviewData) return null;

	return (
		<View style={[styles.reviewContainer, styles.flexColumn, { gap: 16 }]}>
			<View style={[styles.flexRow, { alignItems: 'center', gap: 8 }]}>
				<TouchableRipple
					onPress={() =>
						reviewData.profile && router.push(profileRoute(from!, reviewData.profile.uuid))
					}
				>
					{reviewData.profile?.photoUrl ? (
						<Image
							source={{ uri: reviewData.profile.photoUrl }}
							height={50}
							width={50}
							style={{ borderRadius: 100 }}
						/>
					) : (
						<View
							style={{
								height: 50,
								width: 50,
								borderRadius: 100,
								backgroundColor: theme.colors.surfaceVariant,
							}}
						/>
					)}
				</TouchableRipple>
				<View style={[styles.flexRow, { alignItems: 'flex-start', flex: 1, width: '100%' }]}>
					<View style={{ flexGrow: 1 }}>
						<Text variant="labelLarge">{reviewData.profile?.username}</Text>
						<Text variant="labelSmall">
							{dayjs(formatDate(reviewData.createdAt)).format('hh:mm A · MMM DD, YYYY')}
						</Text>
					</View>
					<View>
						<Menu
							visible={showMenu}
							onDismiss={() => setShowMenu(false)}
							anchor={<IconButton icon="dots-vertical" onPress={() => setShowMenu(true)} />}
						>
							<Menu.Item
								leadingIcon="chart-timeline-variant-shimmer"
								dense
								onPress={handleShowFullReview}
								title="View Full Review"
							/>
							{reviewData.userId === currentUser?.uid && (
								<Menu.Item onPress={handleEditMode} leadingIcon="pencil" title="Edit" />
							)}
						</Menu>
					</View>
				</View>
			</View>
			<View style={[styles.flexColumn, { gap: 4 }]}>
				<View style={[styles.flexRow, { flexWrap: 'wrap' }]}>
					<View style={{ flexGrow: 1 }}>
						<Text variant="titleMedium">{reviewData.title}</Text>
					</View>
					<Chip icon="star">{reviewData.averagedAdvancedScore}</Chip>
				</View>
				<View style={[styles.flexRow, { gap: 8 }]}>
					<View>
						<MoviePoster
							height={100}
							moviePoster={reviewData.movieDetails?.poster_path}
							location="home"
							movieId={reviewData.tmdbID}
						/>
					</View>
					<Text variant="bodyMedium" style={{ flex: 1, flexWrap: 'wrap' }}>
						{reviewData.notes}
					</Text>
				</View>
				{showFullReview && (
					<View style={{ marginTop: 16 }}>
						<BarChart
							barWidth={300}
							barColor={theme.colors.primary}
							barLabelColor="black"
							data={fullReviewData}
						/>
					</View>
				)}
			</View>
			{displayMetaData && (
				<View style={[styles.flexColumn, { gap: 4 }]}>
					<Divider />
					<View style={[styles.flexRow, { justifyContent: 'space-evenly', alignItems: 'center' }]}>
						<Button
							textColor="white"
							onPress={handleUpVote}
							icon={hasLiked ? 'thumb-up' : 'thumb-up-outline'}
							disabled={isVotingUp || isVotingDown}
						>
							{reviewData.votes?.upVote.length || 0}
						</Button>
						<Button
							textColor="white"
							onPress={handleDownVote}
							icon={hasDisliked ? 'thumb-down' : 'thumb-down-outline'}
							disabled={isVotingUp || isVotingDown}
						>
							{reviewData.votes?.downVote.length || 0}
						</Button>
						<Button
							onPress={handleComment}
							textColor="white"
							icon="comment-outline"
							style={styles.flexRow}
						>
							{numberOfComments}
						</Button>
						<Button
							disabled
							textColor="white"
							onPress={() => console.log('share')}
							icon="share-outline"
						>
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
