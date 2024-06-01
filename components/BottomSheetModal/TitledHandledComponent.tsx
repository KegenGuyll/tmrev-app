/* eslint-disable react-native/no-color-literals */
import { BottomSheetHandle, BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import { GestureResponderEvent, View } from 'react-native';
import { Button, Divider, Text } from 'react-native-paper';

type ButtonProp = {
	onPress: (e: GestureResponderEvent) => void;
	title: string;
};

type TitledHandledComponentProps = BottomSheetHandleProps & {
	title: string | React.ReactNode;
	submitButton?: ButtonProp;
	cancelButton?: ButtonProp;
};

const TitledHandledComponent: React.FC<TitledHandledComponentProps> = ({
	animatedIndex,
	animatedPosition,
	title,
	submitButton,
	cancelButton,
}: TitledHandledComponentProps) => {
	return (
		<View>
			<BottomSheetHandle
				indicatorStyle={{ backgroundColor: 'white' }}
				animatedIndex={animatedIndex}
				animatedPosition={animatedPosition}
			/>
			<View
				style={{
					display: 'flex',
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'space-between',
					paddingVertical: 8,
					paddingHorizontal: 16,
				}}
			>
				{cancelButton && <Button onPress={cancelButton.onPress}>{cancelButton.title}</Button>}
				{typeof title === 'string' ? <Text variant="titleLarge">{title}</Text> : title}
				{submitButton && <Button onPress={submitButton.onPress}>{submitButton.title}</Button>}
			</View>
			<Divider />
		</View>
	);
};

export default TitledHandledComponent;
