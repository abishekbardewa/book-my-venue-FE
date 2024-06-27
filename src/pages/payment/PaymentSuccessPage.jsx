import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { axiosPrivate } from '../../services/axios.service';
import { formatDateRange, formatPrice } from '../../utils';
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import Loader from '../../components/common/Loader';

function formatDate(dateString) {
	return new Date(dateString).toLocaleString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		// hour: '2-digit',
		// minute: '2-digit'
	});
}

const PaymentSuccessPage = () => {
	const location = useLocation();
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const [booking, setBooking] = useState(null);

	const searchParams = new URLSearchParams(location.search);
	const bookingId = searchParams.get('id');

	useEffect(() => {
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
	}, [bookingId, navigate]);

	if (loading) {
		return <Loader />;
	}

	return (
		<>
			<main className="grid place-items-center bg-white px-6 py-24 sm:py-15 lg:px-8">
				<div className="rounded-lg bg-white pb-4 pt-5 text-left border border-gray-100 sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
					<div>
						<div className="mx-auto flex items-center justify-center rounded-full">
							<IoCheckmarkCircleSharp className="h-12 w-12 text-green-600" />
						</div>

						<div className="mt-4 text-center sm:mt-5">
							<h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
								Payment successful
							</h3>
							{/* <div className="mt-3">
                <p className="text-md text-gray-500">
                  Your payment of <span className=' font-semibold text-black'>{formatPrice(booking?.payments[0]?.amount)}</span> for the event on <span className=' font-semibold text-black'>{formatDateRange(booking?.startDate, booking?.endDate)}{' '}</span>
                  at <span className=' font-semibold text-black'>{booking?.property?.propertyName}</span> has been successfully processed.
                </p>
              </div> */}
							<div className="font-sans max-w-[600px] mx-auto p-5">
								<h1 className="text-[#b4457f] text-2xl font-bold mt-0">BookMyVenue</h1>
								<h2 className="text-[#4a4a4a]">Booking Confirmation</h2>
								<p>Dear {booking?.user?.firstName},</p>
								<p>Thank you for your booking?. Here are the details:</p>
								<table className="w-full border-collapse mb-5">
									<tbody>
										<tr>
											<td className="p-2.5 border border-gray-300 font-bold">Booking ID</td>
											<td className="p-2.5 border border-gray-300">{booking?.id}</td>
										</tr>
										<tr>
											<td className="p-2.5 border border-gray-300 font-bold">Property</td>
											<td className="p-2.5 border border-gray-300">{booking?.property.propertyName}</td>
										</tr>
										<tr>
											<td className="p-2.5 border border-gray-300 font-bold">Check-in</td>
											<td className="p-2.5 border border-gray-300">{formatDate(booking?.startDate)}</td>
										</tr>
										<tr>
											<td className="p-2.5 border border-gray-300 font-bold">Check-out</td>
											<td className="p-2.5 border border-gray-300">{formatDate(booking?.endDate)}</td>
										</tr>
										<tr>
											<td className="p-2.5 border border-gray-300 font-bold">Status</td>
											<td className="p-2.5 border border-gray-300 text-yellow-600">{booking?.bookingStatus}</td>
										</tr>
										<tr>
											<td className="p-2.5 border border-gray-300 font-bold">Amount Paid</td>
											<td className="p-2.5 border border-gray-300">Rs.{booking?.payments[0].amount}</td>
										</tr>
									</tbody>
								</table>
								<p>
									Please note that your booking is currently <span className="text-yellow-600">{booking?.bookingStatus}</span>. We will notify you
									once it's approved.
								</p>
								<p>If you have any questions, please don't hesitate to contact us.</p>
							</div>
						</div>
						<div className="text-center text-md text-gray-500 px-5">
							Conformation email has been sent to your Email ID : <span className=" font-semibold text-black">{booking?.user.email}</span>
						</div>
					</div>
					<div className="mt-6 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3 px-5">
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
