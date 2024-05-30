import React from 'react';
import { Platform, View, TextInput } from 'react-native';
import { useTheme, Text, TextInput as PaperTextInput } from 'react-native-paper';

type MultiLineInputProps = {
	placeholder?: string;
	numberOfLines: number;
	label?: string;
	value: string;
	onChangeText: (text: string) => void;
	onFocus?: () => void;
};

const MultiLineInput: React.FC<MultiLineInputProps> = ({
	numberOfLines,
	label,
	value,
	onChangeText,
	onFocus,
	placeholder,
}: MultiLineInputProps) => {
	const theme = useTheme();

	if (Platform.OS === 'ios') {
		return (
			<View style={{ gap: 4 }}>
				<Text variant="labelLarge">{label}</Text>
				<TextInput
					style={{
						height: 100,
						padding: 8,
						backgroundColor: theme.colors.surfaceVariant,
						borderRadius: 4,
						color: theme.colors.onSurfaceVariant,
					}}
					placeholder={placeholder}
					editable
					defaultValue={value}
					onFocus={onFocus}
					onChange={(e) => onChangeText(e.nativeEvent.text)}
					multiline
					numberOfLines={numberOfLines}
				/>
			</View>
		);
	}

	return (
		<PaperTextInput
			placeholder={placeholder}
			onFocus={onFocus}
			value={value}
			onChange={(e) => onChangeText(e.nativeEvent.text)}
			label={label}
			multiline
			numberOfLines={numberOfLines}
		/>
	);
};

export default MultiLineInput;
