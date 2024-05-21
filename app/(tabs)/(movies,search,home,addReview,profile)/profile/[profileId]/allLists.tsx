/* eslint-disable react/no-array-index-key */
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { IconButton, Surface, Text, TouchableRipple } from 'react-native-paper';
import { FlatGrid } from 'react-native-super-grid';
import { Shadow } from 'react-native-shadow-2';
import { MovieGeneral } from '@/models/tmdb/movie/tmdbMovie';
import CreateWatchListModal from '@/components/CreateWatchListModal';
import { useGetUserWatchListsQuery } from '@/redux/api/tmrev';
import { FromLocation } from '@/models';
import { MoviePosterImage } from '@/components/MoviePoster';
import { WatchList } from '@/models/tmrev';
import { listDetailsRoute } from '@/constants/routes';

type AllListsSearchParams = {
	profileId: string;
	from: FromLocation;
};

type WatchListItemProps = {
	item: WatchList;
	profileId: string;
	from: FromLocation;
};

const WatchListItem: React.FC<WatchListItemProps> = ({
	item,
	from,
	profileId,
}: WatchListItemProps) => {
	const firstFiveMovies = useMemo(() => item.movies.slice(0, 5), [item.movies]);
	const router = useRouter();

	return (
		<TouchableRipple onPress={() => router.push(listDetailsRoute(from, item._id, profileId))}>
			<Surface style={{ padding: 8, borderRadius: 4 }}>
				<View style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
					<View>
						<Text variant="labelLarge">{item.title}</Text>
						<Text variant="labelSmall">{`${item.movies.length} movies`}</Text>
					</View>

					<View style={{ display: 'flex', flexDirection: 'row' }}>
						{firstFiveMovies.map((movie, index) => (
							// keep an eye on this shadow, it may be causing performance issues
							<Shadow
								key={`${movie.id}-${index}`}
								distance={2}
								offset={[-5, 0]}
								style={{
									marginRight: -10,
								}}
							>
								<MoviePosterImage
									style={{ borderWidth: 0 }}
									height={110}
									moviePoster={movie.poster_path}
									posterSize={154}
								/>
							</Shadow>
						))}
					</View>
				</View>
			</Surface>
		</TouchableRipple>
	);
};

const AllListsPage: React.FC = () => {
	const { profileId, from } = useLocalSearchParams<AllListsSearchParams>();

	const [refreshing, setRefreshing] = useState(false);
	const [movies, setMovies] = useState<MovieGeneral[]>([]);
	const [openCreateModal, setOpenCreateModal] = useState(false);

	const { data, isLoading, refetch } = useGetUserWatchListsQuery(
		{ pageNumber: 0, pageSize: 10, userId: profileId! },
		{ skip: !profileId }
	);

	const handleRefresh = async () => {
		setRefreshing(true);
		await refetch().unwrap();
		setRefreshing(false);
	};

	const handleOpenBottomSheet = () => {
		setOpenCreateModal(true);
	};

	if (isLoading || !data) {
		return <Text>Loading...</Text>;
	}

	return (
		<>
			<Stack.Screen
				options={{
					title: 'All Lists',
					headerRight: () => (
						<View style={{ display: 'flex', flexDirection: 'row' }}>
							<IconButton onPress={handleOpenBottomSheet} icon="plus" size={24} />
							<IconButton onPress={handleOpenBottomSheet} icon="filter" size={24} />
						</View>
					),
				}}
			/>
			<FlatGrid
				itemDimension={200}
				spacing={8}
				data={data.body.watchlists}
				renderItem={({ item }) => <WatchListItem profileId={profileId!} from={from!} item={item} />}
				keyExtractor={(item) => item._id}
				refreshing={refreshing}
				onRefresh={handleRefresh}
			/>
			<CreateWatchListModal
				handleClose={() => setOpenCreateModal(false)}
				open={openCreateModal}
				movies={movies}
				setMovies={setMovies}
			/>
		</>
	);
};

export default AllListsPage;
