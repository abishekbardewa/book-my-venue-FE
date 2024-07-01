import React from 'react';
import ImagePlaceholder from '../../assets/ImagePlaceholder.jpeg';
import { formatPrice } from '../../utils';

const PropertyCard = ({ property }) => {
	return (
		// hover:border-slate-200 transition-transform duration-200 hover:scale-105
		<div className="h-full property-card bg-white rounded-lg border border-gray-50 hover:bg-gray-25 mb-5">
			<div className="w-full aspect-square mb-2">
				{property?.propertyImages.length > 0 ? (
					<img src={property.propertyImages[0]?.imgUrl} alt="" className="object-cover h-full w-full rounded-tr-lg rounded-tl-lg" />
				) : (
					<img src={ImagePlaceholder} alt="Placeholder" className="object-cover h-full w-full rounded-tr-lg rounded-tl-lg" />
				)}
			</div>
			<div className="p-4">
				<h3 className="font-medium text-lg ">{property?.propertyName}</h3>
				<h2 className="text-gray-500">
					{property?.city}, {property?.country}
				</h2>

				<div className="mt-1">
					<span className="font-medium mr-1">{formatPrice(property.price)}</span>
					per day
				</div>
			</div>
		</div>
	);
};

export default PropertyCard;
