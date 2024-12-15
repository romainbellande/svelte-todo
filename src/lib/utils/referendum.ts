export type ReferendumStatus = 'upcoming' | 'active' | 'ended';

export function getReferendumStatus(fromDate: Date, toDate: Date): ReferendumStatus {
	const now = new Date();
	if (now < fromDate) {
		return 'upcoming';
	} else if (now >= fromDate && now <= toDate) {
		return 'active';
	} else {
		return 'ended';
	}
}
