import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, GoogleMap, MarkerF } from '@react-google-maps/api';
import { useFormContext } from 'react-hook-form';
import InputField from '../forms/InputField';
import TextAreaField from '../forms/TextAreaField';
import useOutsideClick from '../../hooks/useOutsideClick';
import { cityList } from '../../constants/city';

const containerStyle = {
	width: '100%',
	height: '400px',
};

const PropertyAddress = ({ handleCityChange, selectedCity, setCord, cordinate, setInteract, userInteracted, isLoaded }) => {
	const {
		register,
		formState: { errors },
		setValue,
	} = useFormContext();

	const [zoomView, setZoomView] = useState(10);
	const [map, setMap] = useState(null);
	const [autocomplete, setAutocomplete] = useState(null);
	const [position, setPosition] = useState(null);
	const [showDrop, setShowDrop] = useState(false);

	const closeDrop = useCallback(() => {
		setShowDrop(false);
	}, []);

	const dropRef = useOutsideClick(showDrop, closeDrop);

	const toggleDrop = (event) => {
		event.stopPropagation();
		setShowDrop(!showDrop);
	};

	const onLoad = (autocomplete) => {
		setAutocomplete(autocomplete);
	};

	const onPlaceChanged = () => {
		if (autocomplete !== null) {
			const place = autocomplete.getPlace();
			if (place.geometry) {
				const lat = place.geometry.location.lat();
				const lng = place.geometry.location.lng();
				const newPosition = { lat, lng };
				setPosition(newPosition);
				setCord(newPosition);
				map.panTo(newPosition);
				setZoomView(18);
				setInteract(true);
				const addressComponents = place.address_components;
				let postalCode = '';
				for (let component of addressComponents) {
					if (component.types.includes('postal_code')) {
						postalCode = component.long_name;
						break;
					}
				}

				if (postalCode) {
					setValue('pincode', postalCode);
				}
			}
		}
	};

	const handleCitySelection = (city) => {
		handleCityChange(city.name);
		const newPosition = { lat: city.lat, lng: city.lng };
		setPosition(newPosition);
		setCord(newPosition);
		if (!userInteracted) {
			setZoomView(10); // Set zoom to 10 initially
		}
		closeDrop();
	};

	useEffect(() => {
		if (map && position) {
			map.panTo(position);
		}
	}, [map, position]);

	return (
		<div className="shadow sm:overflow-hidden sm:rounded-md">
			<div className="space-y-6 bg-white px-4 py-6 sm:p-6 ">
				<div>
					<h3 className="text-base font-semibold leading-6 text-gray-900">Location Information</h3>
					<p className="mt-1 text-sm text-gray-500">Enter the address and location details of the property.</p>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-6 gap-6 ">
					<div className="col-span-3 flex flex-col gap-4">
						<div>
							<label id="listbox-label" className="block text-sm font-medium leading-6 text-gray-900">
								City
							</label>
							<div className="relative mt-1">
								<button
									type="button"
									className="relative w-full cursor-default bg-white py-2 px-3 rounded-md text-left text-gray-900 shadow-sm ring-1 ring-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm"
									aria-haspopup="listbox"
									aria-expanded="true"
									aria-labelledby="listbox-label"
									onClick={toggleDrop}
								>
									<span className="block truncate">{selectedCity || 'Select a city'}</span>
									<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
										<svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
											<path
												fillRule="evenodd"
												d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
												clipRule="evenodd"
											/>
										</svg>
									</span>
								</button>

								{showDrop && (
									<ul
										ref={dropRef}
										className=" z-10 max-h-52 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
										tabIndex="-1"
										role="listbox"
										aria-labelledby="listbox-label"
										aria-activedescendant="listbox-option-3"
									>
										{cityList.map((city, idx) => (
											<li
												key={`${idx}-${city.name}`}
												className="text-gray-900 relative cursor-default select-none py-2 pl-8 pr-4 hover:bg-indigo-600 hover:text-white"
												id="listbox-option-0"
												role="option"
												onClick={() => handleCitySelection(city)}
											>
												<span className="font-normal block truncate">{city.name}</span>
												{selectedCity === city.name && (
													<span className="text-indigo-600 absolute inset-y-0 left-0 flex items-center pl-1.5 hover:text-white">
														<svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
															<path
																fillRule="evenodd"
																d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
																clipRule="evenodd"
															/>
														</svg>
													</span>
												)}
											</li>
										))}
									</ul>
								)}
							</div>
						</div>

						{selectedCity && (
							<>
								{isLoaded && (
									<Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
										<InputField
											label="Search Area"
											placeholder="Search street or area..."
											id="area"
											name="area"
											register={register}
											required={false}
										/>
									</Autocomplete>
								)}
								<div>
									<TextAreaField label="Full Address" id="address" name="address" register={register} required={true} watch={null} />
									{errors?.address && <span className="text-red-500 text-sm">Address is required</span>}
								</div>
								<div>
									<InputField label="Pin Code" id="pincode" name="pincode" register={register} required={true} error={errors?.pincode} />
									{errors?.pincode && <span className="text-red-500 text-sm">Pin Code is required</span>}
								</div>
							</>
						)}
					</div>
					{selectedCity && (
						<div className="col-span-6 sm:col-span-3">
							{isLoaded ? (
								<div className="flex flex-col gap-4 p-3 border rounded-md">
									<p className="mt-1 text-md text-gray-500">Drag marker to your exact location</p>
									<GoogleMap
										mapContainerStyle={containerStyle}
										center={position || cordinate}
										zoom={userInteracted ? 18 : zoomView}
										onLoad={(map) => {
											setMap(map);
											if (!userInteracted) {
												setZoomView(10); // Ensure initial zoom is set correctly
											}
										}}
									>
										<MarkerF
											position={position || cordinate}
											draggable={true}
											onDragEnd={(e) => {
												const newLat = e.latLng.lat();
												const newLng = e.latLng.lng();
												const newPosition = { lat: newLat, lng: newLng };
												setPosition(newPosition);
												setCord(newPosition);
												setInteract(true);
											}}
										/>
									</GoogleMap>
								</div>
							) : (
								<></>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default PropertyAddress;
