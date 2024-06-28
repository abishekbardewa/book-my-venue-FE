export const formatDateRange = (startDate, endDate) => {
	const start = new Date(startDate);
	const end = new Date(endDate);

	const startYear = start.getFullYear();
	const endYear = end.getFullYear();

	const startMonth = start.toLocaleString('default', { month: 'long' });
	const startDay = start.getDate();
	const endDay = end.getDate();

	if (start.toDateString() === end.toDateString()) {
		return `${startDay} ${startMonth} ${startYear}`;
	} else {
		return `${startDay} ${startMonth} ${startYear} - ${endDay} ${startMonth} ${endYear}`;
	}
};

export const formatPrice = (price) => {
	return Intl.NumberFormat('en-IN', {
		style: 'currency',
		currency: 'INR',
		maximumFractionDigits: 0,
	}).format(price);
};

export const getDatesBetween = (startDate, endDate) => {
	let datesArray = [];
	let currentDate = new Date(startDate);
	const end = new Date(endDate);

	while (currentDate <= end) {
		datesArray.push(new Date(currentDate));
		currentDate.setDate(currentDate.getDate() + 1);
	}
	return datesArray;
};

export const debounce = (func, delay) => {
	let timerId;
	return (...args) => {
		clearTimeout(timerId);
		timerId = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
};

export const throttle = (func, limit) => {
	let lastFunc, lastRan;
	return function (...args) {
		const context = this;
		if (!lastRan) {
			func.apply(context, args);
			lastRan = Date.now();
		} else {
			clearTimeout(lastFunc);
			lastFunc = setTimeout(() => {
				if (Date.now() - lastRan >= limit) {
					func.apply(context, args);
					lastRan = Date.now();
				}
			}, limit - (Date.now() - lastRan));
		}
	};
};

export const convertTo12HourFormat = (time24) => {
	if (!time24) return '';
	const [hours, minutes] = time24.split(':');
	let hours12 = parseInt(hours, 10);
	let period = 'AM';

	if (hours12 === 0) {
		hours12 = 12;
	} else if (hours12 === 12) {
		period = 'PM';
	} else if (hours12 > 12) {
		hours12 -= 12;
		period = 'PM';
	}

	return `${hours12}:${minutes} ${period}`;
};

export const convertTo24HourFormat = (time12) => {
	if (!time12) return '';
	const [time, period] = time12.split(' ');
	let [hours, minutes] = time.split(':');
	hours = parseInt(hours, 10);

	if (period.toUpperCase() === 'PM' && hours !== 12) {
		hours += 12;
	} else if (period.toUpperCase() === 'AM' && hours === 12) {
		hours = 0;
	}

	return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

export function calculateDeadline(bookingDateString) {
	// Parse the string into a Date object
	const bookingDate = new Date(bookingDateString);

	// Check if the parsing was successful
	if (isNaN(bookingDate.getTime())) {
		return 'Invalid date format';
	}

	// Calculate the deadline
	const deadlineDate = new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000);

	return deadlineDate.toISOString();
	// return format(deadlineDate, "MMM d, yyyy 'at' h:mm a");
}
