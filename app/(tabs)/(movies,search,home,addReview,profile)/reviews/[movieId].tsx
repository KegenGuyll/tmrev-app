import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { List, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { useGetAllReviewsQuery } from '@/redux/api/tmrev';
import MovieReview from '@/components/MovieReview';
import { FromLocation } from '@/models';
import { feedReviewRoute } from '@/constants/routes';

type SearchParams = {
	movieId: string;
	from: FromLocation;
	title: string;
};

const MovieReviewsPage = () => {
	const router = useRouter();
	const { movieId, from } = useLocalSearchParams<SearchParams>();
	const { data: movieReviews } = useGetAllReviewsQuery({ movie_id: Number(movieId) });

	return (
		<>
			<Stack.Screen options={{ title: 'Reviews', headerRight: () => null }} />
			<SafeAreaView>
				<ScrollView>
					<List.Section>
						{movieReviews?.body.reviews.map((review) => (
							<TouchableRipple
								onPress={() => router.navigate(feedReviewRoute(review._id, 'reviews', from!))}
								key={review._id}
							>
								<MovieReview from={from || 'home'} review={review} />
							</TouchableRipple>
						))}
					</List.Section>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

export default MovieReviewsPage;
