import React from 'react';
import { Platform, View, TextInput as NativeTextInput } from 'react-native';
import { useTheme, Text, TextInput as PaperTextInput } from 'react-native-paper';

type TextInputProps = {
	placeholder?: string;
	label?: string;
	value: string;
	onChangeText: (text: string) => void;
	onFocus?: () => void;
};

const TextInput: React.FC<TextInputProps> = ({
	placeholder,
	label,
	value,
	onChangeText,
	onFocus,
}: TextInputProps) => {
	const theme = useTheme();

	if (Platform.OS === 'ios') {
		return (
			<View style={{ gap: 4 }}>
				<Text variant="labelLarge">{label}</Text>
				<NativeTextInput
					style={{
						padding: 8,
						backgroundColor: theme.colors.surfaceVariant,
						borderRadius: 4,
						color: theme.colors.onSurfaceVariant,
					}}
					editable
					defaultValue={value}
					onFocus={onFocus}
					onChange={(e) => onChangeText(e.nativeEvent.text)}
				/>
			</View>
		);
	}

	return (
		<PaperTextInput
			placeholder={placeholder}
			onFocus={onFocus}
			value={value}
			onChangeText={onChangeText}
			label={label}
		/>
	);
};

export default TextInput;
