import dayjs from 'dayjs';

export default function formatDateYear(date: string | Date | null | undefined): string {
	if (!date) return '-';

	return dayjs(date).format('YYYY');
}
