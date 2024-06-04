import { Stack } from 'expo-router';

const HomeLayout = () => {
	return (
		<Stack screenOptions={{ headerShown: true, title: 'Home Page', headerTintColor: 'white' }} />
	);
};

export default HomeLayout;
