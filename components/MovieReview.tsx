import { Chip, Divider, Text } from 'react-native-paper';
import { Image, View } from 'react-native';
import { Link } from 'expo-router';
import dayjs from 'dayjs';
import { TmrevReview } from '@/models/tmrev';
import { formatDate } from '@/utils/common';

type MovieReviewProps = {
	review: TmrevReview;
	from: string;
};

const MovieReview: React.FC<MovieReviewProps> = ({ review, from }: MovieReviewProps) => {
	if (!review.profile) return null;

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
					<Link
						style={{ flexGrow: 1 }}
						href={`/(tabs)/(${from})/profile/${review.profile.uuid}?from=${from}`}
					>
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
									source={{ uri: review.profile?.photoUrl }}
									style={{ width: 40, height: 40, borderRadius: 50 }}
								/>
							)}
							<View style={{ flexGrow: 1 }}>
								<Text variant="labelLarge">{review.profile?.username}</Text>
								<Text variant="labelSmall">
									{dayjs(formatDate(review.createdAt)).format('hh:mm A · MMM DD, YYYY')}
								</Text>
							</View>
						</View>
					</Link>
				</View>
				<View
					style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}
				>
					<View style={{ flexGrow: 1 }}>
						<Text variant="titleMedium">{review.title}</Text>
					</View>
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
