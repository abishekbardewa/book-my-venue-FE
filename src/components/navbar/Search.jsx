import React, { useEffect, useState } from 'react';
import { debounce } from '../../utils';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import { axiosPrivate } from '../../services/axios.service';
import './serch.css';

const VenueSearch = ({ onCitySelect, onSearchVenues, city, search }) => {
	const [selectedCity, setSelectedCity] = useState('');
	const [items, setItems] = useState([]);

	useEffect(() => {
		setSelectedCity(city);
	}, [city]);

	const handleCityChange = (event) => {
		onCitySelect(event.target.value);
	};

	const handleSearchChange = (event) => {
		const query = event.target.value;

		onSearchVenues(query);
	};
	const handleOnSearch = async (string, results) => {
		console.log(string);
		if (string.length > 2) {
			try {
				const {
					data: { data },
				} = await axiosPrivate.get(`/property?search=${string}`);

				// Check if response.data is an array
				if (Array.isArray(data.properties)) {
					setItems(data.properties.map((item, index) => ({ id: index, name: item.propertyName })));
				} else {
					console.error('Unexpected data structure:', data);
					setItems([]);
				}
			} catch (error) {
				console.error('Error fetching suggestions:', error);
				setItems([]);
			}
		}
	};
	const handleOnSelect = (item) => {
		onSearchVenues(item.name);
		setItems([]);
	};
	const formatResult = (item) => {
		return (
			<div className="result-wrapper">
				<span className="result-span">{item.name}</span>
			</div>
		);
	};

	const handleOnClear = () => {
		onSearchVenues('');
	};

	// const searchProp = debounce(handleSearchChange, 1000);

	const indianCities = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'];

	return (
		<div className="w-max-[600px] md:w-[600px] sm:w-[400px] w-[300px] grid grid-cols-8 md:grid-cols-12 gap-4">
			<div className="md:col-span-4 col-span-8">
				<select
					id="city"
					value={selectedCity}
					onChange={handleCityChange}
					className="border-none appearance-none w-full py-4 px-6 rounded-full text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
				>
					<option value="">All Cities</option>
					{indianCities.map((city) => (
						<option key={city} value={city}>
							{city}
						</option>
					))}
				</select>
			</div>
			<div className="md:col-span-8 col-span-8">
				<div className="relative">
					<ReactSearchAutocomplete
						items={items}
						onSearch={handleOnSearch}
						onSelect={handleOnSelect}
						onClear={handleOnClear}
						maxResults={5}
						// autoFocus
						formatResult={formatResult}
						placeholder="Search venues..."
						className="search"
						inputSearchString={search}
					/>
				</div>
				{/* <div className="relative">
					<input
						type="text"
						defaultValue={search}
						onKeyUp={searchProp}
						className="block w-full !py-4 !px-6 bg-white leading-tight focus:outline-none focus:shadow-outline !rounded-full !border-none "
						placeholder="Search venues..."
					/>
					<div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
						<svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				</div> */}
			</div>
		</div>
	);
};

export default VenueSearch;
