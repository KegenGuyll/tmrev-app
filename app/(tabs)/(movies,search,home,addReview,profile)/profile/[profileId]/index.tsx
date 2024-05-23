import { Stack, useLocalSearchParams } from 'expo-router';
import { IconButton, Menu, Text } from 'react-native-paper';
import { useMemo, useState } from 'react';
import { View, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import { useGetV2UserQuery } from '@/redux/api/tmrev';
import { FromLocation } from '@/models';
import ProfileNavigation from '@/components/Profile/ProfileListNavigationt';
import ProfilePinnedMovies from '@/components/Profile/ProfilePinnedMovies';

export type ProfileSearchParams = {
	profileId: string;
	from?: FromLocation;
};

const Profile = () => {
	const { profileId, from } = useLocalSearchParams<ProfileSearchParams>();
	const [refreshing, setRefreshing] = useState(false);

	if (!profileId) return null;

	const {
		data: profileData,
		isLoading: isProfileLoading,
		refetch,
	} = useGetV2UserQuery({ uid: profileId }, { skip: !profileId });

	const [visible, setVisible] = useState(false);

	const handleRefresh = async () => {
		setRefreshing(true);
		await refetch().unwrap();
		setRefreshing(false);
	};

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
			<SafeAreaView>
				<ScrollView
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					contentContainerStyle={{ paddingBottom: 100 }}
				>
					<View style={{ gap: 32 }}>
						<View>
							<ProfileHeader user={profileData.body} from={from} />
							<ProfileNavigation
								from={from || 'home'}
								profileId={profileId}
								listCount={profileData.body.listCount}
								reviewCount={profileData.body.reviewCount}
								watchedCount={profileData.body.watchedCount}
							/>
						</View>
						<View style={{ paddingHorizontal: 8 }}>
							<ProfilePinnedMovies profileId={profileId} from={from || 'home'} />
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>
		</>
	);
};

export default Profile;
