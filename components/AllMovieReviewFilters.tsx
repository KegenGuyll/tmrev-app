/* eslint-disable react-native/no-color-literals */
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, Divider, Text, Chip, useTheme, List } from 'react-native-paper';
import { useState } from 'react';
import { GetMovieReviewSortBy } from '@/models/tmrev';

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

type SortByItem = {
	title: string;
	description: string;
	sortValue: GetMovieReviewSortBy;
};

const SortByList: SortByItem[] = [
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
];

type AllMovieReviewsFiltersProps = {
	handleCloseBottomSheet: () => void;
	setSortByQuery: (queryValue: GetMovieReviewSortBy) => void;
};

const AllMovieReviewsFilters: React.FC<AllMovieReviewsFiltersProps> = ({
	handleCloseBottomSheet,
	setSortByQuery,
}: AllMovieReviewsFiltersProps) => {
	const [expandedSortBy, setExpandedSortBy] = useState(true);
	const [sort, setSort] = useState<SortType>({
		value: 'reviewedDate.desc',
		title: 'Most Recent',
	});

	const handleSubmit = () => {
		setSortByQuery(sort.value);
		handleCloseBottomSheet();
	};

	return (
		<ScrollView>
			<View style={{ gap: 16 }}>
				<View
					style={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<Button onPress={handleCloseBottomSheet}>Cancel</Button>
					<Text variant="titleLarge">Filters</Text>
					<Button onPress={handleSubmit}>Done</Button>
				</View>

				<Divider />
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
						{SortByList.map((item) => (
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
				</List.Section>
			</View>
		</ScrollView>
	);
};

export default AllMovieReviewsFilters;
