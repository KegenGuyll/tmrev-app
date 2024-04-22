import { Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGetMovieDiscoverQuery } from '@/redux/api/tmdb/movieApi';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import { SortBy } from '@/models/tmdb/movie/movieDiscover';
import MovieGrid from '@/components/MovieGrid';
import { useAppSelector } from '@/hooks/reduxHooks';

import MovieQuickActions from '@/components/MovieQuickActions';

const Movies = () => {
	const [page, setPage] = React.useState(1);
	const [movieData, setMovieData] = React.useState<MovieGeneral[]>([]);
	const { moviePosterQuickActionData } = useAppSelector((state) => state.bottomSheet);

	const { data, isFetching } = useGetMovieDiscoverQuery({
		params: {
			language: 'en-US',
			sort_by: SortBy.MOST_POPULAR,
			include_adult: false,
			include_video: false,
			page,
		},
	});

	useEffect(() => {
		if (data) {
			setMovieData([...movieData, ...data.results]);
		}
	}, [data]);

	const handleFindMovie = () => {
		const movie = movieData.find((m) => m.id === moviePosterQuickActionData?.movieId);

		return movie;
	};

	// check to make sure movieData doesn't have duplicates id
	useEffect(() => {
		const uniqueMovieData = movieData.filter(
			(movie, index, self) => index === self.findIndex((m) => m.id === movie.id)
		);
		if (uniqueMovieData.length !== movieData.length) {
			setMovieData(uniqueMovieData);
		}
	}, [movieData]);

	const handlePageChange = () => {
		setPage(page + 1);
	};

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<SafeAreaView>
				<MovieGrid
					movies={movieData}
					isLoading={isFetching}
					onEndReached={handlePageChange}
					onEndReachedThreshold={1}
					posterPath="movies"
				/>
			</SafeAreaView>
			<MovieQuickActions movie={handleFindMovie()} />
		</>
	);
};

export default Movies;
