import { Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

const ReviewPage = () => {
	return (
		<>
			<Stack.Screen options={{ headerShown: true, title: 'Review' }} />
			<View>
				<Text>Review Page</Text>
			</View>
		</>
	);
};

export default ReviewPage;
