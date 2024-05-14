/* eslint-disable react-native/no-color-literals */
import { FlatList, View, StyleSheet } from 'react-native';
import { Icon, Text, TouchableRipple } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { FromLocation } from '@/models';
import { useGetPinnedMoviesQuery } from '@/redux/api/tmrev';
import MovieReviewCard from '../MovieReviewCard';

type ProfilePinnedMoviesProps = {
	profileId: string;
	from: FromLocation;
};

const ProfilePinnedMovies: React.FC<ProfilePinnedMoviesProps> = ({
	profileId,
	from,
}: ProfilePinnedMoviesProps) => {
	const { currentUser } = auth();
	const router = useRouter();
	const { data: pinnedData } = useGetPinnedMoviesQuery(profileId);

	const isCurrentUser = useMemo(() => currentUser?.uid === profileId, [currentUser, profileId]);

	return (
		<View style={{ gap: 12 }}>
			<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
				<Icon source="pin" size={12} />
				<Text variant="labelSmall">Pinned Reviews</Text>
			</View>
			{pinnedData?.body && !!pinnedData.body.length && (
				<View style={{ borderWidth: 1, borderColor: 'blue' }}>
					<FlatList
						style={{ borderWidth: 1, borderColor: 'red' }}
						data={pinnedData.body}
						renderItem={({ item }) => (
							<View
								style={{
									marginRight: 8,
									borderWidth: 1,
									borderColor: 'green',
									display: 'flex',
									flexDirection: 'row',
									width: 300,
								}}
							>
								<MovieReviewCard review={item} from={from || 'home'} mode="movieDetails" />
							</View>
						)}
						keyExtractor={(item) => item._id}
						horizontal
					/>
				</View>
			)}
			{isCurrentUser && (!pinnedData?.body || !pinnedData.body.length) && (
				<TouchableRipple
					style={styles.pinnedContainer}
					onPress={() =>
						router.push(
							`/(tabs)/(${from})/profile/${profileId}/allReviews?from=${from}&mode=pinned`
						)
					}
				>
					<Text variant="labelSmall">Click to pin your favorite reviews</Text>
				</TouchableRipple>
			)}
			{!isCurrentUser && (!pinnedData?.body || !pinnedData.body.length) && (
				<View style={styles.pinnedContainer}>
					<Text variant="labelSmall">User has no pinned reviews :(</Text>
				</View>
			)}
		</View>
	);
};

export default ProfilePinnedMovies;

const styles = StyleSheet.create({
	pinnedContainer: {
		borderStyle: 'dashed',
		borderWidth: 3,
		borderColor: 'gray',
		height: 150,
		width: '100%',
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
