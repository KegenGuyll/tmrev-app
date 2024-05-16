import { View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Slider } from '@miblanchard/react-native-slider';

type TitledSliderProps = {
	title: string;
	value: number;
	onValueChange: (value: number) => void;
};

const TitledSlider: React.FC<TitledSliderProps> = ({
	title,
	value,
	onValueChange,
}: TitledSliderProps) => {
	const theme = useTheme();

	return (
		<View style={{ paddingLeft: 16, paddingRight: 16, gap: 1 }}>
			<Text variant="labelLarge">
				{title}: {value}
			</Text>
			<Slider
				step={1}
				value={value}
				maximumValue={10}
				minimumValue={1}
				thumbTintColor={theme.colors.primary}
				maximumTrackTintColor={theme.colors.secondaryContainer}
				minimumTrackTintColor={theme.colors.secondary}
				onValueChange={(v) => onValueChange(Number(v))}
				animationType="timing"
				trackClickable={false}
			/>
		</View>
	);
};

export default TitledSlider;
