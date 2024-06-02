import { BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { View } from 'react-native';
import { Divider, Badge, Searchbar, Button, Text } from 'react-native-paper';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import CustomBackground from './CustomBottomSheetBackground';
import MovieGrid from './MovieGrid';
import MoviePoster from './MoviePoster';
import { useCreateWatchListMutation } from '@/redux/api/tmrev';
import { profileRoute } from '@/constants/routes';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import { useFindMoviesQuery } from '@/redux/api/tmdb/searchApi';
import useDebounce from '@/hooks/useDebounce';
import TextInput from './Inputs/TextInput';
import MultiLineInput from './Inputs/MultiLineInput';

type CreateWatchListModalProps = {
	movies: MovieGeneral[];
	setMovies: (movies: MovieGeneral[]) => void;
	open: boolean;
	handleClose: () => void;
	onSuccess?: () => void;
};

const CreateWatchListModal: React.FC<CreateWatchListModalProps> = ({
	movies,
	setMovies,
	open,
	handleClose,
	onSuccess,
}: CreateWatchListModalProps) => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const bottomSheetModalCreateListRef = useRef<BottomSheetModal>(null);
	const bottomSheetModalAddMoviesRef = useRef<BottomSheetModal>(null);
	const [createWatchList] = useCreateWatchListMutation();
	const router = useRouter();

	const debouncedSearchTerm = useDebounce(searchQuery, 500);

	useEffect(() => {
		if (open) {
			handleOpenBottomSheet();
		}
	}, [open]);

	const handleOpenBottomSheet = () => {
		bottomSheetModalCreateListRef.current?.present();
	};

	const handleOpenAddMoviesBottomSheet = () => {
		bottomSheetModalAddMoviesRef.current?.present();
	};

	const handleCloseBottomSheet = () => {
		bottomSheetModalCreateListRef.current?.dismiss();
		handleClose();
	};

	const handleCreateModalChange = (value: number) => {
		if (value === -1) {
			handleClose();
		}
	};

	const handleCloseAddMoviesBottomSheet = () => {
		bottomSheetModalAddMoviesRef.current?.dismiss();
	};

	const { data: movieData, isFetching: movieIsFetching } = useFindMoviesQuery({
		query: debouncedSearchTerm,
	});

	const handleAddMovies = (item: MovieGeneral) => {
		// if movie is already in list, remove it
		if (movies.find((movie) => movie.id === item.id)) {
			setMovies(movies.filter((movie) => movie.id !== item.id));
		} else {
			setMovies([...movies, item]);
		}
	};

	const handleCreateWatchList = async () => {
		const response = await createWatchList({
			description,
			title,
			public: true,
			tags: [],
			movies: movies.map((movie, i) => ({
				order: i,
				tmdbID: movie.id,
			})),
		}).unwrap();

		handleCloseBottomSheet();
		if (response) {
			setTitle('');
			setDescription('');
			setMovies([]);
			if (onSuccess) {
				onSuccess();
			} else if (router.canDismiss()) {
				router.dismiss();
			} else {
				router.navigate(profileRoute('profile', response.userId));
			}
		}
	};

	return (
		<>
			<BottomSheetModal
				stackBehavior="push"
				// eslint-disable-next-line react-native/no-color-literals
				handleIndicatorStyle={{ backgroundColor: 'white' }}
				onChange={handleCreateModalChange}
				backgroundComponent={CustomBackground}
				ref={bottomSheetModalCreateListRef}
				snapPoints={['95%']}
			>
				<BottomSheetScrollView>
					<View style={{ padding: 16, gap: 16 }}>
						<View
							style={{
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<Button onPress={handleCloseBottomSheet}>Cancel</Button>
							<Text variant="titleMedium">Create List</Text>
							<Button onPress={handleCreateWatchList}>Save</Button>
						</View>
						<Divider />
						<TextInput
							onChangeText={(text) => setTitle(text)}
							placeholder="Add list name..."
							label="List Name"
							value={title}
						/>
						<MultiLineInput
							onChangeText={(text) => setDescription(text)}
							placeholder="Add list description..."
							label="List Description"
							value={description}
							numberOfLines={5}
						/>
						<View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
							{movies.map((movie) => (
								<View key={movie.id}>
									<MoviePoster
										height={100}
										location="profile"
										movieId={movie.id}
										moviePoster={movie.poster_path}
										onPress={() => handleAddMovies(movie)}
									/>
								</View>
							))}
						</View>
						<Button mode="outlined" onPress={handleOpenAddMoviesBottomSheet}>
							Add Movies
						</Button>
					</View>
				</BottomSheetScrollView>
			</BottomSheetModal>
			<BottomSheetModal
				// eslint-disable-next-line react-native/no-color-literals
				handleIndicatorStyle={{ backgroundColor: 'white' }}
				stackBehavior="push"
				backgroundComponent={CustomBackground}
				ref={bottomSheetModalAddMoviesRef}
				snapPoints={['95%']}
			>
				<BottomSheetView>
					<View style={{ padding: 16, gap: 8 }}>
						<View
							style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}
						>
							<Text variant="labelLarge">Selected Movies</Text>
							<Badge>{movies.length}</Badge>
						</View>

						<Searchbar
							placeholder="Search for movie..."
							value={searchQuery}
							onChangeText={(text) => setSearchQuery(text)}
						/>
						<Button mode="outlined" onPress={handleCloseAddMoviesBottomSheet}>
							Continue
						</Button>
						{movieData && (
							<MovieGrid
								selectedMovieIds={movies.map((movie) => movie.id)}
								movies={movieData.results}
								isLoading={movieIsFetching}
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
		</>
	);
};

export default CreateWatchListModal;
