import { Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import auth from '@react-native-firebase/auth';
import { IconButton, Menu, Text } from 'react-native-paper';
import { useMemo, useState } from 'react';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import { useGetUserQuery } from '@/redux/api/tmrev';

type ProfileSearchParams = {
	profileId: string;
};

const Profile = () => {
	const { currentUser } = auth();
	const { profileId } = useLocalSearchParams<ProfileSearchParams>();
	const { data: profileData, isLoading: isProfileLoading } = useGetUserQuery(
		{ uid: profileId },
		{ skip: !profileId }
	);
	const { data: loggedInUserData } = useGetUserQuery(
		{ uid: currentUser?.uid as string },
		{ skip: !currentUser || !currentUser.uid }
	);
	const [visible, setVisible] = useState(false);

	const openMenu = () => setVisible(true);
	const closeMenu = () => setVisible(false);

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
			</View>
		</>
	);
};

export default Profile;
