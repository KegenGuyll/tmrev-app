import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { View, TouchableHighlight } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import { useFindMoviesQuery, useFindPeopleQuery } from '@/redux/api/tmdb/searchApi';
import ActorPlaceholderImage from '@/components/ActorPlacholderImage';
import { personDetailsRoute } from '@/constants/routes';
import useDebounce from '@/hooks/useDebounce';
import { PeopleGeneral } from '@/models/tmdb/person';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import MoviePoster from '@/components/MoviePoster';
import { useGetMovieDiscoverQuery } from '@/redux/api/tmdb/movieApi';
import { SortBy } from '@/models/tmdb/movie/movieDiscover';

type SearchRenderItemProps = {
	item: PeopleGeneral | MovieGeneral;
};

const SearchRenderItem: React.FC<SearchRenderItemProps> = ({ item }: SearchRenderItemProps) => {
	if ('profile_path' in item) {
		return (
			<View>
				<TouchableHighlight
					onPress={() => router.navigate(personDetailsRoute('search', item.id.toString()))}
				>
					<ActorPlaceholderImage
						profile_url={item.profile_path}
						department={item.known_for_department}
						height={125}
						width={75}
					/>
				</TouchableHighlight>
			</View>
		);
	}

	return (
		<View>
			<MoviePoster
				movieId={item.id}
				moviePoster={item.poster_path}
				location="search"
				height={125}
				width={75}
			/>
		</View>
	);
};

const Search: React.FC = () => {
	const [searchQuery, setSearchQuery] = React.useState('');

	const debouncedSearchTerm = useDebounce(searchQuery, 500);

	const { data: movieData } = useFindMoviesQuery({
		query: debouncedSearchTerm,
	});

	const { data: peopleData } = useFindPeopleQuery({ query: debouncedSearchTerm });

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

	const results = useMemo(() => {
		if (!movieData?.results?.length && !peopleData?.results?.length) {
			return discoverData?.results ?? [];
		}
		const combinedResults = [...(movieData?.results ?? []), ...(peopleData?.results ?? [])];
		return combinedResults.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
	}, [movieData, peopleData, discoverData]);

	return (
		<View style={{ flex: 1 }}>
			<FlatGrid
				itemDimension={75}
				style={{ flex: 1 }}
				ListHeaderComponentStyle={{ paddingVertical: 12 }}
				ListHeaderComponent={
					<Searchbar
						style={{ width: '100%', flexGrow: 1 }}
						placeholder="Search Movies or People..."
						value={searchQuery}
						onChangeText={(t) => setSearchQuery(t)}
					/>
				}
				data={results}
				renderItem={({ item }) => <SearchRenderItem item={item} />}
			/>
		</View>
	);
};

export default Search;
