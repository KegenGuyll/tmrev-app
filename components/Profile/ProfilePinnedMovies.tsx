/* eslint-disable react-native/no-color-literals */
import { FlatList, View, StyleSheet } from 'react-native';
import { Button, Icon, Text, TouchableRipple } from 'react-native-paper';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import useAuth from '@/hooks/useAuth';
import { FromLocation } from '@/models';
import { useUserControllerGetPinnedReviews } from '@/api/tmrev-api-v2';
import MovieReviewCard from '../MovieReviewCard';
import { updatePinnedReviewsRoute } from '@/constants/routes';

type ProfilePinnedMoviesProps = {
	profileId: string;
	from: FromLocation;
	refreshing: boolean;
};

const ProfilePinnedMovies: React.FC<ProfilePinnedMoviesProps> = ({
	profileId,
	from,
	refreshing,
}: ProfilePinnedMoviesProps) => {
	const { currentUser } = useAuth({});
	const router = useRouter();
	const { data: pinnedData, refetch } = useUserControllerGetPinnedReviews(profileId, {
		query: { enabled: !!profileId },
	});

	useMemo(() => {
		if (refreshing) {
			refetch();
		}
	}, [refreshing]);

	const isCurrentUser = useMemo(() => currentUser?.uid === profileId, [currentUser, profileId]);

	return (
		<View>
			<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
				<View
					style={{
						display: 'flex',
						flexDirection: 'row',
						alignItems: 'center',
						gap: 8,
						flexGrow: 1,
					}}
				>
					<Icon source="pin" size={12} />
					<Text variant="labelSmall">Pinned Reviews</Text>
				</View>
				{isCurrentUser && (
					<View>
						<Button onPress={() => router.navigate(updatePinnedReviewsRoute(from))}>Update</Button>
					</View>
				)}
			</View>
			{pinnedData && !!pinnedData.length && (
				<View>
					<FlatList
						style={{ flex: 1 }}
						data={pinnedData}
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ alignItems: 'stretch', alignContent: 'stretch' }}
						renderItem={({ item }) => (
							<View
								style={{
									marginRight: 12,
									display: 'flex',
									flexDirection: 'row',
									width: 300,
									height: 165,
								}}
							>
								<MovieReviewCard
									titleEllipsizeSettings={{
										numberOflines: 1,
										ellipsizeMode: 'tail',
										width: 200,
									}}
									review={item}
									from={from || 'home'}
								/>
							</View>
						)}
						keyExtractor={(item) => item._id}
						horizontal
						snapToAlignment="center"
						decelerationRate="normal"
						snapToInterval={325}
					/>
				</View>
			)}
			{isCurrentUser && (!pinnedData || !pinnedData.length) && (
				<TouchableRipple
					style={styles.pinnedContainer}
					onPress={() => router.navigate(updatePinnedReviewsRoute(from))}
				>
					<Text variant="labelSmall">Click to pin your favorite reviews</Text>
				</TouchableRipple>
			)}
			{!isCurrentUser && (!pinnedData || !pinnedData.length) && (
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
		marginTop: 8,
	},
});
