import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { ActivityIndicator, Divider, Snackbar, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
	feedControllerGetFeed,
	getFeedControllerGetFeedQueryKey,
} from '@/api/tmrev-api-v2/endpoints';
import FeedCard from '@/features/feed/feedCard';
import { loginRoute } from '@/constants/routes';

const pageSize = 10;

const HomeScreen = () => {
	const router = useRouter();
	const [loginMessage, setLoginMessage] = useState<string | null>(null);

	const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage, refetch, isRefetching } =
		useInfiniteQuery({
			queryKey: getFeedControllerGetFeedQueryKey(),
			queryFn: ({ pageParam = 1 }) =>
				feedControllerGetFeed({
					pageNumber: String(pageParam),
					pageSize: String(pageSize),
					excludeSelf: 'false',
				}),
			getNextPageParam: (lastPage) => {
				const currentPage = lastPage.pageNumber || 1;
				const totalPages = lastPage.totalNumberOfPages || 1;
				return currentPage < totalPages ? currentPage + 1 : undefined;
			},
			initialPageParam: 1,
		});

	const feedItems = useMemo(() => {
		return data?.pages.flatMap((page) => page.results || []) || [];
	}, [data]);

	const onRefresh = async () => {
		await refetch();
	};

	const onEndReached = () => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	};

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	if (feedItems.length === 0 && !isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<Text>No reviews found</Text>
			</View>
		);
	}

	return (
		<>
			<View style={{ flex: 1 }}>
				<FlatList
					onEndReached={onEndReached}
					refreshControl={
						<RefreshControl tintColor="white" refreshing={isRefetching} onRefresh={onRefresh} />
					}
					data={feedItems}
					keyExtractor={(item) => item._id}
					renderItem={({ item }) => (
						<View>
							<Divider />
							<FeedCard
								setLoginMessage={setLoginMessage}
								contentType="reviews"
								review={item}
								from="home"
							/>
						</View>
					)}
					onEndReachedThreshold={0.3}
					ListFooterComponentStyle={{ paddingTop: 16 }}
					ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
				/>
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

export default HomeScreen;
