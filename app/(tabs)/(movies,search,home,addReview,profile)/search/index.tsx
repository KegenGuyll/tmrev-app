import { Link, Stack } from 'expo-router';
import React from 'react';
import {
	NativeSyntheticEvent,
	TextInputChangeEventData,
	StyleSheet,
	View,
	FlatList,
} from 'react-native';
import { Chip, Divider, List, Searchbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFindMoviesQuery, useFindPeopleQuery } from '@/redux/api/tmdb/searchApi';
import MovieGrid from '@/components/MovieGrid';
import ActorPlaceholderImage from '@/components/ActorPlacholderImage';
import MovieQuickActions from '@/components/MovieQuickActions';
import { useAppSelector } from '@/hooks/reduxHooks';

type SearchSelection = 'movies' | 'crew';

type SearchSelectionChipProps = {
	label: string;
	onPress: () => void;
	isSelected: boolean;
};

const SearchSelectionChip: React.FC<SearchSelectionChipProps> = ({
	label,
	onPress,
	isSelected,
}) => {
	return (
		<Chip onPress={onPress} mode={!isSelected ? 'outlined' : 'flat'}>
			<Text>{label}</Text>
		</Chip>
	);
};

const Search: React.FC = () => {
	const [searchQuery, setSearchQuery] = React.useState('');
	const [searchSelection, setSearchSelection] = React.useState<SearchSelection>('movies');
	const { moviePosterQuickActionData } = useAppSelector((state) => state.bottomSheet);

	const onChangeSearch = (e: NativeSyntheticEvent<TextInputChangeEventData>) =>
		setSearchQuery(e.nativeEvent.text);

	const { data: movieData, isFetching: movieIsFetching } = useFindMoviesQuery(
		{ query: searchQuery },
		{ skip: searchSelection !== 'movies' }
	);

	const { data: peopleData } = useFindPeopleQuery(
		{ query: searchQuery },
		{ skip: searchSelection !== 'crew' }
	);

	const handleFindMovie = () => {
		const movie = movieData?.results.find((m) => m.id === moviePosterQuickActionData?.movieId);

		return movie;
	};

	return (
		<>
			<Stack.Screen options={{ headerShown: false }} />
			<SafeAreaView style={{ marginTop: 16 }}>
				<Searchbar placeholder="Search" value={searchQuery} onChange={onChangeSearch} />
				{/* <ScrollView horizontal> */}
				<View style={styles.chipContainer}>
					<SearchSelectionChip
						label="Movies"
						onPress={() => setSearchSelection('movies')}
						isSelected={searchSelection === 'movies'}
					/>
					<SearchSelectionChip
						label="Cast, Crew or Studios"
						onPress={() => setSearchSelection('crew')}
						isSelected={searchSelection === 'crew'}
					/>
				</View>
				{movieData && searchSelection === 'movies' && (
					<MovieGrid
						movies={movieData.results}
						isLoading={movieIsFetching}
						onEndReached={() => {}}
						onEndReachedThreshold={1}
						posterPath="search"
					/>
				)}
				{peopleData && searchSelection === 'crew' && (
					<FlatList
						data={peopleData.results}
						renderItem={({ item }) => (
							<>
								<Link href={`/(tabs)/(search)/person/${item.id}?from=search`}>
									<List.Item
										title={item.name}
										left={() => (
											<ActorPlaceholderImage
												profile_url={item.profile_path}
												department={item.known_for_department}
												height={50}
												width={50}
											/>
										)}
										description={item.known_for_department}
									/>
								</Link>
								<Divider />
							</>
						)}
						keyExtractor={(item) => item.id.toString()}
					/>
				)}
			</SafeAreaView>
			<MovieQuickActions movie={handleFindMovie()} />
		</>
	);
};

const styles = StyleSheet.create({
	chipContainer: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 8,
	},
});

export default Search;
