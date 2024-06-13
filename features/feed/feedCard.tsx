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
import { useEffect, useMemo, useState } from 'react';
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
import BarChart from '@/components/CustomCharts/BarChart';
import {
	commentLoginPrompt,
	dislikeLoginPrompt,
	errorPrompt,
	likeLoginPrompt,
} from '@/constants/messages';

type FeedCardProps = {
	review: FeedReviews;
	// eslint-disable-next-line react/no-unused-prop-types
	contentType: FeedReviewContentTypes;
	from: FromLocation;
	setLoginMessage?: (message: string | null) => void;
};

const FeedCard: React.FC<FeedCardProps> = ({ review, from, setLoginMessage }: FeedCardProps) => {
	const styles = makeStyle();
	const router = useRouter();

	const { currentUser } = auth();

	const [hasLiked, setHasLiked] = useState<boolean>(false);
	const [hasDisliked, setHasDisliked] = useState<boolean>(false);
	const [snackBarMessage, setSnackBarMessage] = useState<string | null>(null);
	const [showMenu, setShowMenu] = useState<boolean>(false);
	const [showFullReview, setShowFullReview] = useState<boolean>(false);
	const theme = useTheme();

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

	useEffect(() => {
		if (!currentUser || !review.votes) return;

		setHasLiked(review.votes.upVote.includes(currentUser.uid));
		setHasDisliked(review.votes.downVote.includes(currentUser.uid));
	}, [review.votes, currentUser]);

	const [voteReview] = useVoteTmrevReviewMutation();

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
		if (!currentUser) {
			if (setLoginMessage) {
				setLoginMessage(likeLoginPrompt);
			}
			return;
		}
		try {
			await voteReview({ reviewId: review._id, vote: true }).unwrap();
			setHasLiked(true);
			setHasDisliked(false);
		} catch (error) {
			setSnackBarMessage(errorPrompt);
		}
	};

	const handleDownVote = async () => {
		if (!currentUser) {
			if (setLoginMessage) {
				setLoginMessage(dislikeLoginPrompt);
			}
			return;
		}
		try {
			await voteReview({ reviewId: review._id, vote: false }).unwrap();
			setHasDisliked(true);
			setHasLiked(false);
		} catch (error) {
			setSnackBarMessage(errorPrompt);
		}
	};

	const handleShowFullReview = () => {
		setShowFullReview(!showFullReview);
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
							onPress={() => router.navigate(profileRoute('home', review.userDetails.uuid))}
							style={[styles.flexRow, { gap: 8, alignItems: 'center' }]}
						>
							<Image
								source={{ uri: review.userDetails.photoUrl }}
								style={{ width: 50, height: 50, borderRadius: 100 }}
							/>
						</TouchableHighlight>
						<View style={styles.flexColumn}>
							<Text variant="labelLarge">{review.userDetails.username}</Text>
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
						<Button textColor="white" onPress={handleComment} icon="comment-outline">
							{review.replies}
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
