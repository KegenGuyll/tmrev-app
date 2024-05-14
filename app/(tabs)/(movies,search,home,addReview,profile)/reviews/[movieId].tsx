import { useLocalSearchParams, Stack } from 'expo-router';
import { List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { useGetAllReviewsQuery } from '@/redux/api/tmrev';
import MovieReview from '@/components/MovieReview';
import { FromLocation } from '@/models';

type SearchParams = {
	movieId: string;
	from: FromLocation;
	title: string;
};

const MovieReviewsPage = () => {
	const { movieId, from, title } = useLocalSearchParams<SearchParams>();
	const { data: movieReviews } = useGetAllReviewsQuery({ movie_id: Number(movieId) });

	return (
		<>
			<Stack.Screen options={{ headerShown: true, title: `Reviews of ${title}` }} />
			<SafeAreaView>
				<ScrollView>
					<List.Section>
						{movieReviews?.body.reviews.map((review) => (
							<MovieReview from={from || 'home'} key={review._id} review={review} />
						))}
					</List.Section>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

export default MovieReviewsPage;
