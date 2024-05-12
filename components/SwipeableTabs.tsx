/* eslint-disable react-native/no-color-literals */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon, Text, TouchableRipple } from 'react-native-paper';
import SwipeableViews from 'react-swipeable-views-native/lib/SwipeableViews.scroll';

export type TabComponentProps = TabProps & {
	label: string;
	icon?: string;
	index: number;
	isSelected: boolean;
	setSelectedIndex: (index: number) => void;
};

type TabProps = {
	label: string;
	icon?: string;
	hideLabel?: boolean;
};

const TabComponent: React.FC<TabComponentProps> = ({
	label,
	icon,
	index,
	isSelected,
	setSelectedIndex,
	hideLabel,
}: TabComponentProps) => {
	return (
		<TouchableRipple
			onPress={() => setSelectedIndex(index)}
			style={[
				isSelected && {
					borderBottomWidth: 1,
					borderBottomColor: 'white',
				},
				{ padding: 16, alignItems: 'center', width: '100%', borderWidth: 1, flexGrow: 1 },
			]}
		>
			<View
				style={{
					width: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 2,
					justifyContent: 'center',
				}}
			>
				<Icon source={icon} size={24} color={isSelected ? 'white' : 'gray'} />
				{!hideLabel && (
					<Text
						style={[{ textAlign: 'center', color: 'gray' }, isSelected && { color: 'white' }]}
						variant="labelSmall"
					>
						{label}
					</Text>
				)}
			</View>
		</TouchableRipple>
	);
};

export type SwipeableData = {
	tab: TabProps;
	view: React.ReactElement;
};

export type SwipeableTabsProps = {
	data: SwipeableData[];
};

const SwipeableTabs: React.FC<SwipeableTabsProps> = ({ data }: SwipeableTabsProps) => {
	const [selectedIndex, setSelectedIndex] = useState(0);

	const [tabs, views] = useMemo(() => {
		const filteredTabs: TabProps[] = [];
		const filteredViews: React.ReactElement[] = [];

		data.forEach((item) => {
			filteredTabs.push(item.tab);
			filteredViews.push(item.view);
		});

		return [filteredTabs, filteredViews];
	}, [data]);

	return (
		<View style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
			<View
				style={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				{tabs.map((tab, index) => (
					<View
						key={tab.label}
						style={{
							width: `${100 / tabs.length}%`,
						}}
					>
						<TabComponent
							{...tab}
							setSelectedIndex={setSelectedIndex}
							index={index}
							isSelected={index === selectedIndex}
						/>
					</View>
				))}
			</View>
			{/* @ts-expect-error */}
			<SwipeableViews
				index={selectedIndex}
				onChangeIndex={setSelectedIndex}
				style={styles.slideContainer}
			>
				{views.map((view, index) => (
					// eslint-disable-next-line react/no-array-index-key
					<View style={styles.slide} key={index}>
						{view}
					</View>
				))}
			</SwipeableViews>
		</View>
	);
};

const styles = StyleSheet.create({
	slideContainer: {
		height: 'auto',
	},
	slide: {
		height: 'auto',
	},
});

export default SwipeableTabs;
