/* eslint-disable react-native/no-color-literals */
import {
	StyleSheet,
	View,
	Image,
	TouchableWithoutFeedback,
	TouchableHighlight,
	Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Divider, Button, Snackbar, IconButton, Menu } from 'react-native-paper';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import useAuth from '@/hooks/useAuth';
import { CommentWithUser } from '@/models/tmrev/comments';
import { feedReviewDetailsRoute, feedReviewRoute, profileRoute } from '@/constants/routes';
import { numberShortHand } from '@/utils/common';
import {
	useDeleteCommentMutation,
	useGetCommentDetailsQuery,
	useGetSingleReviewQuery,
	useVoteCommentMutation,
} from '@/redux/api/tmrev';
import { FromLocation } from '@/models';
import ReviewCard from './reviewCard';
import {
	commentLoginPrompt,
	dislikeLoginPrompt,
	errorPrompt,
	likeLoginPrompt,
} from '@/constants/messages';

type CommentCardProps = {
	comment: CommentWithUser;
	displayMetaData?: boolean;
	from: FromLocation;
	isSubject?: boolean;
	setLoginMessage?: (message: string | null) => void;
};

const CommentCard: React.FC<CommentCardProps> = ({
	comment,
	displayMetaData = true,
	from,
	isSubject,
	setLoginMessage,
}: CommentCardProps) => {
	const styles = makeStyles();
	const router = useRouter();
	const [openMenu, setOpenMenu] = useState<boolean>(false);

	const [voteComment] = useVoteCommentMutation();
	const [deleteComment] = useDeleteCommentMutation();
	const { currentUser } = useAuth({});

	const { data: reviewData } = useGetSingleReviewQuery(
		{ reviewId: comment.post.id },
		{ skip: !comment.post.id || comment.post.type !== 'reviews' }
	);

	const { data: commentDetails } = useGetCommentDetailsQuery(comment.post.id!, {
		skip: !comment.post.id || comment.post.type !== 'comments',
	});

	const isCurrentUsersComment = useMemo(
		() => currentUser?.uid === comment.user.uuid,
		[currentUser, comment]
	);

	const [hasLiked, setHasLiked] = useState<boolean>(false);
	const [hasDisliked, setHasDisliked] = useState<boolean>(false);
	const [snackBarMessage, setSnackBarMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!currentUser || !comment.votes) return;

		setHasLiked(comment.votes!.upVote.includes(currentUser.uid));
		setHasDisliked(comment.votes!.downVote.includes(currentUser.uid));
	}, [comment, currentUser]);

	const handleComment = () => {
		if (!currentUser) {
			if (setLoginMessage) {
				setLoginMessage(commentLoginPrompt);
			}
			return;
		}

		router.push(feedReviewDetailsRoute(comment._id, 'comments', from));
	};

	const handleUpVote = async () => {
		if (!currentUser) {
			if (setLoginMessage) {
				setLoginMessage(likeLoginPrompt);
			}
			return;
		}
		try {
			await voteComment({ commentId: comment._id, vote: true }).unwrap();
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
			await voteComment({ commentId: comment._id, vote: false }).unwrap();
			setHasDisliked(true);
			setHasLiked(false);
		} catch (error) {
			setSnackBarMessage(errorPrompt);
		}
	};

	const handleDeleteComment = async () => {
		try {
			setOpenMenu(false);
			Alert.alert('Delete Comment', 'Are you sure you want to delete this comment?', [
				{
					text: 'Cancel',
					style: 'cancel',
				},
				{
					style: 'destructive',
					text: 'Delete',
					onPress: async () => {
						await deleteComment(comment._id).unwrap();
					},
				},
			]);
		} catch (error) {
			setSnackBarMessage(errorPrompt);
		}
	};

	return (
		<View style={{ gap: 16 }}>
			{isSubject && reviewData && (
				<View>
					<ReviewCard reviewData={reviewData} displayMetaData={false} from={from} />
					<View
						style={{
							borderRightWidth: 3,
							borderColor: 'gray',
							width: 20,
							height: 32,
						}}
					/>
				</View>
			)}
			{isSubject && commentDetails && (
				<View>
					<CommentCard
						comment={commentDetails.body}
						displayMetaData={false}
						from={from}
						isSubject
					/>
					<View
						style={{
							borderRightWidth: 3,
							borderColor: 'gray',
							width: 20,
							height: 32,
						}}
					/>
				</View>
			)}
			<TouchableHighlight
				onPress={() => router.push(feedReviewRoute(comment._id, 'comments', from))}
			>
				<View style={[styles.flexColumn, { paddingHorizontal: 8, paddingVertical: 8 }]}>
					<View style={[styles.flexRow, { alignItems: 'flex-start', gap: 8, paddingBottom: 16 }]}>
						<View style={{ flex: 1, gap: 16 }}>
							<View style={[styles.flexRow, { gap: 8, alignItems: 'center' }]}>
								<TouchableWithoutFeedback
									onPress={() => router.navigate(profileRoute('home', comment.user.uuid))}
								>
									<Image
										source={{ uri: comment.user.photoUrl }}
										height={50}
										width={50}
										style={{ borderRadius: 100 }}
									/>
								</TouchableWithoutFeedback>
								<View
									style={[styles.flexRow, { alignItems: 'flex-start', flex: 1, width: '100%' }]}
								>
									<View style={[styles.flexColumn, { flexGrow: 1 }]}>
										<Text variant="labelLarge">{comment.user.username}</Text>
										<Text variant="labelSmall">
											{dayjs(comment.createdAt).format('hh:mm A · MMM DD, YYYY')}
										</Text>
									</View>
									<View>
										{isCurrentUsersComment && (
											<View>
												<Menu
													anchor={
														<IconButton icon="dots-vertical" onPress={() => setOpenMenu(true)} />
													}
													visible={openMenu}
													onDismiss={() => setOpenMenu(false)}
												>
													<Menu.Item
														dense
														leadingIcon="delete"
														onPress={handleDeleteComment}
														title="Delete"
													/>
												</Menu>
											</View>
										)}
									</View>
								</View>
							</View>

							<Text style={{ flex: 1, flexWrap: 'wrap', width: '90%' }} variant="bodyMedium">
								{comment.comment}
							</Text>
						</View>
					</View>

					{displayMetaData && (
						<>
							<Divider />
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

								<Button disabled textColor="white" icon="share-outline">
									Share
								</Button>
							</View>
						</>
					)}
				</View>
			</TouchableHighlight>
			<Snackbar visible={!!snackBarMessage} onDismiss={() => setSnackBarMessage(null)}>
				{snackBarMessage}
			</Snackbar>
		</View>
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
