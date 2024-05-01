import { TouchableHighlight, View } from 'react-native';
import { Surface, Icon, Text } from 'react-native-paper';

interface ClickableSurfaceProps {
	title: string;
	icon?: string;
	onPress: () => void;
}

const ClickableSurface: React.FC<ClickableSurfaceProps> = ({
	title,
	icon,
	onPress,
}: ClickableSurfaceProps) => {
	return (
		<TouchableHighlight onPress={onPress}>
			<Surface style={{ borderRadius: 4 }}>
				<View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 12 }}>
					<Text variant="labelLarge" style={{ flexGrow: 1 }}>
						{title}
					</Text>
					{icon && <Icon source={icon} size={24} />}
				</View>
			</Surface>
		</TouchableHighlight>
	);
};

export default ClickableSurface;
