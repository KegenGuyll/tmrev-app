import {
	StyleSheet,
	View,
	Image,
	TouchableWithoutFeedback,
	TouchableHighlight,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Divider, Button, Snackbar } from 'react-native-paper';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { CommentWithUser } from '@/models/tmrev/comments';
import { feedReviewDetailsRoute, feedReviewRoute, profileRoute } from '@/constants/routes';
import { numberShortHand } from '@/utils/common';
import { useVoteCommentMutation } from '@/redux/api/tmrev';

type CommentCardProps = {
	comment: CommentWithUser;
	displayMetaData?: boolean;
};

const CommentCard: React.FC<CommentCardProps> = ({
	comment,
	displayMetaData = true,
}: CommentCardProps) => {
	const styles = makeStyles();
	const router = useRouter();

	const [voteComment] = useVoteCommentMutation();
	const { currentUser } = auth();

	const [hasLiked, setHasLiked] = useState<boolean>(false);
	const [hasDisliked, setHasDisliked] = useState<boolean>(false);
	const [snackBarMessage, setSnackBarMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!currentUser || !comment.votes) return;

		setHasLiked(comment.votes!.upVote.includes(currentUser.uid));
		setHasDisliked(comment.votes!.downVote.includes(currentUser.uid));
	}, [comment, currentUser]);

	const handleComment = () => {
		router.push(feedReviewDetailsRoute(comment._id, 'comments'));
	};

	const handleUpVote = async () => {
		try {
			await voteComment({ commentId: comment._id, vote: true }).unwrap();
			setHasLiked(true);
			setHasDisliked(false);
		} catch (error) {
			setSnackBarMessage('Error has occurred');
		}
	};

	const handleDownVote = async () => {
		try {
			await voteComment({ commentId: comment._id, vote: false }).unwrap();
			setHasDisliked(true);
			setHasLiked(false);
		} catch (error) {
			setSnackBarMessage('Error has occurred');
		}
	};

	return (
		<>
			<TouchableHighlight onPress={() => router.push(feedReviewRoute(comment._id, 'comments'))}>
				<View style={[styles.flexColumn, { paddingHorizontal: 8, paddingVertical: 8 }]}>
					<View style={[styles.flexRow, { alignItems: 'flex-start', gap: 8, paddingBottom: 16 }]}>
						<Image
							source={{ uri: comment.user.photoUrl }}
							height={50}
							width={50}
							style={{ borderRadius: 100 }}
						/>
						<View style={{ gap: 16 }}>
							<TouchableWithoutFeedback
								onPress={() => router.navigate(profileRoute('home', comment.user.uuid))}
							>
								<View style={styles.flexColumn}>
									<Text variant="labelLarge">
										{comment.user.firstName} {comment.user.lastName}
									</Text>
									<Text variant="labelSmall">
										{dayjs(comment.createdAt).format('hh:mm A · MMM DD, YYYY')}
									</Text>
								</View>
							</TouchableWithoutFeedback>
							<View>
								<Text variant="bodyMedium">{comment.comment}</Text>
							</View>
						</View>
					</View>
					<Divider />
					{displayMetaData && (
						<View
							style={[styles.flexRow, { justifyContent: 'space-evenly', alignItems: 'center' }]}
						>
							<Button
								onPress={handleUpVote}
								textColor="white"
								icon={hasLiked ? 'thumb-up' : 'thumb-up-outline'}
							>
								{comment.votes.upVote.length}
							</Button>
							<Button
								onPress={handleDownVote}
								textColor="white"
								icon={hasDisliked ? 'thumb-down' : 'thumb-down-outline'}
							>
								{comment.votes.downVote.length}
							</Button>
							<Button
								onPress={handleComment}
								textColor="white"
								icon="comment-outline"
								style={[styles.flexRow, { alignItems: 'center' }]}
							>
								{numberShortHand(comment.replies)}
							</Button>

							<Button textColor="white" icon="share-outline">
								Share
							</Button>
						</View>
					)}
				</View>
			</TouchableHighlight>
			<Snackbar visible={!!snackBarMessage} onDismiss={() => setSnackBarMessage(null)}>
				{snackBarMessage}
			</Snackbar>
		</>
	);
};

const makeStyles = () =>
	StyleSheet.create({
		flexColumn: {
			display: 'flex',
			flexDirection: 'column',
		},
		flexRow: {
			display: 'flex',
			flexDirection: 'row',
		},
	});

export default CommentCard;
