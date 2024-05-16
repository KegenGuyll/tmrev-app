import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { NativeSyntheticEvent, TextInputChangeEventData, View, StyleSheet } from 'react-native';
import { Divider, Searchbar, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatGrid } from 'react-native-super-grid';
import { TouchableHighlight } from 'react-native-gesture-handler';
import auth from '@react-native-firebase/auth';
import { useFindMoviesQuery } from '@/redux/api/tmdb/searchApi';
import { MoviePosterImage } from '@/components/MoviePoster';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import CreateMovieReviewModal from '@/components/CreateMovieReviewModal';
import MovieDiscoverGrid from '@/components/MovieDiscoverGrid';
import { loginRoute } from '@/constants/routes';

const AddReviewPage = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedMovie, setSelectedMovie] = useState<MovieGeneral | null>(null);
	const styles = makeStyles();
	const router = useRouter();

	const { currentUser } = auth();

	const onChangeSearch = (e: NativeSyntheticEvent<TextInputChangeEventData>) => {
		setSearchQuery(e.nativeEvent.text);
	};

	const { data: movieData } = useFindMoviesQuery({
		query: searchQuery,
	});

	return (
		<>
			<Stack.Screen />
			<SafeAreaView style={{ marginTop: 16 }}>
				<View style={{ gap: 8 }}>
					<Searchbar
						onClearIconPress={() => setSearchQuery('')}
						placeholder="Search"
						value={searchQuery}
						onChange={onChangeSearch}
					/>
					<Divider />
					{!searchQuery && (
						<MovieDiscoverGrid from="addReview" onPress={(item) => setSelectedMovie(item)} />
					)}
					{movieData && (
						<FlatGrid
							itemDimension={100}
							style={styles.list}
							data={movieData?.results}
							spacing={8}
							renderItem={({ item }) => (
								<TouchableHighlight onPress={() => setSelectedMovie(item)}>
									<MoviePosterImage moviePoster={item.poster_path} height={170} width={100} />
								</TouchableHighlight>
							)}
							keyExtractor={(item) => item.id.toString()}
						/>
					)}
				</View>
			</SafeAreaView>
			{currentUser && (
				<CreateMovieReviewModal selectedMovie={selectedMovie} setSelectedMovie={setSelectedMovie} />
			)}
			<Snackbar
				onDismiss={() => setSelectedMovie(null)}
				action={{
					label: 'Login',
					onPress: () => router.navigate(loginRoute()),
				}}
				visible={!currentUser && !!selectedMovie}
			>
				You must login to review a movie
			</Snackbar>
		</>
	);
};

export default AddReviewPage;

const makeStyles = () =>
	StyleSheet.create({
		container: {
			flex: 1,
		},
		list: {
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'wrap',
		},
		bottomSheetContainer: {
			flex: 1,
			display: 'flex',
			flexDirection: 'column',
			padding: 16,
			gap: 32,
		},
		customHandleStyle: {
			backgroundColor: 'white',
		},
	});
