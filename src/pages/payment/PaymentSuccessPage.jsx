import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../../services/axios.service';
import { formatDateRange, formatPrice } from '../../utils';
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import Loader from '../../components/common/Loader';
import BMVLOGOG from '/logo-BMvenue.svg';
import StatusBadge from '../../components/common/StatusBadge';

const PaymentSuccessPage = () => {
	const location = useLocation();
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const [booking, setBooking] = useState(null);

	const searchParams = new URLSearchParams(location.search);
	const bookingId = searchParams.get('id');

	useEffect(() => {
		if (!location.state || !location.state.fromPayment) {
			navigate('/');
			return;
		}
		if (!bookingId) {
			navigate('/');
			return;
		}

		const getBooking = async () => {
			try {
				const { data } = await axiosPrivate.get(`/booking/${bookingId}`);
				console.log(data);
				setBooking(data);
			} catch (err) {
				console.log('Error fetching booking', err);
			} finally {
				setLoading(false);
			}
		};

		getBooking();
	}, [bookingId, navigate, location]);

	if (loading) {
		return <Loader />;
	}

	return (
		<>
			<main className="flex flex-1 flex-col  items-center justify-center px-2 py-24 sm:py-15 ">
				<div className=" bg-white p-6  rounded-lg max-w-[600px] mx-auto w-full shadow-md ">
					<div className="flex items-center justify-center rounded-full">
						<IoCheckmarkCircleSharp className="h-12 w-12 text-green-600" />
					</div>

					<div className="mt-4 text-center sm:mt-5">
						<h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
							Payment successful
						</h3>

						<div className="flex flex-col items-center justify-center my-5">
							<img src={BMVLOGOG} height="180" width="180" alt="Logo" />
						</div>
						<h2 className="text-gray-900 font-semibold text-lg">Booking Confirmation</h2>
						<p className="text-gray-900">Dear {booking?.user?.firstName},</p>
						<p className="text-gray-900">Thank you for your booking. Here are the details:</p>
						<div className="my-5 divide-y divide-gray-100 text-sm leading-6 rounded-xl border border-gray-200 px-2">
							<div className="flex justify-between gap-x-4 py-2">
								<dt className="text-gray-900 font-bold whitespace-nowrap text-base">Booking Id</dt>
								<dd className="text-gray-900  whitespace-nowrap text-base">
									<time>{booking?.id.substring(0, 8).toUpperCase()}</time>
								</dd>
							</div>

							<div className="flex justify-between gap-x-4 py-2 flex-wrap">
								<dt className="text-gray-900 font-bold text-base">Property</dt>
								<dd className="text-gray-900 text-base">
									<time>{booking?.property.propertyName}</time>
								</dd>
							</div>
							<div className="flex justify-between gap-x-4 py-2 flex-wrap">
								<dt className="text-gray-900 font-bold text-base">Event Date</dt>
								<dd className="text-gray-900 text-base">
									<time>{formatDateRange(booking?.startDate, booking?.endDate)}</time>
								</dd>
							</div>
							<div className="flex justify-between gap-x-4 py-2 flex-wrap">
								<dt className="text-gray-900 font-bold text-base">Booking Status</dt>
								<dd className="flex items-start gap-x-2 text-base">
									<StatusBadge status={booking?.bookingStatus} type="booking" />
								</dd>
							</div>
							<div className="flex justify-between gap-x-4 py-2">
								<dt className="text-gray-900 font-bold text-base">Amount Paid</dt>
								<dd className="flex items-start gap-x-2 text-base">
									<div className="font-medium text-gray-900">{formatPrice(booking?.payments[0].amount)}</div>

									<StatusBadge status={booking?.payments[0].status} type="payment" />
								</dd>
							</div>
						</div>
						<div className="flex flex-1 flex-col items-center justify-center gap-3">
							<div>
								<p className="text-center text-md text-gray-900">
									Please note that your booking is currently <span className="text-yellow-600">{booking?.bookingStatus}</span>.
								</p>
								<p className="text-center text-md text-gray-900"> We will notify you once it is approved.</p>
							</div>

							<p className="text-center text-md text-gray-900">
								Conformation email has been sent to your Email ID : <span className=" font-semibold text-gray-900">{booking?.user.email}</span>
							</p>
							<p className="text-center text-md text-gray-900">If you have any questions, please do not hesitate to contact us.</p>
						</div>
					</div>

					<div className="mt-10  sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3 ">
						<Link
							to="/customer/my-bookings"
							className="inline-flex w-full justify-center rounded-full bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-gray:outline-indigo-600 sm:col-start-2"
						>
							Check Bookings
						</Link>
						<Link
							to="/"
							className="mt-3 inline-flex w-full justify-center rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
						>
							Back to Home
						</Link>
					</div>
				</div>
			</main>
		</>
	);
};

export default PaymentSuccessPage;
