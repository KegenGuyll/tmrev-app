import { Stack } from 'expo-router';

const HomeLayout = () => {
	return (
		<Stack screenOptions={{ headerShown: false, title: 'Home Page', headerTintColor: 'white' }} />
	);
};

export default HomeLayout;
