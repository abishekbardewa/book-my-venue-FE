import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { selectUser } from '../../redux/slices/authSlice';
import { axiosPrivate } from '../../services/axios.service';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { FaPenToSquare, FaPlus, FaTrash } from 'react-icons/fa6';
import ImagePlaceholder from '../../assets/ImagePlaceholder.jpeg';
import { toast } from 'react-toastify';
import EmptyState from '../../components/common/EmptyState';
import { PiBuildingsFill } from 'react-icons/pi';
import { format } from 'date-fns';
import { formatPrice } from '../../utils';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
const PropertyPage = () => {
	const navigate = useNavigate();
	const user = useSelector(selectUser);
	const [loading, setLoading] = useState(false);
	const [properties, setProperties] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedPropertyId, setSelectedPropertyId] = useState(null);
	const [page, setPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const limit = 10;
	const getOwnerProperties = useCallback(async () => {
		try {
			setLoading(true);
			const { data } = await axiosPrivate.get(`/property/owner-property/${user?.id}?page=${page}&limit=${limit}`);

			setTotalCount(data.totalCount);
			setProperties(data.data);
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	}, [page, user?.id]);

	useEffect(() => {
		getOwnerProperties();
	}, [getOwnerProperties, page]);

	const deleteProperty = async (id) => {
		setSelectedPropertyId(id);
		setShowModal(true);
	};

	const goto = (id) => {
		navigate(`/owner/edit-property/${id}`);
	};

	const handleConfirm = async () => {
		try {
			setLoading(true);

			const { data } = await axiosPrivate.put(`/property/delete/${selectedPropertyId}`);
			if (data.success) {
				toast.success('Property deleted');
				getOwnerProperties();
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.error('Error deleteing property:', error.response.data.msg);
			toast.error(error.response.data.msg);
		} finally {
			setLoading(false);
			setShowModal(false);
			setSelectedPropertyId(null);
		}
	};

	const handleCancel = () => {
		setShowModal(false);
		setSelectedPropertyId(null);
	};

	if (loading) {
		return <Loader />;
	}
	return (
		<>
			<div className="md:flex md:items-center md:justify-between mb-8">
				<div className="min-w-0 flex-1">
					<h2 className="text-2xl font-bold leading-7 text-gray-50 sm:truncate sm:text-3xl sm:tracking-tight">Property</h2>
					<p className="mt-1 text-sm text-gray-50">A list of all the properties in your account.</p>
				</div>
				<div className="mt-4  sm:flex-none">
					<Link to="/owner/add-property">
						<Button buttonType="button" size="md" variant="filled" innerClass="w-50 bg-white " innerTextClass="text-primary " startIcon={<FaPlus />}>
							Add Property
						</Button>
					</Link>
				</div>
			</div>

			{properties.length > 0 ? (
				<div className="shadow sm:overflow-hidden sm:rounded-md">
					<div className="space-y-6 bg-white px-4 py-6 sm:p-6">
						<div className="flow-root">
							<div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
								<div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
									<table className="min-w-full divide-y divide-gray-300">
										<thead>
											<tr>
												<th scope="col" className="min-w-[400px] md:w-[400px] py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
													Name
												</th>
												<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
													Price
												</th>
												<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
													Capacity
												</th>
												<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
													City
												</th>
												<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
													Last update
												</th>
												<th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
													Actions
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200 bg-white">
											{properties.map((property) => (
												<tr key={property?.id}>
													<td className=" py-5 pl-4 pr-3 text-sm sm:pl-0">
														<Link to={`/property-detail/${property?.id}`} className="flex items-center">
															<div className="h-14 w-14 flex-shrink-0">
																<img
																	className="h-14 w-14 rounded-md"
																	src={property?.propertyImages[0]?.imgUrl ? property?.propertyImages[0]?.imgUrl : ImagePlaceholder}
																	alt={property?.propertyName}
																/>
															</div>

															<div className="ml-4">
																<div className="font-medium text-gray-900">{property?.propertyName}</div>
																<div className="mt-1 text-gray-500">{property?.address}</div>
															</div>
														</Link>
													</td>
													<td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{formatPrice(property?.price)} per day</td>
													<td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">{property?.capacity}</td>
													<td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
														<div className="text-gray-900">{property?.city}</div>
													</td>
													<td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
														{format(new Date(property?.updatedAt), 'dd MMMM yyyy')}
													</td>
													<td className="whitespace-nowrap  px-3 py-5 text-right text-sm font-medium sm:pr-0 ">
														<div className="flex item-center  gap-4">
															<div className="text-indigo-600 hover:text-indigo-900" onClick={() => goto(property?.id)}>
																<FaPenToSquare className="h-5 w-5 text-primary" />
															</div>
															<div className="text-indigo-600 hover:text-indigo-900" onClick={() => deleteProperty(property?.id)}>
																<FaTrash className="h-5 w-5 text-red-600" />
															</div>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				<EmptyState
					title="No Properties"
					subtitle="You haven't added any property yet."
					icon={<PiBuildingsFill className="w-16 h-16 text-white" />}
				/>
			)}

			<div className="mt-5">
				<Pagination totalCount={totalCount} page={page} limit={limit} onPageChange={setPage} pageClass={'justify-end'} />
			</div>

			{showModal && (
				<ConfirmModal
					modalId="delete-action-modal"
					title="Confirm Property Deletion"
					message="Are you sure you want to delete this property? This action cannot be undone."
					confirmText="Yes, Delete Property"
					cancelText="No, Keep Property"
					onConfirm={handleConfirm}
					onCancel={handleCancel}
					confirmDisabled={loading}
					cancelDisabled={loading}
					btnClass={'text-white bg-red-600 hover:bg-red-800 focus:ring-red-300 border-red-600'}
					icon={<FaTrash className="w-10 h-10 text-red-600" />}
				/>
			)}
		</>
	);
};

export default PropertyPage;
