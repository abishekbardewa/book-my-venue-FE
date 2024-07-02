import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { debounce } from '../../utils';
import { axiosInstance } from '../../services/axios.service';
import { useCombobox } from 'downshift';
const indianCities = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'];
const VenueSearch = ({ onCitySelect, onSearchVenues, city }) => {
	const [selectedCity, setSelectedCity] = useState('');
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [noResults, setNoResults] = useState(false);

	useEffect(() => {
		setSelectedCity(city);
	}, [city]);

	const handleCityChange = (event) => {
		setInputValue('');
		setItems([]);
		onCitySelect(event.target.value);
	};

	const fetchSuggestions = useCallback(
		async (inputValue) => {
			if (inputValue) {
				setLoading(true);
				try {
					const { data } = await axiosInstance.get(`property/search?search=${inputValue}&city=${city}`);
					const propertyNames = data.data;
					setItems(propertyNames.map((name, index) => ({ id: index, name })));
					setNoResults(propertyNames.length === 0);
				} catch (error) {
					console.error('Error fetching properties:', error);
				} finally {
					setLoading(false);
				}
			} else {
				setItems([]);
			}
		},
		[city],
	);

	const debouncedFetchSuggestions = useMemo(() => debounce(fetchSuggestions, 500), [fetchSuggestions]);
	const handleInputChange = (changes) => {
		const { inputValue, type } = changes;

		switch (type) {
			case useCombobox.stateChangeTypes.InputChange:
				setInputValue(inputValue);
				debouncedFetchSuggestions(inputValue);
				break;
			default:
				break;
		}
	};

	const handleSelectedItemChange = (changes) => {
		const { selectedItem } = changes;
		if (selectedItem) {
			setInputValue(selectedItem.name);
			onSearchVenues(selectedItem.name);
		}
	};
	const { isOpen, getMenuProps, getInputProps, getItemProps, highlightedIndex } = useCombobox({
		items,
		inputValue,
		onInputValueChange: handleInputChange,
		onSelectedItemChange: handleSelectedItemChange,
		itemToString: (item) => (item ? item.name : ''),
	});

	const highlightText = (text, highlight) => {
		const index = text.toLowerCase().indexOf(highlight.toLowerCase());
		if (index === -1) return <span>{text}</span>;

		return (
			<span>
				{text.slice(0, index)}
				<span className="font-semibold text-gray-900">{text.slice(index, index + highlight.length)}</span>
				{text.slice(index + highlight.length)}
			</span>
		);
	};

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
					<div>
						<input
							{...getInputProps({
								placeholder: 'Search venues...',
								className: 'block w-full !py-4 !px-6 bg-white leading-tight focus:outline-none focus:shadow-outline !rounded-full !border-none ',
							})}
						/>
					</div>
					<ul
						{...getMenuProps()}
						className="absolute overflow-hidden  w-full bg-white mt-1 rounded-md shadow-lg max-h-60 overflow-y-auto   text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
					>
						{isOpen && items.length === 0 && !loading && noResults && <li className=" text-sm  p-2 text-gray-900  py-2">No results found</li>}
						{isOpen &&
							items.map((item, index) => (
								<li
									{...getItemProps({ item, index })}
									key={item.id}
									className={`cursor-pointer text-sm  p-2 text-gray-600 py-2 ${highlightedIndex === index ? 'bg-gray-50' : ''}`}
								>
									{highlightText(item.name, inputValue)}
								</li>
							))}
					</ul>
					{loading ? (
						<div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none loader-dots">
							<div></div>
							<div></div>
							<div></div>
						</div>
					) : (
						<div className="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none ">
							<svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default VenueSearch;
