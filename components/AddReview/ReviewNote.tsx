import React from 'react';
import { Platform, View, TextInput } from 'react-native';
import { TextInput as PaperTextInput, Text, useTheme } from 'react-native-paper';

type ReviewNoteProps = {
	note: string;
	setNote: (note: string) => void;
	handleCollapseSlider: () => void;
};

const ReviewNote: React.FC<ReviewNoteProps> = ({
	note,
	setNote,
	handleCollapseSlider,
}: ReviewNoteProps) => {
	const theme = useTheme();

	if (Platform.OS === 'ios') {
		return (
			<View style={{ gap: 4 }}>
				<Text variant="labelLarge">Notes</Text>
				<TextInput
					style={{
						height: 100,
						padding: 8,
						backgroundColor: theme.colors.backdrop,
						borderRadius: 4,
						color: theme.colors.onBackground,
					}}
					editable
					defaultValue={note}
					onFocus={handleCollapseSlider}
					onChange={(e) => setNote(e.nativeEvent.text)}
					multiline
					numberOfLines={6}
				/>
			</View>
		);
	}

	return (
		<View>
			<PaperTextInput
				onFocus={handleCollapseSlider}
				value={note}
				onChange={(e) => setNote(e.nativeEvent.text)}
				label="Notes"
				multiline
				numberOfLines={6}
			/>
		</View>
	);
};

export default ReviewNote;
