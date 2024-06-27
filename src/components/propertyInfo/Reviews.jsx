import React, { useRef } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import Slider from 'react-slick';

import placeholder from '/placeholder.jpg';
import StarRating from './StarRating';

import { formatDistance } from 'date-fns';

const Reviews = ({ reviews }) => {
	let sliderRef = useRef(null);
	const next = () => {
		sliderRef.slickNext();
	};
	const previous = () => {
		sliderRef.slickPrev();
	};

	const settings = {
		className: 'center',
		infinite: true,
		centerMode: true,
		// centerPadding: '60px',
		slidesToShow: 3,
		speed: 500,
		adaptiveHeight: false,
		responsive: [
			{
				breakpoint: 1224,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 2,
				},
			},
			{
				breakpoint: 900,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 2,
					initialSlide: 1,
				},
			},
			{
				breakpoint: 640,
				settings: {
					slidesToShow: 1,
					centerMode: false,
					className: '',
				},
			},
		],
	};

	return (
		<div className="my-12">
			<div className="flex justify-end gap-3 mb-5 sm:mb-8">
				<button onClick={previous} className="bg-primary w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:opacity-80">
					<FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
				</button>
				<button onClick={next} className="bg-primary w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:opacity-80">
					<FaArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
				</button>
			</div>
			<Slider
				ref={(slider) => {
					sliderRef = slider;
				}}
				{...settings}
				className="slider-container"
			>
				{reviews?.map((review) => (
					<div key={review.id} className="flex flex-1 col-span-1 h-100">
						<div className="border border-gray-200 rounded-3xl  p-5 flex flex-col sm:mx-6 sm:p-6 h-[400px] ">
							<div className="flex gap-4 mb-5">
								<img
									className="rounded-full object-cover w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20"
									alt="Avatar"
									src={review?.avatar || placeholder}
								/>
								<div className="flex flex-col justify-center w-full">
									<h1 className="text-sm sm:text-base lg:text-xl md:text-medium">{review?.fullName}</h1>
									<div className="text-xs sm:text-sm text-gray-500">
										{formatDistance(new Date(review?.createdAt), new Date(), { addSuffix: true })}
									</div>
								</div>
							</div>
							<StarRating rating={review.rating} size={6} />
							<p className="text-base mt-3 font-normal">{review.review}</p>
						</div>
					</div>
				))}
			</Slider>
		</div>
	);
};

export default Reviews;
