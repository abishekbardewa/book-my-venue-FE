import React from 'react';
import Avatar from '../Avatar';
import { FaLocationDot } from 'react-icons/fa6';

const PropertyDescriptions = ({ ownerName, capacity, description, avatar, address, tags, amenities }) => {
	return (
		<>
			<div className="flex flex-col gap-5">
				<div className="flex flex-row">
					{tags?.map((tag) => (
						<span key={tag.id} className="w-fit bg-primary text-white text-xs me-2 px-2.5 py-1.5 rounded-full capitalize">
							{tag.replaceAll('-', ' ')}
						</span>
					))}
				</div>

				<div className="flex">
					<div className="mr-4 mt-0.5">
						<Avatar src={avatar} h="40" w="45" />
					</div>
					<div>
						<div className="text-xl font-medium flex flex-row items-center gap-2">{ownerName && <div>Owned By {ownerName}</div>}</div>
						<div className="flex flex-row items-center gap-4 text-md text-neutral-600">{capacity && <div>{capacity} Capacity</div>}</div>
					</div>
				</div>
				<hr className="text-gray-100" />
				<div className="text-md font-light text-neutral-600">
					<h1 className="text-black font-medium text-xl mb-3">Description</h1>
					{description}
				</div>
				<hr className="text-gray-100" />
				<div className="text-md font-light text-neutral-600">
					<h1 className="text-black font-medium text-xl">Address</h1>
					<div className="flex gap-2 items-center mt-3">
						<FaLocationDot />
						{address}
					</div>
				</div>
				{amenities?.length > 0 && (
					<>
						<hr className="text-gray-100" />
						<div className="font-light text-neutral-500 z-0 relative">
							<h1 className="text-black text-xl  font-medium mb-2">What this place offers</h1>
							{amenities?.map((amenity, index) => (
								<div key={index} className="flex ml-2 mt-3 gap-2 items-center">
									<span className=" w-1.5 h-1.5 rounded-full bg-gray-800"></span>
									<div className="text-black ml-3 text-lg"></div>
									{amenity}
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default PropertyDescriptions;
