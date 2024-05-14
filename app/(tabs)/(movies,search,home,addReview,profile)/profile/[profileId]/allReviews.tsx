/* eslint-disable react-native/no-color-literals */
import { View, StyleSheet } from 'react-native';
import { Chip, IconButton, MD3Theme, Text, useTheme } from 'react-native-paper';
import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatGrid } from 'react-native-super-grid';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl } from 'react-native-gesture-handler';
import { useGetUserMovieReviewsQuery } from '@/redux/api/tmrev';
import MovieReviewCard from '@/components/MovieReviewCard';
import { GetMovieReviewSortBy, TmrevReview } from '@/models/tmrev';
import AllMovieReviewsFilters from '@/components/AllMovieReviewFilters';
import { camelCaseToWords } from '@/utils/common';
import { FromLocation } from '@/models';

const pageSize = 15;

type AllReviewsSearchParams = {
	profileId: string;
	advancedScore?: string;
	from?: FromLocation;
};

const AllReviews = () => {
	const [refreshing, setRefreshing] = useState(false);
	const [showAdvancedScoreFilter, setShowAdvancedScoreFilter] = useState(true);
	const [sort, setSort] = useState<GetMovieReviewSortBy>('reviewedDate.desc');
	const [page, setPage] = useState(0);
	const [reviews, setReviews] = useState<TmrevReview[]>([]);

	const { profileId, advancedScore, from } = useLocalSearchParams<AllReviewsSearchParams>();

	const query = useMemo(() => {
		if (advancedScore && showAdvancedScoreFilter) {
			return { sort_by: sort, pageNumber: page, pageSize, advancedScore };
		}

		return { sort_by: sort, pageNumber: page, pageSize };
	}, [sort, page, showAdvancedScoreFilter]);

	const {
		data: userMovieReviewResponse,
		isLoading,
		refetch,
	} = useGetUserMovieReviewsQuery({ userId: profileId!, query }, { skip: !profileId });
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);
	const theme = useTheme();
	const styles = makeStyles(theme);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		refetch().then(() => setRefreshing(false));
	}, []);

	// Reset page and reviews when sort changes
	useEffect(() => {
		setPage(0);
		setReviews([]);
	}, [sort, showAdvancedScoreFilter]);

	useEffect(() => {
		if (userMovieReviewResponse) {
			setReviews((prev) => [...prev, ...userMovieReviewResponse.body.reviews]);
		}
	}, [userMovieReviewResponse]);

	const incrementPage = useCallback(() => {
		if (
			userMovieReviewResponse?.body.pageNumber === userMovieReviewResponse?.body.totalNumberOfPages
		) {
			return;
		}

		setPage((prev) => prev + 1);
	}, [userMovieReviewResponse]);

	const snapPoints = useMemo(() => ['95%'], []);

	const handleOpenBottomSheet = () => {
		bottomSheetModalRef.current?.present();
	};

	const handleCloseBottomSheet = () => {
		bottomSheetModalRef.current?.dismiss();
	};

	if (isLoading || !userMovieReviewResponse) {
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
			<View style={{ marginTop: 8, marginBottom: 32 }}>
				<View
					style={{
						display: 'flex',
						flexDirection: 'row',
						gap: 4,
						flexWrap: 'wrap',
						paddingLeft: 8,
						paddingRight: 8,
					}}
				>
					{/* 
					TODO: Update sort to have a title and value
					{sort && (
						<Chip onClose={() => console.log('close')} icon="sort">
							{camelCaseToWords(sort.split('.')[0])}
							<View style={{ marginLeft: 8 }}>
								{String(sort.split('.')[1]) === 'asc' ? (
									<Icon source="chevron-up" size={20} />
								) : (
									<Icon source="chevron-down" size={20} />
								)}
							</View>
						</Chip>
					)} */}
					{advancedScore && (
						<Chip
							mode={showAdvancedScoreFilter ? 'outlined' : 'flat'}
							onClose={() => setShowAdvancedScoreFilter(!showAdvancedScoreFilter)}
							icon="filter"
						>
							{camelCaseToWords(advancedScore.split('.')[0])} : {advancedScore.split('.')[1]}
						</Chip>
					)}
				</View>
				{!userMovieReviewResponse.body.reviews.length ? (
					<Text>No reviews found</Text>
				) : (
					<FlatGrid
						itemDimension={200}
						style={styles.list}
						data={reviews}
						spacing={8}
						renderItem={({ item }) => <MovieReviewCard from={from || 'home'} review={item} />}
						keyExtractor={(item) => item._id.toString()}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
						onEndReached={incrementPage}
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
