/* eslint-disable react/no-unstable-nested-components */
import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Button, Checkbox, MD3Theme, Searchbar, useTheme } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { FlatGrid } from 'react-native-super-grid';
import {
	useGetPinnedMoviesQuery,
	useGetUserMovieReviewsQuery,
	useUpdatePinnedMovieMutation,
} from '@/redux/api/tmrev';
import { GetUserMovieReviewsQuery, TmrevReview } from '@/models/tmrev/review';
import MovieReviewCard from '@/components/MovieReviewCard';
import { profileRoute } from '@/constants/routes';
import useDebounce from '@/hooks/useDebounce';

const pageSize = 15;
const page = 0;
const sort = 'reviewedDate.desc';

const UpdatePinnedReviews = () => {
	const { currentUser } = auth();
	const [pinnedReviews, setPinnedReviews] = useState<TmrevReview[]>([]);
	const [search, setSearch] = useState('');
	const theme = useTheme();
	const styles = makeStyles(theme);
	const { width } = useWindowDimensions();
	const [updatPinned] = useUpdatePinnedMovieMutation();
	const router = useRouter();

	const debouncedSearchTerm = useDebounce(search, 500);

	const query: GetUserMovieReviewsQuery = useMemo(() => {
		if (debouncedSearchTerm) {
			return { sort_by: sort, pageNumber: page, pageSize, textSearch: debouncedSearchTerm };
		}

		return { sort_by: sort, pageNumber: page, pageSize };
	}, [sort, page, debouncedSearchTerm]);

	const { data: movieReviews } = useGetUserMovieReviewsQuery(
		{ userId: currentUser!.uid, query },
		{ skip: !currentUser }
	);
	const { data: pinnedData } = useGetPinnedMoviesQuery(currentUser!.uid, { skip: !currentUser });

	useEffect(() => {
		if (pinnedData?.body) {
			setPinnedReviews(pinnedData.body);
		}
	}, [pinnedData]);

	const handleTogglePinnedReview = (reviewId: string) => {
		const doesReviewExist = pinnedReviews.findIndex((review) => review._id === reviewId);
		const review = movieReviews?.body.reviews.find((r) => r._id === reviewId);

		if (doesReviewExist === -1 && review) {
			setPinnedReviews([...pinnedReviews, review]);
		} else {
			setPinnedReviews(pinnedReviews.filter((r) => r._id !== reviewId));
		}
	};

	const handleUpdatePinnedReviews = async () => {
		try {
			const pinnedReviewsIds = pinnedReviews.map((r) => r._id);

			await updatPinned({ movieReviewIds: pinnedReviewsIds }).unwrap();

			if (router.canDismiss()) {
				router.dismiss();
			} else {
				router.replace(profileRoute('profile', currentUser!.uid));
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<>
			<Stack.Screen options={{ title: 'Update Pinned Reviews' }} />
			<View style={{ marginTop: 8, position: 'relative', gap: 8 }}>
				<Searchbar
					value={search}
					onChangeText={(t) => setSearch(t)}
					placeholder="Search for reviews"
				/>
				<Button onPress={handleUpdatePinnedReviews} style={{ width: '100%' }} mode="contained">
					Save
				</Button>
				{movieReviews?.body && (
					<FlatGrid
						ListHeaderComponentStyle={{
							display: 'flex',
							flexDirection: 'column',
							gap: 4,
							marginBottom: 8,
							width,
						}}
						ListHeaderComponent={() => (
							<View
								style={{
									width: '100%',
									gap: 4,
									padding: 4,
									flexDirection: 'column',
									display: 'flex',
									alignItems: 'center',
								}}
							/>
						)}
						itemDimension={400}
						style={styles.list}
						data={movieReviews?.body.reviews}
						itemContainerStyle={{ maxHeight: 170 }}
						contentContainerStyle={{ paddingBottom: 120 }}
						spacing={8}
						stickyHeaderIndices={[0]}
						renderItem={({ item }) => (
							<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
								<Checkbox.Android
									status={
										pinnedReviews.filter((v) => v._id === item._id).length ? 'checked' : 'unchecked'
									}
									onPress={() => handleTogglePinnedReview(item._id)}
								/>
								<View style={{ width: '90%' }}>
									<MovieReviewCard
										onPress={() => handleTogglePinnedReview(item._id)}
										from="profile"
										review={item}
									/>
								</View>
							</View>
						)}
						keyExtractor={(item) => item._id.toString()}
					/>
				)}
			</View>
		</>
	);
};

export default UpdatePinnedReviews;

const makeStyles = ({ colors }: MD3Theme) =>
	StyleSheet.create({
		bottomSheetContainer: {
			flex: 1,
			display: 'flex',
			flexDirection: 'column',
			backgroundColor: colors.background,
			padding: 16,
			gap: 32,
		},
		container: {
			flex: 1,
		},
		list: {
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'wrap',
		},
	});
