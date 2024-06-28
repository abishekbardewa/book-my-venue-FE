import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/slices/authSlice';
import { axiosPrivate } from '../../services/axios.service';
import Button from '../../components/common/Button';
import { BOOKING_STATUS, PAYMENT_STATUS, bookingStatusMessages } from '../../constants/status';
import { ROLES } from '../../constants/roles';

import { format } from 'date-fns';
import { formatDateRange, formatPrice } from '../../utils';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';

import { toast } from 'react-toastify';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import { RiCalendarCloseLine } from 'react-icons/ri';
import EmptyState from '../../components/common/EmptyState';
import { MdOutlineCancel } from 'react-icons/md';
import ReviewModal from '../../components/common/ReviewModal';
import FilterTab from '../../components/common/FilterTab';
import { LuLoader2 } from 'react-icons/lu';

const MyBookings = () => {
	const user = useSelector(selectUser);
	const [loading, setLoading] = useState(false);
	const [bookings, setBookings] = useState([]);
	const [internalLoading, setInternalLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const limit = 5;

	const [showModal, setShowModal] = useState(false);
	const [selectedBookingId, setSelectedBookingId] = useState(null);
	const [showReviewModal, setShowReviewModal] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [reviewLoading, setReviewLoading] = useState(false);

	const [view, setView] = useState(BOOKING_STATUS.AWAITING_OWNER_APPROVAL);
	const { title, subtitle } = bookingStatusMessages[view] || bookingStatusMessages.default;
	const getUserBookings = useCallback(async () => {
		try {
			setInternalLoading(true);
			const { data } = await axiosPrivate.get(`/booking/customer-bookings/${user?.id}?page=${page}&limit=${limit}&status=${view}`);
			console.log(data);

			setTotalCount(data.totalCount);
			setBookings(data.data);
		} catch (error) {
			console.log(error);
		} finally {
			setInternalLoading(false);
		}
	}, [page, user?.id, view]);

	useEffect(() => {
		getUserBookings();
	}, [getUserBookings, page, user?.id]);

	const handleAcceptReject = (bookingId) => {
		console.log('here');
		setSelectedBookingId(bookingId);
		setShowModal(true);
	};

	const handleConfirm = async () => {
		try {
			setLoading(true);
			const reqObj = {
				bookingStatus: BOOKING_STATUS.CANCELLED,
				paymentStatus: PAYMENT_STATUS.REFUNDED,
				role: ROLES.CUSTOMER,
			};
			const { data } = await axiosPrivate.put(`/booking/${selectedBookingId}`, reqObj);
			if (data.success) {
				toast.success('Booking is cancelled');
				getUserBookings();
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.error('Error cancelling booking:', error);
			toast.error('Something went wrong');
		} finally {
			setLoading(false);
			setShowModal(false);
			setSelectedBookingId(null);
		}
	};

	const handleCancel = () => {
		setShowModal(false);
		setSelectedBookingId(null);
	};
	const handleReviewCancel = () => {
		setSelectedBooking(null);
		setShowReviewModal(false);
	};

	const handleReviewConfirm = async (rating, review, type, id = null) => {
		console.log(rating, review, type);
		setReviewLoading(true);
		try {
			let reqObj = { rating, review };
			if (type === 'add') {
				reqObj.fullName = user?.firstName + ' ' + user?.lastName;
				reqObj.avatar = user?.avatar;
				reqObj.propertyId = selectedBooking?.property.id;
				reqObj.bookingId = selectedBooking?.id;
				const { data: adddata } = await axiosPrivate.post(`/review`, reqObj);
				console.log(adddata);
				if (adddata.success) {
					toast.success('Review added');
					setSelectedBooking(null);
					setShowReviewModal(false);
					getUserBookings();
				} else {
					toast.error(adddata.message);
				}
			} else {
				const { data } = await axiosPrivate.put(`/review/${id}`, reqObj);
				if (data.success) {
					toast.success('Review updated');
					setSelectedBooking(null);
					setShowReviewModal(false);
					getUserBookings();
				} else {
					toast.error(data.message);
				}
				console.log(data);
			}
		} catch (err) {
			console.error(err);
			toast.error('Something went wrong');
		} finally {
			setReviewLoading(false);
		}
	};

	const addReview = async (booking) => {
		setSelectedBooking(booking);
		setShowReviewModal(true);
	};

	const handleFilter = (status) => {
		console.log(status);
		setView(status);
		setPage(1);
	};

	// if (loading) {
	// 	return <Loader />;
	// }

	return (
		<>
			<div className="md:flex md:items-center md:justify-between mb-8">
				<div className="min-w-0 flex-1">
					<h2 className="text-2xl font-bold leading-7 text-gray-50 sm:truncate sm:text-3xl sm:tracking-tight">Your bookings</h2>
					<p className="mt-1 text-sm text-gray-50">A list of all the bookings in your account.</p>
				</div>
			</div>

			<div className="lg:grid lg:grid-cols-12 lg:gap-x-5 mb-5">
				<nav className="flex flex-wrap lg:flex-nowrap gap-2">
					<FilterTab status={BOOKING_STATUS.AWAITING_OWNER_APPROVAL} currentView={view} onFilter={handleFilter} label="Awaiting approval" />
					<FilterTab status={BOOKING_STATUS.CONFIRMED} currentView={view} onFilter={handleFilter} label="Confirmed" />
					<FilterTab status={BOOKING_STATUS.CANCELLED} currentView={view} onFilter={handleFilter} label="Cancelled" />
					<FilterTab status={BOOKING_STATUS.COMPLETED} currentView={view} onFilter={handleFilter} label="Completed" />
				</nav>
			</div>

			{!internalLoading ? (
				bookings.length > 0 ? (
					<div aria-labelledby="recent-heading" className="mt-16">
						{bookings.map((ele) => (
							<div key={ele?.id} className="mb-4">
								<div className="space-y-8 sm:px-4 lg:px-0">
									<div className="border-b border-t border-gray-500 bg-white  shadow-sm rounded-lg border overflow-hidden">
										<div className="bg-gray-25 p-4 sm:p-6 ">
											<div className="flex  items-center md:items-start justify-between  gap-8">
												<div className="flex items-center  justify-between flex-wrap gap-4 md:gap-8 w-full">
													<dl className="flex items-center justify-between flex-wrap gap-4 md:gap-8 md:w-auto w-full">
														<div>
															<dt className="font-medium text-gray-900">Amount Paid</dt>
															<dd className="mt-1 font-medium text-gray-900">
																{formatPrice(ele?.payments[0].amount)} <StatusBadge status={ele?.payments[0].status} type="payment" />
															</dd>
														</div>
														<div className="sm:text-right md:text-left">
															<dt className="font-medium text-gray-900">Event Date</dt>
															<dd className="mt-1 text-gray-500">{formatDateRange(ele?.startDate, ele?.endDate)}</dd>
														</div>
													</dl>
													<div className=" flex items-start justify-between flex-wrap gap-4 md:gap-8 md:w-auto w-full">
														<div className="text-left md:text-right">
															<dt className="font-medium text-gray-900">Booked On</dt>
															<dd className="mt-1 text-gray-500">
																<time>{format(new Date(ele?.bookingDate), 'dd MMMM yyyy')}</time>
															</dd>
														</div>
														<div className="text-right">
															<dt className="font-medium text-gray-900">Booking Id</dt>
															<dd className="mt-1 text-gray-500">{ele?.id.substring(0, 8).toUpperCase()}</dd>
														</div>
													</div>
												</div>
											</div>
										</div>

										<ul role="list" className="divide-y divide-gray-200">
											<li className="p-4 sm:p-6">
												<div className="flex items-center">
													<div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 sm:h-20 sm:w-20">
														<img
															src={ele?.property?.propertyImages[0]?.imgUrl}
															alt={ele?.property?.propertyName}
															className="h-full w-full object-cover object-center"
														/>
													</div>
													<div className="ml-6 flex-1 ">
														<div className="font-medium text-md text-gray-900 sm:flex sm:justify-between">
															<h5>
																{ele?.property?.propertyName}
																<p className="mt-1 text-gray-500 text-sm">{formatPrice(ele?.property?.price)} per day</p>
															</h5>
														</div>
													</div>
												</div>

												<div className="mt-6 sm:flex sm:justify-between">
													<div className="flex items-center">
														<span className="mr-2 font-medium">Booking:</span> <StatusBadge status={ele?.bookingStatus} type="booking" />
													</div>

													{(ele?.bookingStatus === BOOKING_STATUS.AWAITING_OWNER_APPROVAL || ele?.bookingStatus === BOOKING_STATUS.CONFIRMED) && (
														<div className="flex items-center justify-center  pt-6 pb-2 text-sm font-medium sm:ml-4 sm:mt-0 sm:border-none sm:pt-0">
															<Button
																buttonType="button"
																size="sm"
																variant="outline"
																innerClass="w-full md:w-36  border !border-error-500"
																innerTextClass="!text-red-500"
																onClick={() => handleAcceptReject(ele.id, BOOKING_STATUS.CANCELLED, PAYMENT_STATUS.REFUNDED)}
															>
																Cancel
															</Button>
														</div>
													)}

													{ele?.bookingStatus === BOOKING_STATUS.COMPLETED && (
														<div className="flex items-center justify-center  pt-6 pb-2 text-sm font-medium sm:ml-4 sm:mt-0 sm:border-none sm:pt-0">
															<Button
																buttonType="button"
																size="sm"
																variant="outline"
																innerClass="w-full md:w-36  border border-primary"
																innerTextClass="text-primary"
																onClick={() => addReview(ele)}
															>
																{ele?.reviews?.length > 0 ? 'Edit Review' : 'Add Review'}
															</Button>
														</div>
													)}
												</div>
											</li>
										</ul>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<EmptyState title={title} subtitle={subtitle} icon={<RiCalendarCloseLine className="w-16 h-16 text-white" />} />
				)
			) : (
				<div className="flex items-center justify-center space-x-2 h-[40vh]">
					<LuLoader2 className="w-8 h-8 text-white animate-spin" />
				</div>
			)}
			<div className="mt-5">
				<Pagination totalCount={totalCount} page={page} limit={limit} onPageChange={setPage} pageClass={'justify-end'} />
			</div>
			{showModal && (
				<ConfirmModal
					modalId="booking-action-modal"
					title="Confirm Booking Cancellation"
					message="Are you sure you want to cancel this booking? The payment will be refunded within 7 business days."
					confirmText={'Yes, Cancel Booking'}
					cancelText="No, Keep Booking"
					onConfirm={handleConfirm}
					onCancel={handleCancel}
					confirmDisabled={loading}
					cancelDisabled={loading}
					btnClass={'text-white bg-error-600 hover:bg-error-800 focus:ring-error-300 border-error-600'}
					icon={<MdOutlineCancel className="w-10 h-10 text-error-600" />}
				/>
			)}
			{showReviewModal && (
				<ReviewModal
					modalId="booking-review-modal"
					onConfirm={handleReviewConfirm}
					onCancel={handleReviewCancel}
					// confirmDisabled={internalLoading}
					// cancelDisabled={internalLoading}
					// btnClass={''}
					reviewLoading={reviewLoading}
					reviewData={selectedBooking?.reviews[0]}
				/>
			)}
		</>
	);
};

export default MyBookings;
