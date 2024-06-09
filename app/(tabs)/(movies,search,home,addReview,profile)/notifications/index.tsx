import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { RefreshControl, ScrollView, View } from 'react-native';
import { ActivityIndicator, Text, TouchableRipple } from 'react-native-paper';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import dayjs from 'dayjs';
import {
	useGetNotificationsV2Query,
	useReadAllNotificationsMutation,
	useReadNotificationMutation,
} from '@/redux/api/tmrev';
import { feedReviewRoute, profileRoute } from '@/constants/routes';
import { FromLocation } from '@/models';
import { MoviePosterImage } from '@/components/MoviePoster';
import { NotificationComment, NotificationReview } from '@/models/tmrev/notifications';
import AvatarWithIcon from '@/components/AvatarWithIcon';

type NotificationsSearchParams = {
	from: FromLocation;
};

type NotificationItemProps = {
	item: NotificationReview | NotificationComment;
	from: FromLocation;
};

const NotificationItem: React.FC<NotificationItemProps> = ({
	item,
	from,
}: NotificationItemProps) => {
	const router = useRouter();

	const [readNotification] = useReadNotificationMutation();

	const handleNavigation = async () => {
		await readNotification({ notificationId: item._id }).unwrap();
		router.navigate(feedReviewRoute(item.contentId, item.contentType, from));
	};

	return (
		<TouchableRipple style={{ padding: 8 }} onPress={handleNavigation}>
			<View
				style={{
					flex: 1,
					display: 'flex',
					flexDirection: 'row',
					gap: 16,
					alignItems: 'center',
				}}
			>
				<TouchableRipple onPress={() => router.navigate(profileRoute(from, item.sender.uuid))}>
					<View>
						{item.notificationType === 'comment' && (
							<AvatarWithIcon uri={item.sender.photoUrl} icon="comment" />
						)}
						{item.notificationType === 'like' && (
							<AvatarWithIcon uri={item.sender.photoUrl} icon="thumb-up" />
						)}
						{item.notificationType === 'dislike' && (
							<AvatarWithIcon uri={item.sender.photoUrl} icon="thumb-down" />
						)}
						{item.notificationType === 'viewed' && (
							<AvatarWithIcon uri={item.sender.photoUrl} icon="eye" />
						)}
					</View>
				</TouchableRipple>
				<View style={{ flex: 1 }}>
					<Text variant="labelLarge">
						{item.sender.firstName} {item.sender.lastName}
					</Text>
					<View>
						<Text numberOfLines={3} textBreakStrategy="simple">
							{item.notificationType === 'like' || item.notificationType === 'dislike'
								? `${item.notificationContent.body}`
								: `${item.notificationContent.title}: ${item.notificationContent.body}`}
						</Text>
						<View>
							<Text variant="labelSmall">
								{dayjs(item.createdAt).year() === dayjs().year()
									? dayjs(item.createdAt).format('MM/DD')
									: dayjs(item.createdAt).format('MM/DD/YYYY')}
							</Text>
						</View>
					</View>
				</View>
				{item.contentType === 'reviews' && (
					<View>
						<MoviePosterImage
							width={50}
							height={75}
							moviePoster={item.content.movieDetails.poster_path}
						/>
					</View>
				)}
			</View>
		</TouchableRipple>
	);
};

const Notifications: React.FC = () => {
	const { from } = useLocalSearchParams<NotificationsSearchParams>();
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [readAll] = useReadAllNotificationsMutation();

	useEffect(() => {
		if (from) {
			readAll();
		}
	}, [from]);

	const {
		data: reviewNotificationData,
		isLoading: isReviewNotificationDataLoading,
		refetch: refetchReviewNotification,
	} = useGetNotificationsV2Query({ contentType: 'reviews' });

	const { data: commentNotificationData, refetch: refetchCommentNotification } =
		useGetNotificationsV2Query({ contentType: 'comments' });

	const allNotifications = useMemo(() => {
		if (!reviewNotificationData || !commentNotificationData) return [];

		const reviewNotifications = reviewNotificationData.body as NotificationReview[];
		const commentNotifications = commentNotificationData.body as NotificationComment[];

		return [...reviewNotifications, ...commentNotifications].sort(
			(a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
		);
	}, [reviewNotificationData, commentNotificationData]);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await refetchReviewNotification().unwrap();
		await refetchCommentNotification().unwrap();
		setIsRefreshing(false);
	};
	return (
		<>
			<Stack.Screen options={{ title: 'Notifications', headerRight: () => null }} />
			<ScrollView
				refreshControl={
					<RefreshControl onRefresh={handleRefresh} refreshing={isRefreshing} tintColor="white" />
				}
				contentContainerStyle={{ gap: 32 }}
			>
				{isReviewNotificationDataLoading && <ActivityIndicator />}
				{reviewNotificationData?.body && (
					<View style={{ padding: 8, gap: 8 }}>
						<FlatList
							scrollEnabled={false}
							data={allNotifications}
							keyExtractor={(item) => item._id}
							renderItem={({ item }) => {
								return <NotificationItem item={item} from={from!} />;
							}}
						/>
					</View>
				)}
			</ScrollView>
		</>
	);
};

export default Notifications;
