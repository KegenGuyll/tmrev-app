import { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { Categories } from '@/models/tmrev/categories';
import { useCategoryRatingsQuery } from '@/redux/api/tmrev';
import RatingDistribution from './RatingDistribution';
import { FromLocation } from '@/models';

type RatingDistributionListProps = {
	uid: string;
	from?: FromLocation;
};

const RatingDistributionList: React.FC<RatingDistributionListProps> = ({
	uid,
	from,
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
				<RatingDistribution
					profileId={uid}
					id="personalScore"
					title="Personal Score"
					data={personalScoreRatings}
					from={from}
				/>
				<RatingDistribution
					profileId={uid}
					id="acting"
					title="Acting"
					data={actingScoreRatings}
					from={from}
				/>
				<RatingDistribution
					profileId={uid}
					id="characters"
					title="Characters"
					data={charactersScoreRatings}
					from={from}
				/>
				<RatingDistribution
					profileId={uid}
					id="cinematography"
					title="Cinematography"
					data={cinematographyScoreRatings}
					from={from}
				/>
				<RatingDistribution
					profileId={uid}
					id="climax"
					title="Climax"
					data={climaxScoreRatings}
					from={from}
				/>
				<RatingDistribution
					profileId={uid}
					id="ending"
					title="Ending"
					data={endingScoreRatings}
					from={from}
				/>
				<RatingDistribution
					profileId={uid}
					id="music"
					title="Music"
					data={musicScoreRatings}
					from={from}
				/>
				<RatingDistribution
					profileId={uid}
					id="plot"
					title="Plot"
					data={plotScoreRatings}
					from={from}
				/>
				<RatingDistribution
					profileId={uid}
					id="theme"
					title="Theme"
					data={themeScoreRatings}
					from={from}
				/>
				<RatingDistribution
					profileId={uid}
					id="visuals"
					title="Visuals"
					data={visualsScoreRatings}
					from={from}
				/>
			</ScrollView>
		</View>
	);
};

export default RatingDistributionList;
