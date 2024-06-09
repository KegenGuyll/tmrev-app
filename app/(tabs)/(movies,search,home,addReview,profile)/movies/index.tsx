import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshControl, ScrollView, View } from 'react-native';
import { DateType } from 'react-native-ui-datepicker';

import { Chip, Text } from 'react-native-paper';
import dayjs from 'dayjs';
import { useGetMovieDiscoverQuery, useGetTrendingMoviesQuery } from '@/redux/api/tmdb/movieApi';
import { SortBy } from '@/models/tmdb/movie/movieDiscover';

import MovieHorizontalGrid from '@/components/MovieHorizontalGrid';
import YearPicker from '@/components/Date/YearPicker';
import DatePickerRange from '@/components/Date/DatePickerRange';

const page = 1;

function getMovieReleaseDateRange(date?: Date): [string, string] {
	const today = dayjs(date || new Date());
	const dayOfWeek = today.day(); // 0 (Sunday) to 6 (Saturday)

	let startDate;
	let endDate;

	if (dayOfWeek >= 4) {
		// Thursday (4) to Saturday (6)
		startDate = today.day(4); // Set to the Thursday of the current week
		endDate = today.day(6); // Set to the Saturday of the current week
	} else {
		// Sunday (0) to Wednesday (3)
		startDate = today.add(4 - dayOfWeek, 'day').day(4); // Next Thursday
		endDate = today.add(4 - dayOfWeek, 'day').day(6); // Next Saturday
	}

	startDate = startDate.format('YYYY-MM-DD');
	endDate = endDate.format('YYYY-MM-DD');

	return [startDate, endDate];
}

