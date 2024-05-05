import { View, Image, StyleSheet } from 'react-native';
import { Icon, Text, useTheme, MD3Theme, Button, Divider } from 'react-native-paper';
import { useMemo, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router';
import { numberShortHand } from '@/utils/common';
import { useFollowUserV2Mutation, useUnfollowUserV2Mutation } from '@/redux/api/tmrev';
import { UserV2 } from '@/models/tmrev/user';

type ProfileHeaderProps = {
	user: UserV2;
	followVisible?: boolean;
	editVisible?: boolean;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
	user,
	followVisible,
	editVisible,
}: ProfileHeaderProps) => {
	const theme = useTheme();
	const styles = makeStyles(theme);
	const [isFollowing, setIsFollowing] = useState(user.isFollowing);
	const [followerCount, setFollowerCount] = useState(user.followerCount);
	const { currentUser } = auth();
	const [followUser] = useFollowUserV2Mutation();
	const [unfollowUser] = useUnfollowUserV2Mutation();
	const router = useRouter();

	const handleFollowUser = async () => {
		if (!currentUser) return;

		try {
			await followUser({ userUid: user.uuid });
			setIsFollowing(true);
			setFollowerCount(followerCount + 1);
		} catch (error) {
			console.error(error);
		}
	};

	const handleUnFollowUser = async () => {
		if (!currentUser) return;

		try {
			await unfollowUser({ userUid: user.uuid });
			setIsFollowing(false);
			setFollowerCount(followerCount - 1);
		} catch (error) {
			console.error(error);
		}
	};

	const handleFollowButton = async () => {
		if (isFollowing) {
			await handleUnFollowUser();
		} else {
			await handleFollowUser();
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
					<Text> {numberShortHand(user.reviewCount)}</Text>
					<Text variant="labelLarge">reviews</Text>
				</View>
				<View style={styles.statDisplay}>
					<Text>{numberShortHand(followerCount)}</Text>
					<Text variant="labelLarge">followers</Text>
				</View>
				<View style={styles.statDisplay}>
					<Text>{numberShortHand(user.followingCount)}</Text>
					<Text variant="labelLarge">following</Text>
				</View>
				{user.listCount > 0 ? (
					<View style={styles.statDisplay}>
						<Text>{numberShortHand(user.listCount)}</Text>
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
						<Button onPress={handleFollowButton} style={{ width: '50%' }} mode="contained">
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
