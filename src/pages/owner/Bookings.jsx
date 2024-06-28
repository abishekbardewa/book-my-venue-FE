import React, { useCallback, useEffect, useState } from 'react';

import { axiosPrivate } from '../../services/axios.service';
import { selectUser } from '../../redux/slices/authSlice';
import { useSelector } from 'react-redux';
import Button from '../../components/common/Button';
import { BOOKING_STATUS, PAYMENT_STATUS, bookingConfirmModalMessages, bookingStatusMessages } from '../../constants/status';
import { ROLES } from '../../constants/roles';
import { addHours, format } from 'date-fns';
import { calculateDeadline, formatDateRange, formatPrice } from '../../utils';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import ConfirmModal from '../../components/common/ConfirmModal';
import { PiCheckSquareFill } from 'react-icons/pi';
import { toast } from 'react-toastify';
import EmptyState from '../../components/common/EmptyState';
import { RiCalendarCloseLine } from 'react-icons/ri';
import { MdOutlineCancel } from 'react-icons/md';
import FilterTab from '../../components/common/FilterTab';
import { LuLoader2 } from 'react-icons/lu';
const Bookings = () => {
	const user = useSelector(selectUser);
	const [loading, setLoading] = useState(false);
	const [bookings, setBookings] = useState([]);
	const [internalLoading, setInternalLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const limit = 6;
	const [showModal, setShowModal] = useState(false);
	const [selectedBookingId, setSelectedBookingId] = useState(null);
	const [bookingStatus, setBookingStatus] = useState(null);
	const [paymentStatus, setPaymentStatus] = useState(null);
	const [view, setView] = useState(BOOKING_STATUS.AWAITING_OWNER_APPROVAL);

	const { title, subtitle } = bookingStatusMessages[view] || bookingStatusMessages.default;
	const {
		title: cnfTitle,
		message,
		confirmText,
		cancelText,
		btnClass,
	} = bookingConfirmModalMessages[bookingStatus] || bookingConfirmModalMessages.default;
	const getBookings = useCallback(async () => {
		try {
			setInternalLoading(true);
			const { data } = await axiosPrivate.get(`/booking/owner-bookings/${user?.id}?page=${page}&limit=${limit}&status=${view}`);
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
		getBookings();
	}, [getBookings, page, user?.id]);

	const handleAcceptReject = (id, bookingStatus, paymentStatus) => {
		setBookingStatus(bookingStatus);
		setPaymentStatus(paymentStatus);
		setShowModal(true);
		setSelectedBookingId(id);
	};

	const handleConfirm = async () => {
		try {
			setLoading(true);
			const reqObj = {
				bookingStatus,
				paymentStatus,
				role: ROLES.OWNER,
			};
			console.log(reqObj);
			const { data } = await axiosPrivate.put(`/booking/${selectedBookingId}`, reqObj);
			if (data.success) {
				toast.success(data.message);
				getBookings();
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
					<h2 className="text-2xl font-bold leading-7 text-gray-50 sm:truncate sm:text-3xl sm:tracking-tight">Bookings</h2>
					<p className="mt-1 text-sm text-gray-50">A list of all the bookings of your properties.</p>
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
					<ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 lg:grid-cols-3 xl:gap-x-8 ">
						{bookings.map((ele, idx) => (
							<li key={idx} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
								<Link to={`/property-detail/${ele?.property?.id}`}>
									<div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
										<img
											src={ele?.property?.propertyImages[0]?.imgUrl}
											alt={ele?.property?.propertyName}
											className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
										/>
										<div className="text-md font-medium leading-6 text-gray-900">
											{ele?.property?.propertyName}
											<div className="font-normal text-gray-500">{formatPrice(ele?.payments[0].amount)} per day</div>
										</div>
									</div>
								</Link>
								<dl className=" px-6 py-3 ">
									<div>
										<h3 className="mb-4 text-sm font-medium leading-6 text-gray-900">Booking Info</h3>
										<div className="-my-3 divide-y divide-gray-100 text-sm leading-6 rounded-xl border border-gray-200 px-2">
											<div className="flex justify-between gap-x-4 py-2">
												<dt className="text-gray-500 whitespace-nowrap">Booking Id</dt>
												<dd className="text-gray-700 text-sm whitespace-nowrap">
													<time>{ele?.id.substring(0, 8).toUpperCase()}</time>
												</dd>
											</div>

											<div className="flex justify-between gap-x-4 py-2">
												<dt className="text-gray-500">Booking Date</dt>
												<dd className="text-gray-700">
													<time>{format(new Date(ele?.createdAt), 'dd MMMM yyyy')}</time>
												</dd>
											</div>
											<div className="flex justify-between gap-x-4 py-2">
												<dt className="text-gray-500">Event Date</dt>
												<dd className="text-gray-700">
													<time>{formatDateRange(ele?.startDate, ele?.endDate)}</time>
												</dd>
											</div>

											<div className="flex justify-between gap-x-4 py-2">
												<dt className="text-gray-500">Amount Paid</dt>
												<dd className="flex items-start gap-x-2">
													<div className="font-medium text-gray-900">{formatPrice(ele?.payments[0].amount)}</div>

													<StatusBadge status={ele?.payments[0].status} type="payment" />
												</dd>
											</div>
											<div className="flex justify-between gap-x-4 py-2 flex-wrap">
												<dt className="text-gray-500">Booking Status</dt>
												<dd className="flex items-start gap-x-2">
													<StatusBadge status={ele?.bookingStatus} type="booking" />
												</dd>
											</div>
										</div>
									</div>
									<div className="mt-6 mb-6">
										<h3 className="mb-4 text-sm font-medium leading-6 text-gray-900">Customer Info</h3>
										<div className="-my-3 divide-y divide-gray-100 text-sm leading-6 rounded-xl border border-gray-200 px-2">
											<div className="flex justify-between gap-x-4 py-2 flex-wrap">
												<dt className="text-gray-500">Name</dt>
												<dd className="flex items-start gap-x-2">
													<div className="font-medium text-gray-900">
														{ele?.user?.firstName} {ele?.user?.lastName}
													</div>
												</dd>
											</div>
											<div className="flex justify-between gap-x-4 py-2 flex-wrap">
												<dt className="text-gray-500">Email</dt>
												<dd className="flex items-start gap-x-2">
													<div className="font-medium text-gray-900">{ele?.user?.email}</div>
												</dd>
											</div>
											<div className="flex justify-between gap-x-4 py-2">
												<dt className="text-gray-500">Phone</dt>
												<dd className="flex items-start gap-x-2">
													<div className="font-medium text-gray-900">{ele?.user?.phone}</div>
												</dd>
											</div>
										</div>
									</div>
									<div className="text-xs text-red-600 font-medium">
										Take action before: {format(calculateDeadline(ele?.bookingDate), "MMM d, yyyy 'at' h:mm a")}
									</div>
									{ele?.bookingStatus === 'AWAITING_OWNER_APPROVAL' && (
										<div className="flex justify-between gap-x-4 text-sm py-3">
											<Button
												buttonType="button"
												size="sm"
												variant="filled"
												innerClass="w-36 bg-white !border !border-green-500"
												innerTextClass="text-green-500"
												onClick={() => handleAcceptReject(ele.id, BOOKING_STATUS.CONFIRMED, PAYMENT_STATUS.SUCCESS)}
												disabled={ele?.bookingStatus === BOOKING_STATUS.CONFIRMED}
											>
												Accept
											</Button>
											<Button
												buttonType="button"
												size="sm"
												variant="outline"
												innerClass="w-36  border !border-error-500"
												innerTextClass="!text-red-500"
												onClick={() => handleAcceptReject(ele.id, BOOKING_STATUS.CANCELLED, PAYMENT_STATUS.REFUNDED)}
												disabled={ele?.bookingStatus === BOOKING_STATUS.CANCELLED}
											>
												Reject
											</Button>
										</div>
									)}
								</dl>
							</li>
						))}
					</ul>
				) : (
					<EmptyState title={title} subtitle={subtitle} icon={<RiCalendarCloseLine className="w-16 h-16 text-white" />} />
				)
			) : (
				<div className="flex items-center justify-center space-x-2 h-[40vh]">
					<LuLoader2 className="w-8 h-8 text-white animate-spin" />
				</div>
			)}
			<div className="mt-5">
				<Pagination totalCount={totalCount} page={page} limit={limit} onPageChange={setPage} pageClass={'justify-center'} />
			</div>
			{showModal && (
				<ConfirmModal
					modalId="booking-action-modal"
					title={cnfTitle}
					message={message}
					confirmText={confirmText}
					cancelText={cancelText}
					onConfirm={handleConfirm}
					onCancel={handleCancel}
					confirmDisabled={loading}
					cancelDisabled={loading}
					btnClass={btnClass}
					icon={
						bookingStatus === BOOKING_STATUS.CANCELLED ? (
							<MdOutlineCancel className="w-10 h-10 text-error-600" />
						) : (
							<PiCheckSquareFill className="w-10 h-10 text-green-500" />
						)
					}
				/>
			)}
		</>
	);
};
export default Bookings;
