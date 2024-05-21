import React from 'react';
import logo from '/logo.png';
import { Link } from 'react-router-dom';

export default function Logo() {
	return (
		<Link to="/" className="hidden md:block cursor-pointer rounded-3xl">
			{/* <img src={logo}  height="180" width="180" alt="Logo" /> */}
			<div className='text-xl  font-bold  text-primary'>BookMyVenue</div>
		</Link>
	);
}
