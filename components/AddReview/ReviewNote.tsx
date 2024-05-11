import React from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';

type ReviewNoteProps = {
	note: string;
	setNote: (note: string) => void;
};

const ReviewNote: React.FC<ReviewNoteProps> = ({ note, setNote }: ReviewNoteProps) => {
	return (
		<View>
			<TextInput
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
