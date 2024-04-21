import { DimensionValue, Image } from 'react-native';
import imageUrl from '@/utils/imageUrl';

type ActorPlaceholderImageProps = {
	profile_url: string | null;
	department:
		| 'Acting'
		| 'Directing'
		| 'Production'
		| 'Writing'
		| 'Costume & Make-Up'
		| 'Art'
		| 'Camera'
		| 'Editing'
		| string;
	height: DimensionValue;
	width: DimensionValue;
};

const ActorPlaceholderImage: React.FC<ActorPlaceholderImageProps> = ({
	profile_url,
	department,
	height,
	width,
}: ActorPlaceholderImageProps) => {
	if (profile_url)
		return (
			<Image
				source={{ uri: imageUrl(profile_url, 185) }}
				style={{ width, height, borderRadius: 4 }}
			/>
		);

	switch (department) {
		case 'Acting':
			return (
				<Image
					source={require('@/assets/images/actor-placeholder.jpg')}
					style={{ width, height, borderRadius: 4 }}
				/>
			);
		case 'Directing':
			return (
				<Image
					source={require('@/assets/images/director-placeholder.jpg')}
					style={{ width, height, borderRadius: 4 }}
				/>
			);
		case 'Production':
			return (
				<Image
					source={require('@/assets/images/production-placeholder.jpg')}
					style={{ width, height, borderRadius: 4 }}
				/>
			);
		case 'Writing':
			return (
				<Image
					source={require('@/assets/images/writer-placeholder.jpg')}
					style={{ width, height, borderRadius: 4 }}
				/>
			);
		case 'Art':
			return (
				<Image
					source={require('@/assets/images/art-placeholder.jpg')}
					style={{ width, height, borderRadius: 4 }}
				/>
			);
		case 'Costume & Make-Up':
			return (
				<Image
					source={require('@/assets/images/costume-and-make-up-placeholder.jpg')}
					style={{ width, height, borderRadius: 4 }}
				/>
			);
		case 'Camera':
			return (
				<Image
					source={require('@/assets/images/camera-placeholder.jpg')}
					style={{ width, height, borderRadius: 4 }}
				/>
			);
		case 'Editing':
			return (
				<Image
					source={require('@/assets/images/editing-placeholder.jpg')}
					style={{ width, height, borderRadius: 4 }}
				/>
			);
		default:
			return (
				<Image
					source={require('@/assets/images/director-placeholder.jpg')}
					style={{ width, height, borderRadius: 4 }}
				/>
			);
	}
};

export default ActorPlaceholderImage;
