import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Chip, Divider, List, Searchbar, Text } from 'react-native-paper';
import { useFindMoviesQuery, useFindPeopleQuery } from '@/redux/api/tmdb/searchApi';
import MovieGrid from '@/components/MovieGrid';
import ActorPlaceholderImage from '@/components/ActorPlacholderImage';
import { personDetailsRoute } from '@/constants/routes';
import MovieDiscoverGrid from '@/components/MovieDiscoverGrid';
import useDebounce from '@/hooks/useDebounce';

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

type SearchBarComponentProps = {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	setSearchSelection: (selection: SearchSelection) => void;
	searchSelection: SearchSelection;
};

const SearchBarComponent: React.FC<SearchBarComponentProps> = ({
	searchQuery,
	setSearchQuery,
	searchSelection,
	setSearchSelection,
}: SearchBarComponentProps) => {
	return (
		<View style={{ paddingVertical: 16, width: '100%', flexGrow: 1 }}>
			<Searchbar
				style={{ width: '100%', flexGrow: 1 }}
				placeholder="Search..."
				value={searchQuery}
				onChangeText={(t) => setSearchQuery(t)}
			/>
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
		</View>
	);
};

const Search: React.FC = () => {
	const [searchQuery, setSearchQuery] = React.useState('');
	const [searchSelection, setSearchSelection] = React.useState<SearchSelection>('movies');

	const debouncedSearchTerm = useDebounce(searchQuery, 500);

	const { data: movieData, isFetching: movieIsFetching } = useFindMoviesQuery(
		{ query: debouncedSearchTerm },
		{ skip: searchSelection !== 'movies' }
	);

	const { data: peopleData } = useFindPeopleQuery(
		{ query: debouncedSearchTerm },
		{ skip: searchSelection !== 'crew' }
	);

	return (
		<View>
			{!searchQuery && searchSelection === 'movies' && (
				<MovieDiscoverGrid
					imageHeight={125}
					itemDimension={75}
					ListHeaderComponent={
						<SearchBarComponent
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							searchSelection={searchSelection}
							setSearchSelection={setSearchSelection}
						/>
					}
					from="search"
				/>
			)}
			{movieData && searchSelection === 'movies' && (
				<MovieGrid
					ListHeaderComponent={
						<SearchBarComponent
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							searchSelection={searchSelection}
							setSearchSelection={setSearchSelection}
						/>
					}
					imageHeight={125}
					itemDimension={75}
					movies={movieData.results}
					isLoading={movieIsFetching}
					onEndReached={() => {}}
					onEndReachedThreshold={1}
					posterPath="search"
					bottomPadding={100}
				/>
			)}
			{peopleData && searchSelection === 'crew' && (
				<FlatList
					style={{ width: '100%' }}
					ListHeaderComponent={
						<SearchBarComponent
							searchQuery={searchQuery}
							setSearchQuery={setSearchQuery}
							searchSelection={searchSelection}
							setSearchSelection={setSearchSelection}
						/>
					}
					data={peopleData.results}
					renderItem={({ item }) => (
						<>
							<Link href={personDetailsRoute('search', String(item.id))}>
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
		</View>
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
