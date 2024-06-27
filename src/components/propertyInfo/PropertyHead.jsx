import React, { useState } from 'react';
import Heading from './Heading';
import Slider from 'react-slick';
import { IoIosArrowDroprightCircle, IoIosArrowDropleftCircle } from 'react-icons/io';

const NextArrow = (props) => {
	const { className, style, onClick } = props;
	return (
		<IoIosArrowDroprightCircle
			className={`${className} w-10 h-10 absolute right-4 top-1/2 z-10 cursor-pointer bg-white rounded-full opacity-80 hover:bg-white`}
			style={{
				...style,
				display: 'block',
				pointerEvents: onClick === null ? 'none' : 'auto',
				color: '#000',
			}}
			onClick={onClick}
		/>
	);
};

const PrevArrow = (props) => {
	const { className, style, onClick } = props;
	return (
		<IoIosArrowDropleftCircle
			className={`${className} w-10 h-10 absolute left-4 top-1/2  z-10 cursor-pointer bg-white rounded-full opacity-80 hover:bg-white`}
			style={{
				...style,
				display: 'block',
				pointerEvents: onClick === null ? 'none' : 'auto',
				color: '#000',
			}}
			onClick={onClick}
		/>
	);
};

const PropertyHead = ({ propertyName, city, country, propertyImages }) => {
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [initialSlide, setInitialSlide] = useState(0);

	const toggleFullScreen = (e) => {
		e.stopPropagation();
		setInitialSlide(0);
		setIsFullScreen(!isFullScreen);
	};

	if (!propertyImages || propertyImages.length === 0) {
		return null;
	}
	const settings = {
		lazyLoad: true,
		speed: 500,
		slidesToShow: 1,
		slidesToScroll: 1,
		initialSlide: 1,
		nextArrow: <NextArrow />,
		prevArrow: <PrevArrow />,
	};
	const openImageSlide = (idx) => {
		console.log(idx);
		setInitialSlide(idx);
		setIsFullScreen(true);
	};

	return (
		<>
			<div>
				<Heading name={propertyName || ''} city={city} country={country} />
			</div>
			<div
				className={`hidden lg:flex justify-end gap-2 w-full h-[60vh] overflow-hidden rounded-xl relative cursor-pointer ${
					isFullScreen ? 'hidden' : ''
				}`}
			>
				{propertyImages.length < 5 ? (
					<img className="object-cover w-full" src={propertyImages[0].imgUrl} alt="Img" onClick={() => openImageSlide(0)} />
				) : (
					<>
						<div className=" flex-2 w-full lg:w-auto">
							{propertyImages[0]?.imgUrl && (
								<img className="object-cover w-full h-full" onClick={() => openImageSlide(0)} src={propertyImages[0].imgUrl} alt="Img" />
							)}
						</div>
						<div className="flex-1 hidden lg:flex flex-col gap-2 ">
							{propertyImages
								.slice(1, 3)
								.map(
									(img, index) =>
										img?.imgUrl && (
											<img
												className="object-cover w-full h-[210px]"
												src={img.imgUrl}
												onClick={() => openImageSlide(index + 1)}
												alt="Img"
												key={index}
											/>
										),
								)}
						</div>
						<div className="flex-1 hidden lg:flex flex-col gap-2 ">
							{propertyImages
								.slice(3, 5)
								.map(
									(img, index) =>
										img?.imgUrl && (
											<img
												className="object-cover w-full h-[210px]"
												src={img.imgUrl}
												onClick={() => openImageSlide(index + 3)}
												alt="Img"
												key={index}
											/>
										),
								)}
						</div>
					</>
				)}
				<button
					className="hidden lg:block absolute z-1 px-2 py-1 rounded-md lg:top-2 lg:right-2 bg-white hover:bg-gray-100 "
					onClick={toggleFullScreen}
				>
					Show All Photos
				</button>
			</div>
			<div className="flex lg:hidden justify-center items-center w-full h-full overflow-hidden rounded-sm relative cursor-pointer">
				<Slider {...settings} className="w-full">
					{propertyImages?.map((img, index) => (
						<div key={index} className="w-full ">
							<img className="w-[700px] h-[500px]  object-cover" src={img.imgUrl} alt="Img" />
						</div>
					))}
				</Slider>
			</div>
			{isFullScreen && (
				<div className="fixed inset-0 z-50 overflow-hidden bg-gray-900 flex justify-center items-center">
					<button className="absolute w-20 h-10 z-10 right-2 top-2 rounded-lg bg-white" onClick={toggleFullScreen}>
						Close
					</button>
					{/* nextArrow: <NextArrow />, prevArrow: <PrevArrow />, */}
					<Slider {...settings} initialSlide={initialSlide} className="w-screen h-screen flex items-center justify-center">
						{propertyImages?.map((img, index) => (
							<div key={index} className="w-screen h-auto ">
								<img className="w-full h-[70vh] object-contain" src={img.imgUrl} alt="Img" />
							</div>
						))}
					</Slider>
				</div>
			)}
		</>
	);
};

export default PropertyHead;
