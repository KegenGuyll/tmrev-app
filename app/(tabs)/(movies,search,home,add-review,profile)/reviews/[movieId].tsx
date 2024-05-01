import { useLocalSearchParams, Stack } from 'expo-router';
import { List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { useGetAllReviewsQuery } from '@/redux/api/tmrev';
import MovieReview from '@/components/MovieReview';

type SearchParams = {
	movieId: string;
	from: string;
	title: string;
};

const MovieReviewsPage = () => {
	const slug = useLocalSearchParams<SearchParams>();
	const { data: movieReviews } = useGetAllReviewsQuery({ movie_id: Number(slug.movieId) });

	return (
		<>
			<Stack.Screen options={{ headerShown: true, title: `Reviews of ${slug.title}` }} />
			<SafeAreaView>
				<ScrollView>
					<List.Section>
						{movieReviews?.body.reviews.map((review) => (
							<MovieReview from={slug.from} key={review._id} review={review} />
						))}
					</List.Section>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

export default MovieReviewsPage;
