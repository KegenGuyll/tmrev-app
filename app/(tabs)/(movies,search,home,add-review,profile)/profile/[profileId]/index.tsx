import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import auth from '@react-native-firebase/auth';
import { IconButton, Menu, Text } from 'react-native-paper';
import { useEffect, useMemo, useState } from 'react';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import { useGetUserQuery } from '@/redux/api/tmrev';
import ClickableSurface from '@/components/ClickableSurface';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setUserProfile } from '@/redux/slice/userProfileSlice';

export type ProfileSearchParams = {
	profileId: string;
	from?: string;
};

const Profile = () => {
	const { currentUser } = auth();
	const { profileId, from } = useLocalSearchParams<ProfileSearchParams>();
	const { data: profileData, isLoading: isProfileLoading } = useGetUserQuery(
		{ uid: profileId },
		{ skip: !profileId }
	);
	const { data: loggedInUserData } = useGetUserQuery(
		{ uid: currentUser?.uid as string },
		{ skip: !currentUser || !currentUser.uid }
	);
	const [visible, setVisible] = useState(false);
	const dispatch = useAppDispatch();
	const router = useRouter();

	const openMenu = () => setVisible(true);
	const closeMenu = () => setVisible(false);

	useEffect(() => {
		if (profileData) {
			dispatch(setUserProfile(profileData));
		}
	}, [profileData]);

	const isFollowing = useMemo(() => {
		if (profileData && loggedInUserData) {
			return loggedInUserData.following.includes(profileData._id);
		}

		return false;
	}, []);

	const name = useMemo(() => {
		if (profileData) {
			return `${profileData.firstName} ${profileData.lastName}`;
		}

		return '';
	}, [profileData]);

	if (isProfileLoading || !profileData) {
		return <Text>Loading...</Text>;
	}

	return (
		<>
			<Stack.Screen
				options={{
					title: name,
					headerRight: () => (
						<Menu
							visible={visible}
							onDismiss={closeMenu}
							anchor={<IconButton onPress={openMenu} icon="dots-vertical" />}
						>
							<Menu.Item onPress={closeMenu} title="Share Profile" />
						</Menu>
					),
				}}
			/>
			<View>
				<ProfileHeader followVisible user={profileData} isCurrentlyFollowing={isFollowing} />
				<ClickableSurface
					onPress={() => router.push(`/(tabs)/(${from})/profile/${profileId}/allReviews`)}
					title="View All Reviews"
					icon="chevron-right"
				/>
			</View>
		</>
	);
};

export default Profile;
