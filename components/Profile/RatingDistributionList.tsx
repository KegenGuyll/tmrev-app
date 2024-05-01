import { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Categories } from '@/models/tmrev/categories';
import { useCategoryRatingsQuery } from '@/redux/api/tmrev';
import RatingDistribution from './RatingDistribution';

type RatingDistributionListProps = {
	uid: string;
};

const RatingDistributionList: React.FC<RatingDistributionListProps> = ({
	uid,
}: RatingDistributionListProps) => {
	const { data: categoryRatings, isLoading } = useCategoryRatingsQuery(uid);

	const personalScoreRatings = useMemo(() => {
		if (!categoryRatings) return [];

		return Object.entries(categoryRatings.body.data[Categories.PERSONAL_SCORE]).map(
			([key, value]) => ({
				label: key,
				value: value.length,
			})
		);
	}, [categoryRatings]);

	const actingScoreRatings = useMemo(() => {
		if (!categoryRatings) return [];

		return Object.entries(categoryRatings.body.data[Categories.ACTING]).map(([key, value]) => ({
			label: key,
			value: value.length,
		}));
	}, [categoryRatings]);

	const charactersScoreRatings = useMemo(() => {
		if (!categoryRatings) return [];

		return Object.entries(categoryRatings.body.data[Categories.CHARACTERS]).map(([key, value]) => ({
			label: key,
			value: value.length,
		}));
	}, [categoryRatings]);

	const cinematographyScoreRatings = useMemo(() => {
		if (!categoryRatings) return [];

		return Object.entries(categoryRatings.body.data[Categories.CINEMATOGRAPHY]).map(
			([key, value]) => ({
				label: key,
				value: value.length,
			})
		);
	}, [categoryRatings]);

	const climaxScoreRatings = useMemo(() => {
		if (!categoryRatings) return [];

		return Object.entries(categoryRatings.body.data[Categories.CLIMAX]).map(([key, value]) => ({
			label: key,
			value: value.length,
		}));
	}, [categoryRatings]);

	const endingScoreRatings = useMemo(() => {
		if (!categoryRatings) return [];

		return Object.entries(categoryRatings.body.data[Categories.ENDING]).map(([key, value]) => ({
			label: key,
			value: value.length,
		}));
	}, [categoryRatings]);

	const musicScoreRatings = useMemo(() => {
		if (!categoryRatings) return [];

		return Object.entries(categoryRatings.body.data[Categories.MUSIC]).map(([key, value]) => ({
			label: key,
			value: value.length,
		}));
	}, [categoryRatings]);

	const plotScoreRatings = useMemo(() => {
		if (!categoryRatings) return [];

		return Object.entries(categoryRatings.body.data[Categories.PLOT]).map(([key, value]) => ({
			label: key,
			value: value.length,
		}));
	}, [categoryRatings]);

	const themeScoreRatings = useMemo(() => {
		if (!categoryRatings) return [];

		return Object.entries(categoryRatings.body.data[Categories.THEME]).map(([key, value]) => ({
			label: key,
			value: value.length,
		}));
	}, [categoryRatings]);

	const visualsScoreRatings = useMemo(() => {
		if (!categoryRatings) return [];

		return Object.entries(categoryRatings.body.data[Categories.VISUALS]).map(([key, value]) => ({
			label: key,
			value: value.length,
		}));
	}, [categoryRatings]);

	if (isLoading) {
		return <Text>Loading...</Text>;
	}

	return (
		<View style={{ padding: 8 }}>
			<ScrollView style={{ gap: 8, display: 'flex', flexDirection: 'row' }} horizontal>
				<RatingDistribution title="Personal Score" data={personalScoreRatings} />
				<RatingDistribution title="Acting" data={actingScoreRatings} />
				<RatingDistribution title="Characters" data={charactersScoreRatings} />
				<RatingDistribution title="Cinematography" data={cinematographyScoreRatings} />
				<RatingDistribution title="Climax" data={climaxScoreRatings} />
				<RatingDistribution title="Ending" data={endingScoreRatings} />
				<RatingDistribution title="Music" data={musicScoreRatings} />
				<RatingDistribution title="Plot" data={plotScoreRatings} />
				<RatingDistribution title="Theme" data={themeScoreRatings} />
				<RatingDistribution title="Visuals" data={visualsScoreRatings} />
			</ScrollView>
		</View>
	);
};

export default RatingDistributionList;
