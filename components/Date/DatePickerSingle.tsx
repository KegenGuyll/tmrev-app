/* eslint-disable react/no-unstable-nested-components */
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import CustomBackground from '../CustomBottomSheetBackground';
import TitledHandledComponent from '../BottomSheetModal/TitledHandledComponent';

type DatePickerSingleProps = {
	initDate?: DateType;
	onDateChange: (date: DateType) => void;
	visible: boolean;
	onDismiss: () => void;
};

const DatePickerSingle: React.FC<DatePickerSingleProps> = ({
	initDate,
	onDateChange,
	visible,
	onDismiss,
}: DatePickerSingleProps) => {
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const [date, setDate] = useState<DateType | null>(initDate || new Date());
	const theme = useTheme();
	const styles = makeStyles(theme);

	useEffect(() => {
		if (visible) {
			bottomSheetRef.current?.present();
		} else {
			bottomSheetRef.current?.dismiss();
		}
	}, [visible]);

	const onChange = useCallback((params: { date: DateType }) => {
		setDate(params.date);
	}, []);

	return (
		<BottomSheetModal
			stackBehavior="push"
			handleComponent={({ ...props }) => (
				<TitledHandledComponent
					{...props}
					title="Select Date"
					cancelButton={{ title: 'Cancel', onPress: () => onDismiss() }}
					submitButton={{
						title: 'Apply',
						disabled: !date,
						onPress: () => {
							onDateChange(date);
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
					date={date}
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
					mode="single"
				/>
			</BottomSheetView>
		</BottomSheetModal>
	);
};

export default DatePickerSingle;

const makeStyles = ({ colors }: MD3Theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.background,
			paddingHorizontal: 8,
			paddingTop: 8,
		},
	});
