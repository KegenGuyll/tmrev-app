import dayjs from 'dayjs';

export default function formatDateYear(date: string | Date): string {
	if (!date) return '-';

	return dayjs(date).format('YYYY');
}
