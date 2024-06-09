import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';
import { useGetUserFeedQuery } from '@/redux/api/tmrev';
import FeedCard from '@/features/feed/feedCard';

const pageSize = 10;

const HomeScreen = () => {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [page, setPage] = useState(0);
	const { data, isLoading, refetch } = useGetUserFeedQuery({
		pageNumber: page,
		pageSize,
	});

	const hasReachedEnd = useMemo(() => data?.body.totalNumberOfPages === page, [data, page]);

	const onRefresh = async () => {
		setIsRefreshing(true);
		setPage(0);
		await refetch().unwrap();
		setIsRefreshing(false);
	};

	const onEndReached = async () => {
		if (!hasReachedEnd) {
			setPage(page + 1);
		}
	};

	if (!data || isLoading) {
		return (
			<View>
				<Text>Loading...</Text>
			</View>
		);
	}

	return (
		<View>
			<FlatList
				onEndReached={onEndReached}
				refreshControl={
					<RefreshControl tintColor="white" refreshing={isRefreshing} onRefresh={onRefresh} />
				}
				data={data.body.feed.reviews}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<View>
						<Divider />
						<FeedCard contentType="reviews" review={item} from="home" />
					</View>
				)}
				onEndReachedThreshold={0.5}
				ListFooterComponentStyle={{ paddingTop: 16 }}
				ListFooterComponent={hasReachedEnd ? null : <ActivityIndicator />}
			/>
		</View>
	);
};

export default HomeScreen;
