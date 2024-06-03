import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from 'react-native-paper';
import { View } from 'react-native';
import CustomBackground from '../CustomBottomSheetBackground';

type YearPickerProps = {
	selectedYear?: number;
	onYearChange: (year: number) => void;
	visible: boolean;
	onDismiss: () => void;
};

// function to find return decade based on year
const getDecade = (year?: number) => {
	if (!year) return null;
	return Math.floor(year / 10) * 10;
};

const YearPicker: React.FC<YearPickerProps> = ({
	selectedYear,
	onYearChange,
	visible,
	onDismiss,
}: YearPickerProps) => {
	const decadeBottomSheetRef = useRef<BottomSheetModal>(null);

	const [selectedDecade, setSelectedDecade] = useState<number | null>(getDecade(selectedYear));

	// list of decades
	const decades = useMemo(() => Array.from({ length: 10 }, (_, i) => 2020 - i * 10), []);

	// list of years based on decade
	const years = useMemo(() => {
		if (!selectedDecade) return [];
		return Array.from({ length: 10 }, (_, i) => selectedDecade + i);
	}, [selectedDecade]);

	const handleSelectYear = (year: number) => {
		onYearChange(year);
		onDismiss();
	};

	useEffect(() => {
		if (visible) {
			decadeBottomSheetRef.current?.present();
		} else {
			decadeBottomSheetRef.current?.dismiss();
		}
	}, [visible]);

	return (
		<BottomSheetModal
			// eslint-disable-next-line react-native/no-color-literals
			handleIndicatorStyle={{ backgroundColor: 'white' }}
			backgroundComponent={CustomBackground}
			snapPoints={['50%']}
			onChange={(index) => {
				if (index === -1) {
					onDismiss();
				}
			}}
			ref={decadeBottomSheetRef}
		>
			<BottomSheetScrollView>
				<View
					style={{
						display: 'flex',
						flexDirection: 'row',
						flexWrap: 'wrap',
						gap: 8,
						justifyContent: 'center',
						alignItems: 'center',
						height: '100%',
						paddingTop: 20,
					}}
				>
					{!selectedDecade &&
						decades.map((decade) => (
							<Button
								onPress={() => setSelectedDecade(decade)}
								style={{ width: 160 }}
								key={decade}
								mode="outlined"
								compact
							>
								{decade}
							</Button>
						))}
					{selectedDecade && (
						<View>
							<Button icon="arrow-left" onPress={() => setSelectedDecade(null)} mode="outlined">
								Select Decade
							</Button>
							<View
								style={{
									display: 'flex',
									flexDirection: 'row',
									flexWrap: 'wrap',
									gap: 8,
									justifyContent: 'center',
									alignItems: 'center',
									height: '100%',
									paddingTop: 20,
								}}
							>
								{years.map((year) => (
									<Button onPress={() => handleSelectYear(year)} key={year}>
										{year}
									</Button>
								))}
							</View>
						</View>
					)}
				</View>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};

export default YearPicker;
