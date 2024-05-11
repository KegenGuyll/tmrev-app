import { Stack } from 'expo-router';
import { useState } from 'react';
import { NativeSyntheticEvent, TextInputChangeEventData, View, StyleSheet } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatGrid } from 'react-native-super-grid';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { useFindMoviesQuery } from '@/redux/api/tmdb/searchApi';
import { MoviePosterImage } from '@/components/MoviePoster';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import CreateMovieReviewModal from '@/components/CreateMovieReviewModal';

const AddReviewPage = () => {
	const [searchQuery, setSearchQuery] = useState('step brothers');
	const [selectedMovie, setSelectedMovie] = useState<MovieGeneral | null>(null);
	const styles = makeStyles();

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
				<View>
					<Searchbar placeholder="Search" value={searchQuery} onChange={onChangeSearch} />
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
			<CreateMovieReviewModal selectedMovie={selectedMovie} setSelectedMovie={setSelectedMovie} />
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
