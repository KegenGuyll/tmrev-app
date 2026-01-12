import { StyleSheet, View, Image, TouchableHighlight } from 'react-native';
import {
	TouchableRipple,
	Text,
	Chip,
	Snackbar,
	Button,
	useTheme,
	Menu,
	IconButton,
} from 'react-native-paper';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import useReviewMutations from '@/hooks/useReviewMutations';
import { FeedItem } from '@/api/tmrev-api-v2/schemas';
import MoviePoster from '@/components/MoviePoster';
import {
	FeedReviewContentTypes,
	feedReviewDetailsRoute,
	feedReviewRoute,
	profileRoute,
	reviewFunctionRoute,
} from '@/constants/routes';
import { formatDate } from '@/utils/common';
import { FromLocation } from '@/models';
import BarChart from '@/components/CustomCharts/BarChart';
import { commentLoginPrompt, dislikeLoginPrompt, likeLoginPrompt } from '@/constants/messages';

type FeedCardProps = {
	review: FeedItem;
	// eslint-disable-next-line react/no-unused-prop-types
	contentType: FeedReviewContentTypes;
	from: FromLocation;
	setLoginMessage?: (message: string | null) => void;
};

const FeedCard: React.FC<FeedCardProps> = ({ review, from, setLoginMessage }: FeedCardProps) => {
	const styles = makeStyle();
	const router = useRouter();

	const { currentUser } = useAuth({});

	const [hasLiked, setHasLiked] = useState<boolean>(review.hasUpvoted);
	const [hasDisliked, setHasDisliked] = useState<boolean>(review.hasDownvoted);
	const [snackBarMessage, setSnackBarMessage] = useState<string | null>(null);
	const [showMenu, setShowMenu] = useState<boolean>(false);
	const [showFullReview, setShowFullReview] = useState<boolean>(false);
	const theme = useTheme();

	const { voteUp, removeUp, voteDown, removeDown, isVotingUp, isVotingDown } = useReviewMutations();

	useEffect(() => {
		if (!review || !currentUser) return;

		setHasLiked(review.hasUpvoted);
		setHasDisliked(review.hasDownvoted);
	}, [review, currentUser]);

	const fullReviewData = useMemo(() => {
		if (!review || !review.advancedScore) return [];

		return [
			{
				label: 'Plot',
				value: review.advancedScore.plot,
			},
			{
				label: 'Theme',
				value: review.advancedScore.theme,
			},
			{
				label: 'Climax',
				value: review.advancedScore.climax,
			},
			{
				label: 'Ending',
				value: review.advancedScore.ending,
			},
			{
				label: 'Acting',
				value: review.advancedScore.acting,
			},
			{
				label: 'Characters',
				value: review.advancedScore.characters,
			},
			{
				label: 'Music',
				value: review.advancedScore.music,
			},
			{
				label: 'Cinematography',
				value: review.advancedScore.cinematography,
			},
			{
				label: 'Visuals',
				value: review.advancedScore.visuals,
			},
			{
				label: 'Personal Score',
				value: review.advancedScore.personalScore,
			},
		];
	}, [review]);

	const handleComment = () => {
		if (!currentUser) {
			if (setLoginMessage) {
				setLoginMessage(commentLoginPrompt);
			}
			return;
		}

		router.navigate(feedReviewDetailsRoute(review._id, 'reviews', from));
	};

	const handleUpVote = async () => {
		if (!review || !currentUser) {
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
				await removeUp({ reviewId: review._id });
			} else {
				// If currently downvoted, remove downvote first
				if (hasDisliked) {
					setHasDisliked(false);
					await removeDown({ reviewId: review._id });
				}
				// Optimistic update then add upvote
				setHasLiked(true);
				await voteUp({ reviewId: review._id });
			}
		} catch (error) {
			// Rollback on error
			setHasLiked(previousLiked);
			setHasDisliked(previousDisliked);
		}
	};

	const handleDownVote = async () => {
		if (!review || !currentUser) {
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
				await removeDown({ reviewId: review._id });
			} else {
				// If currently upvoted, remove upvote first
				if (hasLiked) {
					setHasLiked(false);
					await removeUp({ reviewId: review._id });
				}
				// Optimistic update then add downvote
				setHasDisliked(true);
				await voteDown({ reviewId: review._id });
			}
		} catch (error) {
			// Rollback on error
			setHasLiked(previousLiked);
			setHasDisliked(previousDisliked);
		}
	};

	const handleShowFullReview = () => {
		setShowFullReview(!showFullReview);
		setShowMenu(false);
	};

	const handleEditMode = () => {
		router.navigate(reviewFunctionRoute(from, review.tmdbID, 'edit', review._id));
		setShowMenu(false);
	};

	return (
		<>
			<TouchableRipple
				onPress={() => router.navigate(feedReviewRoute(review._id, 'reviews', from))}
				style={[styles.container, styles.flexColumn, { gap: 8 }]}
			>
				<>
					<View style={[styles.flexRow, { gap: 8, alignItems: 'center' }]}>
						<TouchableHighlight
							onPress={() => router.navigate(profileRoute('home', review.profile.uuid))}
							style={[styles.flexRow, { gap: 8, alignItems: 'center' }]}
						>
							{review.profile.photoUrl ? (
								<Image
									source={{ uri: review.profile.photoUrl }}
									style={{ width: 50, height: 50, borderRadius: 100 }}
								/>
							) : (
								<View
									style={{
										width: 50,
										height: 50,
										borderRadius: 100,
										backgroundColor: theme.colors.surfaceVariant,
									}}
								/>
							)}
						</TouchableHighlight>
						<View style={styles.flexColumn}>
							<Text variant="labelLarge">{review.profile.username}</Text>
							<Text variant="labelSmall">
								{dayjs(formatDate(review.createdAt)).format('hh:mm A · MMM DD, YYYY')}
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
								{review.userId === currentUser?.uid && (
									<Menu.Item onPress={handleEditMode} leadingIcon="pencil" title="Edit" />
								)}
							</Menu>
						</View>
					</View>
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
					<View style={[styles.flexRow, { justifyContent: 'space-evenly', padding: 0 }]}>
						<Button
							textColor="white"
							onPress={handleUpVote}
							icon={hasLiked ? 'thumb-up' : 'thumb-up-outline'}
							disabled={isVotingUp || isVotingDown}
						>
							{review.votes.upVote}
						</Button>
						<Button
							textColor="white"
							onPress={handleDownVote}
							icon={hasDisliked ? 'thumb-down' : 'thumb-down-outline'}
							disabled={isVotingUp || isVotingDown}
						>
							{review.votes.downVote}
						</Button>
						<Button textColor="white" onPress={handleComment} icon="comment-outline">
							{review.commentCount}
						</Button>
						<Button disabled textColor="white" onPress={() => {}} icon="share-outline">
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
