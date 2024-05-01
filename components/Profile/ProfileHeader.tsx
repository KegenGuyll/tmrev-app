import { View, Image, StyleSheet } from 'react-native';
import { Icon, Text, useTheme, MD3Theme, Button, Divider } from 'react-native-paper';
import { useMemo, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import { numberShortHand } from '@/utils/common';
import { User } from '@/models/tmrev';
import { useFollowUserMutation } from '@/redux/api/tmrev';

type ProfileHeaderProps = {
	user: User;
	followVisible?: boolean;
	editVisible?: boolean;
	isCurrentlyFollowing?: boolean;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
	user,
	followVisible,
	editVisible,
	isCurrentlyFollowing,
}: ProfileHeaderProps) => {
	const theme = useTheme();
	const styles = makeStyles(theme);
	const [isFollowing, setIsFollowing] = useState(isCurrentlyFollowing);
	const { currentUser } = auth();
	const [followUser] = useFollowUserMutation();
	const router = useRouter();

	const handleFollowUser = async () => {
		if (!currentUser) return;

		try {
			const token = await currentUser.getIdToken();
			await followUser({ uid: user._id, authToken: token });
			setIsFollowing(true);
		} catch (error) {
			console.error(error);
		}
	};

	const name = useMemo(() => {
		return `${user.firstName} ${user.lastName}`;
	}, [user]);

	return (
		<View style={styles.container}>
			<View style={styles.statsContainer}>
				<Image source={{ uri: user?.photoUrl }} style={styles.image} />
				<View style={styles.statDisplay}>
					<Text> {numberShortHand(user.reviews.length)}</Text>
					<Text variant="labelLarge">reviews</Text>
				</View>
				<View style={styles.statDisplay}>
					<Text>{numberShortHand(user.followers.length)}</Text>
					<Text variant="labelLarge">followers</Text>
				</View>
				<View style={styles.statDisplay}>
					<Text>{numberShortHand(user.following.length)}</Text>
					<Text variant="labelLarge">following</Text>
				</View>
				{user.watchLists.length > 0 ? (
					<View style={styles.statDisplay}>
						<Text>{numberShortHand(user.watchLists.length)}</Text>
						<Text variant="labelLarge">lists</Text>
					</View>
				) : null}
			</View>
			<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
				<Text variant="labelLarge">{name}</Text>
			</View>
			{user.bio && <Text>{user.bio}</Text>}
			{user.location && (
				<View style={{ display: 'flex', gap: 8, flexDirection: 'row', alignItems: 'center' }}>
					<Icon size={24} source="map-marker" />
					<Text>{user.location}</Text>
				</View>
			)}
			{followVisible && (
				<>
					<Divider style={{ margin: 16 }} />
					<View style={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 8 }}>
						<Button onPress={handleFollowUser} style={{ width: '50%' }} mode="contained">
							{isFollowing ? 'Unfollow' : 'Follow'}
						</Button>
						<Button disabled style={{ width: '50%' }} mode="outlined">
							Message
						</Button>
					</View>
				</>
			)}
			{editVisible && (
				<>
					<Divider style={{ margin: 16 }} />
					<Button
						onPress={() => router.push('/(tabs)/(profile)/profile/editProfile')}
						mode="outlined"
					>
						Edit Profile
					</Button>
				</>
			)}
		</View>
	);
};

const makeStyles = ({ colors }: MD3Theme) =>
	StyleSheet.create({
		container: {
			display: 'flex',
			flexDirection: 'column',
			gap: 4,
			backgroundColor: colors.background,
			padding: 16,
			borderRadius: 4,
		},
		statsContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
		},
		image: {
			height: 64,
			width: 64,
			borderRadius: 50,
			borderWidth: 2,
			borderColor: 'white',
		},
		statDisplay: {
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
		},
	});

export default ProfileHeader;
