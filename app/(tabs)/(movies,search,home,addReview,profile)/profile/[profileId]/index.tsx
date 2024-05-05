import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { IconButton, Menu, Text } from 'react-native-paper';
import { useMemo, useState } from 'react';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import { useGetV2UserQuery } from '@/redux/api/tmrev';
import ClickableSurface from '@/components/ClickableSurface';
import RatingDistributionList from '@/components/Profile/RatingDistributionList';
import { FromLocation } from '@/models';

export type ProfileSearchParams = {
	profileId: string;
	from?: FromLocation;
};

const Profile = () => {
	const { profileId, from } = useLocalSearchParams<ProfileSearchParams>();
	const { data: profileData, isLoading: isProfileLoading } = useGetV2UserQuery(
		{ uid: profileId },
		{ skip: !profileId }
	);

	const [visible, setVisible] = useState(false);
	const router = useRouter();

	const openMenu = () => setVisible(true);
	const closeMenu = () => setVisible(false);

	const name = useMemo(() => {
		if (profileData) {
			return `${profileData.body.firstName} ${profileData.body.lastName}`;
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
				<ProfileHeader followVisible user={profileData.body} />
				<ClickableSurface
					onPress={() => router.push(`/(tabs)/(${from || 'home'})/profile/${profileId}/allReviews`)}
					title="View All Reviews"
					icon="chevron-right"
				/>
				<RatingDistributionList from={from} uid={profileId} />
			</View>
		</>
	);
};

export default Profile;
