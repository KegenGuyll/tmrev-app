import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import WatchedMovieList from '@/components/WatchedMovieList';
import { FromLocation } from '@/models';

type WatchedMoviesSearchPrams = {
	profileId: string;
	from?: FromLocation;
};

const WatchedMovies = () => {
	const { profileId, from } = useLocalSearchParams<WatchedMoviesSearchPrams>();

	return (
		<>
			<Stack.Screen options={{ title: 'Movies Seen', headerRight: () => null }} />
			<View>
				<WatchedMovieList userId={profileId} from={from || 'home'} />
			</View>
		</>
	);
};

export default WatchedMovies;
