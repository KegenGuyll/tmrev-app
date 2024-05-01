import { View } from 'react-native';
import auth from '@react-native-firebase/auth';
import { Button, Divider, IconButton, Menu, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import { useGetUserQuery } from '@/redux/api/tmrev';
import ClickableSurface from '@/components/ClickableSurface';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setUserProfile } from '@/redux/slice/userProfileSlice';

const Profile = () => {
	const { currentUser } = auth();
	const router = useRouter();
	const { data, isLoading } = useGetUserQuery(
		{ uid: currentUser?.uid as string },
		{ skip: !currentUser || !currentUser.uid }
	);
	const [visible, setVisible] = useState(false);
	const dispatch = useAppDispatch();

	const openMenu = () => setVisible(true);
	const closeMenu = () => setVisible(false);

	useEffect(() => {
		if (data) {
			dispatch(setUserProfile(data));
		}
	}, [data]);

	const name = useMemo(() => `${data?.firstName} ${data?.lastName}`, [data]);

	const handleSignOut = async () => {
		try {
			closeMenu();
			await auth().signOut();
			router.replace('/(tabs)/(home)/home');
		} catch (error) {
			console.error(error);
		}
	};

	if (isLoading || (!data && currentUser)) {
		return <Text>Loading...</Text>;
	}

	if (!currentUser || !data) {
		return (
			<>
				<Stack.Screen options={{ title: 'Profile', headerRight: () => null }} />
				<SafeAreaView style={{ gap: 8 }}>
					<Text variant="headlineMedium">You&apos;re not currently logged in.</Text>
					<View style={{ gap: 8 }}>
						<Button onPress={() => router.push('/login')} mode="contained">
							Login
						</Button>
						<Divider />
						<Button onPress={() => router.push('/signup')} mode="outlined">
							Sign Up
						</Button>
					</View>
				</SafeAreaView>
			</>
		);
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
							<Menu.Item onPress={handleSignOut} title="Logout" />
						</Menu>
					),
				}}
			/>
			<View style={{ gap: 16 }}>
				<ProfileHeader editVisible user={data} />
				<ClickableSurface
					onPress={() => router.push(`/(tabs)/(profile)/profile/${currentUser.uid}/allReviews`)}
					title="View All Reviews"
					icon="chevron-right"
				/>
			</View>
		</>
	);
};

export default Profile;
