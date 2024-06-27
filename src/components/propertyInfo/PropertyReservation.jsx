import React, { useEffect, useState } from 'react';
import Calendar from '../Calendar';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, isSameDay } from 'date-fns';

import { selectUser } from '../../redux/slices/authSlice';
import { useSelector } from 'react-redux';
import LoginPage from '../../pages/public/LoginPage';
import { db } from '../../dexie/db';
import Button from '../common/Button';
import { formatPrice, getDatesBetween } from '../../utils';
import { ROLES } from '../../constants/roles';
import { formatDate } from 'date-fns';

const PropertyReservation = ({ property }) => {
	const [showLoginModal, setShowLoginModal] = useState(false);
	const user = useSelector(selectUser);

	const navigate = useNavigate();
	const [totalPrice, setTotalPrice] = useState(property?.price);
	const [dates, setDates] = useState([]);
	const [dateRange, setDateRange] = useState({
		startDate: new Date(),
		endDate: new Date(),
		key: 'selection',
	});

	useEffect(() => {
		if (property?.bookings?.length > 0) {
			const allDates = property?.bookings?.map((booking) => getDatesBetween(booking.startDate, booking.endDate)).flat();

			const currentDate = new Date();
			const tomorrow = new Date(currentDate);
			tomorrow.setDate(currentDate.getDate() + 1);
			const dayAfterTomorrow = new Date(currentDate);
			dayAfterTomorrow.setDate(currentDate.getDate() + 2);
			const additionalDates = [currentDate, tomorrow, dayAfterTomorrow];

			const allDatesWithAdditional = [...new Set([...allDates, ...additionalDates])];
			setDates(allDatesWithAdditional);

			if (allDatesWithAdditional.some((date) => isSameDay(date, currentDate))) {
				let nextAvailableDate = new Date(currentDate);
				while (allDatesWithAdditional.some((date) => isSameDay(date, nextAvailableDate))) {
					nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
				}

				setDateRange((prevRange) => ({
					...prevRange,
					startDate: nextAvailableDate,
					endDate: nextAvailableDate,
				}));
			}
		}
	}, [property?.bookings]);

	const calculateTotalPrice = (startDate, endDate) => {
		if (!startDate || !endDate) return property?.price;
		const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
		return days * property.price;
	};

	const handleDatesAndPrice = (ranges) => {
		const { startDate, endDate } = ranges.selection;
		setDateRange({ ...dateRange, startDate, endDate });
		const total = calculateTotalPrice(startDate, endDate);
		setTotalPrice(total);
	};
	const bookThisPlace = async (e) => {
		console.log(e);
		e.preventDefault();
		if (!user) {
			setShowLoginModal(true);
			return;
		}

		const startDate = new Date(dateRange.startDate);
		startDate.setHours(0, 0, 0, 0);
		const endDate = new Date(dateRange.endDate);
		endDate.setHours(0, 0, 0, 0);

		const bookingObj = {
			totalPrice,
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(),
			userId: user.id,
			propertyId: property?.id,
			propertyName: property?.propertyName,
			description: property?.description,
			price: property?.price,
			checkInTime: property?.checkInTime,
			checkOutTime: property?.checkOutTime,
			address: property?.address,
			city: property?.city,
			country: property?.country,
			propertyImages: property?.propertyImages,
			amenities: property?.amenities,
			propertyTags: property?.propertyTags,
			owner: property?.owner,
		};

		try {
			const result = await db.bookings.add(bookingObj);

			navigate(`/payment?id=${result}`, { state: { fromReservation: true } });
		} catch (error) {
			console.error('Failed to save booking:', error);
		}
	};

	return (
		<>
			<div className="bg-white rounded-xl shadow-lg border-[1px] border-neutral-200 overflow-hidden">
				<div className="flex flex-row items-center gap-0 p-4">
					<div className="text-2xl font-semibold">{formatPrice(totalPrice)}</div>
					<div className=" text-neutral-600 ml-2 font-normal">Per Day</div>
				</div>
				<hr className="bg-gray-50" />
				<Calendar value={dateRange} onChange={(value) => handleDatesAndPrice(value)} disabledDates={dates} />
				<hr className="bg-gray-50" />
				<div className="p-4">
					<Button
						buttonType="button"
						size="md"
						variant="filled"
						innerClass="w-[100%] bg-primary"
						innerTextClass="text-white"
						onClick={bookThisPlace}
						disabled={property?.ownerId === user?.id || user?.role === ROLES.OWNER}
					>
						Reserve
					</Button>
					{(property?.ownerId === user?.id || user?.role === ROLES.OWNER) && (
						<div className=" text-neutral-600 ml-2 font-normal">Only customers are allowed to book a property</div>
					)}
				</div>
				<hr className="bg-gray-50" />
				<div className=" p-4 flex flex-row items-center justify-between font-semibold text-lg">
					<div>Total</div>
					<div> {formatPrice(totalPrice)}</div>
				</div>
			</div>
			{showLoginModal && (
				<div className="flex bg-black bg-opacity-50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-screen">
					<div className="p-4 w-full max-w-md max-h-full">
						<LoginPage isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
					</div>
				</div>
			)}
		</>
	);
};

export default PropertyReservation;
