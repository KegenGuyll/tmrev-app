import React from 'react';
import { NativeSyntheticEvent, TextInputChangeEventData } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const Search = () => {
	const [searchQuery, setSearchQuery] = React.useState('');

	const onChangeSearch = (e: NativeSyntheticEvent<TextInputChangeEventData>) =>
		setSearchQuery(e.nativeEvent.text);

	return (
		<SafeAreaView>
			<Searchbar placeholder="Search" value={searchQuery} onChange={onChangeSearch} />
		</SafeAreaView>
	);
};

export default Search;
