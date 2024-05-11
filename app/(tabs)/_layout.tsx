import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import auth from '@react-native-firebase/auth';
import { Image } from 'react-native';

const iconSize = 25;

const TabLayout = () => {
	const { currentUser } = auth();

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
				name="(addReview)"
				options={{
					headerShown: false,
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
					headerShown: false,
					title: 'Profile',
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
