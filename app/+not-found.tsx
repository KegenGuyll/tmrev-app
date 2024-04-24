import { Redirect, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

const NotFoundScreen = () => {
	return (
		<>
			<Stack.Screen options={{ title: 'Oops!', headerShown: false }} />
			<Redirect href="/(tabs)/(home)/home" />
		</>
	);
};

export default NotFoundScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	link: {
		marginTop: 15,
		paddingVertical: 15,
	},
	linkText: {
		fontSize: 14,
		color: '#2e78b7',
	},
});
