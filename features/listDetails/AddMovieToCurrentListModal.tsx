import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { View } from 'react-native';
import { Badge, Searchbar, Text } from 'react-native-paper';
import { useEffect, useRef, useState } from 'react';
import CustomBackground from '@/components/CustomBottomSheetBackground';
import MovieGrid from '@/components/MovieGrid';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import TitledHandledComponent from '@/components/BottomSheetModal/TitledHandledComponent';
import useDebounce from '@/hooks/useDebounce';
import { useFindMoviesQuery } from '@/redux/api/tmdb/searchApi';

type AddMovieToListModalProps = {
	setMovies: (movies: MovieGeneral[]) => void;
	onDismiss: () => void;
	visible: boolean;
};

const AddMovieToListModal: React.FC<AddMovieToListModalProps> = ({
	setMovies,
	onDismiss,
	visible,
}: AddMovieToListModalProps) => {
	const bottomSheetModalAddMoviesRef = useRef<BottomSheetModal>(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [tempMovies, setTempMovies] = useState<MovieGeneral[]>([]);

	const debouncedSearchTerm = useDebounce(searchQuery, 500);

	const { data, isFetching } = useFindMoviesQuery({
		query: debouncedSearchTerm,
	});

	useEffect(() => {
		if (visible) {
			bottomSheetModalAddMoviesRef.current?.present();
		} else {
			bottomSheetModalAddMoviesRef.current?.dismiss();
		}
	});

	const handleClose = () => {
		onDismiss();
		bottomSheetModalAddMoviesRef.current?.dismiss();
		setSearchQuery('');
		setTempMovies([]);
	};

	const handleSetMovies = () => {
		setMovies(tempMovies);
		handleClose();
	};

	const handleAddMovies = (item: MovieGeneral) => {
		// if movie is already in list, remove it
		if (tempMovies.find((movie) => movie.id === item.id)) {
			setTempMovies(tempMovies.filter((movie) => movie.id !== item.id));
		} else {
			setTempMovies([...tempMovies, item]);
		}
	};

	return (
		<BottomSheetModal
			onChange={(index) => {
				if (index === -1) {
					onDismiss();
				}
			}}
			handleComponent={({ ...props }) => (
				<TitledHandledComponent
					{...props}
					title={
						<View
							style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}
						>
							<Text variant="labelLarge">Selected Movies</Text>
							<Badge>{tempMovies.length}</Badge>
						</View>
					}
					cancelButton={{
						onPress: onDismiss,
						title: 'Cancel',
					}}
					submitButton={{
						onPress: handleSetMovies,
						title: 'Add Movies',
					}}
				/>
			)}
			backgroundComponent={CustomBackground}
			ref={bottomSheetModalAddMoviesRef}
			snapPoints={['95%']}
		>
			<BottomSheetView>
				<View style={{ padding: 16, gap: 8 }}>
					<Searchbar
						placeholder="Search for movie..."
						value={searchQuery}
						onChangeText={(text) => setSearchQuery(text)}
					/>
					{data && (
						<MovieGrid
							selectedMovieIds={tempMovies.map((movie) => movie.id)}
							movies={data.results}
							isLoading={isFetching}
							onEndReached={() => {}}
							onEndReachedThreshold={1}
							posterPath="search"
							bottomPadding={100}
							imageHeight={120}
							itemDimension={70}
							onPress={handleAddMovies}
						/>
					)}
				</View>
			</BottomSheetView>
		</BottomSheetModal>
	);
};

export default AddMovieToListModal;
