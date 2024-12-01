import { View } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';

type SpinnerProps = {
	size?: 'small' | 'large';
};

const Spinner: React.FC<SpinnerProps> = ({ size }: SpinnerProps) => {
	const theme = useTheme();

	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<ActivityIndicator size={size} color={theme.colors.primary} />
		</View>
	);
};

export default Spinner;
