import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { List, TouchableRipple } from 'react-native-paper';
import { useCallback, useState } from 'react';
import { FlatGrid } from 'react-native-super-grid';
import { RefreshControl } from 'react-native-gesture-handler';
import { useGetReviewsByMovieIdQuery } from '@/redux/api/tmrev';
import MovieReview from '@/components/MovieReview';
import { FromLocation } from '@/models';
import { feedReviewRoute } from '@/constants/routes';

type SearchParams = {
	movieId: string;
	from: FromLocation;
	title: string;
};

const pageSize = 25;

const MovieReviewsPage = () => {
	const router = useRouter();
	const [refreshing, setRefreshing] = useState(false);
	const [page, setPage] = useState(0);
	const { movieId, from, title } = useLocalSearchParams<SearchParams>();

	const { data: movieReviewsData, refetch } = useGetReviewsByMovieIdQuery({
		movieId: Number(movieId),
		query: {
			pageNumber: page,
			pageSize,
			sort_by: 'createdAt.desc',
		},
	});

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		setPage(0);
		await refetch().unwrap();
		setRefreshing(false);
	}, []);

	const incrementPage = useCallback(() => {
		if (page === movieReviewsData?.body.totalNumberOfPages) {
			return;
		}

		setPage(page + 1);
	}, [movieReviewsData]);

	if (!movieReviewsData) return null;

	return (
		<>
			<Stack.Screen options={{ title: `${title} Reviews`, headerRight: () => null }} />
			<FlatGrid
				refreshControl={
					<RefreshControl tintColor="white" refreshing={refreshing} onRefresh={onRefresh} />
				}
				onEndReached={incrementPage}
				itemDimension={800}
				spacing={0}
				data={movieReviewsData?.body.reviews}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<List.Section>
						<TouchableRipple
							onPress={() => router.navigate(feedReviewRoute(item._id, 'reviews', from!))}
						>
							<MovieReview from={from || 'home'} review={item} />
						</TouchableRipple>
					</List.Section>
				)}
			/>
		</>
	);
};

export default MovieReviewsPage;