const Movies = () => {
	const [trendingTimeWindow, setTrendingTimeWindow] = useState<'day' | 'week'>('week');
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [popularYear, setPopularYear] = useState(new Date().getFullYear());
	const [viewYearPicker, setViewYearPicker] = useState(false);
	const [viewDateRangePicker, setViewDateRangePicker] = useState(false);

	const [customRange, setCustomRange] = useState<{
		startDate: DateType;
		endDate: DateType;
	}>({ startDate: undefined, endDate: undefined });

	const [startDate, endDate] = useMemo(() => getMovieReleaseDateRange(), []);

	const { data: upcomingReleases, refetch: upRefetch } = useGetMovieDiscoverQuery({
		params: {
			language: 'en-US',
			sort_by: SortBy.MOST_POPULAR,
			include_adult: false,
			include_video: false,
			page,
			region: 'US',
			with_origin_country: 'US',
			with_original_language: 'en',
			'primary_release_date.gte': customRange.startDate
				? dayjs(customRange.startDate).format('YYYY-MM-DD')
				: startDate,
			'primary_release_date.lte': customRange.endDate
				? dayjs(customRange.endDate).format('YYYY-MM-DD')
				: endDate,
			with_release_type: '1',
		},
	});

	const { data: popularYearlyRelease, refetch: popularRefetch } = useGetMovieDiscoverQuery({
		params: {
			language: 'en-US',
			sort_by: SortBy.MOST_POPULAR,
			include_adult: false,
			include_video: false,
			page,
			region: 'US',
			with_origin_country: 'US',
			with_original_language: 'en',
			primary_release_year: popularYear,
			with_release_type: '1',
		},
	});

	const {
		data: trendingData,
		isLoading: tdIsLoading,
		refetch: tdRefetch,
	} = useGetTrendingMoviesQuery({
		pathParams: { timeWindow: trendingTimeWindow },
	});

	const formattedTrendingData = useMemo(() => {
		if (!trendingData) return [];

		return trendingData.results.map((movie) => ({
			uniqueId: movie.id.toString(),
			movieId: movie.id,
			moviePoster: movie.poster_path,
		}));
	}, [trendingData]);

	const formattedUpcomingReleases = useMemo(() => {
		if (!upcomingReleases) return [];

		return upcomingReleases.results.map((movie) => ({
			uniqueId: movie.id.toString(),
			movieId: movie.id,
			moviePoster: movie.poster_path,
		}));
	}, [upcomingReleases]);

	const formattedPopularYearlyRelease = useMemo(() => {
		if (!popularYearlyRelease) return [];

		return popularYearlyRelease.results.map((movie) => ({
			uniqueId: movie.id.toString(),
			movieId: movie.id,
			moviePoster: movie.poster_path,
		}));
	}, [popularYearlyRelease]);

	const handleToggleTrendingTimeWindow = () => {
		setTrendingTimeWindow((prev) => (prev === 'day' ? 'week' : 'day'));
	};

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await tdRefetch().unwrap();
		await upRefetch().unwrap();
		await popularRefetch().unwrap();
		setIsRefreshing(false);
	};

	return (
		<>
			<SafeAreaView>
				<ScrollView
					contentContainerStyle={{ gap: 16, padding: 8 }}
					refreshControl={
						<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="white" />
					}
				>
					<View style={{ gap: 4 }}>
						<View
							style={{
								display: 'flex',
								flexDirection: 'row',
								gap: 8,
								flexWrap: 'wrap',
								alignItems: 'center',
							}}
						>
							<View style={{ flexGrow: 1 }}>
								<Text variant="titleMedium">Trending Movies</Text>
							</View>
							<View>
								{trendingTimeWindow === 'day' ? (
									<Chip
										onPress={handleToggleTrendingTimeWindow}
										icon="calendar-today"
										style={{ marginVertical: 4 }}
									>
										Day
									</Chip>
								) : (
									<Chip
										onPress={handleToggleTrendingTimeWindow}
										icon="calendar-week"
										style={{ marginVertical: 4 }}
									>
										Week
									</Chip>
								)}
							</View>
						</View>
						<MovieHorizontalGrid
							data={formattedTrendingData}
							posterHeight={120}
							posterSelectionLocation="movies"
							isLoading={tdIsLoading}
						/>
					</View>
					<View style={{ gap: 4 }}>
						<View
							style={{
								display: 'flex',
								flexDirection: 'row',
								gap: 8,
								flexWrap: 'wrap',
								alignItems: 'center',
							}}
						>
							<View style={{ flexGrow: 1 }}>
								<Text variant="titleMedium">Upcoming Releases</Text>
							</View>
							<View>
								<Chip
									onPress={() => setViewDateRangePicker(true)}
									icon="calendar"
									style={{ marginVertical: 4 }}
								>
									{dayjs(customRange.startDate || startDate).format('MMM D')} -{' '}
									{dayjs(customRange.endDate || endDate).format('MMM D')}
								</Chip>
							</View>
						</View>
						<MovieHorizontalGrid
							data={formattedUpcomingReleases}
							posterHeight={120}
							posterSelectionLocation="movies"
							isLoading={tdIsLoading}
						/>
					</View>
					<View style={{ gap: 4 }}>
						<View
							style={{
								display: 'flex',
								flexDirection: 'row',
								gap: 8,
								flexWrap: 'wrap',
								alignItems: 'center',
							}}
						>
							<View style={{ flexGrow: 1 }}>
								<Text variant="titleMedium">Popular Releases</Text>
							</View>
							<View>
								<Chip
									onPress={() => setViewYearPicker(true)}
									icon="calendar-text"
									style={{ marginVertical: 4 }}
								>
									{popularYear}
								</Chip>
							</View>
						</View>
						<MovieHorizontalGrid
							data={formattedPopularYearlyRelease}
							posterHeight={120}
							posterSelectionLocation="movies"
							isLoading={tdIsLoading}
						/>
					</View>
				</ScrollView>
			</SafeAreaView>
			<YearPicker
				onDismiss={() => setViewYearPicker(false)}
				visible={viewYearPicker}
				onYearChange={(year) => setPopularYear(year)}
				selectedYear={popularYear}
			/>
			<DatePickerRange
				onDateChange={(sd, ed) => setCustomRange({ startDate: sd, endDate: ed })}
				startDate={startDate}
				endDate={endDate}
				onDismiss={() => setViewDateRangePicker(false)}
				visible={viewDateRangePicker}
			/>
		</>
	);
};

export default Movies;
