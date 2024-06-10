import React, { useEffect, useState } from 'react';
import Calendar from '../Calendar';
import FormatPrice from '../FormatPrice';
import { useNavigate } from 'react-router-dom';
import { differenceInDays } from 'date-fns';

import { selectIsAuthenticated, selectUser } from '../../redux/slices/authSlice';
import { useSelector } from 'react-redux';
import LoginPage from '../../pages/public/LoginPage';
import { clearDatabase, db } from '../../dexie/db';
import Button from '../common/Button';

const PropertyReservation = ({ property }) => {
	const [showLoginModal, setShowLoginModal] = useState(false);
	const isAuthenticated = useSelector(selectIsAuthenticated);
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
		let dates = [];
		property?.bookings?.forEach((ele) => {
			const start = new Date(ele.startDate);
			const end = new Date(ele.endDate);
			let currentDate = start;

			while (currentDate <= end) {
				dates.push(new Date(currentDate));
				currentDate.setDate(currentDate.getDate() + 1);
			}
		});
		setDates(dates);
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
			amenities: property?.PropertyTags,
			propertyTags: property?.PropertyTags,
		};

		try {
			const result = await db.bookings.add(bookingObj);

			navigate(`/payment?id=${result}`);
		} catch (error) {
			console.error('Failed to save booking:', error);
		}
	};

	return (
		<>
			<div className="bg-white rounded-xl shadow-lg border-[1px] border-neutral-200 overflow-hidden">
				<div className="flex flex-row items-center gap-0 p-4">
					<div className="text-2xl font-semibold">{<FormatPrice price={property?.price} />}</div>
					<div className=" text-neutral-600 ml-2 font-normal">Per Day</div>
				</div>
				<hr />
				<Calendar value={dateRange} onChange={(value) => handleDatesAndPrice(value)} disabledDates={dates} />
				<hr />
				<div className="p-4">
					<Button
						buttonType="button"
						size="md"
						variant="filled"
						innerClass="w-[100%] bg-primary"
						innerTextClass="text-white"
						onClick={bookThisPlace}
						disabled={property?.ownerId === user?.id}
					>
						Reserve
					</Button>
					{property?.ownerId === user?.id && <div className=" text-neutral-600 ml-2 font-normal">Only customers are allowed to book a property</div>}
				</div>
				<hr />
				<div className=" p-4 flex flex-row items-center justify-between font-semibold text-lg">
					<div>Total</div>
					<div>{<FormatPrice price={totalPrice} />}</div>
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
