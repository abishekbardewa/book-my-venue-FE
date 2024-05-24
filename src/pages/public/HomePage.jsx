import React, { useEffect, useState } from 'react';
import placeholderImage from '/placeholder.jpg'; // Import your placeholder image
import { Link } from 'react-router-dom';
import Container from '../../components/Container';
import PropertyCard from '../../components/common/PropertyCard';
import { axiosPrivate } from '../../services/axios.service';
import Loader from '../../components/common/Loader';
import Categories from '../../components/common/Categories';
import VenueSearch from '../../components/navbar/Search';
import venue from '/venue2.png';
const HomePage = () => {
	const [properties, setProperties] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedCity, setSelectedCity] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const showImage = location.pathname === '/';
	useEffect(() => {
		// if (selectedCity || searchQuery) {
		getProperties();
	}, [selectedCity]);

	const handleCitySelect = (city) => {
		setSelectedCity(city);
	};

	const handleSearchVenues = (query) => {
		setSearchQuery(query);
	};

	async function getProperties() {
		try {
			setLoading(true);
			const params = {
				city: selectedCity,
				// search: searchQuery,
			};
			console.log(params);
			const { data } = await axiosPrivate.get('/property', { params });
			setProperties(data.data);
			console.log('GET D', data);
		} catch (error) {
			console.log('GET', error);
		} finally {
			setLoading(false);
		}
	}

	if (loading) {
		return <Loader />;
	}

	return (
		<>
			{showImage && (
				<>
					<div className="relative">
						<img src={venue} alt="venue" className="h-[350px] w-full opacity-80 object-cover object-center" />
						<div className="absolute top-[calc(-50%_+_350px)] left-1/2 transform -translate-x-1/2">
							<VenueSearch onCitySelect={handleCitySelect} onSearchVenues={handleSearchVenues} />
						</div>
					</div>
				</>
			)}
			<Categories />

			{loading ? (
				<Loader />
			) : (
				<div className="sm:mx-2 lg:mx-16 px-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
						{properties?.map((property) => (
							<Link key={property.id} to={`/property-detail/${property.id}`}>
								<PropertyCard property={property} />
							</Link>
						))}
					</div>
				</div>
			)}
		</>
	);
};

export default HomePage;
