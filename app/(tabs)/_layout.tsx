import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Tabs, useRouter } from 'expo-router';
import auth from '@react-native-firebase/auth';
import { Image } from 'react-native';
import { Menu, Divider, IconButton } from 'react-native-paper';

const iconSize = 25;

const TabLayout = () => {
	const { currentUser } = auth();
	const [visible, setVisible] = React.useState(false);
	const router = useRouter();

	const openMenu = () => setVisible(true);

	const closeMenu = () => setVisible(false);

	const handleSignOut = async () => {
		try {
			await auth().signOut();
			router.replace('/(tabs)/(home)/home');
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<Tabs
			initialRouteName="(home)"
			screenOptions={{
				tabBarActiveTintColor: 'white',
				tabBarHideOnKeyboard: true,
			}}
		>
			<Tabs.Screen
				name="(home)"
				options={{
					headerShown: false,
					title: 'Home',
					headerTitle: 'Home',
					tabBarIcon: ({ color }) => <Icon name="home" color={color} size={iconSize} />,
				}}
			/>
			<Tabs.Screen
				name="(search)"
				options={{
					title: 'Search',
					tabBarIcon: ({ color }) => <Icon name="search" color={color} size={iconSize} />,
					headerShown: false,
				}}
			/>
			<Tabs.Screen
				name="(add-review)"
				options={{
					title: 'Add Review',
					tabBarIcon: ({ color }) => <Icon name="add" color={color} size={iconSize} />,
				}}
			/>
			<Tabs.Screen
				name="(movies)"
				options={{
					title: 'Movies',
					headerShown: false,
					tabBarIcon: ({ color }) => <Icon name="movie" color={color} size={iconSize} />,
				}}
			/>
			<Tabs.Screen
				name="(profile)"
				options={{
					headerShown: true,
					title: 'Profile',
					headerRight: () => (
						<Menu
							visible={visible}
							onDismiss={closeMenu}
							anchor={<IconButton onPress={openMenu} icon="dots-vertical" />}
						>
							<Menu.Item onPress={() => {}} title="Item 1" />
							<Menu.Item onPress={() => {}} title="Item 2" />

							{currentUser && (
								<>
									<Divider />
									<Menu.Item onPress={handleSignOut} title="Sign Out" />
								</>
							)}
						</Menu>
					),
					tabBarIcon: ({ color }) => {
						if (currentUser?.photoURL) {
							return (
								<Image
									source={{ uri: currentUser.photoURL }}
									style={{
										width: iconSize,
										height: iconSize,
										borderRadius: iconSize / 2,
										borderColor: color,
										borderWidth: 1,
									}}
								/>
							);
						}

						return <Icon name="account-circle" color={color} size={iconSize} />;
					},
				}}
			/>
		</Tabs>
	);
};

export default TabLayout;
