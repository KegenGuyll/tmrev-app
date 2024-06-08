import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
	Keyboard,
	StyleSheet,
	TouchableWithoutFeedback,
	View,
	ScrollView,
	RefreshControl,
} from 'react-native';
import { Text, useTheme, MD3Theme, Divider, ActivityIndicator } from 'react-native-paper';
import { useMemo, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import {
	useGetCommentDetailsQuery,
	useGetCommentsQuery,
	useGetSingleReviewQuery,
} from '@/redux/api/tmrev';
import CommentCard from '@/features/feed/commentCard';
import { FeedReviewContentTypes, feedReviewDetailsRoute } from '@/constants/routes';
import ReviewCard from '@/features/feed/reviewCard';
import { FromLocation } from '@/models';

type ReviewSearchProps = {
	reviewId: string;
	contentType: FeedReviewContentTypes;
	from: FromLocation;
};

const ReviewPage: React.FC = () => {
	const { reviewId, contentType, from } = useLocalSearchParams<ReviewSearchProps>();

	const theme = useTheme();
	const styles = makeStyles(theme);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const {
		data: reviewData,
		isLoading: isReviewDataLoading,
		refetch: refetchReview,
	} = useGetSingleReviewQuery(
		{ reviewId: reviewId! },
		{ skip: !reviewId && contentType !== 'reviews' }
	);
	const {
		data: commentData,
		isLoading: isCommentLoading,
		refetch: refetchComments,
	} = useGetCommentsQuery(reviewId!, {
		skip: !reviewId,
	});
	const {
		data: commentDetails,
		isLoading: isCommentDetailsLoading,
		refetch: refetchCommentDetails,
	} = useGetCommentDetailsQuery(reviewId!, { skip: !reviewId && contentType !== 'comments' });

	const isLoading = useMemo(
		() => isReviewDataLoading || isCommentLoading || isCommentLoading,
		[isCommentDetailsLoading, isCommentLoading, isReviewDataLoading]
	);

	const handleRefresh = async () => {
		try {
			setIsRefreshing(true);
			if (contentType === 'reviews') {
				await refetchReview().unwrap();
			}
			if (contentType === 'comments') {
				await refetchCommentDetails().unwrap();
			}

			await refetchComments().unwrap();

			setIsRefreshing(false);
		} catch (error) {
			setIsRefreshing(false);
		}
	};

	const handleNavigateToComment = () => {
		if (contentType === 'reviews') {
			router.navigate(feedReviewDetailsRoute(reviewId!, 'reviews', from!));
		} else if (contentType === 'comments') {
			router.navigate(feedReviewDetailsRoute(reviewId!, 'comments', from!));
		}
	};

	return (
		<>
			<Stack.Screen
				options={{ headerShown: true, title: contentType === 'reviews' ? 'Review' : 'Replies' }}
			/>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} style={styles.container}>
				<ScrollView
					contentContainerStyle={{ paddingBottom: 100 }}
					refreshControl={
						<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="white" />
					}
				>
					{isLoading && (
						<ActivityIndicator style={{ position: 'absolute', top: 10, right: 0, left: 0 }} />
					)}
					{contentType === 'reviews' && (
						<ReviewCard
							numberOfComments={commentData?.body.length || 0}
							reviewData={reviewData}
							from={from!}
						/>
					)}
					{commentDetails && contentType === 'comments' && (
						<CommentCard comment={commentDetails?.body} from={from!} />
					)}
					{contentType === 'comments' && (
						<View style={[styles.flexRow, { paddingVertical: 16 }]}>
							<Text variant="titleMedium">
								{commentDetails?.body.replies ? '	Replies:' : 'No Replies:'}
							</Text>
						</View>
					)}
					<FlatList
						scrollEnabled={false}
						data={commentData?.body}
						renderItem={({ item }) => (
							<>
								<CommentCard comment={item} from={from!} />
								<Divider />
							</>
						)}
						keyExtractor={(item) => item._id}
					/>
				</ScrollView>
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
