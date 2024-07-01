import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../../components/common/PropertyCard';
import Categories from '../../components/common/Categories';
import VenueSearch from '../../components/navbar/Search';
import venue from '/venue2.png';
import { axiosPrivate } from '../../services/axios.service';
import { LuLoader2 } from 'react-icons/lu';
import { PiBuildingsFill } from 'react-icons/pi';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';
const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;
const HomePage = () => {
	const showImage = location.pathname === '/';
	const [properties, setProperties] = useState([]);
	const [internalLoading, setInternalLoading] = useState(false);
	const [selectedCity, setSelectedCity] = useState(localStorage.getItem('userCity') ?? '');
	const [searchQuery, setSearchQuery] = useState('');
	const [selectTag, setSelectTag] = useState('');
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [totalCount, setTotalCount] = useState(0);

	const handleSearchVenues = (query) => {
		console.log(query);
		setSearchQuery(query);
		setProperties([]);
	};

	const handleCitySelect = (city) => {
		setSelectedCity(city);
		setSelectTag('');
		setSearchQuery('');
		setProperties([]);
	};

	const handleTagSelect = (tagName) => {
		setSelectTag(tagName);
		setProperties([]);
	};

	const fetchProperties = useCallback(
		async (city = null, currentPage = 1, search = '', tag = '') => {
			try {
				setInternalLoading(true);
				const params = {
					city: city || selectedCity,
					page: currentPage,
					limit: 8,
					search,
					propertyTags: tag,
				};
				const { data } = await axiosPrivate.get('/property', { params });
				setProperties((prevProperties) => {
					const newProperties = currentPage === 1 ? data.data : [...prevProperties, ...data.data];
					setHasMore(newProperties.length < data.totalCount);
					return newProperties;
				});

				setTotalCount(data.totalCount);
				setPage(currentPage);
			} catch (error) {
				console.error('Error fetching properties:', error);
			} finally {
				setInternalLoading(false);
			}
		},
		[selectedCity],
	);

	useEffect(() => {
		setPage(1);
		setHasMore(true);
		fetchProperties(selectedCity, 1, searchQuery, selectTag);
	}, [selectedCity, searchQuery, selectTag, fetchProperties]);

	const loadMoreProperties = () => {
		console.log('loadMoreProperties called. Current page:', page, 'Has more:', hasMore);
		if (!internalLoading && hasMore) {
			const nextPage = page + 1;
			fetchProperties(selectedCity, nextPage, searchQuery, selectTag);
		}
	};

	const getCityFromCoords = async (latitude, longitude) => {
		try {
			const url = `https://api.mapbox.com/search/geocode/v6/reverse?country=in&types=district&longitude=${longitude}&latitude=${latitude}&access_token=${MAPBOX_API_KEY}`;
			const {
				data: { features },
			} = await axios.get(url);
			let city;
			if (features.length > 0) {
				const properties = features[0].properties;
				const context = properties.context;
				city = context.district.name;
			}
			return city;
		} catch (error) {
			console.error('Error fetching city name:', error);
			return null;
		}
	};

	const getUserLocation = () => {
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const { latitude, longitude } = position.coords;
					const city = await getCityFromCoords(latitude, longitude);
					if (city) {
						setSelectedCity(city);
						localStorage.setItem('userCity', city);
					}
				},
				(error) => {
					console.error('Error getting user location:', error);
				},
			);
		}
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			getUserLocation();
		}, 5000);

		return () => clearTimeout(timer);
	}, []);

	return (
		<>
			{showImage && (
				<div className="relative">
					<img src={venue} alt="venue" className="h-[350px] w-full opacity-80 object-cover object-center" />
					<div className="absolute top-[calc(-50%_+_350px)] left-1/2 transform -translate-x-1/2 z-[9]">
						<VenueSearch onCitySelect={handleCitySelect} city={selectedCity} onSearchVenues={handleSearchVenues} />
					</div>
				</div>
			)}
			<Categories setTag={handleTagSelect} selectedTag={selectTag} />
			<div className="sm:mx-2 lg:mx-16 px-4 mb-42">
				{properties.length === 0 && !internalLoading && (
					<div className="flex flex-col items-center justify-center h-[60vh]">
						<PiBuildingsFill className="w-16 h-16 text-black" />
						<h3 className="mt-2 text-sm font-semibold text-black">Properties Not Found</h3>
					</div>
				)}
				<InfiniteScroll
					dataLength={properties?.length}
					next={loadMoreProperties}
					hasMore={hasMore}
					loader={
						<div className="flex items-center justify-center space-x-2  h-[40vh]">
							<LuLoader2 className="w-8 h-8 text-primary animate-spin" />
						</div>
					}
					offset={100}
				>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
						{properties?.map((property) => (
							<Link key={property.id} to={`/property-detail/${property.id}`}>
								<PropertyCard property={property} />
							</Link>
						))}
					</div>
				</InfiniteScroll>
			</div>
		</>
	);
};

export default HomePage;
