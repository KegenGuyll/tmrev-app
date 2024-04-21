import { Stack } from 'expo-router';
import React from 'react';
import { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFindMoviesQuery } from '@/redux/api/tmdb/searchApi';
import MovieGrid from '@/components/MovieGrid';

const Search = () => {
	const [searchQuery, setSearchQuery] = React.useState('');

	const onChangeSearch = (e: NativeSyntheticEvent<TextInputChangeEventData>) =>
		setSearchQuery(e.nativeEvent.text);

	const { data, isFetching } = useFindMoviesQuery(
		{ query: searchQuery },
		{ skip: searchQuery.length < 3 }
	);

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<SafeAreaView>
				<Searchbar placeholder="Search" value={searchQuery} onChange={onChangeSearch} />
				{data && (
					<MovieGrid
						movies={data.results}
						isLoading={isFetching}
						onEndReached={() => {}}
						onEndReachedThreshold={1}
						posterPath="search"
					/>
				)}
			</SafeAreaView>
		</>
	);
};

export default Search;
