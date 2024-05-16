/* eslint-disable react-native/no-color-literals */
import { FlatList, View, StyleSheet } from 'react-native';
import { Button, Icon, Text, TouchableRipple } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { FromLocation } from '@/models';
import { useGetPinnedMoviesQuery } from '@/redux/api/tmrev';
import MovieReviewCard from '../MovieReviewCard';
import { updatePinnedReviewsRoute } from '@/constants/routes';

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
						<Button onPress={() => router.push(updatePinnedReviewsRoute(from))}>Update</Button>
					</View>
				)}
			</View>
			{pinnedData?.body && !!pinnedData.body.length && (
				<View>
					<FlatList
						style={{ flex: 1 }}
						data={pinnedData.body}
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
			{isCurrentUser && (!pinnedData?.body || !pinnedData.body.length) && (
				<TouchableRipple
					style={styles.pinnedContainer}
					onPress={() => router.push(updatePinnedReviewsRoute(from))}
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