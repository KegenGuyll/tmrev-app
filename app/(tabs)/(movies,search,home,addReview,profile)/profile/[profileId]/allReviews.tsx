/* eslint-disable react-native/no-color-literals */
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Chip, IconButton, MD3Theme, Text, useTheme } from 'react-native-paper';
import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatGrid } from 'react-native-super-grid';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import { useGetUserMovieReviewsQuery } from '@/redux/api/tmrev';
import MovieReviewCard, { MovieReviewDisplayChip } from '@/components/MovieReviewCard';
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

const convertSortToDisplayChip = (sort: GetMovieReviewSortBy): MovieReviewDisplayChip => {
	switch (sort) {
		case 'reviewedDate.desc':
			return 'reviewDate';
		case 'reviewedDate.asc':
			return 'reviewDate';
		case 'averagedAdvancedScore.desc':
			return 'averagedAdvancedScore';
		case 'averagedAdvancedScore.asc':
			return 'averagedAdvancedScore';
		case 'budget.desc.movieDetails':
			return 'budget';
		case 'budget.asc.movieDetails':
			return 'budget';
		case 'runtime.desc.movieDetails':
			return 'runtime';
		case 'runtime.asc.movieDetails':
			return 'runtime';
		default:
			return 'reviewDate';
	}
};

const AllReviews = () => {
	const [refreshing, setRefreshing] = useState(false);
	const [showAdvancedScoreFilter, setShowAdvancedScoreFilter] = useState(true);
	const [sort, setSort] = useState<GetMovieReviewSortBy>('reviewedDate.desc');
	const [page, setPage] = useState(0);
	const [openFilters, setOpenFilters] = useState(false);
	const flatListRef = useRef<FlatList<TmrevReview>>(null);

	const handleMoveToTop = () => {
		flatListRef.current?.scrollToOffset({ offset: 0 });
	};

	const handleSetSort = (s: GetMovieReviewSortBy) => {
		handleMoveToTop();
		setPage(0);
		setSort(s);
	};

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
		isFetching,
		refetch,
	} = useGetUserMovieReviewsQuery({ userId: profileId!, query }, { skip: !profileId });

	const theme = useTheme();
	const styles = makeStyles(theme);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		refetch().then(() => setRefreshing(false));
	}, []);

	const incrementPage = useCallback(() => {
		if (
			userMovieReviewResponse?.body.pageNumber === userMovieReviewResponse?.body.totalNumberOfPages
		) {
			return;
		}

		if (isLoading) return;

		setPage((prev) => prev + 1);
	}, [userMovieReviewResponse]);

	if (isLoading || !userMovieReviewResponse) {
		return <ActivityIndicator />;
	}

	return (
		<>
			<Stack.Screen
				options={{
					title: `Reviews`,
					headerRight: () => <IconButton icon="filter" onPress={() => setOpenFilters(true)} />,
				}}
			/>
			<View style={{ marginTop: 8 }}>
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
						ref={flatListRef}
						itemDimension={200}
						style={styles.list}
						data={userMovieReviewResponse.body.reviews}
						contentContainerStyle={{ paddingBottom: 100 }}
						itemContainerStyle={{ maxHeight: 170 }}
						onEndReachedThreshold={1}
						spacing={8}
						renderItem={({ item }) => (
							<MovieReviewCard
								titleEllipsizeSettings={{
									ellipsizeMode: 'tail',
									numberOflines: 1,
									width: 250,
								}}
								notesEllipsizeSettings={{
									ellipsizeMode: 'tail',
									numberOflines: 6,
									width: 200,
								}}
								displayedChip={convertSortToDisplayChip(sort)}
								from={from || 'home'}
								review={item}
							/>
						)}
						keyExtractor={(item) => item._id.toString()}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
						onEndReached={incrementPage}
						ListFooterComponent={() => {
							if (isLoading || isFetching) {
								return (
									<View>
										<ActivityIndicator />
									</View>
								);
							}

							return null;
						}}
					/>
				)}
			</View>
			<AllMovieReviewsFilters
				open={openFilters}
				handleClose={() => setOpenFilters(false)}
				setSortByQuery={handleSetSort}
				sortQuery={sort}
			/>
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
