import React from 'react';
import { RiStarFill } from 'react-icons/ri';
const StarRating = ({ rating, size = 8 }) => {
	const fullStars = Math.floor(rating);
	const emptyStars = 5 - fullStars;
	return (
		<div className="flex items-center gap-[3px]">
			{Array(fullStars)
				.fill()
				.map((_, index) => (
					<RiStarFill key={`full-star-${index}`} className={`w-${size} h-${size} text-yellow-500`} />
				))}
			{Array(emptyStars)
				.fill()
				.map((_, index) => (
					<RiStarFill key={`full-star-${index}`} className={`w-${size} h-${size} text-gray-200`} />
				))}
		</div>
	);
};

export default StarRating;
