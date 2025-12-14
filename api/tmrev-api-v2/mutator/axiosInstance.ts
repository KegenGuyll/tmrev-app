import Axios, { AxiosRequestConfig } from 'axios';
import auth from '@react-native-firebase/auth';
import { TMREV_V2_API_URL } from '@env';

const AXIOS_INSTANCE = Axios.create({
	baseURL: TMREV_V2_API_URL,
});

// Add request interceptor to automatically attach Firebase ID token
AXIOS_INSTANCE.interceptors.request.use(
	async (config) => {
		try {
			const { currentUser: user } = auth();

			if (user) {
				// Get fresh ID token (cached by Firebase, only refreshes if expired)
				const idToken = await user.getIdToken();
				config.headers.Authorization = idToken;
			}
		} catch (error) {
			console.error('Failed to get auth token:', error);
			// Continue with request even if token fetch fails
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Add response interceptor to handle 401 errors
AXIOS_INSTANCE.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			// Token might be expired, try to refresh and retry once
			const originalRequest = error.config;

			if (!originalRequest._retry) {
				originalRequest._retry = true;

				try {
					const { currentUser: user } = auth();

					if (user) {
						// Force refresh the token
						const freshToken = await user.getIdToken(true);
						originalRequest.headers.Authorization = freshToken;
						return await AXIOS_INSTANCE(originalRequest);
					}
				} catch (refreshError) {
					console.error('Token refresh failed:', refreshError);
					// Redirect to login if refresh fails
					if (typeof window !== 'undefined') {
						window.location.href = '/login';
					}
				}
			}
		}

		return Promise.reject(error);
	}
);

export const axiosInstance = <T>(
	config: AxiosRequestConfig,
	options?: AxiosRequestConfig
): Promise<T> => {
	const source = Axios.CancelToken.source();

	const promise = AXIOS_INSTANCE({
		...config,
		...options,
		cancelToken: source.token,
	}).then(({ data }) => data);

	// @ts-expect-error error
	promise.cancel = () => {
		source.cancel('Query was cancelled');
	};

	return promise;
};
