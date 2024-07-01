import React, { useEffect, useState } from 'react';
import ImageUpload from '../../components/forms/ImageUpload';
import { toast } from 'react-toastify';
import { selectUser } from '../../redux/slices/authSlice';
import { useSelector } from 'react-redux';
import { axiosPrivate } from '../../services/axios.service';
import Button from '../../components/common/Button';
import { useForm, FormProvider } from 'react-hook-form';
import PropertyDetails from '../../components/propertyForm/PropertyDetails';
import PropertyAddress from '../../components/propertyForm/PropertyAddress';
import PropertyExtra from '../../components/propertyForm/PropertyExtra';
import PropertyTagsAndAmenities from '../../components/propertyForm/PropertyTagsAndAmenities';
import { useJsApiLoader } from '@react-google-maps/api';
import { convertTo12HourFormat } from '../../utils';
const steps = [
	{ name: 'Property Details', key: 'property-details' },
	{ name: 'Location Information', key: 'property-address' },
	{ name: 'Visuals and Media', key: 'property-images' },
	{ name: 'Categories and Amenities', key: 'property-tags' },
	{ name: 'Additional Information', key: 'property-extra' },
];
const views = ['property-details', 'property-address', 'property-images', 'property-tags', 'property-extra'];

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const AddPropertyPage = () => {
	const user = useSelector(selectUser);
	const [propertyImages, setPropertyImages] = useState([]);
	const [categories, setCategories] = useState([]);
	const [catErr, setCatErr] = useState(false);
	const [noImgErr, setNoImgErr] = useState(false);
	const [amenities, setAmenities] = useState([]);
	const [selectedCity, setSelectedCity] = useState('');
	const [cordinate, setCordinate] = useState({});
	const [userInteracted, setUserInteracted] = useState(false);

	const handUserInteracted = (event) => {
		setUserInteracted(event);
	};
	const handCordinateChange = (newCordinate) => {
		setCordinate(newCordinate);
	};

	const handleSetCategories = (eventValue) => {
		setCategories(eventValue);
	};
	const handleAmenityChange = (amenityValue) => {
		setAmenities(amenityValue);
	};
	const handleImagesChange = (images) => {
		setPropertyImages(images);
	};
	const handleCityChange = (cityValue) => {
		setSelectedCity(cityValue);
	};

	const [view, setView] = useState('property-details');
	const [enabledViews, setEnabledViews] = useState(['property-details']);

	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: GOOGLE_KEY,
		libraries: ['places'],
	});

	const methods = useForm({
		defaultValues: {
			country: 'India',
		},
		mode: 'all',
	});

	const {
		handleSubmit,
		formState: { isSubmitting },
		trigger,
		reset,
	} = methods;

	const onSubmit = async (data) => {
		const checkInTime = convertTo12HourFormat(data?.checkInTime);
		const checkOutTime = convertTo12HourFormat(data?.checkOutTime);

		let fd = new FormData();
		fd.append('propertyName', data.propertyName);
		fd.append('description', data.description);
		fd.append('capacity', data.capacity);
		fd.append('price', data.price);
		fd.append('address', data.address);
		fd.append('city', selectedCity);
		fd.append('pincode', data.pincode);
		fd.append('lat', cordinate.lat);
		fd.append('lng', cordinate.lng);
		fd.append('country', data.country);
		fd.append('extraInfo', data.extraInfo ?? '');
		fd.append('ownerId', user?.id);
		fd.append('checkInTime', checkInTime);
		fd.append('checkOutTime', checkOutTime);
		fd.append('propertyTags', JSON.stringify(categories));
		let captions = [];
		propertyImages.forEach((f) => {
			fd.append(`propertyImages`, f.file);
			captions.push(f.caption);
		});
		fd.append(`captions`, JSON.stringify(captions));
		const amenitiesFiltered = amenities.filter((ele) => ele.amenityName);
		if (amenitiesFiltered.length > 0) {
			fd.append('amenities', JSON.stringify(amenitiesFiltered));
		}

		try {
			const res = await axiosPrivate.post(`property`, fd, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			if (res.data.success) {
				reset();
				setPropertyImages([]);
				setCategories([]);
				setAmenities([]);
				setSelectedCity('Delhi');
				setView('property-details');
				setEnabledViews(['property-details']);
				toast.success('Property is added');
			} else {
				toast.error('Something went wrong');
			}
		} catch (e) {
			toast.error('Something went wrong');
		}
	};

	const handleNext = async (e) => {
		e.preventDefault();
		if (view === 'property-tags' && categories.length === 0) {
			setCatErr(true);
			return;
		} else {
			setCatErr(false);
		}
		if (view === 'property-images' && propertyImages.length === 0) {
			setNoImgErr(true);
			return;
		} else {
			setNoImgErr(false);
		}

		const currentIndex = views.indexOf(view);

		setNoImgErr(false);
		setCatErr(false);
		const isValid = await trigger();

		if (isValid && currentIndex < views.length - 1) {
			const nextView = views[currentIndex + 1];
			setEnabledViews((prev) => [...new Set([...prev, nextView])]);
			setView(nextView);
		}
	};

	const handlePrev = async (e) => {
		e.preventDefault();
		const currentIndex = views.indexOf(view);
		setView(views[currentIndex - 1]);
	};

	const handleSetView = async (key) => {
		if (view === 'property-tags' && categories.length === 0) {
			setCatErr(true);
			return;
		} else {
			setCatErr(false);
		}
		if (view === 'property-images' && propertyImages.length === 0) {
			setNoImgErr(true);
			return;
		} else {
			setNoImgErr(false);
		}
		const isValid = await trigger();
		if (isValid) {
			setView(key);
		}
	};
	return (
		<>
			<div className="md:flex md:items-center md:justify-between mb-8">
				<div className="min-w-0 flex-1">
					<h2 className="text-2xl font-bold leading-7 text-gray-50 sm:truncate sm:text-3xl sm:tracking-tight">Add Property</h2>
					<p className="mt-1 text-sm text-gray-50">List out your property </p>
				</div>
			</div>
			<div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
				<aside className="px-2 py-6 sm:px-6 lg:col-span-3 lg:px-0 lg:py-0">
					<nav className="flex gap-2 flex-wrap lg:flex-col">
						{steps.map((step) => (
							<a
								key={step.key}
								onClick={() => handleSetView(step.key)}
								className={`cursor-pointer group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
									view === step.key ? 'bg-gray-50 text-gray-900' : 'hover:bg-gray-50 hover:text-gray-900 text-gray-50'
								} ${!enabledViews.includes(step.key) && 'pointer-events-none opacity-50'}  ${isSubmitting && 'pointer-events-none opacity-50'}`}
							>
								<span className="truncate">{step.name}</span>
							</a>
						))}
					</nav>
				</aside>

				<div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
					<FormProvider {...methods}>
						<form onSubmit={handleSubmit(onSubmit)}>
							{view === 'property-details' && <PropertyDetails />}
							{view === 'property-address' && (
								<PropertyAddress
									handleCityChange={handleCityChange}
									setCord={handCordinateChange}
									selectedCity={selectedCity}
									cordinate={cordinate}
									setInteract={handUserInteracted}
									userInteracted={userInteracted}
									isLoaded={isLoaded}
								/>
							)}

							{view === 'property-images' && (
								<div className="shadow sm:overflow-hidden sm:rounded-md">
									<div className="space-y-6 bg-white px-4 py-6 sm:p-6">
										<div>
											<h3 className="text-base font-semibold leading-6 text-gray-900">Visuals and Media</h3>
											<p className="mt-1 text-sm text-gray-500">Upload images to showcase the property.</p>
										</div>
										<ImageUpload onImagesChange={handleImagesChange} propertyImages={propertyImages} />
										{noImgErr && <p className="text-red-500 text-sm mt-1">At least one image is required.</p>}
									</div>
								</div>
							)}
							{view === 'property-tags' && (
								<PropertyTagsAndAmenities
									handleSetCategories={handleSetCategories}
									categories={categories}
									catErr={catErr}
									handleAmenityChange={handleAmenityChange}
									amenities={amenities}
								/>
							)}
							{view === 'property-extra' && <PropertyExtra />}
							<div className="py-3 text-right mt-3 gap-2 flex items-center justify-end">
								{view !== 'property-details' && (
									<Button
										buttonType="button"
										size="md"
										variant="filled"
										onClick={handlePrev}
										innerClass="w-36 bg-white"
										innerTextClass="text-primary"
										disabled={isSubmitting}
									>
										Prev
									</Button>
								)}
								{view !== 'property-extra' && (
									<Button
										buttonType="button"
										size="md"
										variant="filled"
										innerClass="w-36 bg-white"
										innerTextClass="text-primary"
										onClick={handleNext}
									>
										Next
									</Button>
								)}
								{view === 'property-extra' && (
									<Button
										buttonType="submit"
										size="md"
										variant="filled"
										loading={isSubmitting}
										disabled={isSubmitting}
										innerClass="w-36 bg-white"
										innerTextClass="text-primary"
									>
										{isSubmitting ? 'Loading...' : 'Submit'}
									</Button>
								)}
							</div>
						</form>
					</FormProvider>
				</div>
			</div>
		</>
	);
};

export default AddPropertyPage;
