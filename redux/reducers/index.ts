import { combineReducers } from 'redux';
import counterReducer from '../slice/counterSlice';
import bottomSheetReducer from '../slice/bottomSheet';
import userProfileReducer from '../slice/userProfileSlice';
import { pokemonApi } from '../api/pokemonApi';
import { movieApi } from '../api/tmdb/movieApi';
import { peopleApi } from '../api/tmdb/peopleApi';
import { searchApi } from '../api/tmdb/searchApi';
import { tvApi } from '../api/tmdb/tvApi';
import { tmrevApi } from '../api/tmrev';

const rootReducer = combineReducers({
	counter: counterReducer,
	bottomSheet: bottomSheetReducer,
	userProfile: userProfileReducer,
	[pokemonApi.reducerPath]: pokemonApi.reducer,
	[movieApi.reducerPath]: movieApi.reducer,
	[peopleApi.reducerPath]: peopleApi.reducer,
	[searchApi.reducerPath]: searchApi.reducer,
	[tvApi.reducerPath]: tvApi.reducer,
	[tmrevApi.reducerPath]: tmrevApi.reducer,
});

export default rootReducer;
