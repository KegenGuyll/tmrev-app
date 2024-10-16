import { useCallback, useEffect, useRef, useState } from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import { StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import TitledHandledComponent from '../BottomSheetModal/TitledHandledComponent';
import CustomBackground from '../CustomBottomSheetBackground';

type DatePickerProps = {
	date: string;
	onDateChange: (date: DateType) => void;
	visible: boolean;
	onDismiss: () => void;
};

const DatePicker: React.FC<DatePickerProps> = ({
	date,
	onDateChange,
	visible,
	onDismiss,
}: DatePickerProps) => {
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const theme = useTheme();
	const styles = makeStyles(theme);
	const [selectedDate, setSelectedDate] = useState<DateType>(date);

	useEffect(() => {
		if (visible) {
			bottomSheetRef.current?.present();
		} else {
			bottomSheetRef.current?.dismiss();
		}
	}, [visible]);

	const onChange = useCallback((params: { date: DateType }) => {
		setSelectedDate(params.date);
	}, []);

	return (
		<BottomSheetModal
			handleComponent={({ ...props }) => (
				<TitledHandledComponent
					{...props}
					title="Select Date"
					cancelButton={{ title: 'Cancel', onPress: () => onDismiss() }}
					submitButton={{
						title: 'Apply',
						disabled: !selectedDate,
						onPress: () => {
							onDateChange(selectedDate);
							onDismiss();
						},
					}}
				/>
			)}
			// eslint-disable-next-line react-native/no-color-literals
			handleIndicatorStyle={{ backgroundColor: 'white' }}
			backgroundComponent={CustomBackground}
			onChange={(i) => {
				if (i === -1) {
					onDismiss();
				}
			}}
			snapPoints={['60%']}
			ref={bottomSheetRef}
		>
			<BottomSheetView style={styles.container}>
				<DateTimePicker
					headerTextStyle={{ color: theme.colors.onBackground }}
					weekDaysTextStyle={{ color: theme.colors.onBackground }}
					headerButtonColor={theme.colors.onBackground}
					calendarTextStyle={{ color: theme.colors.onBackground }}
					selectedItemColor={theme.colors.primary}
					selectedTextStyle={{ fontWeight: 'bold', color: theme.colors.onPrimary }}
					yearContainerStyle={{ backgroundColor: theme.colors.background }}
					monthContainerStyle={{ backgroundColor: theme.colors.background }}
					weekDaysContainerStyle={{ backgroundColor: theme.colors.background }}
					onChange={onChange}
					date={selectedDate}
					mode="single"
				/>
			</BottomSheetView>
		</BottomSheetModal>
	);
};

export default DatePicker;

const makeStyles = ({ colors }: MD3Theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.background,
			paddingHorizontal: 8,
			paddingTop: 8,
		},
	});
