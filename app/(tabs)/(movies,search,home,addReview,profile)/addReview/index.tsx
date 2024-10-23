import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar, Snackbar } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { useFindMoviesQuery } from '@/redux/api/tmdb/searchApi';
import { MoviePosterImage } from '@/components/MoviePoster';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import MovieDiscoverGrid from '@/components/MovieDiscoverGrid';
import { loginRoute, reviewFunctionRoute } from '@/constants/routes';
import useDebounce from '@/hooks/useDebounce';
import { reviewLoginPrompt } from '@/constants/messages';
import useAuth from '@/hooks/useAuth';

const AddReviewPage = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedMovie, setSelectedMovie] = useState<MovieGeneral | null>(null);
	const styles = makeStyles();
	const router = useRouter();

	const { currentUser } = useAuth({});

	const debouncedSearchTerm = useDebounce(searchQuery, 500);

	const { data: movieData } = useFindMoviesQuery({
		query: debouncedSearchTerm,
	});

	const handlePosterSelection = (item: MovieGeneral) => {
		router.navigate(reviewFunctionRoute('addReview', item.id, 'create'));
	};

	return (
		<>
			<View>
				{!searchQuery && (
					<MovieDiscoverGrid
						ListHeaderComponent={
							<Searchbar
								style={{ marginBottom: 16 }}
								placeholder="Search..."
								value={searchQuery}
								onChangeText={(t) => setSearchQuery(t)}
							/>
						}
						itemDimension={75}
						imageHeight={125}
						from="addReview"
						onPress={(item) => handlePosterSelection(item)}
					/>
				)}
				{movieData && (
					<FlatGrid
						ListHeaderComponent={
							<Searchbar
								style={{ marginBottom: 16 }}
								placeholder="Search..."
								value={searchQuery}
								onChangeText={(t) => setSearchQuery(t)}
							/>
						}
						itemDimension={75}
						style={styles.list}
						data={movieData?.results}
						spacing={8}
						renderItem={({ item }) => (
							<TouchableHighlight onPress={() => handlePosterSelection(item)}>
								<MoviePosterImage moviePoster={item.poster_path} height={125} />
							</TouchableHighlight>
						)}
						keyExtractor={(item) => item.id.toString()}
					/>
				)}
			</View>
			<Snackbar
				onDismiss={() => setSelectedMovie(null)}
				action={{
					label: 'Login',
					onPress: () => router.navigate(loginRoute()),
				}}
				visible={!currentUser && !!selectedMovie}
			>
				{reviewLoginPrompt}
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
