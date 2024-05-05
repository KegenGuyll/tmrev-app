import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme, Text } from 'react-native-paper';
import { FromLocation } from '@/models';

type Data = {
	label: string;
	value: number;
};

type RatingDistributionProps = {
	title: string;
	id: string;
	data: Data[];
	profileId: string;
	from?: FromLocation;
};

const RatingDistribution: React.FC<RatingDistributionProps> = ({
	data,
	title,
	id,
	profileId,
	from,
}: RatingDistributionProps) => {
	const theme = useTheme();
	const router = useRouter();

	const handleRoute = (item: Data) => {
		const formattedQuery = `${id}.${item.label}`;

		router.push(
			`/(tabs)/(${from || 'home'})/profile/${profileId}/allReviews?advancedScore=${formattedQuery}`
		);
	};

	return (
		<View
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				borderWidth: 1,
				borderRadius: 4,
				padding: 16,
				gap: 8,
			}}
		>
			<Text variant="titleLarge">{title}</Text>
			<BarChart
				showValuesAsTopLabel
				topLabelTextStyle={{ color: theme.colors.secondary }}
				xAxisLabelTextStyle={{ color: theme.colors.secondary }}
				initialSpacing={0}
				endSpacing={2}
				yAxisThickness={0}
				xAxisThickness={0}
				barBorderRadius={4}
				frontColor={theme.colors.secondary}
				hideYAxisText
				barWidth={22}
				spacing={8}
				data={data}
				hideRules
				height={200}
				maxValue={10}
				onPress={handleRoute}
			/>
		</View>
	);
};

export default RatingDistribution;
