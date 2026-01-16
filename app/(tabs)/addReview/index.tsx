import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Searchbar, Snackbar } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import { useFindMoviesQuery } from '@/redux/api/tmdb/searchApi';
import MoviePoster from '@/components/MoviePoster';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import { loginRoute, reviewFunctionRoute } from '@/constants/routes';
import useDebounce from '@/hooks/useDebounce';
import { reviewLoginPrompt } from '@/constants/messages';
import useAuth from '@/hooks/useAuth';
import { useGetMovieDiscoverQuery } from '@/redux/api/tmdb/movieApi';
import { SortBy } from '@/models/tmdb/movie/movieDiscover';

const AddReviewPage = () => {
	const [searchQuery, setSearchQuery] = useState('');
	const [showLoginPrompt, setShowLoginPrompt] = useState(false);
	const router = useRouter();

	const { currentUser } = useAuth({});

	const debouncedSearchTerm = useDebounce(searchQuery, 500);

	const { data: movieData } = useFindMoviesQuery({
		query: debouncedSearchTerm,
	});

	const { data: discoverData } = useGetMovieDiscoverQuery(
		{
			params: {
				language: 'en-US',
				sort_by: SortBy.MOST_POPULAR,
				include_adult: false,
				include_video: false,
				page: 1,
			},
		},
		{ skip: !!searchQuery }
	);

	const handlePosterSelection = (item: MovieGeneral) => {
		if (!currentUser) {
			setShowLoginPrompt(true);
		} else {
			router.navigate(reviewFunctionRoute('addReview', item.id, 'create'));
		}
	};

	const results = useMemo(() => {
		if (movieData?.results.length) {
			const movieDataResults = [...movieData.results];
			return movieDataResults.sort((a, b) => b.popularity - a.popularity);
		}

		if (discoverData?.results.length) {
			const discoverDataResults = [...discoverData.results];
			return discoverDataResults.sort((a, b) => b.popularity - a.popularity);
		}

		return [];
	}, [movieData, discoverData]);

	return (
		<>
			<View style={{ flex: 1 }}>
				<FlatGrid
					itemDimension={75}
					style={{ flex: 1 }}
					ListHeaderComponentStyle={{ paddingVertical: 12 }}
					ListHeaderComponent={
						<Searchbar
							placeholder="Search for Movie to Review..."
							value={searchQuery}
							onChangeText={(t) => setSearchQuery(t)}
						/>
					}
					data={results}
					renderItem={({ item }) => (
						<MoviePoster
							onPress={() => handlePosterSelection(item)}
							movieId={item.id}
							moviePoster={item.poster_path}
							location="addReview"
							height={125}
							width={75}
						/>
					)}
				/>
			</View>
			<Snackbar
				onDismiss={() => setShowLoginPrompt(false)}
				action={{
					label: 'Login',
					onPress: () => router.navigate(loginRoute()),
				}}
				visible={showLoginPrompt}
			>
				{reviewLoginPrompt}
			</Snackbar>
		</>
	);
};

export default AddReviewPage;
