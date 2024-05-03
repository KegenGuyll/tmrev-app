/* eslint-disable react-native/no-color-literals */
import { View, StyleSheet } from 'react-native';
import { IconButton, MD3Theme, Text, useTheme } from 'react-native-paper';
import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatGrid } from 'react-native-super-grid';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { RefreshControl } from 'react-native-gesture-handler';
import { ProfileSearchParams } from '.';
import { useGetUserMovieReviewsQuery } from '@/redux/api/tmrev';
import MovieReviewCard from '@/components/MovieReviewCard';
import { GetMovieReviewSortBy } from '@/models/tmrev';
import AllMovieReviewsFilters from '@/components/AllMovieReviewFilters';

const AllReviews = () => {
	const [refreshing, setRefreshing] = useState(false);
	const [sort, setSort] = useState<GetMovieReviewSortBy>('reviewedDate.desc');

	const { profileId } = useLocalSearchParams<ProfileSearchParams>();
	const { data, isLoading, refetch } = useGetUserMovieReviewsQuery(
		{ userId: profileId, query: { sort_by: sort } },
		{ skip: !profileId }
	);
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);
	const theme = useTheme();
	const styles = makeStyles(theme);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		refetch().then(() => setRefreshing(false));
	}, []);

	const snapPoints = useMemo(() => ['95%'], []);

	const handleOpenBottomSheet = () => {
		bottomSheetModalRef.current?.present();
	};

	const handleCloseBottomSheet = () => {
		bottomSheetModalRef.current?.dismiss();
	};

	if (isLoading || !data) {
		return <Text>Loading...</Text>;
	}

	return (
		<>
			<Stack.Screen
				options={{
					title: `Reviews`,
					headerRight: () => <IconButton icon="filter" onPress={handleOpenBottomSheet} />,
				}}
			/>
			<View>
				{!data.body.reviews.length ? (
					<Text>No reviews found</Text>
				) : (
					<FlatGrid
						itemDimension={200}
						style={styles.list}
						data={data.body.reviews}
						spacing={8}
						renderItem={({ item }) => <MovieReviewCard review={item} />}
						keyExtractor={(item) => item._id.toString()}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
					/>
				)}
			</View>
			<BottomSheetModal
				handleIndicatorStyle={{ backgroundColor: 'white' }}
				handleStyle={{ backgroundColor: theme.colors.background }}
				style={{ backgroundColor: theme.colors.background }}
				snapPoints={snapPoints}
				ref={bottomSheetModalRef}
			>
				<BottomSheetView style={styles.bottomSheetContainer}>
					<AllMovieReviewsFilters
						handleCloseBottomSheet={handleCloseBottomSheet}
						setSortByQuery={setSort}
					/>
				</BottomSheetView>
			</BottomSheetModal>
		</>
	);
};

export default AllReviews;

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
