import { View, Image, StyleSheet } from 'react-native';
import { Text, ProgressBar, Chip, useTheme } from 'react-native-paper';

import { LinearGradient } from 'expo-linear-gradient';
import imageUrl from '@/utils/imageUrl';
import { formatRuntime, numberShortHand } from '@/utils/common';

type ListHeaderComponentProps = {
	backdropPath: string;
	title: string;
	description: string | null;
	username: string;
	completionPercentage: number;
	averageAdvancedScore: number | null;
	totalRuntime: number;
	totalBudget: number;
};

const ListHeaderComponent: React.FC<ListHeaderComponentProps> = ({
	backdropPath,
	title,
	description,
	username,
	completionPercentage,
	averageAdvancedScore,
	totalRuntime,
	totalBudget,
}: ListHeaderComponentProps) => {
	const theme = useTheme();

	return (
		<View>
			<Image
				style={styles.backgroundImage}
				source={{
					uri: imageUrl(backdropPath),
				}}
			/>
			<LinearGradient
				colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,1)']}
				style={styles.backgroundImageOverlay}
			/>
			<View
				style={{
					position: 'absolute',
					bottom: -20,
					zIndex: 999,
					display: 'flex',
					flexDirection: 'column',
					gap: 8,
					padding: 8,
					width: '100%',
				}}
			>
				<View>
					<Text variant="headlineLarge">{title}</Text>
					<Text variant="bodyLarge" ellipsizeMode="tail" numberOfLines={3.5}>
						{description}
					</Text>
				</View>
				<View
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 3,
					}}
				>
					<Text variant="labelSmall">
						{username} has watched {completionPercentage}% of this list
					</Text>
					<ProgressBar
						style={{ width: '100%', flex: 1, flexGrow: 1 }}
						progress={completionPercentage / 100}
						color={completionPercentage / 100 === 1 ? 'green' : theme.colors.primary}
					/>
				</View>
				<View
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						flexDirection: 'row',
						gap: 8,
					}}
				>
					<Chip icon="star">
						<Text>{averageAdvancedScore || 'N/A'}</Text>
					</Chip>
					<Chip icon="clock-time-four-outline">
						<Text>{formatRuntime(totalRuntime)}</Text>
					</Chip>
					<Chip icon="cash">
						<Text>{numberShortHand(totalBudget)}</Text>
					</Chip>
				</View>
			</View>
		</View>
	);
};

export default ListHeaderComponent;

const styles = StyleSheet.create({
	backgroundImageContainer: {
		width: '100%',
		height: 400,
		position: 'relative',
		marginBottom: 32,
	},
	backgroundImage: {
		width: '100%',
		height: 400,
		zIndex: 1,
	},
	backgroundImageOverlay: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		height: '100%',
		zIndex: 999,
	},
});
