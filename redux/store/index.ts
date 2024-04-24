import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../reducers';
import { pokemonApi } from '../api/pokemonApi';
import { movieApi } from '../api/tmdb/movieApi';
import { peopleApi } from '../api/tmdb/peopleApi';
import { searchApi } from '../api/tmdb/searchApi';
import { tvApi } from '../api/tmdb/tvApi';
import { tmrevApi } from '../api/tmrev';

export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		})
			.concat(pokemonApi.middleware)
			.concat(movieApi.middleware)
			.concat(tvApi.middleware)
			.concat(peopleApi.middleware)
			.concat(searchApi.middleware)
			.concat(tmrevApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
