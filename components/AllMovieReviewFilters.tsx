/* eslint-disable react-native/no-color-literals */
import { View, StyleSheet } from 'react-native';
import { Text, Chip, useTheme, List, MD3Theme } from 'react-native-paper';
import { useEffect, useRef, useState } from 'react';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GetMovieReviewSortBy } from '@/models/tmrev';
import CustomBackground from './CustomBottomSheetBackground';
import TitledHandledComponent from './BottomSheetModal/TitledHandledComponent';

type SortType = {
	value: GetMovieReviewSortBy;
	title: string;
};

type FilterReviewItemProps = {
	setSort: (sort: SortType) => void;
	title: string;
	description: string;
	sortValue: GetMovieReviewSortBy;
	isActive: boolean;
};

const FilterReviewItem: React.FC<FilterReviewItemProps> = ({
	setSort,
	title,
	description,
	sortValue,
	isActive,
}: FilterReviewItemProps) => {
	const theme = useTheme();

	return (
		<List.Item
			style={{ marginLeft: 64 }}
			left={() => {
				if (!isActive) return null;

				return <List.Icon icon="check" color={theme.colors.primary} />;
			}}
			titleStyle={{
				color: isActive ? theme.colors.primary : 'white',
			}}
			onPress={() =>
				setSort({
					value: sortValue,
					title,
				})
			}
			title={title}
			description={description}
		/>
	);
};

type SortByListType = {
	title: string;
	description: string;
	key: string;
	items: SortByItem[];
};

type SortByItem = {
	title: string;
	description: string;
	sortValue: GetMovieReviewSortBy;
};

const SortByList: SortByListType[] = [
	{
		key: 'reviewedDate',
		title: 'Review Date',
		description: 'Sort by the date the review was made.',
		items: [
			{
				title: 'Most Recent',
				description: 'Sort by the most recent reviewed.',
				sortValue: 'reviewedDate.desc',
			},
			{
				title: 'Oldest',
				description: 'Sort by the oldest reviewed.',
				sortValue: 'reviewedDate.asc',
			},
		],
	},
	{
		key: 'averagedAdvancedScore',
		title: 'Average Score',
		description: 'Sort by the average score of the review.',
		items: [
			{
				title: 'Highest Score',
				description: 'Sort by the highest score.',
				sortValue: 'averagedAdvancedScore.desc',
			},
			{
				title: 'Lowest Score',
				description: 'Sort by the lowest score.',
				sortValue: 'averagedAdvancedScore.asc',
			},
		],
	},
	{
		key: 'movieDetails',
		title: 'Movie Details',
		description: 'Sort by the details of the movie.',
		items: [
			{
				title: 'Highest Budget',
				description: 'Sort by the largest budget.',
				sortValue: 'budget.desc.movieDetails',
			},
			{
				title: 'Lowest Budget',
				description: 'Sort by the smallest budget.',
				sortValue: 'budget.asc.movieDetails',
			},
			{
				title: 'Longest Runtime',
				description: 'Sort by the longest runtime.',
				sortValue: 'runtime.desc.movieDetails',
			},
			{
				title: 'Shortest Runtime',
				description: 'Sort by the shortest runtime.',
				sortValue: 'runtime.asc.movieDetails',
			},
		],
	},
];

type AllMovieReviewsFiltersProps = {
	handleClose: () => void;
	setSortByQuery: (queryValue: GetMovieReviewSortBy) => void;
	sortQuery: GetMovieReviewSortBy;
	open: boolean;
};

const AllMovieReviewsFilters: React.FC<AllMovieReviewsFiltersProps> = ({
	handleClose,
	setSortByQuery,
	sortQuery: initialSortQuery,
	open,
}: AllMovieReviewsFiltersProps) => {
	const [expandedSortBy, setExpandedSortBy] = useState(true);
	const [sort, setSort] = useState<SortType>({
		value: initialSortQuery,
		title: 'Most Recent',
	});
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);

	const theme = useTheme();
	const styles = makeStyles(theme);

	useEffect(() => {
		if (open) {
			bottomSheetModalRef.current?.present();
		}
	}, [open]);

	const setInitialSort = (value: GetMovieReviewSortBy) => {
		const initialSort = SortByList.find((list) => {
			return list.items.find((item) => item.sortValue === value);
		});
		if (initialSort) {
			setSort({
				value,
				title: initialSort.title,
			});
		}
	};

	useEffect(() => {
		setInitialSort(initialSortQuery);
	}, [initialSortQuery]);

	const handleModalClose = () => {
		handleClose();
		bottomSheetModalRef.current?.dismiss();
	};

	const handleSubmit = () => {
		setSortByQuery(sort.value);
		handleClose();
		bottomSheetModalRef.current?.dismiss();
	};

	return (
		<BottomSheetModal
			backgroundComponent={CustomBackground}
			handleIndicatorStyle={{ backgroundColor: 'white' }}
			handleComponent={({ animatedIndex, animatedPosition }) => (
				<TitledHandledComponent
					animatedIndex={animatedIndex}
					animatedPosition={animatedPosition}
					title="Filters"
					submitButton={{
						onPress: handleSubmit,
						title: 'Apply',
					}}
					cancelButton={{
						onPress: handleModalClose,
						title: 'Cancel',
					}}
				/>
			)}
			snapPoints={['95%']}
			ref={bottomSheetModalRef}
			onChange={(i) => {
				if (i === -1) {
					handleClose();
				}
			}}
		>
			<BottomSheetScrollView style={styles.bottomSheetContainer}>
				<View style={{ gap: 16 }}>
					<View style={{ gap: 4 }}>
						<Text variant="labelLarge">Active Filters</Text>
						<View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
							{sort && <Chip icon="sort">{sort.title}</Chip>}
						</View>
					</View>
					<List.Section>
						<List.Accordion
							onPress={() => setExpandedSortBy(!expandedSortBy)}
							expanded={expandedSortBy}
							title="Sort By"
							description="Select a sorting method for the reviews."
							left={() => <List.Icon icon="sort" />}
						>
							{SortByList.map((list) => (
								<List.Accordion key={list.title} title={list.title} description={list.description}>
									{list.items.map((item) => (
										<FilterReviewItem
											key={item.sortValue}
											setSort={setSort}
											title={item.title}
											description={item.description}
											sortValue={item.sortValue}
											isActive={sort?.value === item.sortValue}
										/>
									))}
								</List.Accordion>
							))}
						</List.Accordion>
					</List.Section>
				</View>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};

export default AllMovieReviewsFilters;

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
