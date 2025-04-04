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
import MoviePoster from '@/components/MoviePoster';
import { ReviewResponse } from '@/models/tmrev/movie';
import { useVoteTmrevReviewMutation } from '@/redux/api/tmrev';
import { feedReviewDetailsRoute, profileRoute, reviewFunctionRoute } from '@/constants/routes';
import { formatDate } from '@/utils/common';
import { FromLocation } from '@/models';
import BarChart from '@/components/CustomCharts/BarChart';
import { commentLoginPrompt, dislikeLoginPrompt, likeLoginPrompt } from '@/constants/messages';

type ReviewCardProps = {
	reviewData: ReviewResponse | undefined;
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
		if (!reviewData || !reviewData.body || !reviewData.body.advancedScore) return [];

		return [
			{
				label: 'Plot',
				value: reviewData.body.advancedScore.plot,
			},
			{
				label: 'Theme',
				value: reviewData.body.advancedScore.theme,
			},
			{
				label: 'Climax',
				value: reviewData.body.advancedScore.climax,
			},
			{
				label: 'Ending',
				value: reviewData.body.advancedScore.ending,
			},
			{
				label: 'Acting',
				value: reviewData.body.advancedScore.acting,
			},
			{
				label: 'Characters',
				value: reviewData.body.advancedScore.characters,
			},
			{
				label: 'Music',
				value: reviewData.body.advancedScore.music,
			},
			{
				label: 'Cinematography',
				value: reviewData.body.advancedScore.cinematography,
			},
			{
				label: 'Visuals',
				value: reviewData.body.advancedScore.visuals,
			},
			{
				label: 'Personal Score',
				value: reviewData.body.advancedScore.personalScore,
			},
		];
	}, [reviewData]);

	const [voteReview] = useVoteTmrevReviewMutation();

	const { currentUser } = useAuth({});

	useEffect(() => {
		if (!reviewData || !reviewData?.body || !currentUser) return;

		setHasLiked(reviewData?.body.votes!.upVote.includes(currentUser.uid));
		setHasDisliked(reviewData?.body.votes!.downVote.includes(currentUser.uid));
	}, [reviewData]);

	const handleUpVote = async () => {
		if (!reviewData || !reviewData?.body || !currentUser) {
			if (setLoginMessage) {
				setLoginMessage(likeLoginPrompt);
			}
			return;
		}
		try {
			await voteReview({ reviewId: reviewData?.body._id, vote: true }).unwrap();
			setHasLiked(true);
			setHasDisliked(false);
		} catch (error) {
			console.error(error);
		}
	};

	const handleDownVote = async () => {
		if (!reviewData || !reviewData?.body || !currentUser) {
			if (setLoginMessage) {
				setLoginMessage(dislikeLoginPrompt);
			}
			return;
		}
		try {
			await voteReview({ reviewId: reviewData?.body._id, vote: false }).unwrap();
			setHasDisliked(true);
			setHasLiked(false);
		} catch (error) {
			console.error(error);
		}
	};

	const handleComment = () => {
		if (!reviewData || !reviewData?.body || !currentUser) {
			if (setLoginMessage) {
				setLoginMessage(commentLoginPrompt);
			}
			return;
		}

		router.navigate(feedReviewDetailsRoute(reviewData.body?._id, 'reviews', from));
	};

	const handleShowFullReview = () => {
		setShowFullReview(!showFullReview);
		setShowMenu(false);
	};

	const handleEditMode = () => {
		router.navigate(
			reviewFunctionRoute(from, reviewData?.body?.tmdbID || 0, 'edit', reviewData?.body?._id)
		);
		setShowMenu(false);
	};

	if (!reviewData) return null;

	return (
		<View style={[styles.reviewContainer, styles.flexColumn, { gap: 16 }]}>
			<View style={[styles.flexRow, { alignItems: 'center', gap: 8 }]}>
				<TouchableRipple
					onPress={() => router.push(profileRoute(from!, reviewData.body!.user.uuid))}
				>
					<Image
						source={{ uri: reviewData.body?.user.photoUrl }}
						height={50}
						width={50}
						style={{ borderRadius: 100 }}
					/>
				</TouchableRipple>
				<View style={[styles.flexRow, { alignItems: 'flex-start', flex: 1, width: '100%' }]}>
					<View style={{ flexGrow: 1 }}>
						<Text variant="labelLarge">{reviewData.body?.user.username}</Text>
						<Text variant="labelSmall">
							{dayjs(formatDate(reviewData.body!.createdAt)).format('hh:mm A · MMM DD, YYYY')}
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
							{reviewData.body?.userId === currentUser?.uid && (
								<Menu.Item onPress={handleEditMode} leadingIcon="pencil" title="Edit" />
							)}
						</Menu>
					</View>
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
