import React, { forwardRef } from 'react';
import { Platform, View, TextInput, StyleProp, TextStyle } from 'react-native';
import { useTheme, Text, TextInput as PaperTextInput } from 'react-native-paper';

type MultiLineInputProps = {
	placeholder?: string;
	numberOfLines: number;
	label?: string;
	value: string;
	onChangeText: (text: string) => void;
	onFocus?: () => void;
	onBlur?: () => void;
	height?: number;
	inputStyle?: StyleProp<TextStyle>;
};

const MultiLineInput = forwardRef(
	(
		{
			numberOfLines,
			label,
			value,
			onChangeText,
			onFocus,
			placeholder,
			height = 100,
			inputStyle,
			onBlur,
		}: MultiLineInputProps,
		ref: React.LegacyRef<TextInput>
	) => {
		const theme = useTheme();

		if (Platform.OS === 'ios') {
			return (
				<View style={{ gap: 4 }}>
					{label && <Text variant="labelLarge">{label}</Text>}
					<TextInput
						ref={ref}
						style={[
							{
								height,
								padding: 8,
								backgroundColor: theme.colors.surfaceVariant,
								borderRadius: 4,
								color: theme.colors.onSurfaceVariant,
							},
							inputStyle,
						]}
						placeholder={placeholder}
						editable
						defaultValue={value}
						onBlur={onBlur}
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
				ref={ref}
				placeholder={placeholder}
				onFocus={onFocus}
				value={value}
				onChange={(e) => onChangeText(e.nativeEvent.text)}
				label={label}
				multiline
				numberOfLines={numberOfLines}
			/>
		);
	}
);

export default MultiLineInput;
