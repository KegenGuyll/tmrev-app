/* eslint-disable react/no-unstable-nested-components */
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MD3Theme, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import DateTimePicker, { DateType } from 'react-native-ui-datepicker';
import CustomBackground from '../CustomBottomSheetBackground';
import TitledHandledComponent from '../BottomSheetModal/TitledHandledComponent';

type DatePickerRangeProps = {
	startDate: string;
	endDate: string;
	onDateChange: (startDate: DateType, endDate: DateType) => void;
	visible: boolean;
	onDismiss: () => void;
};

const DatePickerRange: React.FC<DatePickerRangeProps> = ({
	startDate,
	endDate,
	onDateChange,
	visible,
	onDismiss,
}: DatePickerRangeProps) => {
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const [range, setRange] = useState<{
		startDate: DateType;
		endDate: DateType;
	}>({ startDate, endDate });
	const theme = useTheme();
	const styles = makeStyles(theme);

	useEffect(() => {
		if (visible) {
			bottomSheetRef.current?.present();
		} else {
			bottomSheetRef.current?.dismiss();
		}
	}, [visible]);

	const onChange = useCallback((params: { startDate: DateType; endDate: DateType }) => {
		setRange(params);
	}, []);

	return (
		<BottomSheetModal
			handleComponent={({ ...props }) => (
				<TitledHandledComponent
					{...props}
					title="Select Date Range"
					cancelButton={{ title: 'Cancel', onPress: () => onDismiss() }}
					submitButton={{
						title: 'Apply',
						disabled: !range.startDate || !range.endDate,
						onPress: () => {
							onDateChange(range.startDate, range.endDate);
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
					startDate={range.startDate}
					endDate={range.endDate}
					mode="range"
				/>
			</BottomSheetView>
		</BottomSheetModal>
	);
};

export default DatePickerRange;

const makeStyles = ({ colors }: MD3Theme) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.background,
			paddingHorizontal: 8,
			paddingTop: 8,
		},
	});
