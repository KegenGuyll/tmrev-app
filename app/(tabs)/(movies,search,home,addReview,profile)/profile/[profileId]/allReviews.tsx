/* eslint-disable react-native/no-color-literals */
import { View, StyleSheet } from 'react-native';
import {
	ActivityIndicator,
	Chip,
	IconButton,
	MD3Theme,
	Text,
	useTheme,
	Searchbar,
} from 'react-native-paper';
import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatGrid } from 'react-native-super-grid';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { FlatList, RefreshControl } from 'react-native-gesture-handler';
import MovieReviewCard, { MovieReviewDisplayChip } from '@/components/MovieReviewCard';
import { GetMovieReviewSortBy, TmrevReview } from '@/models/tmrev';
import AllMovieReviewsFilters from '@/components/AllMovieReviewFilters';
import { camelCaseToWords } from '@/utils/common';
import { FromLocation } from '@/models';
import useDebounce from '@/hooks/useDebounce';
import {
	useReviewControllerFindByUserId,
	ReviewAggregated,
	ReviewControllerFindByUserIdParams,
} from '@/api/tmrev-api-v2';

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

// Extract footer component to avoid inline component definition
const ListFooter: React.FC<{ isLoading: boolean; isFetching: boolean }> = ({
	isLoading,
	isFetching,
}) => {
	if (isLoading || isFetching) {
		return (
			<View>
				<ActivityIndicator />
			</View>
		);
	}
	return null;
};

const AllReviews = () => {
	const [fullData, setFullData] = useState<ReviewAggregated[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const [showAdvancedScoreFilter, setShowAdvancedScoreFilter] = useState(true);
	const [sort, setSort] = useState<GetMovieReviewSortBy>('reviewedDate.desc');
	const [page, setPage] = useState(1);
	const [openFilters, setOpenFilters] = useState(false);
	const flatListRef = useRef<FlatList<TmrevReview>>(null);
	const [search, setSearch] = useState<string>('');

	const debouncedSearchTerm = useDebounce(search, 200);

	const handleMoveToTop = () => {
		flatListRef.current?.scrollToOffset({ offset: 0 });
	};

	const handleSetSort = (s: GetMovieReviewSortBy) => {
		handleMoveToTop();
		setPage(0);
		setSort(s);
	};

	const { profileId, advancedScore, from } = useLocalSearchParams<AllReviewsSearchParams>();

	// Reset fullData when search term or sort changes
	useEffect(() => {
		setFullData([]);
		setPage(1);
	}, [debouncedSearchTerm, sort]);

	const query: ReviewControllerFindByUserIdParams = useMemo(() => {
		if (advancedScore && showAdvancedScoreFilter) {
			return { sortBy: sort, pageNumber: page, pageSize, advancedScore };
		}

		if (debouncedSearchTerm) {
			return { sortBy: sort, pageNumber: page, pageSize, textSearch: debouncedSearchTerm };
		}

		return { sortBy: sort, pageNumber: page, pageSize };
	}, [sort, page, showAdvancedScoreFilter, debouncedSearchTerm]);

	const {
		data: userMovieReviewResponse,
		refetch,
		isLoading,
		isFetching,
	} = useReviewControllerFindByUserId(profileId!, query, {
		query: {
			enabled: !!profileId,
		},
	});

	// Update fullData when new data arrives
	useEffect(() => {
		if (userMovieReviewResponse?.results) {
			if (page === 1) {
				// Replace data on first page or after search/sort change
				setFullData(userMovieReviewResponse.results);
			} else {
				// Append data for subsequent pages
				setFullData((prev) => {
					const existingIds = new Set(prev.map((item: ReviewAggregated) => item._id));
					const newItems = (userMovieReviewResponse.results || []).filter(
						(item: ReviewAggregated) => !existingIds.has(item._id)
					);
					return [...prev, ...newItems];
				});
			}
		}
	}, [userMovieReviewResponse, page]);

	const theme = useTheme();
	const styles = makeStyles(theme);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		setFullData([]);
		setPage(1);
		await refetch();
		setRefreshing(false);
	}, []);

	const loadNextPage = useCallback(() => {
		if (
			!isFetching &&
			userMovieReviewResponse &&
			userMovieReviewResponse.totalNumberOfPages &&
			page < userMovieReviewResponse.totalNumberOfPages
		) {
			setPage((prevPage) => prevPage + 1);
		}
	}, [userMovieReviewResponse, page, isFetching]);

	const handleOpenFilters = useCallback(() => {
		setOpenFilters(true);
	}, []);

	const headerRight = useCallback(() => {
		return <IconButton icon="filter" onPress={handleOpenFilters} />;
	}, [handleOpenFilters]);

	return (
		<>
			<Stack.Screen
				options={{
					title: `Reviews`,
					headerRight,
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
				<FlatGrid
					ListHeaderComponent={
						<View style={{ paddingBottom: 16, width: '100%' }}>
							<Searchbar
								value={search}
								onChangeText={(s) => setSearch(s)}
								placeholder="Search..."
							/>
						</View>
					}
					ref={flatListRef}
					itemDimension={400}
					style={styles.list}
					data={fullData as any}
					contentContainerStyle={{ alignItems: 'stretch', width: '100%' }}
					itemContainerStyle={{ maxHeight: 170 }}
					spacing={8}
					renderItem={({ item }) => (
						<MovieReviewCard
							titleEllipsizeSettings={{
								ellipsizeMode: 'tail',
								numberOflines: 1,
								width: 200,
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
					ListEmptyComponent={
						<View
							style={{
								borderStyle: 'dotted',
								borderColor: 'gray',
								borderWidth: 2,
								paddingHorizontal: 16,
								paddingVertical: 32,
								alignItems: 'center',
								borderRadius: 4,
								flex: 1,
								flexDirection: 'row',
								justifyContent: 'center',
							}}
						>
							<Text>No Results Found :(</Text>
						</View>
					}
					keyExtractor={(item) => item._id.toString()}
					refreshControl={
						<RefreshControl tintColor="white" refreshing={refreshing} onRefresh={onRefresh} />
					}
					onEndReached={loadNextPage}
					onEndReachedThreshold={0.5}
					ListFooterComponent={<ListFooter isLoading={isLoading} isFetching={isFetching} />}
				/>
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
			width: '100%',
		},
	});
