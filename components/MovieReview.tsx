import { Chip, Divider, Text } from 'react-native-paper';
import { Image, View } from 'react-native';
import { Link } from 'expo-router';
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
					style={{
						display: 'flex',
						alignItems: 'center',
						flexDirection: 'row',
						marginBottom: 8,
					}}
				>
					<Link style={{ flexGrow: 1 }} href={`/(tabs)/(home)/profile/${review.profile.uuid}`}>
						<View
							style={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								gap: 8,
							}}
						>
							{review.profile.photoUrl && (
								<Image
									source={{ uri: review.profile.photoUrl }}
									style={{ width: 40, height: 40, borderRadius: 50 }}
								/>
							)}
							<Text variant="labelLarge">{name}</Text>
						</View>
					</Link>
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
