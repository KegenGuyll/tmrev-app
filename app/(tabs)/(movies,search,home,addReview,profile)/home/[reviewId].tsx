import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Keyboard, StyleSheet, TouchableWithoutFeedback, View, RefreshControl } from 'react-native';
import { Text, useTheme, MD3Theme, Divider, ActivityIndicator, Snackbar } from 'react-native-paper';
import React, { useMemo, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import {
	useReviewControllerFindOne,
	useCommentControllerFindOne,
} from '@/api/tmrev-api-v2/endpoints';
import useComments from '@/hooks/useComments';
import CommentCard from '@/features/feed/commentCard';
import { FeedReviewContentTypes, feedReviewDetailsRoute, loginRoute } from '@/constants/routes';
import ReviewCard from '@/features/feed/reviewCard';
import { FromLocation } from '@/models';
import { commentLoginPrompt } from '@/constants/messages';
import useAuth from '@/hooks/useAuth';

type ReviewSearchProps = {
	reviewId: string;
	contentType: FeedReviewContentTypes;
	from: FromLocation;
};

const ReviewPage: React.FC = () => {
	const { reviewId, contentType, from } = useLocalSearchParams<ReviewSearchProps>();
	const [loginMessage, setLoginMessage] = useState<string | null>(null);

	const { currentUser } = useAuth({});

	const theme = useTheme();
	const styles = makeStyles(theme);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const {
		data: reviewData,
		isLoading: isReviewDataLoading,
		refetch: refetchReview,
	} = useReviewControllerFindOne(reviewId!, {
		query: { enabled: !!reviewId && contentType === 'reviews' },
	});

	const {
		comments,
		totalCount,
		isLoading: isCommentsLoading,
		refetch: refetchComments,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useComments({
		postId: reviewId!,
		enabled: !!reviewId,
	});

	const {
		data: commentDetails,
		isLoading: isCommentDetailsLoading,
		refetch: refetchCommentDetails,
	} = useCommentControllerFindOne(reviewId!, {
		query: { enabled: !!reviewId && contentType === 'comments' },
	});

	const isLoading = useMemo(
		() => isReviewDataLoading || isCommentsLoading || isCommentDetailsLoading,
		[isCommentDetailsLoading, isCommentsLoading, isReviewDataLoading]
	);

	const handleRefresh = async () => {
		try {
			setIsRefreshing(true);
			if (contentType === 'reviews') {
				await refetchReview();
			}
			if (contentType === 'comments') {
				await refetchCommentDetails();
			}

			await refetchComments();
			setIsRefreshing(false);
		} catch (error) {
			setIsRefreshing(false);
		}
	};

	const handleLoadMore = () => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	};

	const handleNavigateToComment = () => {
		if (!currentUser) {
			setLoginMessage(commentLoginPrompt);
			return;
		}

		if (contentType === 'reviews') {
			router.navigate(feedReviewDetailsRoute(reviewId!, 'reviews', from!));
		} else if (contentType === 'comments') {
			router.navigate(feedReviewDetailsRoute(reviewId!, 'comments', from!));
		}
	};

	return (
		<>
			<Stack.Screen
				options={{
					headerShown: true,
					title: contentType === 'reviews' ? 'Review' : 'Replies',
					headerRight: () => null,
				}}
			/>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} style={styles.container}>
				<View style={{ flex: 1 }}>
					{isLoading && (
						<ActivityIndicator
							style={{ position: 'absolute', top: 10, right: 0, left: 0, zIndex: 1 }}
						/>
					)}
					<FlatList
						contentContainerStyle={{ paddingBottom: 100 }}
						refreshControl={
							<RefreshControl
								refreshing={isRefreshing}
								onRefresh={handleRefresh}
								tintColor="white"
							/>
						}
						ListHeaderComponent={
							<>
								{contentType === 'reviews' && (
									<ReviewCard
										setLoginMessage={setLoginMessage}
										numberOfComments={totalCount}
										reviewData={reviewData}
										from={from!}
									/>
								)}
								{commentDetails && contentType === 'comments' && (
									<CommentCard
										setLoginMessage={setLoginMessage}
										isSubject
										comment={commentDetails}
										from={from!}
									/>
								)}
								{contentType === 'comments' && (
									<View style={[styles.flexRow, { paddingVertical: 16 }]}>
										<Text variant="titleMedium">
											{totalCount > 0 ? `Replies (${totalCount}):` : 'No Replies'}
										</Text>
									</View>
								)}
							</>
						}
						data={comments}
						renderItem={({ item }) => (
							<>
								<CommentCard setLoginMessage={setLoginMessage} comment={item} from={from!} />
								<Divider />
							</>
						)}
						keyExtractor={(item) => item._id}
						onEndReached={handleLoadMore}
						onEndReachedThreshold={0.3}
						ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
					/>
				</View>
			</TouchableWithoutFeedback>
			<View style={styles.keyboardContainer}>
				<TouchableWithoutFeedback onPress={() => handleNavigateToComment()}>
					<View style={styles.inner}>
						<View
							style={{
								width: '100%',
								backgroundColor: theme.colors.surfaceVariant,
								height: 35,
								borderRadius: 4,
								justifyContent: 'center',
								paddingHorizontal: 8,
							}}
						>
							<Text>Comment...</Text>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</View>
			<Snackbar
				action={{
					label: 'Login',
					onPress: () => router.navigate(loginRoute()),
				}}
				visible={!!loginMessage}
				onDismiss={() => setLoginMessage(null)}
			>
				{loginMessage}
			</Snackbar>
		</>
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
			bottom: 0,
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

export default ReviewPage;
