import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetMovieDetailsQuery } from '@/redux/api/tmdb/movieApi';

type MovieDetailsParams = {
	movieId: string;
};

const MovieDetails = () => {
	const slug: MovieDetailsParams = useLocalSearchParams();

	const { data, isFetching, isLoading } = useGetMovieDetailsQuery({
		movie_id: Number(slug.movieId),
		params: {},
	});

	if (isFetching || isLoading || !data) {
		return (
			<>
				<Stack.Screen options={{ headerShown: true }} />
				<SafeAreaView>
					<Text>Loading...</Text>
				</SafeAreaView>
			</>
		);
	}

	return (
		<>
			<Stack.Screen options={{ headerShown: true, title: data.title }} />
			<SafeAreaView>
				<Text variant="headlineLarge">{data.title}</Text>
			</SafeAreaView>
		</>
	);
};

export default MovieDetails;
