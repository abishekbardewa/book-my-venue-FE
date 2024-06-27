import React, { useCallback, useEffect, useState } from 'react';

import { axiosPrivate } from '../../services/axios.service';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Loader from '../../components/common/Loader';
import { selectUser } from '../../redux/slices/authSlice';
import { useSelector } from 'react-redux';
import useRazorpay from 'react-razorpay';
import { PAYMENT_STATUS } from '../../constants/status';
import { db } from '../../dexie/db';

import { formatDateRange, formatPrice, getDatesBetween } from '../../utils';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';
import ConfirmModal from '../../components/common/ConfirmModal';
import { PiWarningCircleFill } from 'react-icons/pi';

import placeholder from '/placeholder.jpg';
import PaymentLoader from '../../components/common/PaymentLoader';
import BMVICON from '/icon-BMV.png';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const PaymentPage = () => {
	const location = useLocation();
	const [Razorpay] = useRazorpay();
	const navigate = useNavigate();
	const user = useSelector(selectUser);
	const [booking, setBooking] = useState(null);
	const [loading, setLoading] = useState(false);
	const [paymentLoading, setPaymentLoading] = useState(false);
	const [bookingDates, setBookingDates] = useState([]);
	const [termsChecked, setTermsChecked] = useState(false);

	const [showModal, setShowModal] = useState(false);

	const [bookingErrMsg, setBookingErrMsg] = useState('');

	useEffect(() => {
		if (!location.state || !location.state.fromReservation) {
			navigate('/');
			return;
		}

		const fetchBooking = async () => {
			const searchParams = new URLSearchParams(location.search);
			const bookingId = searchParams.get('id');
			if (!bookingId) {
				navigate('/');
			}

			const foundBooking = await db.bookings.get(parseInt(bookingId));
			console.log(foundBooking);
			if (foundBooking) {
				const allDates = getDatesBetween(foundBooking.startDate, foundBooking.endDate);

				setBookingDates(allDates);
				setBooking(foundBooking);
			} else {
				navigate('/');
			}
		};

		fetchBooking();
	}, [location.search, navigate, location.state]);

	const handlePaymentModalDissmiss = useCallback(async (order) => {
		try {
			await axiosPrivate.put(`booking/remove-booking/${order.bookingId}`);
		} catch (err) {
			console.log('Order Dissmiss Removed', err);
		}
	}, []);

	const handlePayment = useCallback(async () => {
		if (!booking) return;
		if (!termsChecked) {
			toast.error('You must agree to the terms and conditions before proceeding.');
			return;
		}
		try {
			const { data } = await axiosPrivate.post('/payment/create-payment-order', {
				amount: booking.totalPrice,
				startDate: booking.startDate,
				endDate: booking?.endDate,
				userId: booking?.userId,
				propertyId: booking?.propertyId,
			});
			console.log(data);
			if (data.success) {
				const { data: orderResponse } = data;
				const options = {
					key: RAZORPAY_KEY_ID,
					amount: orderResponse.order.amount,
					currency: orderResponse.order.currency,
					name: 'Book My Venue',
					description: 'Order Pyment',
					image: BMVICON,
					order_id: orderResponse.order.id,
					handler: async function (response) {
						try {
							setPaymentLoading(true);

							const { data } = await axiosPrivate.post('/payment/confirm-payment', {
								bookingId: orderResponse.bookingId,
								orderId: response.razorpay_order_id,
								paymentId: response.razorpay_payment_id,
								signature: response.razorpay_signature,
								amount: orderResponse.order.amount,
								status: PAYMENT_STATUS.SUCCESS,
							});
							console.log(data);
							setPaymentLoading(false);
							navigate(`/payment-success?id=${orderResponse.bookingId}`, { state: { fromPayment: true } });
						} catch (err) {
							console.log('Error', err);
						}
					},
					prefill: {
						name: `${user.firstName} ${user.lastName}`,
						email: user?.email,
					},
					modal: {
						ondismiss: () => handlePaymentModalDissmiss(orderResponse),
					},
					timeout: 15 * 60, //15Min
				};

				const rzpay = new Razorpay(options);
				rzpay.open();
				rzpay.on('payment.failed', async (res) => {
					console.log('FAILED', res, orderResponse);

					await axiosPrivate.post('/payment/confirm-payment', {
						bookingId: orderResponse.bookingId,
						orderId: orderResponse.order.id,
						paymentId: res.error.metadata.payment_id,
						signature: '',
						amount: orderResponse.order.amount,
						status: PAYMENT_STATUS.FAILED,
					});
					toast.error('Payment failed, please try again');
				});
			} else {
				console.log(data);
			}
		} catch (err) {
			console.log(err);
			console.log(err.response.data.error);
			setBookingErrMsg(err.response.data.error);
			setShowModal(true);
		}
	}, [Razorpay, user?.email, user?.firstName, user?.lastName, booking, handlePaymentModalDissmiss, termsChecked, navigate]);

	const handleGoBack = () => {
		navigate(-1);
	};

	const handleCancel = () => {
		setShowModal(false);
		navigate('/');
	};

	const handleConfirm = () => {
		navigate(-1);
	};

	const goto = (url) => {
		window.open(url, '_blank');
	};

	if (loading) {
		return <Loader />;
	}

	return (
		<>
			{paymentLoading ? (
				<PaymentLoader />
			) : (
				<div className="sm:mx-2 lg:mx-16 px-4 mt-24 pb-24">
					<h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Confirm and Pay</h1>{' '}
					<p className="mt-1 text-md text-gray-500">Review your property and booking information before making your payment.</p>
					<div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
						<section className="lg:col-span-7">
							<ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
								<li className=" py-6 sm:py-10">
									<div className="flex">
										<div className="flex-shrink-0">
											<img
												src={booking?.propertyImages[0].imgUrl}
												alt="Front of men&#039;s Basic Tee in sienna."
												className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
											/>
										</div>
										<div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
											<div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
												<div>
													<div className="flex justify-between">
														<h3 className="text-md">
															<a href="#" className="font-medium text-gray-700 hover:text-gray-800">
																{booking?.propertyName}
															</a>
														</h3>
													</div>
													<div className="mt-1 text-md">
														<p className="text-gray-500">{booking?.address}</p>
														<p className=" text-gray-500">
															{booking?.city}, {booking?.country}
														</p>
													</div>
													<div className="flex flex-col flex-wrap md:flex-nowrap justify-start gap-2 mt-4 w-full">
														<p className="w-fit bg-primary text-white text-md capitalize px-2.5 py-1.5 rounded-full  ">
															Checkin: {booking?.checkInTime}
														</p>
														<p className="w-fit bg-primary text-white text-md capitalize px-2.5 py-1.5 rounded-full ">
															Checkout: {booking?.checkOutTime}
														</p>
													</div>
												</div>
												<div className="mt-4 sm:mt-0 text-left md:text-right">
													<p className="text-md font-medium text-gray-900"> {formatPrice(booking?.price)} per day</p>
												</div>
											</div>
										</div>
									</div>
								</li>
								<li className="flex py-6 sm:py-10">
									<div>
										<h2 className="text-lg font-medium text-gray-900">Owner Information</h2>
										<p className="text-md text-gray-600">Contact details for the owner</p>
										<div className="flex gap-4 mt-4">
											<img
												className="rounded-full object-cover w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20"
												alt="Avatar"
												src={booking?.owner?.avatar || placeholder}
											/>
											<div className="text-md font-medium flex flex-col items-start gap-2">
												<h3 className="font-medium text-gray-700 hover:text-gray-800">
													{booking?.owner?.firstName} {booking?.owner?.lastName}
												</h3>
												<p className="text-md text-gray-600">{booking?.owner?.email}</p>
												<p className="text-md text-gray-600">{booking?.owner?.phone}</p>
											</div>
										</div>
									</div>
								</li>
								<li className="flex py-6 sm:py-10">
									<div>
										<h2 className="text-lg font-medium text-gray-900">Your Information</h2>
										<p className="text-md text-gray-600">Ensure your details are accurate to receive updates from BookMyVenue</p>
										<div className="flex gap-4 mt-4">
											<img
												className="rounded-full object-cover w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20"
												alt="Avatar"
												src={user?.avatar || placeholder}
											/>
											<div className="text-md font-medium flex flex-col items-start gap-2">
												<h3 className="font-medium text-gray-700 hover:text-gray-800">
													{user?.firstName} {user?.lastName}
												</h3>
												<p className="text-md text-gray-600">{user?.email}</p>
												<p className="text-md text-gray-600">{user?.phone}</p>
											</div>
										</div>
									</div>
								</li>
								<li className="flex py-6 sm:py-10">
									<div>
										<h2 className="text-lg font-medium text-gray-900">Cancellation and refund policy</h2>
										<p className="text-md text-gray-600">
											Free cancellation before 48 hours of the event date. Cancellations after that may be for a partial refund.
										</p>
										<span onClick={() => goto('/terms-of-service')} className="underline font-bold mt-1 cursor-pointer">
											Learn More
										</span>
									</div>
								</li>
							</ul>
						</section>

						<section className="order-first md:order-last sticky top-32 overflow-hidden mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
							<h2 className="text-lg font-medium text-gray-900">Booking summary</h2>

							<dl className="mt-6 space-y-4">
								<div className="flex items-center justify-between">
									<dt className="text-md text-gray-600">Booking dates</dt>
									<dd className="text-md font-medium text-gray-900">{booking && formatDateRange(booking.startDate, booking.endDate)}</dd>
								</div>
								<div className="flex items-center justify-between border-t border-gray-200 pt-4">
									<dt className="flex items-center text-md text-gray-600">
										<span>Booking cost</span>
									</dt>
									<dd className="text-md font-medium text-gray-900">
										{formatPrice(booking?.price)} x {bookingDates?.length} {bookingDates?.length > 1 ? 'days' : 'day'}
									</dd>
								</div>

								<div className="flex items-center justify-between border-t border-gray-200 pt-4">
									<dt className="text-base font-medium text-gray-900">Total cost</dt>
									<dd className="text-base font-medium text-gray-900">{formatPrice(booking?.totalPrice)}</dd>
								</div>
							</dl>
							<div className="mt-6 flex items-start">
								<input
									id="terms"
									type="checkbox"
									checked={termsChecked}
									onChange={(e) => {
										console.log(e);
										setTermsChecked(e.target.checked);
									}}
									className="h-5 w-5 mt-[5px] rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
								/>
								<div className="ml-2">
									<label htmlFor="terms" className="text-md font-medium text-gray-900">
										I have read and understood the{' '}
										<span onClick={() => goto('/privacy-policy')} className="text-indigo-500 underline underline-offset-3 cursor-pointer">
											privacy policy{' '}
										</span>{' '}
										and the{' '}
										<span onClick={() => goto('/terms-of-service')} className="text-indigo-500 underline underline-offset-3 cursor-pointer">
											terms of service.
										</span>
									</label>
								</div>
							</div>

							<div className="py-3 mt-6 gap-2 flex flex-col md:flex-row items-center justify-center">
								<Button
									buttonType="button"
									size="md"
									variant="filled"
									onClick={handleGoBack}
									innerClass="w-[100%] lg:w-[50%] bg-white"
									innerTextClass="text-primary"
									disabled={loading}
								>
									Go back
								</Button>

								<Button
									buttonType="button"
									size="md"
									variant="filled"
									innerClass="w-[100%] lg:w-[50%] bg-primary"
									innerTextClass="text-white"
									onClick={handlePayment}
									disabled={loading}
								>
									Pay now
								</Button>
							</div>
						</section>
					</div>
				</div>
			)}
			{showModal && (
				<ConfirmModal
					modalId="booking-err-modal"
					title="Booking Unsuccessful"
					subtitle="Please Try Again in 30 Minutes"
					message="Unfortunately, your booking could not be completed at this time. Please wait for 30 minutes and try again."
					confirmText={'Choose new dates'}
					onConfirm={handleConfirm}
					onCancel={handleCancel}
					confirmDisabled={loading}
					cancelDisabled={loading}
					btnClass={'text-white !w-[100%] bg-warning-600 hover:bg-warning-800 focus:ring-warning-300 border-warning-600'}
					icon={<PiWarningCircleFill className="w-10 h-10 text-warning-500" />}
				/>
			)}
		</>
	);
};

export default PaymentPage;
