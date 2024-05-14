module.exports = {
	expo: {
		name: 'tmrev',
		slug: 'tmrev',
		version: '1.0.0',
		orientation: 'portrait',
		icon: './assets/images/icon.png',
		scheme: 'myapp',
		userInterfaceStyle: 'automatic',
		splash: {
			image: './assets/images/splash.png',
			resizeMode: 'contain',
			backgroundColor: '#ffffff',
		},
		assetBundlePatterns: ['**/*'],
		ios: {
			supportsTablet: true,
			googleServicesFile: process.env.GOOGLE_SERVICES_PLIST,
			bundleIdentifier: 'com.tmrev',
		},
		android: {
			adaptiveIcon: {
				foregroundImage: './assets/images/adaptive-icon.png',
				backgroundColor: '#ffffff',
			},
			googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
			package: 'com.tmrev',
		},
		web: {
			bundler: 'metro',
			output: 'static',
			favicon: './assets/images/favicon.png',
		},
		plugins: [
			'expo-router',
			'@react-native-firebase/app',
			'@react-native-firebase/auth',
			'@react-native-firebase/crashlytics',
			'expo-font',
			[
				'expo-build-properties',
				{
					ios: {
						useFrameworks: 'static',
					},
				},
			],
			[
				'@react-native-google-signin/google-signin',
				{
					iosUrlScheme: '637447196415-66vk7pjqb820uels0ggn8l3eija2s9vf.apps.googleusercontent.com',
					infoPlist: {
						CFBundleURLTypes: [
							{
								CFBundleURLSchemes: [
									'637447196415-66vk7pjqb820uels0ggn8l3eija2s9vf.apps.googleusercontent.com',
								],
							},
						],
					},
				},
			],
		],
		experiments: {
			typedRoutes: false,
		},
		extra: {
			router: {
				origin: false,
			},
			eas: {
				projectId: '11919a23-d055-46b2-b7b5-4553413ad5c4',
			},
		},
	},
};
