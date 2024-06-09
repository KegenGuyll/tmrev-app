import { Image, View } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

type AvatarWithIconProps = {
	uri: string;
	avatarSize?: number;
	iconSize?: number;
	icon: string;
};

const AvatarWithIcon: React.FC<AvatarWithIconProps> = ({
	uri,
	avatarSize = 50,
	iconSize = 15,
	icon,
}: AvatarWithIconProps) => {
	const theme = useTheme();

	return (
		<View style={{ position: 'relative' }}>
			<Image
				style={{ borderRadius: 100 }}
				source={{ uri }}
				width={avatarSize}
				height={avatarSize}
			/>
			<View
				style={{
					justifyContent: 'center',
					height: 25,
					width: 25,
					backgroundColor: theme.colors.primary,
					borderWidth: 2,
					borderColor: theme.colors.background,
					flex: 1,
					alignItems: 'center',
					borderRadius: 100,
					position: 'absolute',
					bottom: -3,
					right: -1,
				}}
			>
				<Icon source={icon} color={theme.colors.onPrimary} size={iconSize} />
			</View>
		</View>
	);
};

export default AvatarWithIcon;
