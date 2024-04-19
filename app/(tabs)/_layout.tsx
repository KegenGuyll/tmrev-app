import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';

const iconSize = 25;

const TabLayout = () => {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: 'white',
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					headerTitle: '',
					tabBarIcon: ({ color }) => <Icon name="home" color={color} size={iconSize} />,
				}}
			/>
			<Tabs.Screen
				name="search"
				options={{
					title: 'Search',
					tabBarIcon: ({ color }) => <Icon name="search" color={color} size={iconSize} />,
				}}
			/>
			<Tabs.Screen
				name="add-review"
				options={{
					title: 'Add Review',
					tabBarIcon: ({ color }) => <Icon name="add" color={color} size={iconSize} />,
				}}
			/>
			<Tabs.Screen
				name="movies"
				options={{
					title: 'Movies',
					headerShown: false,
					tabBarIcon: ({ color }) => <Icon name="movie" color={color} size={iconSize} />,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					headerShown: false,
					title: 'Profile',
					tabBarIcon: ({ color }) => <Icon name="person" color={color} size={iconSize} />,
				}}
			/>
		</Tabs>
	);
};

export default TabLayout;
