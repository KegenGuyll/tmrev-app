import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
import useDebounce from '@/hooks/useDebounce';

const AddReviewPage = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedMovie, setSelectedMovie] = useState<MovieGeneral | null>(null);
	const styles = makeStyles();
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const { currentUser } = auth();

	const debouncedSearchTerm = useDebounce(searchQuery, 500);

	const { data: movieData } = useFindMoviesQuery({
		query: debouncedSearchTerm,
	});

	const handlePosterSelection = (item: MovieGeneral) => {
		setOpen(true);
		setSelectedMovie(item);
	};

	return (
		<>
			<SafeAreaView>
				<View style={{ gap: 8 }}>
					<Searchbar
						placeholder="Search..."
						value={searchQuery}
						onChangeText={(t) => setSearchQuery(t)}
					/>
					<Divider />
					{!searchQuery && (
						<MovieDiscoverGrid from="addReview" onPress={(item) => handlePosterSelection(item)} />
					)}
					{movieData && (
						<FlatGrid
							itemDimension={100}
							style={styles.list}
							data={movieData?.results}
							spacing={8}
							renderItem={({ item }) => (
								<TouchableHighlight onPress={() => handlePosterSelection(item)}>
									<MoviePosterImage moviePoster={item.poster_path} height={170} width={100} />
								</TouchableHighlight>
							)}
							keyExtractor={(item) => item.id.toString()}
						/>
					)}
				</View>
			</SafeAreaView>
			{currentUser && (
				<CreateMovieReviewModal
					visible={open}
					onDismiss={() => setOpen(false)}
					selectedMovie={selectedMovie}
				/>
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
