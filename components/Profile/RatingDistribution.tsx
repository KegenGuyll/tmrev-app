import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme, Text } from 'react-native-paper';

type RatingDistributionProps = {
	title: string;
	data: { label: string; value: number }[];
};

const RatingDistribution: React.FC<RatingDistributionProps> = ({
	data,
	title,
}: RatingDistributionProps) => {
	const theme = useTheme();

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
				isAnimated
			/>
		</View>
	);
};

export default RatingDistribution;
