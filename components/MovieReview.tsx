import { Chip, Divider, Text } from 'react-native-paper';
import { Image, View } from 'react-native';
import { TmrevReview } from '@/models/tmrev';

type MovieReviewProps = {
	review: TmrevReview;
};

const MovieReview: React.FC<MovieReviewProps> = ({ review }: MovieReviewProps) => {
	const name = `${review.profile.firstName} ${review.profile.lastName}`;

	return (
		<>
			<View style={{ padding: 8 }}>
				<View
					style={{ display: 'flex', alignItems: 'center', flexDirection: 'row', marginBottom: 8 }}
				>
					{review.profile.photoUrl && (
						<Image
							source={{ uri: review.profile.photoUrl }}
							style={{ width: 40, height: 40, borderRadius: 20, marginRight: 8 }}
						/>
					)}
					<Text variant="labelLarge" style={{ flexGrow: 1 }}>
						{name}
					</Text>
					<Chip icon="star">
						<Text>{review.averagedAdvancedScore}</Text>
					</Chip>
				</View>
				<Text variant="bodyMedium">{review.notes}</Text>
			</View>
			<Divider />
		</>
	);
};

export default MovieReview;
