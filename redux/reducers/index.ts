import { combineReducers } from 'redux';
import counterReducer from '../slice/counterSlice';
import { pokemonApi } from '../api/pokemonApi';
import { movieApi } from '../api/tmdb/movieApi';
import { peopleApi } from '../api/tmdb/peopleAPI';
import { searchApi } from '../api/tmdb/searchAPI';
import { tvApi } from '../api/tmdb/tvAPI';

const rootReducer = combineReducers({
	counter: counterReducer,
	[pokemonApi.reducerPath]: pokemonApi.reducer,
	[movieApi.reducerPath]: movieApi.reducer,
	[peopleApi.reducerPath]: peopleApi.reducer,
	[searchApi.reducerPath]: searchApi.reducer,
	[tvApi.reducerPath]: tvApi.reducer,
});

export default rootReducer;
